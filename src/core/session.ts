import fs from "fs";
import path from "path";
import readline from "readline";
import { useMultiFileAuthState } from "ultra-baileys";
import config from "../config.js";
import log from "../logger.js";

// ═════════════════════════════════════════════════════════════════
// 1. UTILIDADES Y CONSTANTES ANSI (Cero dependencias)
// ═════════════════════════════════════════════════════════════════

const c = {
  rst: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  bgRed: "\x1b[48;5;196m",
  red: "\x1b[38;5;196m",
  redDark: "\x1b[38;5;88m",
  green: "\x1b[38;5;46m",
  cyan: "\x1b[38;5;51m",
  blue: "\x1b[38;5;33m",
  white: "\x1b[38;5;231m",
  gray: "\x1b[38;5;244m",
  dark: "\x1b[38;5;236m",
  gold: "\x1b[38;5;220m"
};

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const isTTY = () => Boolean(process.stdout.isTTY);

function getWidth(): number {
  const cols = process.stdout.columns || 80;
  return Math.max(40, Math.min(cols, 80)); // Restringido entre 40 y 80 para un HUD limpio
}

function stripAnsi(str: string): string {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
}

const sleep = (ms: number): Promise<void> =>
  isTTY() ? new Promise((res) => setTimeout(res, ms)) : Promise.resolve();

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

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ═════════════════════════════════════════════════════════════════
// 3. COMPONENTES VISUALES
// ═════════════════════════════════════════════════════════════════

async function typeCmd(cmd: string) {
  if (!isTTY()) {
    console.log(`root@ghostsaver:~# ${cmd}`);
    return;
  }
  process.stdout.write(`\n  ${c.green}${c.bold}root@ghostsaver${c.rst}:${c.cyan}~${c.rst}# `);
  await sleep(200);
  for (const char of cmd) {
    process.stdout.write(char);
    await sleep(25 + Math.random() * 40);
  }
  await sleep(300);
  console.log("\n");
}

function drawGhost() {
  const w = getWidth();
  const narrow = w < 50;

  const GHOST = [
    "     ▄▄████████▄▄     ",
    "   ▄██████████████▄   ",
    "  ██████████████████  ",
    "  ██▀▀▀████████▀▀▀██  ",
    "  ██ ▄ █ ██████ ▄ █ ██  ",
    "  ██████████████████  ",
    "  ██████▀▀▀▀▀▀██████  ",
    "  ██████████████████  ",
    "  ▀██████▀▀▀▀██████▀  ",
    "    ▀▀▀        ▀▀▀    "
  ];
  
  const GRADIENT = [c.white, c.white, c.cyan, c.cyan, c.cyan, c.blue, c.blue, c.green, c.green, c.green];

  console.log("");
  for (let i = 0; i < GHOST.length; i++) {
    const ghostLine = `${GRADIENT[i]}${GHOST[i]}${c.rst}`;
    
    if (narrow) {
      const pad = Math.max(0, Math.floor((w - 22) / 2));
      console.log(" ".repeat(pad) + ghostLine);
    } else {
      // Wide layout: Ghost on left, Title on right
      const titleLines = [
        "",
        "",
        `  ${c.bold}${c.white}G H O S T S A V E R${c.rst}`,
        `  ${c.cyan}WhatsApp Session Guardian${c.rst}`,
        `  ${c.dark}─────────────────────────${c.rst}`,
        `  ${c.gold}PRO VERSION${c.rst}`,
        `  ${c.gray}github.com/BrayanRK${c.rst}`,
        "",
        "",
        ""
      ];
      console.log(`    ${ghostLine}${titleLines[i]}`);
    }
  }

  if (narrow) {
    console.log(`\n  ${c.bold}${c.white}GHOSTSAVER PRO${c.rst}`);
    console.log(`  ${c.cyan}WhatsApp Session Guardian${c.rst}`);
    console.log(`  ${c.gray}github.com/BrayanRK${c.rst}\n`);
  } else {
    console.log("");
  }
}

function drawBox(title: string, lines: string[], color = c.cyan) {
  const w = getWidth();
  const cleanTitle = stripAnsi(title);
  const topPad = Math.max(0, w - cleanTitle.length - 8);
  
  console.log(`  ${color}╭─ [ ${c.white}${c.bold}${title}${c.rst}${color} ] ${"─".repeat(topPad)}╮${c.rst}`);
  
  for (const line of lines) {
    const clean = stripAnsi(line);
    const pad = Math.max(0, w - clean.length - 4);
    console.log(`  ${color}│${c.rst} ${line} ${" ".repeat(pad)}${color}│${c.rst}`);
  }
  
  console.log(`  ${color}╰${"─".repeat(w - 2)}╯${c.rst}\n`);
}

// ═════════════════════════════════════════════════════════════════
// 4. MOTOR DE CARGA Y HACKEO
// ═════════════════════════════════════════════════════════════════

async function runStep(label: string, isFail = false) {
  if (!isTTY()) {
    console.log(`  [ OK ] ${label}`);
    return;
  }

  const w = getWidth();
  const target = isFail ? 99 : 100;
  const tickLimit = isFail ? 35 : 20;
  let f = 0;

  for (let tick = 0; tick <= tickLimit; tick++) {
    const pct = Math.floor((tick / tickLimit) * target);
    const frame = SPINNER[f++ % SPINNER.length];
    
    // Auto-truncate label if terminal is very narrow
    let safeLabel = label;
    const fixedWidth = 10 + 9; // "[X] " + " [ XXX% ]"
    if (safeLabel.length + fixedWidth > w - 2) {
      safeLabel = safeLabel.substring(0, w - fixedWidth - 5) + "...";
    }

    const dotsCount = Math.max(1, (w - 2) - (fixedWidth + safeLabel.length));
    const dots = c.dark + ".".repeat(dotsCount) + c.rst;
    const pctStr = pct.toString().padStart(3, " ");
    const pctColor = pct === 100 ? c.green : c.gold;

    process.stdout.write(`\r\x1b[2K  ${c.cyan}[${c.white}${frame}${c.cyan}]${c.rst} ${safeLabel} ${dots} ${c.cyan}[ ${pctColor}${pctStr}% ${c.cyan}]${c.rst}`);
    await sleep(isFail ? 40 : 25);
  }

  if (isFail) {
    // Hang at 99%
    const safeLabel = label.length + 19 > w - 2 ? label.substring(0, w - 24) + "..." : label;
    const dotsCount = Math.max(1, (w - 2) - (19 + safeLabel.length));
    const dots = c.dark + ".".repeat(dotsCount) + c.rst;

    for (let j = 0; j < 12; j++) {
      const spin = SPINNER[(f + j) % SPINNER.length];
      process.stdout.write(`\r\x1b[2K  ${c.red}[${c.white}${spin}${c.red}]${c.rst} ${c.red}${c.bold}${safeLabel}${c.rst} ${dots} ${c.red}[ ${c.white} 99% ${c.red}]${c.rst}`);
      await sleep(150);
    }
  } else {
    // Success finish
    const safeLabel = label.length + 19 > w - 2 ? label.substring(0, w - 24) + "..." : label;
    const dotsCount = Math.max(1, (w - 2) - (19 + safeLabel.length));
    const dots = c.dark + ".".repeat(dotsCount) + c.rst;
    process.stdout.write(`\r\x1b[2K  ${c.dark}[ ${c.green}OK${c.dark} ]${c.rst} ${c.white}${safeLabel}${c.rst} ${dots} ${c.dark}[${c.green}100%${c.dark}]${c.rst}\n`);
  }
}

async function showHackFail() {
  await runStep(HACK_TARGET, true);
  if (!isTTY()) {
    console.log(`  [FAIL] ${HACK_TARGET}`);
    return;
  }

  const [err1, err2] = HACK_ERRORS[Math.floor(Math.random() * HACK_ERRORS.length)];
  
  // Glitch flash
  for (let i = 0; i < 3; i++) {
    process.stdout.write(`\r\x1b[2K  ${c.bgRed}${c.white}${c.bold} [ SYSTEM FAILURE - INTRUSION REJECTED ] ${c.rst}`);
    await sleep(60);
    process.stdout.write(`\r\x1b[2K`);
    await sleep(50);
  }
  
  const w = getWidth();
  const safeLabel = HACK_TARGET.length + 19 > w - 2 ? HACK_TARGET.substring(0, w - 24) + "..." : HACK_TARGET;
  const dotsCount = Math.max(1, (w - 2) - (19 + safeLabel.length));
  const dots = c.dark + ".".repeat(dotsCount) + c.rst;

  process.stdout.write(`\r\x1b[2K  ${c.redDark}[${c.red}FAIL${c.redDark}]${c.rst} ${c.red}${c.bold}${safeLabel}${c.rst} ${dots} ${c.redDark}[${c.red}ERR!${c.redDark}]${c.rst}\n`);
  console.log(`\n  ${c.red}✖  ${c.bold}${err1}${c.rst}`);
  console.log(`     ${c.gray}${err2}${c.rst}\n`);
  await sleep(1000);
}

// ═════════════════════════════════════════════════════════════════
// 5. EXPORTS PÚBLICOS (BANNERS)
// ═════════════════════════════════════════════════════════════════

export async function printSetupBanner(): Promise<void> {
  if (isTTY()) process.stdout.write("\x1b[?25l"); // Hide cursor
  try {
    console.clear();
    await typeCmd("./ghostsaver --init");
    drawGhost();
    
    for (const msg of pickRandom(LOADING_MSGS, 5)) {
      await runStep(msg);
    }
    await showHackFail();

    drawBox("INITIAL SETUP", [
      `${c.cyan}▸${c.rst} Ingresa tu numero para vincular WhatsApp`,
      `${c.gold}▸${c.rst} Solo necesitas hacer esto UNA VEZ.`
    ], c.blue);

  } finally {
    if (isTTY()) process.stdout.write("\x1b[?25h"); // Show cursor
  }
}

export async function printPairingBanner(code: string): Promise<void> {
  if (isTTY()) process.stdout.write("\x1b[?25l");
  try {
    console.clear();
    await typeCmd("./ghostsaver --pair");
    drawGhost();

    for (const msg of pickRandom(LOADING_MSGS, 3)) {
      await runStep(msg);
    }
    console.log("");

    const formatCode = code.length === 8 ? `${code.slice(0,4)}-${code.slice(4)}` : code;
    
    drawBox("PAIRING REQUIRED", [
      `${c.white}Sigue estos pasos en tu celular principal:${c.rst}`,
      "",
      `  ${c.cyan}1${c.rst} ▸ Abre WhatsApp`,
      `  ${c.cyan}2${c.rst} ▸ Toca los 3 puntos → Dispositivos vinculados`,
      `  ${c.cyan}3${c.rst} ▸ Toca "Vincular con numero de telefono"`,
      `  ${c.cyan}4${c.rst} ▸ Ingresa tu numero y espera el codigo`,
      "",
      `  ► ${c.bold}${c.green}CODIGO: ${formatCode}${c.rst}`,
      `    ${c.gold}(El codigo expira en 60 segundos)${c.rst}`
    ], c.cyan);

  } finally {
    if (isTTY()) process.stdout.write("\x1b[?25h");
  }
}

export async function printConnectedBanner(ownerNumber: string, prefixEnabled: boolean): Promise<void> {
  if (isTTY()) process.stdout.write("\x1b[?25l");
  try {
    console.clear();
    await typeCmd("./ghostsaver --start");
    drawGhost();

    // Solo el gag rápido
    await showHackFail();

    const pfxStr = prefixEnabled ? `[ ${config.prefix} ] Activo` : "Desactivado";
    const cmdStr = prefixEnabled ? `${config.prefix}vv` : "vv";

    drawBox("SECURE STATUS", [
      `${c.dark}⋆${c.rst} BOT      : ${c.green}GHOSTSAVER PRO${c.rst}`,
      `${c.dark}⋆${c.rst} STATUS   : ${c.white}ONLINE & PROTECTED${c.rst}`,
      `${c.dark}⋆${c.rst} OWNER    : ${c.cyan}+${ownerNumber}${c.rst}`,
      `${c.dark}⋆${c.rst} PREFIX   : ${c.gold}${pfxStr}${c.rst}`,
      `${c.dark}⋆${c.rst} SECURITY : ${c.gray}AntiDelete [ON]${c.rst}`,
      `${c.dark}⋆${c.rst} COMMANDS : ${c.white}${cmdStr}${c.rst}`,
      `${c.dark}⋆${c.rst} DEV      : ${c.gold}BrayanRK (Draven)${c.rst}`
    ], c.green);

  } finally {
    if (isTTY()) process.stdout.write("\x1b[?25h");
  }
}

// ═════════════════════════════════════════════════════════════════
// 6. LÓGICA DE SESIÓN (Intacta)
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
  if (superOwner) {
    const n = superOwner.split("@")[0];
    if (n && n !== "5732230904061") return n;
  }
  const f = path.join(process.cwd(), config.sessionDir, "owner.txt");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf-8").trim();

  let num = "";
  while (!num) {
    num = await prompt(`  ${c.cyan}▸ Ingresa tu numero (con cod. pais, ej: 57322...): ${c.rst}`);
    num = num.replace(/\D/g, "");
  }
  if (!fs.existsSync(path.dirname(f))) fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, num, "utf-8");
  return num;
}

export function clearSession(): void {
  const p = path.resolve(process.cwd(), config.sessionDir);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

export async function loadAuthState(): Promise<ReturnType<typeof useMultiFileAuthState>> {
  const p = path.resolve(process.cwd(), config.sessionDir);
  return await useMultiFileAuthState(p);
}
