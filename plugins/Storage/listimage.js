"use strict";
import fs from "fs";

export default {
  name: "listimage",
  alias: ["listimg"],
  description: "Menampilkan semua daftar image yang tersimpan di database",
  access: { owner: true },
  run: async (m, { conn }) => {
    const imagePath = "./database/storage/image.json";

    if (!fs.existsSync(imagePath)) {
      return m.reply("⚠️ Belum ada data image tersimpan!");
    }

    const imageData = JSON.parse(fs.readFileSync(imagePath, "utf8"));
    if (!Array.isArray(imageData) || imageData.length === 0) {
      return m.reply("⚠️ Belum ada image di database!");
    }

    const list = imageData.map((img, i) => `*${i + 1}.* ${img.name}`).join("\n");

    const caption = `📸 *Daftar Image Tersimpan*\n\n${list}\n\nTotal: *${imageData.length}* image`;
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  }
};
