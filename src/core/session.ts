import fs from "fs";
import readline from "readline";
import { useMultiFileAuthState } from "ultra-baileys";
import config from "../config.js";
import log from "../logger.js";

const R    = "\x1b[0m";
const B    = "\x1b[1m";
const DIM  = "\x1b[2m";
const C    = "\x1b[36m";
const G    = "\x1b[32m";
const Y    = "\x1b[33m";
const M    = "\x1b[35m";
const GRAY = "\x1b[90m";
const W    = "\x1b[37m";
const BG_M = "\x1b[45m\x1b[37m";

export function printSetupBanner(): void {
  console.clear();
  console.log(`\n${C}  ╭────────────────────────────────────╮${R}`);
  console.log(`${C}  │   ${B}${W}G H O S T S A V E R   ${B}${Y}P R O${C}    │${R}`);
  console.log(`${C}  ╰────────────────────────────────────╯${R}`);
  console.log(`\n  ${GRAY}⚡ Developer :${R} ${B}${W}BrayanRK${R}`);
  console.log(`  ${GRAY}⚡ Estado    :${R} ${B}${Y}Configuración Inicial${R}\n`);
}

export function printConnectedBanner(ownerNumber: string, prefixEnabled: boolean): void {
  console.clear();
  const prefixStr = prefixEnabled ? `[ ${config.prefix} ] Activo` : "Desactivado";
  console.log(`\n${G}  ╭────────────────────────────────────╮${R}`);
  console.log(`${G}  │   ${B}${W}G H O S T S A V E R   ${B}${Y}P R O${G}    │${R}`);
  console.log(`${G}  ╰────────────────────────────────────╯${R}`);
  console.log(`\n  ${GRAY}➤${R} ${W}ESTADO DE CONEXIÓN:${R} ${B}${G}ONLINE 🟢${R}\n`);
  console.log(`  ${C}├─ 👤 Owner   :${R} ${Y}+${ownerNumber}${R}`);
  console.log(`  ${C}├─ ⚡ Prefijo :${R} ${Y}${prefixStr}${R}`);
  console.log(`  ${C}└─ 👨‍💻 Dev     :${R} ${Y}BrayanRK${R}\n`);
  console.log(`  ${GRAY}El guardián está activo y esperando comandos...${R}\n`);
}

export function printPairingBanner(code: string): void {
  console.clear();
  console.log(`\n${M}  ╭────────────────────────────────────╮${R}`);
  console.log(`${M}  │   ${B}${W}G H O S T S A V E R   ${B}${Y}P R O${M}    │${R}`);
  console.log(`${M}  ╰────────────────────────────────────╯${R}`);
  console.log(`\n  ${GRAY}➤${R} ${W}CÓDIGO DE VINCULACIÓN:${R}`);
  const formatCode = code.length === 8 ? code.slice(0,4) + "-" + code.slice(4) : code;
  console.log(`\n      ${B}${BG_M}  ${formatCode}  ${R}\n`);
  console.log(`  ${GRAY}1.${R} Abre WhatsApp en tu celular`);
  console.log(`  ${GRAY}2.${R} Toca "Dispositivos vinculados"`);
  console.log(`  ${GRAY}3.${R} Toca "Vincular con número de teléfono"`);
  console.log(`  ${GRAY}4.${R} Escribe el código gigante de arriba\n`);
}

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

  printSetupBanner();

  let number = "";
  while (!number || !/^\d{10,15}$/.test(number)) {
    number = await prompt(
      `  ${C}➤ Tu número (con código de país, sin +):${R}\n  ${Y}Ej: 5732XXXXXXXX${R} > `
    );
    if (!/^\d{10,15}$/.test(number))
      console.log(`\n  \x1b[91m✖ Número inválido.\n${R}`);
  }

  fs.writeFileSync(file, JSON.stringify({ ownerNumber: number }, null, 2));
  console.log(`\n  ${G}✔ Guardado: +${number}${R}`);
  console.log(`  ${GRAY}${DIM}(No te volverá a preguntar)\n${R}`);

  return number;
}

export function clearSession(): void {
  try {
    const dir = config.sessionDir;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log.warn("Sesión borrada.");
    }
  } catch (e) {
    log.error("No se pudo borrar sesión:", (e as Error).message);
  }
}

export async function loadAuthState(): Promise<ReturnType<typeof useMultiFileAuthState>> {
  const dir = config.sessionDir;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return await useMultiFileAuthState(dir);
}
