// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: antidelete               ║
// ║              Toggle AntiDelete on/off con persistencia      ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";

import { Deco } from "../../utils/deco.js";

const command: Command = {
  name: "antidelete",
  aliases: ["ad"],
  cooldown: 2000,

  async run(sock: WASocket, _msg: WAMessage, args: string[], ctx: BotContext): Promise<void> {
    const { botJid, settings, saveSettings } = ctx;
    const sub = args[0]?.toLowerCase();

    if (!sub || !["on", "off"].includes(sub)) {
      const estado = settings.antiDelete ? "Activo" : "Inactivo";
      await sock.sendMessage(botJid, {
        text:
          Deco.header("ANTI-DELETE") + "\n" +
          Deco.listItem("Estado", estado) + "\n\n" +
          Deco.infoLine("Uso:") + "\n" +
          Deco.commandUsage("antidelete on") + "\n" +
          Deco.commandUsage("antidelete off")
      });
      return;
    }

    settings.antiDelete = sub === "on";
    saveSettings();

    const msg = settings.antiDelete
      ? Deco.header("ANTI-DELETE") + "\n" + Deco.successLine("AntiDelete activado.") + "\n" + Deco.quote("Te avisare aqui cuando eliminen un mensaje.")
      : Deco.header("ANTI-DELETE") + "\n" + Deco.warnLine("AntiDelete desactivado.");

    await sock.sendMessage(botJid, { text: msg });
  },
};

export default command;
