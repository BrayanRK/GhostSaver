import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import config from "../../config.js";

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
        } catch { /* skip archivo invalido */ }
      }

      const categories = Object.keys(menuData).sort();
      const totalCmds  = categories.reduce((acc, c) => acc + menuData[c].length, 0);
      const pfx        = ctx.settings.prefixEnabled ? config.prefix : "";
      const pfxLabel   = ctx.settings.prefixEnabled ? `\`${config.prefix}\`` : "Sin prefijo";

      // ── Cabecera ──────────────────────────────────────────────────
      let t = "";
      t += `*!Hola! Soy* *GhostSaver* \u{1F47B}\n`;
      t += `*aqui tienes la lista de comandos*\n\n`;
      t += `\u{256D}\u{2508}\u{2508}\u{2508} \u{21B7}\n`;
      t += `\u{2502} \u{2712} Developed by *BrayanRK*\n`;
      t += `\u{2502} \u{2712} Comandos: ${totalCmds}  |  Prefijo: ${pfxLabel}\n`;
      t += `\u{2570}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\u{2500}\n\n`;

      // ── Categorias y comandos ──────────────────────────────────────
      for (const category of categories) {
        const catName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        const cmds    = menuData[category];

        // Titulo de categoria: *_☑︎ CATEGORIA ☑︎_*
        t += `*_\u{2611}\uFE0E ${catName.toUpperCase()} \u{2611}\uFE0E_*\n\n`;

        // Subtitulo
        t += `> \u{2710} Comandos de *${catName}*\n\n`;

        for (const c of cmds) {
          // Para "vv" incluir tambien los aliases dinamicos de settings
          const staticAliases: string[] = Array.isArray(c.aliases) ? c.aliases : [];
          const dynamicAliases: string[] = c.name === "vv" ? (ctx.settings.vvAliases ?? []) : [];
          const allAliases = [...new Set([...staticAliases, ...dynamicAliases])];
          const aliasText = allAliases.length > 0
            ? allAliases.map(a => ` \`${pfx}${a}\``).join("")
            : "";
          t += `> \u{270E} *${pfx}${c.name}*${aliasText}\n\n`;
        }
      }

      await sock.sendMessage(botJid, { text: t.trim() });
    } catch (error) {
      await sock.sendMessage(botJid, {
        text: `> \u{274C} Error al generar menu: ${(error as Error).message}`,
      });
    }
  },
};

export default command;
