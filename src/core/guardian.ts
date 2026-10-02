// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Guardian v2.0                     ║
// ║              Verificación por JID + fromMe                  ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WAMessage } from "ultra-baileys";

// ─── Normaliza un JID quitando el sufijo de dispositivo (:X) ─────────────────
export function normalizeJid(jid: string): string {
  return jid.replace(/:.*@/, "@").trim();
}

// ─── Extrae el JID del bot sin sufijo de dispositivo ─────────────────────────
export function normalizeBotJid(rawJid: string): string {
  return normalizeJid(rawJid);
}

// ─── Extrae el número del bot a partir de su JID ─────────────────────────────
export function extractOwnerFromJid(botJid: string): string {
  return String(botJid).split(":")[0].split("@")[0];
}

// ─── Obtiene el JID del remitente de un mensaje ───────────────────────────────
export function getSenderJid(msg: WAMessage): string {
  const raw = msg?.key?.participant ?? msg?.key?.remoteJid ?? "";
  return normalizeJid(raw);
}

// ─── Verifica si el mensaje es del owner autorizado ──────────────────────────
// Lógica:
//   1. fromMe === true  → es el número vinculado al bot (owner local)
//   2. JID del sender === superOwnerJid  → tú (owner global, por JID)
export function isOwner(
  msg: WAMessage,
  superOwnerJid: string
): boolean {
  if (msg?.key?.fromMe === true) return true;
  if (!superOwnerJid)            return false;

  const senderJid = getSenderJid(msg);
  return normalizeJid(senderJid) === normalizeJid(superOwnerJid);
}

// ─── Verifica si el chat es privado (no grupo) ────────────────────────────────
export function isPrivateChat(msg: WAMessage): boolean {
  const remoteJid = msg?.key?.remoteJid ?? "";
  return !remoteJid.endsWith("@g.us") && !remoteJid.endsWith("@broadcast");
}

// ─── Verifica si el remitente es el superOwner global ────────────────────────
export function isSuperOwner(msg: WAMessage, superOwnerJid: string): boolean {
  if (!superOwnerJid) return false;
  if (msg?.key?.fromMe === true) return true;
  const senderJid = getSenderJid(msg);
  return normalizeJid(senderJid) === normalizeJid(superOwnerJid);
}
