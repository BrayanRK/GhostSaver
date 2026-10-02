// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Logger v2.0 Premium               ║
// ║              by Brayan / bytebot                            ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Estilos ───────────────────────────────────────────────────────────────────
const R   = "\x1b[0m";
const B   = "\x1b[1m";
const DIM = "\x1b[2m";

// Colores de texto
const WHITE   = "\x1b[97m";
const CYAN    = "\x1b[96m";
const GREEN   = "\x1b[92m";
const YELLOW  = "\x1b[93m";
const RED     = "\x1b[91m";
const MAGENTA = "\x1b[95m";
const BLUE    = "\x1b[94m";
const GRAY    = "\x1b[90m";

// Fondos
const BG_GREEN   = "\x1b[42m";
const BG_RED     = "\x1b[41m";
const BG_YELLOW  = "\x1b[43m";
const BG_CYAN    = "\x1b[46m";
const BG_MAGENTA = "\x1b[45m";
const BG_BLUE    = "\x1b[44m";
const BG_GRAY    = "\x1b[100m";

// ── Timestamp ─────────────────────────────────────────────────────────────────
function ts(): string {
  const now = new Date();
  const h   = String(now.getHours()).padStart(2, "0");
  const m   = String(now.getMinutes()).padStart(2, "0");
  const s   = String(now.getSeconds()).padStart(2, "0");
  return `${GRAY}${DIM}${h}:${m}:${s}${R}`;
}

// ── Etiqueta coloreada ────────────────────────────────────────────────────────
function label(bg: string, fg: string, text: string): string {
  return `${B}${bg}${fg}${text}${R}`;
}

// ── Logger ────────────────────────────────────────────────────────────────────
const log = {
  ok:    (...a: unknown[]) => console.log(`${ts()} ${label(BG_GREEN,   "\x1b[30m", " ✦ OK   ")} ${GREEN}${a.join(" ")}${R}`),
  info:  (...a: unknown[]) => console.log(`${ts()} ${label(BG_CYAN,    "\x1b[30m", " ◈ INFO ")} ${CYAN}${a.join(" ")}${R}`),
  warn:  (...a: unknown[]) => console.log(`${ts()} ${label(BG_YELLOW,  "\x1b[30m", " ◉ WARN ")} ${YELLOW}${a.join(" ")}${R}`),
  error: (...a: unknown[]) => console.log(`${ts()} ${label(BG_RED,     WHITE,      " ✖ ERR  ")} ${RED}${a.join(" ")}${R}`),
  cmd:   (...a: unknown[]) => console.log(`${ts()} ${label(BG_MAGENTA, WHITE,      " ⚡ CMD  ")} ${MAGENTA}${a.join(" ")}${R}`),
  ghost: (...a: unknown[]) => console.log(`${ts()} ${label(BG_BLUE,    WHITE,      " ◈ VIEW ")} ${BLUE}${a.join(" ")}${R}`),
  del:   (...a: unknown[]) => console.log(`${ts()} ${label(BG_GRAY,    WHITE,      " ✖ DEL  ")} ${GRAY}${B}${a.join(" ")}${R}`),
  ban:   (...a: unknown[]) => console.log(`${ts()} ${label(BG_RED,     WHITE,      " ⛔ IGN  ")} ${RED}${DIM}${a.join(" ")}${R}`),
  div:   ()                => console.log(`  ${GRAY}${DIM}${"━".repeat(54)}${R}`),
  gap:   ()                => console.log(""),
};

export default log;
