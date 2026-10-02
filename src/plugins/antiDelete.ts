// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — AntiDelete Plugin v2.0            ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { BotSettings } from "../types/index.js";
import { normalizeBotJid } from "../core/guardian.js";
import log from "../logger.js";

import { Deco } from "../utils/deco.js";

// (Omitiendo import de log porque va despues)

const TYPE_LABELS: Record<string, string> = {
  conversation:               "Texto",
  extendedTextMessage:        "Texto",
  imageMessage:               "Imagen",
  videoMessage:               "Video",
  audioMessage:               "Audio",
  documentMessage:            "Documento",
  documentWithCaptionMessage: "Documento",
  stickerMessage:             "Sticker",
  contactMessage:             "Contacto",
  locationMessage:            "Ubicacion",
  pollCreationMessage:        "Encuesta",
};

function detectType(msg: WAMessage): string {
  const content = msg?.message;
  if (!content) return "Desconocido";
  const key = Object.keys(content).find((k) => TYPE_LABELS[k]);
  return key ? TYPE_LABELS[key] : `[Archivo] ${Object.keys(content)[0]}`;
}

function getCaption(msg: WAMessage): string {
  const m = msg?.message;
  if (!m) return "";
  return (
    (m.conversation as string) ||
    ((m.extendedTextMessage as { text?: string })?.text) ||
    ((m.imageMessage  as { caption?: string })?.caption) ||
    ((m.videoMessage  as { caption?: string })?.caption) ||
    ((m.documentMessage as { caption?: string })?.caption) ||
    ""
  );
}

export function registerAntiDelete(
  sock: WASocket,
  msgStore: Map<string, WAMessage>,
  settings: BotSettings
): void {
  sock.ev.on("messages.update", async (updates) => {
    if (!settings.antiDelete) return;

    const botJid = normalizeBotJid(sock.user?.id ?? "");
    if (!botJid) return;

    for (const { key, update } of updates) {
      try {
        if ((update as { messageStubType?: number }).messageStubType !== 1) continue;

        const cached = msgStore.get(key.id ?? "");
        if (!cached) continue;

        const chatJid   = key.remoteJid ?? "";
        const isGroup   = chatJid.endsWith("@g.us");
        const sender    = key.participant ?? chatJid;
        const senderNum = sender.split("@")[0];

        if (sender === botJid) continue;

        const tipo      = detectType(cached);
        const caption   = getCaption(cached);
        const chatLabel = isGroup ? "Grupo" : "Privado";
        const hora      = new Date(Number(cached.messageTimestamp) * 1000)
          .toLocaleString("es-CO", { timeZone: "America/Bogota" });

        let alertText = [
          Deco.header("ANTI-DELETE"),
          Deco.warnLine("Mensaje eliminado detectado."),
          "",
          Deco.listItem("Origen", chatLabel),
          Deco.listItem("De", `+${senderNum}`),
          Deco.listItem("Tipo", tipo),
          Deco.listItem("Hora", hora),
        ].join("\n");

        if (caption) {
          alertText += "\n\n" + Deco.infoLine("Texto / Contenido:") + "\n" + Deco.blockquote(caption);
        }

        await sock.sendMessage(botJid, { text: alertText });
        await sock.sendMessage(botJid, { forward: cached, force: true });

        log.del(`+${senderNum}`);
      } catch (err) {
        log.error("AntiDelete:", (err as Error).message);
      }
    }
  });

  log.ok("AntiDelete registrado.");
}
