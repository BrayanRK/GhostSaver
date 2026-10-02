// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: menu                     ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import config from "../../config.js";

import { Deco } from "../../utils/deco.js";

const CATEGORY_ICONS: Record<string, string> = {
  MEDIA:   "🎬 MEDIA",
  UTILS:   "⚙️ UTILS",
  OWNER:   "💀 OWNER",
  GENERAL: "⚡ GENERAL",
  DEFAULT: "🗡️ CMD",
};

function getCategoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.DEFAULT;
}

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  let results: string[] = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, item.name);
    if (item.isDirectory()) {
      results = [...results, ...getFiles(res)];
    } else if (
      item.isFile() &&
      (item.name.endsWith(".ts") || item.name.endsWith(".js")) &&
      !item.name.endsWith(".d.ts")
    ) {
      results.push(res);
    }
  }
  return results;
}

const command: Command = {
  name: "menu",
  aliases: ["help", "comandos", "cmd"],
  cooldown: 5000,

  async run(sock: WASocket, _msg: WAMessage, _args: string[], ctx: BotContext): Promise<void> {
    const { botJid } = ctx;
    const commandsDir = path.resolve(process.cwd(), config.commandsDir);

    try {
      const allFiles = getFiles(commandsDir);
      const menuData: Record<string, Array<{ name: string; aliases: string[] }>> = {};

      for (const filePath of allFiles) {
        if (filePath.endsWith("menu.ts") || filePath.endsWith("menu.js")) continue;
        try {
          const { default: cmd } = await import(
            `${pathToFileURL(filePath).href}?v=${Date.now()}`
          ) as { default?: Command };

          if (cmd?.name) {
            const raw      = path.basename(path.dirname(filePath)).toUpperCase();
            const category = raw === "COMMANDS" ? "GENERAL" : raw;
            if (!menuData[category]) menuData[category] = [];
            menuData[category].push({ name: cmd.name, aliases: cmd.aliases ?? [] });
          }
        } catch { /* skip archivo inválido */ }
      }

      const categories = Object.keys(menuData).sort();
      const totalCmds  = categories.reduce((acc, c) => acc + menuData[c].length, 0);
      const pfx = ctx.settings.prefixEnabled ? config.prefix : "";
      const pfxLabel = ctx.settings.prefixEnabled ? `\`${config.prefix}\`` : "Modo libre";

      const botName = `*GHOSTSAVER*`;
      const botCreator = 'B R A Y A N R K';

      let t = `¡Hola! Soy ⑘ ${botName} ↫\nᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n\n`;
      t += `╭─── ↷\n`;
      t += `│ ✐ 𝗧𝗲𝗺𝗽𝗹𝗮𝘁𝗲 𝗕𝘆 ${botCreator}\n`;
      t += `│ ✐ Total Comandos: ${totalCmds}\n`;
      t += `│ ✐ Prefijo: ${pfxLabel}\n`;
      t += `╰──────────────────\n\n`;

      for (const category of categories) {
        const catName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        const cmds = menuData[category];

        t += `${Deco.header(catName)}\n`;
        t += `${Deco.quote(`✐ Comandos de *${catName}*`)}\n\n`;

        for (const c of cmds) {
          t += `${Deco.commandUsage(c.name, c.aliases)}\n\n`;
        }
      }

      await sock.sendMessage(botJid, { text: t.trim() });
    } catch (error) {
      await sock.sendMessage(botJid, {
        text: Deco.header('MENU') + '\n' + Deco.errorLine(`Error al generar: ${(error as Error).message}`),
      });
    }
  },
};

export default command;
