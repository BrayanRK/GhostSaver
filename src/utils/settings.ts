// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Settings Manager v2.0             ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import type { BotSettings } from "../types/index.js";
import { DEFAULT_DOWNLOAD_DIR } from "./paths.js";
import config from "../config.js";
import log from "../logger.js";

const DEFAULT_VV_ALIASES = ["viewonce", "vo", "ver"];

function getDefaults(): BotSettings {
  return {
    saveMode:       "storage",
    antiDelete:     true,
    downloadDir:    DEFAULT_DOWNLOAD_DIR,
    vvAliases:      DEFAULT_VV_ALIASES,
    prefixEnabled:  false,   // Sin prefijo por defecto
  };
}

export function loadSettings(): BotSettings {
  const file = config.settingsFile;
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<BotSettings>;
      const d      = getDefaults();
      return {
        saveMode:      parsed.saveMode      ?? d.saveMode,
        antiDelete:    parsed.antiDelete    ?? d.antiDelete,
        downloadDir:   parsed.downloadDir   || d.downloadDir,
        vvAliases:     parsed.vvAliases     ?? d.vvAliases,
        prefixEnabled: parsed.prefixEnabled ?? d.prefixEnabled,
      };
    }
  } catch {
    log.warn("settings.json inválido, usando defaults.");
  }
  return getDefaults();
}

export function saveSettings(settings: BotSettings): void {
  try {
    fs.writeFileSync(config.settingsFile, JSON.stringify(settings, null, 2), "utf8");
  } catch (e) {
    log.error("No se pudo guardar settings.json:", (e as Error).message);
  }
}

export function initSettings(): BotSettings {
  const s = loadSettings();
  if (!fs.existsSync(config.settingsFile)) {
    saveSettings(s);
    log.info("settings.json creado.");
  }
  return s;
}
