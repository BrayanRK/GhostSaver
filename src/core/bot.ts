// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Bot Principal v2.0                ║
// ╚══════════════════════════════════════════════════════════════╝

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  normalizeMessageContent,
} from "ultra-baileys";
import type { WAMessage } from "ultra-baileys";
import pino from "pino";

import config from "../config.js";
import log from "../logger.js";
import { MessageQueue } from "./queue.js";
import {
  isOwner,
  isPrivateChat,
  isSuperOwner,
  normalizeBotJid,
  extractOwnerFromJid,
  getSenderJid,
} from "./guardian.js";
import { loadCommands, setupAutoReload } from "./loader.js";
import {
  getOwnerNumber,
  loadAuthState,
  clearSession,
  printConnectedBanner,
  printPairingBanner,
} from "./session.js";
import { registerAntiDelete } from "../plugins/antiDelete.js";
import { initSettings, saveSettings as persistSettings } from "../utils/settings.js";
import { ensureBaseDirs } from "../utils/paths.js";
import {
  findViewOnceMedia,
  getRealSender,
  getTextMessage,
  normalizeJidToNumber,
  processViewOnce,
} from "../utils/media.js";
import type { BotContext, BotSettings } from "../types/index.js";

// ─── Cooldowns ────────────────────────────────────────────────────────────────
const cooldowns = new Map<string, number>();
function isOnCooldown(name: string, ms: number): boolean {
  const last = cooldowns.get(name);
  return last ? Date.now() - last < ms : false;
}
function setCooldown(name: string): void { cooldowns.set(name, Date.now()); }

let sessionRetries = 0;

// ─── Bot principal ────────────────────────────────────────────────────────────
async function startBot(): Promise<void> {
  const OWNER_NUMBER = await getOwnerNumber();

  let state: Awaited<ReturnType<typeof loadAuthState>>["state"];
  let saveCreds: Awaited<ReturnType<typeof loadAuthState>>["saveCreds"];

  try {
    ({ state, saveCreds } = await loadAuthState());
  } catch (e) {
    log.error("Sesión corrupta:", (e as Error).message);
    if (sessionRetries < config.maxSessionRetries) {
      sessionRetries++;
      log.warn(`Auto-reparando (${sessionRetries}/${config.maxSessionRetries})...`);
      clearSession();
      setTimeout(() => startBot(), 2000);
    } else {
      log.error("Demasiados intentos. Borra auth_info manualmente.");
    }
    return;
  }

  const settings: BotSettings = initSettings();
  ensureBaseDirs(settings.downloadDir);

  const commands = await loadCommands();
  log.div();
  const cmdNames = [...new Set([...commands.values()].map((c) => c.name))];
  log.ok(`${cmdNames.length} comandos →`, cmdNames.join("  ·  "));
  log.div();
  setupAutoReload(commands);

  const { version } = await fetchLatestBaileysVersion();
  log.info("WA version:", version.join("."));

  const logger = pino({ level: "silent" });
  (logger as unknown as { child: () => typeof logger }).child = () => logger;

  const msgStore = new Map<string, WAMessage>();
  const queue    = new MessageQueue();

  const sock = makeWASocket({
    version,
    browser: Browsers.ubuntu("Chrome"),
    logger,
    auth: state,
    printQRInTerminal: false,
    getMessage: async (key) => {
      return msgStore.get(key.id!)?.message ?? { conversation: "" };
    },
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    log.info(`Solicitando código para: +${OWNER_NUMBER}`);
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const code = await sock.requestPairingCode(OWNER_NUMBER);
      printPairingBanner(code);
    } catch (e) {
      log.error("Error al pedir código:", (e as Error).message);
    }
  }

  // ── Conexión ──────────────────────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "connecting") { log.info("Conectando..."); return; }

    if (connection === "open") {
      sessionRetries = 0;
      const ownerNum = extractOwnerFromJid(sock.user?.id ?? OWNER_NUMBER);
      printConnectedBanner(ownerNum, settings.prefixEnabled);
      registerAntiDelete(sock, msgStore, settings);

      // (Sin aviso molesto de superOwnerJid en consola)
      return;
    }

    if (connection === "close") {
      const code        = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const isLoggedOut  = code === DisconnectReason.loggedOut;
      const isBadSession = code === DisconnectReason.badSession;
      const isConflict   = code === DisconnectReason.connectionReplaced;

      if (isLoggedOut || isBadSession) {
        log.warn(`Sesión inválida (${code}). Reconectando...`);
        clearSession();
        if (sessionRetries < config.maxSessionRetries) {
          sessionRetries++;
          setTimeout(() => startBot(), 3000);
        } else {
          log.error("Reinicia manualmente.");
        }
      } else if (isConflict) {
        log.warn("Bot abierto en otro dispositivo. Cerrando instancia.");
      } else {
        log.warn(`Conexión cerrada (${code}). Reconectando en 3s...`);
        setTimeout(() => startBot(), 3000);
      }
    }
  });

  // ══════════════════════════════════════════════════════════════════════════════
  //  LISTENER PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════════════
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    // ── Almacenar para AntiDelete ─────────────────────────────────────────────
    const stanzaId = msg?.key?.id;
    if (stanzaId) {
      msgStore.set(stanzaId, msg);
      if (msgStore.size > config.msgStoreLimit)
        msgStore.delete(msgStore.keys().next().value!);
    }

    const botJid = normalizeBotJid(sock.user?.id ?? "");

    // (El bloque automático de ViewOnce fue removido porque ultra-baileys no retiene la etiqueta en los mensajes entrantes. Todo se maneja vía comando manual .vv)

    // ── BLOQUE 2: Comandos ────────────────────────────────────────────────────
    // Regla: solo responder si...
    //   A) el remitente es el propio bot (fromMe) sin importar si es grupo o privado
    //   B) el remitente es el superOwnerJid sin importar si es grupo o privado
    const senderJid  = getSenderJid(msg);
    const superOwner = isSuperOwner(msg, config.superOwnerJid);
    const fromMe     = msg?.key?.fromMe === true;
    const authorized = superOwner || fromMe;

    if (!authorized) return;

    const body = getTextMessage(msg).trim();
    if (!body)   return;

    // ── Parsing con o sin prefijo ─────────────────────────────────────────────
    let text = "";
    if (settings.prefixEnabled) {
      if (!body.startsWith(config.prefix)) return;
      text = body.slice(config.prefix.length).trim();
    } else {
      text = body.trim();
    }
    if (!text) return;

    const [rawCmd, ...args] = text.split(/\s+/);
    const commandName       = rawCmd?.toLowerCase();
    if (!commandName) return;

    let command = commands.get(commandName);

    // Fallback: Si no lo encuentra, verificar si es un alias dinámico de 'vv'
    if (!command && settings.vvAliases.includes(commandName)) {
      command = commands.get("vv");
    }

    if (!command) return;

    const cooldownMs = command.cooldown ?? config.defaultCooldown;
    if (isOnCooldown(commandName, cooldownMs)) {
      const last = cooldowns.get(commandName)!;
      const rem  = ((cooldownMs - (Date.now() - last)) / 1000).toFixed(1);
      log.warn(`Cooldown "${commandName}": ${rem}s`);
      return;
    }
    setCooldown(commandName);

    const ctx: BotContext = {
      ownerNumber:   extractOwnerFromJid(sock.user?.id ?? OWNER_NUMBER),
      superOwnerJid: config.superOwnerJid,
      botJid,
      settings,
      saveSettings: () => persistSettings(settings),
    };

    queue.enqueue(async () => {
      const pfx = settings.prefixEnabled ? config.prefix : "";
      log.cmd(`${pfx}${commandName}`);
      try {
        await command.run(sock, msg, args, ctx);
      } catch (e) {
        log.error(`${commandName}:`, (e as Error)?.message ?? e);
      }
    });
  });
}

startBot();
