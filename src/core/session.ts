import fs from "fs";
import readline from "readline";
import { useMultiFileAuthState } from "ultra-baileys";
import config from "../config.js";
import log from "../logger.js";

const colors = {
  reset:   '\x1b[0m',
  white:   '\x1b[38;5;15m',
  silver:  '\x1b[38;5;250m',
  gray:    '\x1b[38;5;245m',
  dark:    '\x1b[38;5;238m',
  neonG:   '\x1b[38;5;46m',
  neonG2:  '\x1b[38;5;48m',
  neonG3:  '\x1b[38;5;49m',
  neonC:   '\x1b[38;5;51m',
  red:     '\x1b[38;5;196m',
  gold:    '\x1b[38;5;220m',
  dim:     '\x1b[2m',
};

// ───────────────────────── Ancho dinamico (Termux friendly) ─────────────────────────

const isTTY = Boolean(process.stdout.isTTY);
const cols = () => process.stdout.columns || 80;
// Ancho interior del cuadro. El cuadro total mide W + 4, siempre menor al ancho de la terminal.
const getWidth = () => Math.max(30, Math.min(100, cols() - 5));

const sleep = (ms: number): Promise<void> =>
  isTTY ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

function stripAnsi(value: string) {
  return String(value).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

// Corta texto en varias lineas segun el ancho (con sangria en las continuaciones)
function wrap(text: string, width: number, indent = 3): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  const limit = () => (lines.length === 0 ? width : Math.max(8, width - indent));

  for (const word of words) {
    let w = word;
    while (true) {
      if (!cur && w.length <= limit()) { cur = w; break; }
      if (cur && cur.length + 1 + w.length <= limit()) { cur += " " + w; break; }
      if (cur) { lines.push(cur); cur = ""; continue; }
      const lim = limit();
      lines.push(w.slice(0, lim));
      w = w.slice(lim);
      if (!w) break;
    }
  }
  if (cur) lines.push(cur);
  return lines.map((l, i) => (i === 0 ? l : " ".repeat(indent) + l));
}

// ───────────────────────── Bloques de dibujo ─────────────────────────

function border(kind: "top" | "mid" | "bottom", color: string): string {
  const W = getWidth();
  const [l, r] = kind === "top" ? ["╭", "╮"] : kind === "mid" ? ["├", "┤"] : ["╰", "╯"];
  return `${color}${l}${"─".repeat(W + 2)}${r}${colors.reset}`;
}

function boxLines(text = "", color = colors.white): string[] {
  const W = getWidth();
  const parts = text ? wrap(text, W) : [""];
  return parts.map(
    (l) =>
      `${colors.dark}│${colors.reset} ${color}${l}${colors.reset}${" ".repeat(Math.max(0, W - l.length))} ${colors.dark}│${colors.reset}`
  );
}

function centered(text = "", color = colors.white): string {
  const W = getWidth();
  const raw = stripAnsi(text);
  const left = Math.max(0, Math.floor((W - raw.length) / 2));
  const right = Math.max(0, W - raw.length - left);
  return `${colors.dark}│${colors.reset} ${" ".repeat(left)}${color}${text}${colors.reset}${" ".repeat(right)} ${colors.dark}│${colors.reset}`;
}

async function printLines(lines: string[], delay = 0) {
  for (const l of lines) {
    console.log(l);
    if (delay) await sleep(delay);
  }
}

function panelLines(title: string, rows: { text: string; color?: string }[] = []): string[] {
  const out: string[] = [];
  out.push(border("top", colors.neonG));
  out.push(...boxLines(title, colors.white));
  out.push(border("mid", colors.neonC));
  for (const row of rows) out.push(...boxLines(row.text, row.color || colors.gray));
  out.push(border("bottom", colors.neonG));
  return out;
}

async function panel(title: string, rows: { text: string; color?: string }[] = []) {
  await printLines(panelLines(title, rows), 22);
}

// ───────────────────────── Logo ─────────────────────────

const GHOST_ART = [
  "    ▄████▄    ",
  "  ▄████████▄  ",
  " ████████████ ",
  " ██  ████  ██ ",
  " ██  ████  ██ ",
  " ████▀▀▀▀████ ",
  " ████████████ ",
  " ██▀██▀▀██▀██ ",
];

const GHOST_GRAD = [
  colors.white, colors.white, colors.silver, colors.neonC,
  colors.neonC, colors.neonG3, colors.neonG2, colors.neonG,
];

const TITLE_GRAD = [colors.neonG, colors.neonG2, colors.neonG3, colors.neonC, colors.neonC];

// Fuente de bloques 5x5 para el titulo en pantallas anchas
const FONT: Record<string, string[]> = {
  G: [" ████", "█    ", "█  ██", "█   █", " ████"],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  S: [" ████", "█    ", " ███ ", "    █", "████ "],
  T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
  V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
  E: ["█████", "█    ", "████ ", "█    ", "█████"],
  R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
};

function bigWord(word: string): string[] {
  return [0, 1, 2, 3, 4].map((r) =>
    word.split("").map((ch) => FONT[ch][r]).join(" ")
  );
}

async function renderHero(sessionReady = false) {
  const W = getWidth();
  const wide = W >= 64;
  const out: string[] = [];

  out.push(border("top", colors.neonG));
  out.push(centered(""));
  GHOST_ART.forEach((l, i) => out.push(centered(l, GHOST_GRAD[i])));
  out.push(centered(""));

  if (wide) {
    bigWord("GHOSTSAVER").forEach((l, i) => out.push(centered(l, TITLE_GRAD[i])));
  } else {
    out.push(centered("G H O S T S A V E R", colors.neonG));
    out.push(centered("─".repeat(Math.min(19, W)), colors.dark));
  }

  out.push(centered(""));
  out.push(centered("WhatsApp Session Guardian", colors.neonC));
  out.push(border("mid", colors.neonC));
  out.push(centered("Developed by BrayanRK", colors.gold));
  out.push(centered(sessionReady ? "Sesion detectada" : "Esperando vinculacion", colors.gray));

  const state = sessionReady ? "ONLINE" : "BOOT";
  const status =
    W >= 44
      ? `${colors.neonG}● ${state}${colors.reset}   ${colors.gray}◆ GHOSTSAVER PRO   ◆ PROTECTED${colors.reset}`
      : `${colors.neonG}● ${state}${colors.reset}   ${colors.gray}◆ PROTECTED${colors.reset}`;
  out.push(centered(status));
  out.push(border("bottom", colors.neonG));
  out.push("");

  await printLines(out, 28); // el banner baja linea por linea
}

// ───────────────────────── Pantalla de carga ─────────────────────────

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const LOADING_MSGS = [
  "Saltando firewall del corazon",
  "Burlando antivirus emocional",
  "Probando clave: te_quiero123",
  "Descifrando mensajes en visto",
  "Evadiendo la friendzone",
  "Inyectando carisma.exe",
  "Escaneando puertos del alma",
  "Desencriptando indirectas",
  "Bypass de excusas: estoy ocupada",
  "Rastreando ultima vez en linea",
  "Compilando flores.js",
  "Reenviando hola por 47va vez",
  "Cargando valentia al 1%",
  "Ocultando mi IP sentimental",
  "Descargando mas ganas de ella",
];

const HACK_TARGET = "Hackeando el corazon de ella";
const HACK_ERRORS: string[][] = [
  [
    "ACCESO DENEGADO: no se pudo hackear el corazon de ella",
    "Causa: amor imposible (error 404: correspondencia no encontrada)",
  ],
  [
    "FALLO CRITICO: firewall emocional demasiado fuerte",
    "Causa: ya tiene novio (error 403: forbidden)",
  ],
  [
    "CONNECTION TIMEOUT: lleva 3 horas en linea sin responderte",
    "Causa: visto ignorado (error 408: request timeout)",
  ],
  [
    "INTRUSION BLOQUEADA: ella solo te ve como amigo",
    "Causa: friendzone.exe no tiene parche disponible",
  ],
  [
    "HACKEO FALLIDO: clave incorrecta en intento 47",
    "Causa: el corazon de ella requiere autenticacion de dos factores",
  ],
  [
    "SISTEMA CAIDO: tu crush esta sin conexion desde hace 6 horas",
    "Causa: te tiene bloqueado (error 403: access denied)",
  ],
  [
    "ROOTKIT RECHAZADO: demasiadas capas de indiferencia",
    "Causa: no pudo bypasear el modo avion sentimental",
  ],
  [
    "PROCESO ABORTADO: le mando foto a otro",
    "Causa: corazon.exe no es de codigo abierto",
  ],
  [
    "BUFFER OVERFLOW: demasiados 'hola' sin respuesta",
    "Causa: memoria sentimental llena de otro",
  ],
  [
    "NULL POINTER EXCEPTION: su corazon no apunta a ti",
    "Causa: referencia invalida (error 500: internal heart error)",
  ],
  [
    "SEGFAULT: intento acceder a memoria protegida",
    "Causa: sus sentimientos estan en modo solo lectura",
  ],
  [
    "KERNEL PANIC: el amor unilateral derumbo el sistema",
    "Causa: no se puede amar por los dos (error 501: not implemented)",
  ],
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// Muestra directamente el fallo rojo sin secuencia larga (para cuando ya hay sesion)
async function quickHackFail() {
  if (!isTTY) return;
  process.stdout.write("\x1b[?25l");
  try {
    console.log("");
    await runStep(HACK_TARGET, true);
    console.log("");
    const errors = HACK_ERRORS[Math.floor(Math.random() * HACK_ERRORS.length)];
    for (const err of errors) {
      wrap(err, cols() - 7, 2).forEach((l, i) => {
        console.log(`  ${colors.red}${i === 0 ? "✖" : " "} ${l}${colors.reset}`);
      });
    }
    await sleep(2200);
  } finally {
    process.stdout.write("\x1b[?25h");
  }
}

// Una linea de progreso que se adapta al ancho de la terminal
function stepLine(icon: string, iconColor: string, label: string, pct: number, barColor: string, labelColor = colors.white): string {
  const c = cols() - 1;
  const pctStr = `${pct}%`.padStart(4);
  const barW = Math.min(18, c - 9 - label.length - 3);
  const useBar = barW >= 6;

  let text = label;
  if (!useBar) {
    const max = c - 9;
    if (text.length > max) text = text.slice(0, Math.max(1, max - 1)) + "…";
  }

  const filled = useBar ? Math.round((barW * pct) / 100) : 0;
  const bar = useBar
    ? ` ${colors.dark}[${barColor}${"█".repeat(filled)}${colors.gray}${"░".repeat(barW - filled)}${colors.dark}]${colors.reset}`
    : "";

  return `  ${iconColor}${icon}${colors.reset} ${labelColor}${text}${colors.reset}${bar} ${colors.gold}${pctStr}${colors.reset}`;
}

async function runStep(label: string, fail = false) {
  const tick = 50;
  const dur = fail ? 2600 : 650 + Math.random() * 700;
  const ticks = Math.ceil(dur / tick);
  const target = fail ? 99 : 100;
  let f = 0;

  for (let t = 0; t <= ticks; t++) {
    const pct = Math.round((t / ticks) * target);
    process.stdout.write(`\r\x1b[2K${stepLine(FRAMES[f++ % FRAMES.length], colors.neonC, label, pct, colors.neonG)}`);
    await sleep(tick);
  }

  if (fail) {
    // se queda trabado en 99% antes de fallar
    for (let t = 0; t < 24; t++) {
      process.stdout.write(`\r\x1b[2K${stepLine(FRAMES[f++ % FRAMES.length], colors.neonC, label, 99, colors.neonG)}`);
      await sleep(tick);
    }
    process.stdout.write(`\r\x1b[2K${stepLine("✖", colors.red, label, 99, colors.red, colors.red)}\n`);
  } else {
    process.stdout.write(`\r\x1b[2K${stepLine("✔", colors.neonG, label, 100, colors.neonG)}\n`);
  }
}

async function loadingScreen(task: string, opts: { steps?: number; hackFail?: boolean } = {}) {
  if (!isTTY) return; // en pm2 / logs no animamos nada

  const steps = opts.steps ?? 4;
  process.stdout.write("\x1b[?25l"); // ocultar cursor

  try {
    console.log("");
    for (const l of wrap(task, cols() - 5, 2)) console.log(`  ${colors.neonC}${l}${colors.reset}`);
    console.log("");

    for (const msg of pickRandom(LOADING_MSGS, steps)) await runStep(msg);

    if (opts.hackFail) {
      await runStep(HACK_TARGET, true);
      console.log("");
      const errors = HACK_ERRORS[Math.floor(Math.random() * HACK_ERRORS.length)];
      for (const err of errors) {
        wrap(err, cols() - 7, 2).forEach((l, i) => {
          console.log(`  ${colors.red}${i === 0 ? "✖" : " "} ${l}${colors.reset}`);
        });
      }
      await sleep(2200);
    } else {
      await sleep(350);
    }
  } finally {
    process.stdout.write("\x1b[?25h"); // mostrar cursor
  }
}

// ───────────────────────── Banners publicos ─────────────────────────

export async function printSetupBanner(): Promise<void> {
  console.clear();
  await loadingScreen("Iniciando core de GhostSaver", { steps: 5, hackFail: true });
  console.clear();
  await renderHero(false);
  await panel("Inicializacion del Guardian", [
    { text: "▸  Ingresa tu numero para vincular la sesion de WhatsApp", color: colors.neonC },
    { text: "▸  Solo necesitas hacer esto UNA VEZ.", color: colors.gold },
  ]);
  console.log("");
}

export async function printPairingBanner(code: string): Promise<void> {
  console.clear();
  await loadingScreen("Generando codigo de vinculacion", { steps: 3 });
  console.clear();
  await renderHero(false);
  const formatCode = code.length === 8 ? code.slice(0, 4) + "-" + code.slice(4) : code;
  await panel("Paso final - Vinculacion", [
    { text: "▸  Abre WhatsApp en tu celular principal", color: colors.silver },
    { text: 'Toca "Dispositivos vinculados"'.padStart(0), color: colors.silver },
    { text: 'Toca "Vincular con numero de telefono"', color: colors.silver },
    { text: `►  CODIGO:  ${formatCode}`, color: colors.neonG },
  ]);
  console.log("");
}

export async function printConnectedBanner(ownerNumber: string, prefixEnabled: boolean): Promise<void> {
  console.clear();
  await renderHero(true);
  // Solo muestra el fallo rojo rapido (sin la secuencia larga de pasos)
  await quickHackFail();
  console.clear();
  await renderHero(true);
  const prefixStr = prefixEnabled ? `[ ${config.prefix} ] Activo` : "Desactivado";
  await panel("Conexion establecida", [
    { text: "Bot: GHOSTSAVER PRO", color: colors.neonG },
    { text: "Estado: ONLINE y PROTEGIDO", color: colors.white },
    { text: `Owner: +${ownerNumber}`, color: colors.neonC },
    { text: `Prefijo: ${prefixStr}`, color: colors.gold },
    { text: `Seguridad: AntiDelete [Activo] | Comandos: ${prefixStr}vv`, color: colors.gray },
    { text: "Dev: BrayanRK", color: colors.neonG },
  ]);
  console.log("");
}

// ───────────────────────── Sesion / Auth ─────────────────────────

function prompt(text: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(text, (ans) => { rl.close(); resolve(ans.trim()); });
  });
}

export async function getOwnerNumber(): Promise<string> {
  const file = config.sessionFile;
  if (fs.existsSync(file)) {
    try {
      const d = JSON.parse(fs.readFileSync(file, "utf8")) as { ownerNumber?: string };
      if (d.ownerNumber) return d.ownerNumber;
    } catch { /* corrupto, re-preguntar */ }
  }

  await printSetupBanner();

  let number = "";
  while (!number || !/^\d{10,15}$/.test(number)) {
    number = await prompt(
      `  ${colors.neonG}➤${colors.white} Tu numero (codigo de pais, sin +):${colors.reset}\n  ${colors.gold}Ej: 5732XXXXXXXX${colors.reset} > `
    );
    if (!/^\d{10,15}$/.test(number))
      console.log(`\n  ${colors.red}✖ Numero invalido.${colors.reset}\n`);
  }

  fs.writeFileSync(file, JSON.stringify({ ownerNumber: number }, null, 2));
  console.log(`\n  ${colors.neonG}✔ Guardado: +${number}${colors.reset}`);
  console.log(`  ${colors.gray}${colors.dim}(No te volvera a preguntar)\n${colors.reset}`);

  return number;
}

export function clearSession(): void {
  try {
    const dir = config.sessionDir;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log.warn("Sesion borrada.");
    }
  } catch (e) {
    log.error("No se pudo borrar sesion:", (e as Error).message);
  }
}

export async function loadAuthState(): Promise<ReturnType<typeof useMultiFileAuthState>> {
  const dir = config.sessionDir;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return await useMultiFileAuthState(dir);
}
