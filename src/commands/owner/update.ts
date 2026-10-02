// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: update                   ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import { exec } from "child_process";
import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import log from "../../logger.js";

import { Deco } from "../../utils/deco.js";

const command: Command = {
  name: "update",
  aliases: ["actualizar"],
  cooldown: 10000,

  async run(sock: WASocket, _msg: WAMessage, _args: string[], ctx: BotContext): Promise<void> {
    const { botJid } = ctx;

    if (!fs.existsSync(".git")) {
      await sock.sendMessage(botJid, {
        text:
          Deco.header("UPDATE") + "\n" +
          Deco.errorLine("No se encontro la carpeta .git") + "\n\n" +
          Deco.blockquote("Este bot fue instalado desde ZIP.\nLa actualizacion automatica solo funciona con:\n`git clone URL_DEL_REPOSITORIO`"),
      });
      return;
    }

    await sock.sendMessage(botJid, { text: Deco.header("UPDATE") + "\n" + Deco.infoLine("Buscando cambios...") });
    log.info("Ejecutando git pull + npm install...");

    exec("git pull && npm install", { timeout: 60000 }, async (error, stdout, stderr) => {
      if (error) {
        log.error("Error en update:", error.message);
        await sock.sendMessage(botJid, {
          text: Deco.header("UPDATE") + "\n" + Deco.errorLine("Error durante actualizacion:\n") + Deco.quote(`\`${error.message.slice(0, 500)}\``),
        });
        return;
      }

      const output = (stdout + stderr).slice(0, 1200).trim();
      await sock.sendMessage(botJid, {
        text:
          Deco.header("UPDATE") + "\n" +
          Deco.successLine("Actualizacion completada") + "\n\n" +
          `\`\`\`\n${output || "Sin cambios."}\n\`\`\`\n\n` +
          Deco.quote("_Reiniciando..._"),
      });

      log.ok("Actualizacion exitosa. Reiniciando...");
      setTimeout(() => process.exit(0), 2000);
    });
  },
};

export default command;
