// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: prefix                   ║
// ║              Activa / desactiva el prefijo de comandos       ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import config from "../../config.js";

import { Deco } from "../../utils/deco.js";

const command: Command = {
  name: "prefix",
  aliases: ["pfx"],
  cooldown: 2000,

  async run(sock: WASocket, _msg: WAMessage, args: string[], ctx: BotContext): Promise<void> {
    const { botJid, settings, saveSettings } = ctx;
    const sub = args[0]?.toLowerCase();

    // Sin argumento → mostrar estado actual
    if (!sub || !["on", "off"].includes(sub)) {
      const estado = settings.prefixEnabled
        ? `Activo (caracter: \`${config.prefix}\`)`
        : `Desactivado (modo libre)`;

      await sock.sendMessage(botJid, {
        text:
          Deco.header("PREFIJO") + "\n" +
          Deco.listItem("Estado", estado) + "\n\n" +
          Deco.infoLine("Uso:") + "\n" +
          Deco.commandUsage("prefix on", ["activar"], settings.prefixEnabled ? config.prefix : "") + "\n" +
          Deco.commandUsage("prefix off", ["desactivar"], settings.prefixEnabled ? config.prefix : "")
      });
      return;
    }

    settings.prefixEnabled = sub === "on";
    saveSettings();

    const msg = settings.prefixEnabled
      ? Deco.header("PREFIJO") + "\n" + Deco.successLine(`Prefijo activado. Usa \`${config.prefix}\` al inicio.`)
      : Deco.header("PREFIJO") + "\n" + Deco.warnLine("Prefijo desactivado. Modo libre activo.");

    await sock.sendMessage(botJid, { text: msg });
  },
};

export default command;
