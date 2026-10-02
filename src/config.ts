// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Config v2.0                       ║
// ║              Edita aquí sin tocar el resto del código        ║
// ╚══════════════════════════════════════════════════════════════╝

const config = {
  superOwnerJid: "",

  // ── Prefijo de comandos ──────────────────────────────────────────────────────
  // Carácter de prefijo (usado cuando prefix está ON)
  prefix: ".",

  // ── Sesión ───────────────────────────────────────────────────────────────────
  sessionDir:   "./auth_info",
  sessionFile:  "./session.json",
  settingsFile: "./settings.json",

  // ── Comandos ─────────────────────────────────────────────────────────────────
  commandsDir: "./src/commands",

  // ── Anti-ban: cola de mensajes ───────────────────────────────────────────────
  queueDelay: 1200,

  // ── Cooldowns ────────────────────────────────────────────────────────────────
  defaultCooldown: 3000,

  // ── Auto-reload ──────────────────────────────────────────────────────────────
  reloadDebounce: 500,

  // ── Almacenamiento de mensajes para AntiDelete ────────────────────────────────
  msgStoreLimit: 200,

  // ── Reconexión ────────────────────────────────────────────────────────────────
  maxSessionRetries: 3,
} as const;

export default config;
