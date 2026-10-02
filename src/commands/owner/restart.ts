// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: restart                  ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import log from "../../logger.js";

import { Deco } from "../../utils/deco.js";

const command: Command = {
  name: "restart",
  aliases: ["reboot"],
  cooldown: 5000,

  async run(sock: WASocket, _msg: WAMessage, _args: string[], ctx: BotContext): Promise<void> {
    const { botJid } = ctx;
    await sock.sendMessage(botJid, { text: Deco.header("RESTART") + "\n" + Deco.infoLine("Reiniciando GhostSaver...") });
    log.warn("Reinicio solicitado por el owner.");
    setTimeout(() => process.exit(0), 1500);
  },
};

export default command;
