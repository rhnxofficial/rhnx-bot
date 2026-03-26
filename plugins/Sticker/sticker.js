"use strict";

export default {
  name: "sticker",
  alias: ["s", "stiker"],
  description: "Buat sticker dari gambar, video, atau URL",
  tags: ["sticker"],

  run: async (m, { conn, args }) => {
    try {
      let input;
      if (m.quoted) {
        input = await m.quoted.download();
      } else if (["imageMessage", "videoMessage"].includes(m.type) && !args[0]) {
        input = await m.download();
      } else if (args[0]) {
        input = args[0];
      } else {
        return m.reply("⚠️ Kirim atau reply gambar/video, atau kasih URL untuk dijadikan sticker.");
      }

      await conn.sendSticker(m.chat, input, m, {
        packname: styleSans(`${m.pushName}`),
        author: styleSans(sticker.author)
      });
    } catch (e) {
      console.error("sticker error:", e);
      m.reply("⚠️ Gagal membuat sticker.");
    }
  }
};
