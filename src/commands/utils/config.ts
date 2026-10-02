// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: config                   ║
// ║              Panel de estado ÚNICO — todo en uno             ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import { isTermux } from "../../utils/paths.js";
import config from "../../config.js";

import { Deco } from "../../utils/deco.js";

const SAVE_MODE_LABELS: Record<string, string> = {
  storage: "Solo almacenamiento local",
  forward: "Guardar + reenviar aqui",
  chat:    "Solo reenviar aqui (sin disco)",
};

const command: Command = {
  name: "config",
  aliases: ["cfg", "estado", "panel", "status"],
  cooldown: 2000,

  async run(sock: WASocket, _msg: WAMessage, _args: string[], ctx: BotContext): Promise<void> {
    const { settings, botJid, superOwnerJid } = ctx;

    const platform    = isTermux ? "Termux (Android)" : "PC / Servidor";
    const saveLabel   = SAVE_MODE_LABELS[settings.saveMode] ?? settings.saveMode;
    const adStatus    = settings.antiDelete  ? "Activo" : "Inactivo";
    const prefStatus  = settings.prefixEnabled
      ? `Activo (caracter: \`${config.prefix}\`)`
      : "Desactivado (modo libre)";
    const aliases     = settings.vvAliases.length > 0
      ? settings.vvAliases.join(" · ")
      : "ninguno";
    const text = [
      Deco.header("PANEL"),
      Deco.listItem("Modo guardado", saveLabel),
      Deco.listItem("Ruta", `\`${settings.downloadDir}\``),
      Deco.listItem("AntiDelete", adStatus),
      Deco.listItem("Prefijo", prefStatus),
      Deco.listItem("Aliases vv", aliases),
      Deco.listItem("Plataforma", platform),
    ].join("\n");

    await sock.sendMessage(botJid, { text });
  },
};

export default command;
