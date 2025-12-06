"use strict";

import fs from "fs";
import path from "path";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

function getRandom(ext = "") {
  return path.join(process.cwd(), `${Date.now()}-${Math.floor(Math.random() * 9999)}${ext}`);
}

export default {
  name: "swm",
  alias: ["wm"],
  description: "Ubah watermark sticker",
  run: async (m, { conn, args, setReply }) => {
    try {
      const quoted = m.quoted ? m.quoted : m;

      if (!quoted) {
        return setReply(
          "⚠️ Silakan reply stiker yang ingin di-WM!\nContoh: .swm PackBaru|AuthorBaru"
        );
      }

      if (quoted.type !== "stickerMessage") {
        return setReply("⚠️ Yang direply bukan sticker!\nContoh: .swm PackBaru|AuthorBaru");
      }

      let ahuh = args.join(" ").split("|");
      let satu = ahuh[0] !== "" ? ahuh[0] : "";
      let dua = typeof ahuh[1] !== "" ? ahuh[1] : "";

      let media;
      if (m.quoted && typeof m.quoted.download === "function") {
        media = await m.quoted.download();
      } else if (typeof m.download === "function") {
        media = await m.download();
      } else {
        return setReply("⚠️ Gagal: tidak bisa download sticker.");
      }

      if (!media || !Buffer.isBuffer(media)) {
        return setReply("⚠️ Gagal download sticker!");
      }

      let sticker = new Sticker(media, {
        pack: satu,
        author: dua,
        type: StickerTypes.FULL,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "#FFFFFF00"
      });

      let stickerFilePath = getRandom(".webp");
      await sticker.toFile(stickerFilePath);

      let stickerBuffer = fs.readFileSync(stickerFilePath);
      await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

      fs.unlinkSync(stickerFilePath);
    } catch (err) {
      setReply("⚠️ Gagal ubah watermark sticker.");
      console.error("SWM Error:", err.message);
    }
  }
};
