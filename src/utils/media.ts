// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Media Utility v2.0                ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import path from "path";
import { downloadMediaMessage, normalizeMessageContent } from "ultra-baileys";
import type { WASocket, WAMessage } from "ultra-baileys";
import type { MediaResult, MediaType, SaveMode } from "../types/index.js";
import {
  getMediaFolder,
  generatePremiumName,
  getExtension,
  TEMP_DIR,
} from "./paths.js";
import log from "../logger.js";

// ─── Detecta ViewOnce en mensaje normalizado ──────────────────────────────────
export function findViewOnceMedia(
  message: Record<string, unknown> | null | undefined
): MediaResult | null {
  if (!message) return null;

  // Si tiene el wrapper ephemeralMessage, desenvolvemos y llamamos recursivamente
  if (message.ephemeralMessage) {
    const ephemInner = (message.ephemeralMessage as { message?: Record<string, unknown> })?.message;
    if (ephemInner) return findViewOnceMedia(ephemInner);
  }

  // 1. Detección estándar Baileys (Wrappers)
  let inner =
    (message.viewOnceMessage          as { message?: Record<string, unknown> })?.message ||
    (message.viewOnceMessageV2        as { message?: Record<string, unknown> })?.message ||
    (message.viewOnceMessageV2Extension as { message?: Record<string, unknown> })?.message;

  if (inner) {
    if (inner.imageMessage) return { type: "image", message: inner };
    if (inner.videoMessage) return { type: "video", message: inner };
    if (inner.audioMessage) return { type: "audio", message: inner };
  }

  // 2. Detección ultra-baileys (Propiedad viewOnce: true inyectada directo en el medio)
  if (message.imageMessage && (message.imageMessage as Record<string, unknown>).viewOnce === true) {
    return { type: "image", message };
  }
  if (message.videoMessage && (message.videoMessage as Record<string, unknown>).viewOnce === true) {
    return { type: "video", message };
  }
  if (message.audioMessage && (message.audioMessage as Record<string, unknown>).viewOnce === true) {
    return { type: "audio", message };
  }
  
  return null;
}

// ─── Detecta cualquier media (incluyendo ViewOnce anidado) ────────────────────
export function findAnyMedia(
  message: Record<string, unknown> | null | undefined
): MediaResult | null {
  if (!message) return null;
  if (message.imageMessage) return { type: "image", message };
  if (message.videoMessage) return { type: "video", message };
  if (message.audioMessage) return { type: "audio", message };

  const inner =
    (message.viewOnceMessage          as { message?: Record<string, unknown> })?.message ||
    (message.viewOnceMessageV2        as { message?: Record<string, unknown> })?.message ||
    (message.viewOnceMessageV2Extension as { message?: Record<string, unknown> })?.message ||
    (message.ephemeralMessage         as { message?: Record<string, unknown> })?.message;

  if (inner) return findAnyMedia(inner);
  return null;
}

// ─── Borra archivo de forma segura ───────────────────────────────────────────
function safeDelete(p: string | null): void {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch { /* silencioso */ }
}

// ─── Guarda buffer en disco con nombre premium ────────────────────────────────
function writeToDisk(buffer: Buffer, type: MediaType, senderJid: string, downloadDir: string): string {
  const folder   = getMediaFolder(senderJid, type, downloadDir);
  const fileName = generatePremiumName(folder, type);
  const filePath = path.join(folder, fileName);

  if (type === "image") {
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  // video/audio: temp → destino
  const tmp = path.join(TEMP_DIR, `tmp_${Date.now()}${getExtension(type)}`);
  try {
    fs.writeFileSync(tmp, buffer);
    fs.copyFileSync(tmp, filePath);
  } finally {
    safeDelete(tmp);
  }
  return filePath;
}

import { Deco } from "./deco.js";

// ...

// ─── Proceso completo ViewOnce según SaveMode ─────────────────────────────────
export async function processViewOnce(
  sock: WASocket,
  fakeMsg: WAMessage,
  media: MediaResult,
  senderJid: string,
  botJid: string,
  saveMode: SaveMode,
  downloadDir: string
): Promise<string | boolean> {
  try {
    const buffer = await downloadMediaMessage(
      fakeMsg, "buffer", {},
      { logger: log as any, reuploadRequest: sock.updateMediaMessage }
    ) as Buffer;

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 1000) return false;

    const type = media.type;
    let savedPath = "";

    if (saveMode === "storage" || saveMode === "forward") {
      savedPath = writeToDisk(buffer, type, senderJid, downloadDir);
    }

    if (saveMode === "forward" || saveMode === "chat") {
      const num     = senderJid.split("@")[0].replace(/\D/g, "");
      let caption = Deco.header("VIEWONCE") + "\n" + Deco.listItem("Remitente", `+${num}`);
      if (savedPath) {
        // Obtenemos solo el nombre de la carpeta y archivo para que no se vea la ruta larguisima en el movil
        const shortPath = savedPath.split(/[\/\\]/).slice(-2).join("/");
        caption += "\n" + Deco.listItem("Guardado en", shortPath);
      }
      
      if (type === "image") {
        await sock.sendMessage(botJid, { image: buffer, caption, viewOnce: false });
      } else if (type === "video") {
        await sock.sendMessage(botJid, { video: buffer, caption, viewOnce: false });
      } else if (type === "audio") {
        // En audio no hay caption visual en ptt, mandamos un msj extra
        await sock.sendMessage(botJid, { text: caption });
        await sock.sendMessage(botJid, { audio: buffer, mimetype: "audio/ogg; codecs=opus", ptt: true });
      }
    }

    return savedPath || true;
  } catch (e) {
    log.error("ViewOnce:", (e as Error).message);
    return false;
  }
}

// ─── Helpers de mensajes ──────────────────────────────────────────────────────
export function getRealSender(msg: WAMessage): string {
  return msg?.key?.participant ?? msg?.key?.remoteJid ?? "desconocido@s.whatsapp.net";
}

export function getQuotedInfo(msg: WAMessage): {
  quotedMessage: Record<string, unknown>;
  key: WAMessage["key"];
} | null {
  const ctx = (msg?.message?.extendedTextMessage as {
    contextInfo?: { quotedMessage?: Record<string, unknown>; stanzaId?: string; participant?: string };
  })?.contextInfo;

  if (!ctx?.quotedMessage || !ctx?.stanzaId) return null;

  const remoteJid = msg.key.remoteJid!;
  const key: WAMessage["key"] = { remoteJid, fromMe: false, id: ctx.stanzaId };
  if (remoteJid.endsWith("@g.us") && ctx.participant) key.participant = ctx.participant;

  return { quotedMessage: ctx.quotedMessage, key };
}

export function getTextMessage(msg: WAMessage): string {
  const m = msg?.message;
  if (!m) return "";
  return (
    (m.conversation as string) ||
    ((m.extendedTextMessage as { text?: string })?.text) ||
    ((m.imageMessage  as { caption?: string })?.caption) ||
    ((m.videoMessage  as { caption?: string })?.caption) ||
    ""
  );
}

export function normalizeJidToNumber(jid: string): string {
  return String(jid).split("@")[0].replace(/\D/g, "");
}

export { normalizeMessageContent };
