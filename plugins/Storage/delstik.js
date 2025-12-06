"use strict";
import fs from "fs";

export default {
  name: "delstik",
  alias: ["delstik", "hapusstik"],
  description: "Hapus sticker dari database berdasarkan nama",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args[0];
    if (!name) return m.reply("⚠️ Contoh: *delstik tesa*");

    const stickerPath = "./database/storage/sticker.json";
    if (!fs.existsSync(stickerPath)) return m.reply("📂 Belum ada database sticker!");

    const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
    const index = stickerData.findIndex((s) => s.name === name);

    if (index === -1) return m.reply(`❌ Sticker dengan nama *${name}* tidak ditemukan!`);

    const deleted = stickerData.splice(index, 1)[0];
    fs.writeFileSync(stickerPath, JSON.stringify(stickerData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ Sticker *${deleted.name}* berhasil dihapus.` },
      { quoted: m }
    );
  }
};
