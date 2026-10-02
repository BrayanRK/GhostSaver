// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Paths v2.0                        ║
// ║              Rutas premium: fotos / videos / audios          ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import path from "path";
import os from "os";
import type { MediaType } from "../types/index.js";

const homeDir = os.homedir();

// ── Detección de Termux ───────────────────────────────────────────────────────
export const isTermux: boolean =
  process.platform === "android" ||
  homeDir.includes("/data/data/com.termux/files/home");

// ── Directorios base ─────────────────────────────────────────────────────────
export const DEFAULT_DOWNLOAD_DIR: string = isTermux
  ? path.join(homeDir, "storage", "shared", "GhostSaver")
  : path.join(homeDir, "GhostSaver");

export const TEMP_DIR: string = isTermux
  ? path.join(homeDir, "storage", "shared", ".ghost_tmp")
  : path.join(os.tmpdir(), "ghost_tmp");

// ── Subcarpeta por tipo de media ──────────────────────────────────────────────
function getTypeFolder(type: MediaType): string {
  switch (type) {
    case "image": return "fotos";
    case "video": return "videos";
    case "audio": return "audios";
  }
}

// ── Extensión por tipo ────────────────────────────────────────────────────────
export function getExtension(type: MediaType): string {
  switch (type) {
    case "image": return ".jpg";
    case "video": return ".mp4";
    case "audio": return ".ogg";
  }
}

// ── Asegura que existan los directorios base ──────────────────────────────────
export function ensureBaseDirs(downloadDir: string): void {
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
  if (!fs.existsSync(TEMP_DIR))    fs.mkdirSync(TEMP_DIR,    { recursive: true });
}

// ── Obtiene la carpeta correcta para el media de un contacto ──────────────────
// Estructura: <downloadDir>/<número>/<fotos|videos|audios>/
export function getMediaFolder(senderJid: string, type: MediaType, downloadDir: string): string {
  const number    = String(senderJid).split("@")[0].replace(/\D/g, "") || "desconocido";
  const typeDir   = getTypeFolder(type);
  const folderPath = path.join(downloadDir, number, typeDir);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  return folderPath;
}

// ── Genera un nombre premium sin colisiones ────────────────────────────────────
// Formato: GhostSaver_01.jpg, GhostSaver_02.jpg, ...
// Cuenta los archivos existentes en la carpeta para determinar el índice
export function generatePremiumName(folder: string, type: MediaType): string {
  const ext      = getExtension(type);
  const existing = fs.existsSync(folder)
    ? fs.readdirSync(folder).filter((f) => f.endsWith(ext)).length
    : 0;
  const index    = String(existing + 1).padStart(2, "0");
  const name     = `GhostSaver_${index}${ext}`;
  // Si por algún motivo ya existe (condición de carrera), agrega sufijo aleatorio
  const fullPath = path.join(folder, name);
  if (fs.existsSync(fullPath)) {
    const rand = String(Math.floor(Math.random() * 90) + 10);
    return `GhostSaver_${index}_${rand}${ext}`;
  }
  return name;
}
