"use strict";
import fs from "fs";

export default {
  name: "liststik",
  alias: ["liststik", "stiklist"],
  description: "Lihat semua sticker yang tersimpan di database",
  access: { owner: true },
  run: async (m, { conn }) => {
    const stickerPath = "./database/storage/sticker.json";
    if (!fs.existsSync(stickerPath)) return m.reply("📂 Belum ada database sticker!");

    const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
    if (stickerData.length === 0) return m.reply("📭 Belum ada sticker yang disimpan!");

    let teks = `🗂️ *List Sticker (${stickerData.length})*\n\n`;
    teks += stickerData.map((s, i) => `*${i + 1}.* ${s.name}`).join("\n");

    await conn.sendMessage(m.chat, { text: teks }, { quoted: m });
  }
};
