import fs from "fs";
import fetch from "node-fetch";
import { uploadImage } from "../../lib/uploader.js";

export default {
  name: "smeme",
  desc: "Buat stiker meme dari gambar atau stiker",

  run: async (m, { conn, q, prefix, command }) => {
    try {
      if (!q) return m.reply(`*Contoh:* ${prefix + command} teksatas,teksbawah`);
      const [top = "", bottom = ""] = q.split(",").map((v) => v.trim());

      const isImage = m.type === "imageMessage";
      const isSticker = m.type === "stickerMessage";
      const isQuotedImage = m.quoted && m.quoted.type === "imageMessage";
      const isQuotedSticker = m.quoted && m.quoted.type === "stickerMessage";

      if (!isImage && !isSticker && !isQuotedImage && !isQuotedSticker)
        return m.reply(
          `Kirim atau reply gambar/stiker dengan format:\n${prefix + command} teksatas,teksbawah`
        );

      const mediaMsg = isQuotedImage || isQuotedSticker ? m.quoted : m;
      const buffer = await mediaMsg.download();

      const uploadedUrl = await uploadImage(buffer);

      const topText = encodeURIComponent(top);
      const bottomText = encodeURIComponent(bottom);

      const memeUrl = `https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${uploadedUrl}`;

      const memeBuffer = Buffer.from(await (await fetch(memeUrl)).arrayBuffer());

      await conn.sendSticker(m.chat, memeBuffer, m, {
        packname: sticker.packname,
        author: sticker.author
      });
    } catch (err) {
      console.error(err);
      m.reply("❌ Gagal membuat meme!");
    }
  }
};
