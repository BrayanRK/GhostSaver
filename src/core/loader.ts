// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Command Loader v2.0               ║
// ║              Carga dinámica + auto-reload de comandos .ts   ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Command } from "../types/index.js";
import log from "../logger.js";
import config from "../config.js";

const COMMANDS_DIR = path.resolve(process.cwd(), config.commandsDir);

// ─── Obtiene todos los archivos .ts de forma recursiva ───────────────────────
function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  let results: string[] = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (
      item.isFile() &&
      (item.name.endsWith(".ts") || item.name.endsWith(".js")) &&
      !item.name.endsWith(".d.ts")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Carga todos los comandos en el mapa ─────────────────────────────────────
export async function loadCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();

  if (!fs.existsSync(COMMANDS_DIR)) {
    fs.mkdirSync(COMMANDS_DIR, { recursive: true });
    return commands;
  }

  for (const fullPath of getFiles(COMMANDS_DIR)) {
    try {
      // Cache-bust para que tsx recargue el módulo actualizado
      const fileUrl = `${pathToFileURL(fullPath).href}?v=${Date.now()}`;
      const module  = await import(fileUrl) as { default?: Command };
      const cmd     = module.default;

      if (!cmd?.name || typeof cmd.run !== "function") continue;

      commands.set(cmd.name.toLowerCase(), cmd);

      if (Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) {
          commands.set(alias.toLowerCase(), cmd);
        }
      }
    } catch (e) {
      log.error(`Error cargando ${path.basename(fullPath)}:`, (e as Error).message);
    }
  }

  return commands;
}

let isWatching = false;

// ─── Auto-reload con debounce ─────────────────────────────────────────────────
export function setupAutoReload(commands: Map<string, Command>): void {
  if (isWatching) return;
  isWatching = true;

  let debounce: NodeJS.Timeout | null = null;

  fs.watch(COMMANDS_DIR, { recursive: true }, async (_event, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".ts") && !filename.endsWith(".js")) return;

    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(async () => {
      log.info(`Cambio detectado: ${filename} — Recargando comandos...`);
      try {
        const fresh = await loadCommands();
        commands.clear();
        fresh.forEach((v, k) => commands.set(k, v));
        const names = [...new Set([...commands.values()].map((c) => c.name))];
        log.ok(`Recargados: ${names.join(", ")}`);
      } catch (e) {
        log.error("Error en auto-reload:", (e as Error).message);
      }
    }, config.reloadDebounce);
  });

  log.ok("Auto-reload activo en /commands");
}

export { COMMANDS_DIR };
