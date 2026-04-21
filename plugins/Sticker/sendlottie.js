"use strict";

import fs from "fs";
import path from "path";

export default {
  name: "sendlottie",
  alias: ["sl"],
  description: "Kirim sticker lottie dari root folder",

  async run(m, { conn }) {
    try {
      const filePath = path.join(process.cwd(), "sticker_lottie.was");

      if (!fs.existsSync(filePath)) {
        return m.reply("❌ File stc.was tidak ditemukan di root!");
      }

      const buffer = fs.readFileSync(filePath);

      await conn.sendMessage(
        m.chat,
        {
          sticker: buffer,
          mimetype: "application/was",
          isLottie: true,
          isAnimated: true
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);

      await m.reply(
        "❌ Gagal kirim lottie\n" +
        "Error: " + (err.message || err)
      );
    }
  }
};
