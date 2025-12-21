"use strict";
import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

export default {
  name: "addstik",
  alias: ["addstik", "addsticker"],
  description: "Tambahkan sticker ke database dengan nama tertentu",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args[0];
    if (!name) return m.reply("⚠️ Contoh: *addstik tesa* (reply sticker)");

    const isSticker = m.quoted && m.quoted.type === "stickerMessage";
    if (!isSticker) return m.reply("❌ Reply ke sticker yang mau disimpan dulu!");

    const stickerPath = "./database/storage/sticker.json";
    if (!fs.existsSync(stickerPath)) fs.writeFileSync(stickerPath, "[]");

    const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
    if (stickerData.some((s) => s.name === name)) {
      return m.reply(`⚠️ Sticker dengan nama *${name}* sudah ada!`);
    }

    try {
      const filePath = await m.quoted.downloadAndSave();
      const buffer = fs.readFileSync(filePath);

      const urlSticker = await uploadToGithub(buffer);

      stickerData.push({
        name,
        urlSticker
      });

      fs.writeFileSync(stickerPath, JSON.stringify(stickerData, null, 2));

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Sticker *${name}* berhasil ditambahkan!\n\nURL: ${urlSticker}`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      return m.reply("⚠️ Gagal menambahkan sticker. Coba lagi nanti!");
    }
  }
};
