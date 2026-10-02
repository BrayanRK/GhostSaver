// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Types v2.0                        ║
// ║              by Brayan / bytebot                            ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";

// ─── Modos de guardado de ViewOnce ────────────────────────────────────────────
export type SaveMode =
  | "storage"   // Solo almacenamiento local
  | "forward"   // Guardar en almacenamiento + reenviar al chat del bot
  | "chat";     // Solo reenviar al chat del bot (sin guardar en disco)

// ─── Tipos de media ──────────────────────────────────────────────────────────
export type MediaType = "image" | "video" | "audio";

// ─── Resultado de detección de media ViewOnce ─────────────────────────────────
export interface MediaResult {
  type: MediaType;
  message: Record<string, unknown>;
}

// ─── Configuración persistente (settings.json) ───────────────────────────────
export interface BotSettings {
  saveMode: SaveMode;
  antiDelete: boolean;
  downloadDir: string;
  vvAliases: string[];
  prefixEnabled: boolean;    // false = sin prefijo (por defecto)
}

// ─── Contexto del bot pasado a los comandos ───────────────────────────────────
export interface BotContext {
  ownerNumber: string;
  superOwnerJid: string;     // JID completo del owner global (con @s.whatsapp.net)
  botJid: string;
  settings: BotSettings;
  saveSettings: () => void;
}

// ─── Interfaz de comando ──────────────────────────────────────────────────────
export interface Command {
  name: string;
  aliases?: string[];
  cooldown?: number;
  run: (
    sock: WASocket,
    msg: WAMessage,
    args: string[],
    ctx: BotContext
  ) => Promise<void>;
}
