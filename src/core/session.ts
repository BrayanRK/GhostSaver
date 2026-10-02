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
  neonG:   '\x1b[38;5;46m',  // Hacker Green
  neonC:   '\x1b[38;5;51m',  // Cyber Cyan
  red:     '\x1b[38;5;196m',
  gold:    '\x1b[38;5;220m',
  dim:     '\x1b[2m',
};

const WIDTH = 100;

const HERO_LOGO = [
  '                                                                         ',
  '         ________  ______  ________________ ___ _    ____________        ',
  '        / ____/ / / / __ \\/ ___/_  __/ ___//   | |  / / ____/ __ \\       ',
  '       / / __/ /_/ / / / /\\__ \\ / /  \\__ \\/ /| | | / / __/ / /_/ /       ',
  '      / /_/ / __  / /_/ /___/ // /  ___/ / ___ | |/ / /___/ _, _/        ',
  '      \\____/_/ /_/\\____//____//_/  /____/_/  |_|___/_____/_/ |_|         ',
  '                                                                         ',
  '                          .-.                                            ',
  '                         (o o)                                           ',
  '                         | O \\                                           ',
  '                          \\   \\                                          ',
  '                           `~~~\'                                         ',
  '                                                                         ',
  '                    GUARDIAN ACTIVATED                                   ',
  '                                                                         '
];

function stripAnsi(value: string) {
  return String(value).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function line(text = "", color = colors.white) {
  const raw = stripAnsi(text);
  const size = Math.max(0, WIDTH - raw.length);
  return `${colors.dark}│${colors.reset} ${color}${text}${colors.reset}${" ".repeat(size)} ${colors.dark}│${colors.reset}`;
}

function centerLine(text = "", color = colors.white) {
  const raw = stripAnsi(text);
  const left = Math.max(0, Math.floor((WIDTH - raw.length) / 2));
  const right = Math.max(0, WIDTH - raw.length - left);
  return `${colors.dark}│${colors.reset} ${" ".repeat(left)}${color}${text}${colors.reset}${" ".repeat(right)} ${colors.dark}│${colors.reset}`;
}

function panel(title: string, rows: {text: string, color: string}[] = []) {
  console.log(`${colors.neonG}╭${"─".repeat(WIDTH + 2)}╮${colors.reset}`);
  console.log(line(title, colors.white));
  console.log(`${colors.neonC}├${"─".repeat(WIDTH + 2)}┤${colors.reset}`);
  for (const row of rows) console.log(line(row.text, row.color || colors.gray));
  console.log(`${colors.neonG}╰${"─".repeat(WIDTH + 2)}╯${colors.reset}`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadingScreen(taskName: string) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  for (let step = 0; step <= 20; step++) {
    const bar = '█'.repeat(step) + '░'.repeat(20 - step);
    process.stdout.write(`\r  ${colors.neonC}${frames[i]}${colors.reset}  ${colors.white}${taskName}${colors.reset}  ${colors.neonG}[${bar}]${colors.reset}  ${colors.gold}${step * 5}%${colors.reset}`);
    i = (i + 1) % frames.length;
    await sleep(40);
  }
  process.stdout.write(`\r  ${colors.neonG}✔${colors.reset}  ${colors.white}${taskName}${colors.reset}  ${colors.neonG}[${'█'.repeat(20)}]${colors.reset}  ${colors.gold}100%${colors.reset}\n\n`);
}

async function renderHero(sessionReady = false) {
  const logoColors = [colors.neonG, colors.neonC, colors.white, colors.silver];

  console.log(`${colors.neonG}╭${"─".repeat(WIDTH + 2)}╮${colors.reset}`);
  console.log(centerLine("GHOSTSAVER PRO", colors.neonG));
  console.log(centerLine("Hacker / Guardian Edition", colors.neonC));
  console.log(centerLine("Powered by BrayanRK", colors.gold));
  console.log(centerLine(`${colors.neonG}✦${colors.reset} ${sessionReady ? "Sesion de Ghost interceptada" : "Iniciando sistema de vinculacion"} ${colors.neonG}✦${colors.reset}`, colors.gray));
  console.log(`${colors.neonC}├${"─".repeat(WIDTH + 2)}┤${colors.reset}`);
  
  for (let i = 0; i < HERO_LOGO.length; i += 1) {
    const tint = logoColors[i % logoColors.length];
    console.log(centerLine(HERO_LOGO[i], tint));
    await sleep(15); // Animación tipo scanline
  }
  
  console.log(`${colors.neonG}├${"─".repeat(WIDTH + 2)}┤${colors.reset}`);
  console.log(centerLine(`${colors.neonC}╭${colors.reset}${"─".repeat(14)}${colors.neonC}╮${colors.reset} ${colors.gray}System${colors.reset} ${colors.neonC}╭${colors.reset}${"─".repeat(14)}${colors.neonC}╮${colors.reset}`, colors.gray));
  console.log(centerLine(`${colors.neonC}│${colors.reset} ${sessionReady ? colors.white + "ONLINE" : colors.white + " BOOT "} ${colors.neonC}│${colors.reset} ${colors.gray}GHOSTSAVER PRO${colors.reset} ${colors.neonC}│${colors.reset} ${colors.white} PROTECTED${colors.reset} ${colors.neonC}│${colors.reset}`, colors.gray));
  console.log(centerLine(`${colors.neonC}╰${colors.reset}${"─".repeat(14)}${colors.neonC}╯${colors.reset} ${colors.gray}•${colors.reset} ${colors.gray}SAFE${colors.reset} ${colors.gray}•${colors.reset}`, colors.gray));
  console.log(`${colors.neonG}╰${"─".repeat(WIDTH + 2)}╯${colors.reset}`);
  console.log("");
}

export async function printSetupBanner(): Promise<void> {
  console.clear();
  await loadingScreen("Iniciando Core de GhostSaver...");
  await renderHero(false);
  panel("Inicializacion del Guardian", [
    { text: "✦  Ingresa tu numero para interceptar la sesion de WhatsApp", color: colors.neonC },
    { text: "✦  Solo necesitas hacer esto UNA VEZ.", color: colors.gold },
  ]);
  console.log("");
}

export async function printPairingBanner(code: string): Promise<void> {
  console.clear();
  await loadingScreen("Generando Codigo de Encriptacion...");
  await renderHero(false);
  const formatCode = code.length === 8 ? code.slice(0,4) + "-" + code.slice(4) : code;
  panel("Paso Final - Vinculacion", [
    { text: "✦  Abre WhatsApp en tu celular principal", color: colors.silver },
    { text: "✦  Toca \"Dispositivos vinculados\"", color: colors.silver },
    { text: "✦  Toca \"Vincular con numero de telefono\"", color: colors.silver },
    { text: `✦  Ingresa este codigo maestro:  ${formatCode}  `, color: colors.neonG }
  ]);
  console.log("");
}

export async function printConnectedBanner(ownerNumber: string, prefixEnabled: boolean): Promise<void> {
  console.clear();
  await loadingScreen("Sincronizando GhostSaver con WhatsApp...");
  await renderHero(true);
  const prefixStr = prefixEnabled ? `[ ${config.prefix} ] Activo` : "Desactivado";
  panel("Conexion Establecida", [
    { text: "Bot: GHOSTSAVER PRO", color: colors.neonG },
    { text: "Estado: ONLINE y PROTEGIDO", color: colors.white },
    { text: `Owner: +${ownerNumber}`, color: colors.neonC },
    { text: `Prefijo: ${prefixStr}`, color: colors.gold },
    { text: "Seguridad: AntiDelete [Activo] | Comandos: .vv", color: colors.gray },
    { text: "Dev: BrayanRK", color: colors.neonG },
  ]);
  console.log("");
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

  await printSetupBanner();

  let number = "";
  while (!number || !/^\d{10,15}$/.test(number)) {
    number = await prompt(
      `  ${colors.neonG}➤${colors.white} Tu numero (con codigo de pais, sin +):${colors.reset}\n  ${colors.gold}Ej: 5732XXXXXXXX${colors.reset} > `
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
