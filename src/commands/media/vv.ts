// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Comando: vv                       ║
// ║              Guarda un ViewOnce citado manualmente          ║
// ╚══════════════════════════════════════════════════════════════╝

import type { WASocket, WAMessage } from "ultra-baileys";
import { normalizeMessageContent } from "ultra-baileys";
import type { Command, BotContext } from "../../types/index.js";
import {
  getQuotedInfo,
  findAnyMedia,
  processViewOnce,
} from "../../utils/media.js";
import log from "../../logger.js";

const command: Command = {
  name: "vv",
  // Aliases limpios. Se pueden agregar/quitar con .alias
  aliases: ["viewonce", "vo", "ver"],
  cooldown: 0,

  async run(sock: WASocket, msg: WAMessage, _args: string[], ctx: BotContext): Promise<void> {
    const quotedInfo = getQuotedInfo(msg);
    if (!quotedInfo) {
      log.warn("[vv] No hay mensaje citado.");
      return;
    }

    const normalized = normalizeMessageContent(quotedInfo.quotedMessage) as Record<string, unknown>;
    const media      = findAnyMedia(normalized);
    if (!media) {
      log.warn("[vv] El mensaje citado no contiene media.");
      return;
    }

    // El sender real es quien mandó el viewOnce original
    const ctxInfo = (msg?.message?.extendedTextMessage as {
      contextInfo?: { participant?: string };
    })?.contextInfo;

    const senderJid = ctxInfo?.participant ?? msg.key.remoteJid ?? "desconocido";

    const fakeMsg: WAMessage = {
      key: quotedInfo.key,
      message: normalized,
    };

    const ok = await processViewOnce(
      sock,
      fakeMsg,
      media,
      senderJid,
      ctx.botJid,
      ctx.settings.saveMode,
      ctx.settings.downloadDir
    );

    if (!ok) {
      log.warn("[vv] No se pudo procesar el media.");
    }
    // Sin respuesta al chat. Silencioso total.
  },
};

export default command;
