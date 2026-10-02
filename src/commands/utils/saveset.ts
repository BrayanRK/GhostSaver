// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: saveset                  ║
// ║              Elige el modo de guardado de ViewOnce          ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext, SaveMode } from "../../types/index.js";

import { Deco } from "../../utils/deco.js";

const VALID_MODES: SaveMode[] = ["storage", "forward", "chat"];

const DESCRIPTIONS: Record<SaveMode, string> = {
  storage: "*storage* -> Solo guarda en disco",
  forward: "*forward* -> Guarda en disco Y reenvia al chat",
  chat:    "*chat*    -> Solo reenvia al chat (sin disco)",
};

const command: Command = {
  name: "saveset",
  aliases: ["modo", "savemode"],
  cooldown: 2000,

  async run(sock: WASocket, _msg: WAMessage, args: string[], ctx: BotContext): Promise<void> {
    const { botJid, settings, saveSettings } = ctx;
    const sub = args[0]?.toLowerCase() as SaveMode | undefined;

    if (!sub || !VALID_MODES.includes(sub)) {
      const current = DESCRIPTIONS[settings.saveMode];
      const lines = [
        Deco.header("GUARDADO"),
        Deco.infoLine("Actual:"),
        Deco.quote(current),
        "",
        Deco.infoLine("Opciones:"),
        ...VALID_MODES.map((m) => Deco.quote(DESCRIPTIONS[m])),
        "",
        Deco.commandUsage("saveset storage|forward|chat"),
      ];
      await sock.sendMessage(botJid, { text: lines.join("\n") });
      return;
    }

    settings.saveMode = sub;
    saveSettings();

    const confirmMap: Record<SaveMode, string> = {
      storage: Deco.header("GUARDADO") + "\n" + Deco.successLine("Modo *storage* activado.") + "\n" + Deco.quote("Se guardara solo en almacenamiento."),
      forward: Deco.header("GUARDADO") + "\n" + Deco.successLine("Modo *forward* activado.") + "\n" + Deco.quote("Se guardara en disco y se reenviara aqui."),
      chat:    Deco.header("GUARDADO") + "\n" + Deco.successLine("Modo *chat* activado.") + "\n" + Deco.quote("Solo se reenviara aqui, sin disco."),
    };

    await sock.sendMessage(botJid, { text: confirmMap[sub] });
  },
};

export default command;
