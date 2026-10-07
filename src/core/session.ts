import fs from "fs";
import path from "path";
import readline from "readline";
import { useMultiFileAuthState } from "ultra-baileys";
import config from "../config.js";

// ═════════════════════════════════════════════════════════════════
// 1. COLORES Y UTILIDADES (cero dependencias)
// ═════════════════════════════════════════════════════════════════

const c = {
  rst:     "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  white:   "\x1b[38;5;231m",
  silver:  "\x1b[38;5;250m",
  gray:    "\x1b[38;5;244m",
  dark:    "\x1b[38;5;238m",
  green:   "\x1b[38;5;46m",
  green2:  "\x1b[38;5;48m",
  green3:  "\x1b[38;5;49m",
  lime4:   "\x1b[38;5;34m",
  lime5:   "\x1b[38;5;28m",
  lime6:   "\x1b[38;5;22m",
  cyan:    "\x1b[38;5;51m",
  blue:    "\x1b[38;5;39m",
  red:     "\x1b[38;5;196m",
  redDark: "\x1b[38;5;88m",
  bgRed:   "\x1b[48;5;196m",
  gold:    "\x1b[38;5;220m",
};

const isTTY = () => Boolean(process.stdout.isTTY);
const cols = () => process.stdout.columns || 80;
// Ancho interior de las cajas. Caja total = W + 4, siempre menor al ancho de la terminal.
const getWidth = () => Math.max(30, Math.min(76, cols() - 5));

const sleep = (ms: number): Promise<void> =>
  isTTY() ? new Promise((res) => setTimeout(res, ms)) : Promise.resolve();

function stripAnsi(s: string): string {
  return String(s).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function hideCursor() {
  if (isTTY()) process.stdout.write("\x1b[?25l");
}
function showCursor() {
  if (isTTY()) process.stdout.write("\x1b[?25h");
}
// Si el proceso muere en medio de una animacion, el cursor vuelve igual
process.once("exit", showCursor);

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
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

// ═════════════════════════════════════════════════════════════════
// 2. TEXTOS Y HUMOR MIGAJERO
// ═════════════════════════════════════════════════════════════════

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
  ["ACCESO DENEGADO: no se pudo hackear el corazon de ella", "Causa: amor imposible (error 404: correspondencia no encontrada)"],
  ["FALLO CRITICO: firewall emocional demasiado fuerte", "Causa: ya tiene novio (error 403: forbidden)"],
  ["CONNECTION TIMEOUT: lleva 3 horas en linea sin responderte", "Causa: visto ignorado (error 408: request timeout)"],
  ["INTRUSION BLOQUEADA: ella solo te ve como amigo", "Causa: friendzone.exe no tiene parche disponible"],
  ["HACKEO FALLIDO: clave incorrecta en intento 47", "Causa: el corazon de ella requiere autenticacion de dos factores"],
  ["SISTEMA CAIDO: tu crush esta sin conexion desde hace 6 horas", "Causa: te tiene bloqueado (error 403: access denied)"],
  ["ROOTKIT RECHAZADO: demasiadas capas de indiferencia", "Causa: no pudo bypasear el modo avion sentimental"],
  ["PROCESO ABORTADO: le mando foto a otro", "Causa: corazon.exe no es de codigo abierto"],
  ["BUFFER OVERFLOW: demasiados 'hola' sin respuesta", "Causa: memoria sentimental llena de otro"],
  ["NULL POINTER EXCEPTION: su corazon no apunta a ti", "Causa: referencia invalida (error 500: internal heart error)"],
  ["SEGFAULT: intento acceder a memoria protegida", "Causa: sus sentimientos estan en modo solo lectura"],
  ["KERNEL PANIC: el amor unilateral derumbo el sistema", "Causa: no se puede amar por los dos (error 501: not implemented)"],
];

const DEV_NAME = "BrayanRK";
const DEV_ALIAS = "Draven";
const REPO = "github.com/BrayanRK/GhostSaver";

// ═════════════════════════════════════════════════════════════════
// 3. FUENTE DE BLOQUES 5x5 (A-Z, 0-9, guion)
// ═════════════════════════════════════════════════════════════════

const FONT: Record<string, string[]> = {
  " ": ["     ", "     ", "     ", "     ", "     "],
  "-": ["     ", "     ", " ███ ", "     ", "     "],
  A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
  B: ["████ ", "█   █", "████ ", "█   █", "████ "],
  C: [" ████", "█    ", "█    ", "█    ", " ████"],
  D: ["████ ", "█   █", "█   █", "█   █", "████ "],
  E: ["█████", "█    ", "████ ", "█    ", "█████"],
  F: ["█████", "█    ", "████ ", "█    ", "█    "],
  G: [" ████", "█    ", "█  ██", "█   █", " ████"],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
  J: ["  ███", "   █ ", "   █ ", "█  █ ", " ██  "],
  K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
  L: ["█    ", "█    ", "█    ", "█    ", "█████"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
  O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  P: ["████ ", "█   █", "████ ", "█    ", "█    "],
  Q: [" ███ ", "█   █", "█ █ █", "█  █ ", " ██ █"],
  R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
  S: [" ████", "█    ", " ███ ", "    █", "████ "],
  T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
  V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
  W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
  Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
  Z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
  "0": [" ███ ", "█  ██", "█ █ █", "██  █", " ███ "],
  "1": ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
  "2": [" ███ ", "█   █", "  ██ ", " █   ", "█████"],
  "3": ["████ ", "    █", " ███ ", "    █", "████ "],
  "4": ["█  █ ", "█  █ ", "█████", "   █ ", "   █ "],
  "5": ["█████", "█    ", "████ ", "    █", "████ "],
  "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
  "7": ["█████", "   █ ", "  █  ", " █   ", " █   "],
  "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
  "9": [" ███ ", "█   █", " ████", "    █", " ███ "],
};

function bigRows(text: string): string[] {
  const chars = text.toUpperCase().split("");
  return [0, 1, 2, 3, 4].map((r) =>
    chars.map((ch) => (FONT[ch] ?? FONT[" "])[r]).join(" ")
  );
}

// ═════════════════════════════════════════════════════════════════
// 4. PIEZAS DE DIBUJO (cajas HUD)
// ═════════════════════════════════════════════════════════════════

function border(kind: "top" | "mid" | "bottom", color: string, title?: string): string {
  const W = getWidth();
  if (kind === "top" && title) {
    const t = title.length > W - 4 ? title.slice(0, W - 4) : title;
    const n = Math.max(1, W - 3 - t.length);
    return `${color}╭─[ ${c.white}${c.bold}${t}${c.rst}${color} ]${"─".repeat(n)}╮${c.rst}`;
  }
  const [l, r] = kind === "top" ? ["╭", "╮"] : kind === "mid" ? ["├", "┤"] : ["╰", "╯"];
  return `${color}${l}${"─".repeat(W + 2)}${r}${c.rst}`;
}

// Linea con contenido ya coloreado (el relleno ignora los codigos ANSI)
function boxRaw(rich: string, side = c.dark): string {
  const W = getWidth();
  const pad = Math.max(0, W - stripAnsi(rich).length);
  return `${side}│${c.rst} ${rich}${" ".repeat(pad)} ${side}│${c.rst}`;
}

function centeredRich(rich: string, side = c.dark): string {
  const W = getWidth();
  const len = stripAnsi(rich).length;
  const left = Math.max(0, Math.floor((W - len) / 2));
  const right = Math.max(0, W - len - left);
  return `${side}│${c.rst} ${" ".repeat(left)}${rich}${" ".repeat(right)} ${side}│${c.rst}`;
}

function centered(text = "", color = c.white, side = c.dark): string {
  const W = getWidth();
  const t = text.length > W ? text.slice(0, W) : text;
  return centeredRich(`${color}${t}${c.rst}`, side);
}

// Texto con wrap y color -> lineas "rich" listas para meter en un panel
function txt(text: string, color = c.gray): string[] {
  if (!text) return [""];
  return wrap(text, getWidth()).map((l) => `${color}${l}${c.rst}`);
}

// Fila "▸ CLAVE    valor" alineada
function kv(key: string, value: string, color = c.white): string {
  const W = getWidth();
  const kw = 8;
  const room = W - 2 - kw - 1;
  const v = value.length > room ? value.slice(0, Math.max(1, room - 1)) + "…" : value;
  return `${c.green}▸ ${c.gray}${key.padEnd(kw)} ${color}${v}${c.rst}`;
}

type Row = string | { center: string };

async function printLines(lines: string[], delay = 0) {
  for (const l of lines) {
    console.log(l);
    if (delay) await sleep(delay);
  }
}

async function panel(title: string, rows: Row[], color = c.green, side = c.dark) {
  const out = [
    border("top", color, title),
    ...rows.map((r) => (typeof r === "string" ? boxRaw(r, side) : centeredRich(r.center, side))),
    border("bottom", color),
    "",
  ];
  await printLines(out, isTTY() ? 18 : 0);
}

// ═════════════════════════════════════════════════════════════════
// 5. EFECTOS HACKER
// ═════════════════════════════════════════════════════════════════

// Lluvia estilo Matrix (solo ASCII para no romper el ancho en Termux)
async function matrixIntro(ms = 1400) {
  if (!isTTY()) return;
  const w = Math.max(10, cols() - 1);
  const h = Math.max(4, Math.min(12, (process.stdout.rows || 24) - 3));
  const glyphs = "01<>[]{}/\\|#$%&*+=;:?ABCDEF";
  const trail = [c.white, c.green, c.green2, c.lime4, c.lime5, c.lime6];
  const heads = Array.from({ length: w }, () => -Math.floor(Math.random() * h * 2));
  const frames = Math.max(1, Math.round(ms / 60));

  hideCursor();
  try {
    for (let f = 0; f < frames; f++) {
      let out = f === 0 ? "" : `\x1b[${h}A`;
      for (let r = 0; r < h; r++) {
        let line = "";
        for (let col = 0; col < w; col++) {
          const d = heads[col] - r;
          line += d >= 0 && d < trail.length
            ? trail[d] + glyphs[Math.floor(Math.random() * glyphs.length)]
            : " ";
        }
        out += `\r${line}${c.rst}\n`;
      }
      process.stdout.write(out);
      for (let col = 0; col < w; col++) {
        heads[col]++;
        if (heads[col] - trail.length > h && Math.random() > 0.6) {
          heads[col] = -Math.floor(Math.random() * h);
        }
      }
      await sleep(60);
    }
  } finally {
    showCursor();
  }
}

// Prompt de terminal con efecto de tipeo
async function typeLine(rawCmd: string) {
  // En pantallas angostas (Termux) el prompt se acorta y el comando se recorta para no hacer wrap
  const narrow = cols() < 50;
  const user = narrow ? "ghost" : "root@ghostsaver";
  const prefixLen = 2 + user.length + 4; // sangria + usuario + ":~# "
  const cmd = rawCmd.length > cols() - 1 - prefixLen ? rawCmd.slice(0, Math.max(4, cols() - 1 - prefixLen)) : rawCmd;
  const prompt = `  ${c.green}${c.bold}${user}${c.rst}${c.white}:${c.cyan}~${c.white}# ${c.rst}`;
  if (!isTTY()) {
    console.log(prompt + cmd);
    return;
  }
  process.stdout.write(prompt);
  await sleep(180);
  for (const ch of cmd) {
    process.stdout.write(`${c.silver}${ch}${c.rst}`);
    await sleep(18 + Math.random() * 22);
  }
  await sleep(220);
  process.stdout.write("\n");
}

// Filas de texto grande que se "descifran" de izquierda a derecha
async function revealRows(rows: string[], grads: string[], frames = 14) {
  const len = Math.max(...rows.map((r) => r.length));
  const grad = (i: number) => grads[i % grads.length];

  if (!isTTY()) {
    await printLines(rows.map((r, i) => centered(r, grad(i))));
    return;
  }

  const glyphs = "01#$%&*+=<>/\\|";
  const band = 6;
  hideCursor();
  try {
    for (let f = 0; f < frames; f++) {
      const prog = Math.round(((f + 1) / frames) * (len + band));
      let out = f === 0 ? "" : `\x1b[${rows.length}A`;
      for (let r = 0; r < rows.length; r++) {
        let s = "";
        for (let col = 0; col < len; col++) {
          const ch = rows[r][col] ?? " ";
          if (ch === " ") s += " ";
          else if (col < prog - band) s += `${grad(r)}${ch}`;
          else if (col < prog) s += `${c.lime4}${glyphs[Math.floor(Math.random() * glyphs.length)]}`;
          else s += " ";
        }
        out += centeredRich(s + c.rst) + "\n";
      }
      process.stdout.write(out);
      await sleep(45);
    }
  } finally {
    showCursor();
  }
}

// ═════════════════════════════════════════════════════════════════
// 6. BOOT LOG Y GAG DEL HACKEO
// ═════════════════════════════════════════════════════════════════

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const lineW = () => Math.min(cols() - 1, 76);

function bootLine(state: "run" | "ok" | "fail", label: string, pct: number, frame = "⠋"): string {
  const lw = lineW();
  const maxLabel = Math.max(8, lw - 17);
  const text = label.length > maxLabel ? label.slice(0, maxLabel - 1) + "…" : label;
  const dots = ".".repeat(Math.max(2, lw - 15 - text.length));

  const badge =
    state === "ok"   ? `${c.dark}[${c.green} OK ${c.dark}]${c.rst}`
    : state === "fail" ? `${c.redDark}[${c.red}FAIL${c.redDark}]${c.rst}`
    : `${c.cyan}[ ${c.white}${frame}${c.cyan}  ]${c.rst}`;

  const labelColor = state === "fail" ? c.red + c.bold : c.white;
  const tag =
    state === "fail" ? `${c.red}ERR!${c.rst}`
    : state === "ok" ? `${c.green}100%${c.rst}`
    : `${c.gold}${`${pct}%`.padStart(4)}${c.rst}`;

  return `  ${badge} ${labelColor}${text}${c.rst} ${c.dark}${dots}${c.rst} ${tag}`;
}

async function bootStep(label: string, opts: { fast?: boolean; fail?: boolean } = {}) {
  const { fast = false, fail = false } = opts;
  const tick = 40;
  let f = 0;

  const climb = fail ? (fast ? 700 : 1500) : fast ? 150 + Math.random() * 150 : 300 + Math.random() * 250;
  const ticks = Math.ceil(climb / tick);
  const top = fail ? 99 : 100;

  for (let t = 0; t <= ticks; t++) {
    const pct = Math.round((t / ticks) * top);
    process.stdout.write(`\r\x1b[2K${bootLine("run", label, pct, SPINNER[f++ % SPINNER.length])}`);
    await sleep(tick);
  }

  if (!fail) {
    process.stdout.write(`\r\x1b[2K${bootLine("ok", label, 100)}\n`);
    return;
  }

  // se queda trabado en 99% antes de reventar
  const hold = Math.ceil((fast ? 700 : 1600) / 120);
  for (let t = 0; t < hold; t++) {
    process.stdout.write(`\r\x1b[2K${bootLine("run", label, 99, SPINNER[f++ % SPINNER.length])}`);
    await sleep(120);
  }

  // flash rojo
  const flash = lineW() >= 44 ? " SYSTEM FAILURE // INTRUSION REJECTED " : " SYSTEM FAILURE ";
  for (let i = 0; i < 3; i++) {
    process.stdout.write(`\r\x1b[2K  ${c.bgRed}${c.white}${c.bold}${flash}${c.rst}`);
    await sleep(70);
    process.stdout.write(`\r\x1b[2K`);
    await sleep(55);
  }
  process.stdout.write(`\r\x1b[2K${bootLine("fail", label, 99)}\n`);
}

async function hackGag(fast = false) {
  await bootStep(HACK_TARGET, { fail: true, fast });
  const [err1, err2] = HACK_ERRORS[Math.floor(Math.random() * HACK_ERRORS.length)];
  console.log("");
  await panel(
    "INTRUSION REJECTED",
    [...txt(`✖ ${err1}`, c.red + c.bold), "", ...txt(err2, c.gray)],
    c.red,
    c.redDark
  );
  await sleep(fast ? 900 : 1500);
}

async function bootSequence(
  command: string,
  steps: string[],
  opts: { fast?: boolean; hack?: boolean } = {}
) {
  if (!isTTY()) return; // en pm2 / logs no animamos nada
  hideCursor();
  try {
    console.log("");
    await typeLine(command);
    console.log("");
    for (const s of steps) await bootStep(s, { fast: opts.fast });
    if (opts.hack) await hackGag(opts.fast);
    else await sleep(opts.fast ? 150 : 400);
  } finally {
    showCursor();
  }
}

// ═════════════════════════════════════════════════════════════════
// 7. HERO (logo + titulo + firma)
// ═════════════════════════════════════════════════════════════════

// Cada linea es simetrica, asi que centrarlas una por una da el fantasma perfecto
const GHOST = [
  "▄▄██████▄▄",
  "▄██████████████▄",
  "██████████████████",
  "███  ████████  ███",
  "███  ████████  ███",
  "██████████████████",
  "████████▄▄████████",
  "██████████████████",
  "██▀██▀██▀▀██▀██▀██",
];

const GHOST_GRAD = [c.white, c.white, c.silver, c.cyan, c.cyan, c.green3, c.green3, c.green2, c.green];
const TITLE_GRAD = [c.green, c.green2, c.green3, c.cyan, c.cyan];

async function renderHero(opts: { ready?: boolean; ghost?: boolean; bigTitle?: boolean } = {}) {
  const { ready = false, ghost = true, bigTitle = true } = opts;
  const W = getWidth();
  const wide = W >= 59; // GHOSTSAVER en una sola linea mide 59
  const delay = isTTY() ? 22 : 0;

  const head: string[] = [border("top", c.green, ready ? "GHOSTSAVER // ONLINE" : "GHOSTSAVER // BOOT"), centered("")];
  if (ghost) {
    GHOST.forEach((l, i) => head.push(centered(l, GHOST_GRAD[i])));
    head.push(centered(""));
  }
  await printLines(head, delay);

  if (bigTitle) {
    const rows = wide ? bigRows("GHOSTSAVER") : [...bigRows("GHOST"), ...bigRows("SAVER")];
    const grads = wide ? TITLE_GRAD : [...TITLE_GRAD, ...TITLE_GRAD];
    await revealRows(rows, grads);
  } else {
    await printLines([centeredRich(`${c.bold}${c.green}G H O S T S A V E R${c.rst}`)]);
  }

  const tail: string[] = [];
  tail.push(centered(""));
  tail.push(centered(W >= 36 ? "─── WhatsApp Session Guardian ───" : "WhatsApp Session Guardian", c.cyan));
  if (W >= 37) tail.push(centered("ViewOnce Saver · AntiDelete · Stealth", c.gray));
  tail.push(centeredRich(`${c.lime6}░${c.lime5}▒${c.lime4}▓${c.green}█${c.lime4}▓${c.lime5}▒${c.lime6}░${c.rst}`));
  tail.push(border("mid", c.cyan));
  tail.push(
    centeredRich(`${c.gray}DEV ${c.dark}//${c.rst} ${c.gold}${c.bold}${DEV_NAME}${c.rst} ${c.gray}aka${c.rst} ${c.cyan}${DEV_ALIAS}${c.rst}`)
  );
  tail.push(
    W >= 38
      ? centeredRich(`${c.gray}REPO ${c.dark}//${c.rst} ${c.silver}${REPO}${c.rst}`)
      : centered(REPO, c.silver)
  );

  const state = ready ? "ONLINE" : "BOOT";
  const stateColor = ready ? c.green : c.gold;
  tail.push(
    centeredRich(
      W >= 44
        ? `${stateColor}● ${state}${c.rst}   ${c.gray}◆ SECURE   ◆ STEALTH   ◆ PRO${c.rst}`
        : `${stateColor}● ${state}${c.rst}   ${c.gray}◆ SECURE   ◆ PRO${c.rst}`
    )
  );
  tail.push(border("bottom", c.green));
  tail.push("");
  await printLines(tail, delay);
}

// ═════════════════════════════════════════════════════════════════
// 8. BANNERS PUBLICOS
// ═════════════════════════════════════════════════════════════════

export async function printSetupBanner(): Promise<void> {
  if (isTTY()) {
    console.clear();
    await matrixIntro(1300);
    console.clear();
    await bootSequence("./ghostsaver --init", pickRandom(LOADING_MSGS, 5), { hack: true });
    console.clear();
  }
  await renderHero({});
  await panel(
    "INITIAL SETUP",
    [
      ...txt("▸ Ingresa tu numero para vincular WhatsApp", c.cyan),
      ...txt("▸ Solo necesitas hacer esto UNA VEZ.", c.gold),
    ],
    c.blue
  );
}

export async function printPairingBanner(code: string): Promise<void> {
  if (isTTY()) {
    console.clear();
    // Animación eliminada para que el código cargue instantáneamente y no se pierda la conexión
  }
  // Pairing: version compacta (sin fantasma) para que el codigo quede siempre visible
  await renderHero({ ghost: false, bigTitle: getWidth() >= 59 });

  const W = getWidth();
  const formatCode = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;

  // Codigo grande: en pantallas anchas una linea, en Termux dos bloques apilados
  let codeRows: string[];
  if (W >= 53 || formatCode.length <= 5) {
    codeRows = bigRows(formatCode);
  } else {
    const plain = formatCode.replace("-", "");
    const half = Math.ceil(plain.length / 2);
    codeRows = [...bigRows(plain.slice(0, half)), ...bigRows(plain.slice(half))];
  }

  const rows: Row[] = [
    ...txt("Sigue estos pasos en tu celular:", c.cyan),
    "",
    ...txt("1 ▸ Abre WhatsApp", c.white),
    ...txt("2 ▸ Toca los 3 puntos → Dispositivos vinculados", c.silver),
    ...txt("3 ▸ Toca \"Vincular con numero de telefono\"", c.silver),
    ...txt("4 ▸ Ingresa tu numero y escribe el codigo", c.silver),
    "",
    ...codeRows.map((r, i): Row => ({ center: `${c.bold}${TITLE_GRAD[i % TITLE_GRAD.length]}${r}${c.rst}` })),
    "",
    { center: `${c.gray}CODIGO ▸ ${c.white}${c.bold}${formatCode}${c.rst}` },
    { center: `${c.gold}expira en 60 segundos${c.rst}` },
  ];

  await panel("PAIRING REQUIRED", rows, c.cyan);
}

export async function printConnectedBanner(ownerNumber: string, prefixEnabled: boolean): Promise<void> {
  if (isTTY()) {
    console.clear();
    await bootSequence("./ghostsaver --start", [], { fast: true, hack: true }); // solo el gag rapido
    console.clear();
  }
  await renderHero({ ready: true });

  const pfxStr = prefixEnabled ? `[ ${config.prefix} ] Activo` : "Desactivado";
  const cmdStr = prefixEnabled ? `${config.prefix}vv` : "vv";

  await panel("SECURE STATUS", [
    kv("BOT", "GHOSTSAVER PRO", c.green),
    kv("STATUS", "ONLINE · PROTEGIDO", c.green),
    kv("OWNER", `+${ownerNumber}`, c.cyan),
    kv("PREFIX", pfxStr, c.gold),
    kv("ENGINE", "ultra-baileys", c.white),
    kv("SECURITY", "AntiDelete [ON]", c.silver),
    kv("COMMANDS", cmdStr, c.white),
  ]);

  if (isTTY()) {
    await typeLine("tail -f events.log  # escuchando...");
    console.log("");
  }
}

// ═════════════════════════════════════════════════════════════════
// 9. LÓGICA DE SESIÓN (intacta)
// ═════════════════════════════════════════════════════════════════

function prompt(text: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(text, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

export async function getOwnerNumber(): Promise<string> {
  const superOwner = config.superOwnerJid as string;
  if (superOwner && superOwner !== "") {
    const n = superOwner.split("@")[0];
    if (n && n !== "5732230904061") return n;
  }

  const file = path.join(process.cwd(), config.sessionFile);
  const credsFile = path.join(process.cwd(), config.sessionDir, "creds.json");
  const isPaired = fs.existsSync(credsFile);

  if (fs.existsSync(file)) {
    try {
      const d = JSON.parse(fs.readFileSync(file, "utf8")) as { ownerNumber?: string };
      if (d.ownerNumber) {
        if (isPaired) {
          return d.ownerNumber;
        } else {
          const ans = await prompt(
            `\n  ${c.gold}⚠ Se encontro un intento pendiente con el numero: +${d.ownerNumber}${c.rst}\n  ${c.cyan}¿Deseas volver a intentar vincular con este mismo numero? (S/n): ${c.rst}`
          );
          if (ans.trim().toLowerCase() !== "n") {
            return d.ownerNumber;
          }
        }
      }
    } catch { /* corrupto, ignorar */ }
  }

  await printSetupBanner();

  let number = "";
  while (!number || !/^\d{10,15}$/.test(number)) {
    number = await prompt(
      `  ${c.cyan}➤${c.white} Tu numero (todo pegado, con cod. de pais, sin el +):${c.rst}\n  ${c.gold}Ejemplo: 57322...${c.rst} > `
    );
    if (!/^\d{10,15}$/.test(number)) {
      console.log(`\n  ${c.red}✖ Numero invalido. Usa solo numeros.${c.rst}\n`);
    }
  }

  let sessionData = {};
  if (fs.existsSync(file)) {
    try {
      sessionData = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch { /* ignorar */ }
  }

  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  fs.writeFileSync(file, JSON.stringify({ ...sessionData, ownerNumber: number }, null, 2));
  console.log(`\n  ${c.green}✔ Guardado: +${number}${c.rst}`);
  console.log(`  ${c.gray}${c.dim}(Si falla, te preguntara la proxima vez)\n${c.rst}`);

  return number;
}

export function clearSession(): void {
  const p = path.resolve(process.cwd(), config.sessionDir);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

export async function loadAuthState(): Promise<ReturnType<typeof useMultiFileAuthState>> {
  const p = path.resolve(process.cwd(), config.sessionDir);
  return await useMultiFileAuthState(p);
}
