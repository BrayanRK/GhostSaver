// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: alias                    ║
// ║              Gestión de aliases del comando .vv             ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";

import { Deco } from "../../utils/deco.js";

const command: Command = {
  name: "alias",
  aliases: ["aliases"],
  cooldown: 2000,

  async run(sock: WASocket, _msg: WAMessage, args: string[], ctx: BotContext): Promise<void> {
    const { botJid, settings, saveSettings } = ctx;
    const sub   = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    // ── Listar aliases ────────────────────────────────────────────────────────
    if (!sub || sub === "list") {
      const list = settings.vvAliases.length > 0
        ? settings.vvAliases.map((a) => Deco.quote(`.${a}`)).join("\n")
        : Deco.quote("_ninguno_");

      await sock.sendMessage(botJid, {
        text:
          Deco.header("ALIASES (VV)") +
          list + "\n\n" +
          Deco.infoLine("Uso:") + "\n" +
          Deco.commandUsage("alias add <nombre>") + "\n" +
          Deco.commandUsage("alias remove <nombre>")
      });
      return;
    }

    // ── Agregar alias ─────────────────────────────────────────────────────────
    if (sub === "add") {
      if (!value) {
        await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.errorLine("Especifica el alias: `.alias add <nombre>`") });
        return;
      }
      if (value === "vv") {
        await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.errorLine("No puedes usar `vv` (es el principal).") });
        return;
      }
      if (settings.vvAliases.includes(value)) {
        await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.warnLine(`El alias \`.${value}\` ya existe.`) });
        return;
      }
      settings.vvAliases.push(value);
      saveSettings();
      await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.successLine(`Alias \`.${value}\` agregado.`) });
      return;
    }

    // ── Eliminar alias ────────────────────────────────────────────────────────
    if (sub === "remove" || sub === "del") {
      if (!value) {
        await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.errorLine("Especifica el alias: `.alias remove <nombre>`") });
        return;
      }
      const idx = settings.vvAliases.indexOf(value);
      if (idx === -1) {
        await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.warnLine(`El alias \`.${value}\` no existe.`) });
        return;
      }
      settings.vvAliases.splice(idx, 1);
      saveSettings();
      await sock.sendMessage(botJid, { text: Deco.header("ALIAS") + "\n" + Deco.successLine(`Alias \`.${value}\` eliminado.`) });
      return;
    }

    await sock.sendMessage(botJid, {
      text: Deco.header("ALIAS") + "\n" + Deco.errorLine("Subcomando invalido. Usa: `list`, `add`, `remove`"),
    });
  },
};

export default command;
