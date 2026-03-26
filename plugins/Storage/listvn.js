"use strict";
import fs from "fs";

export default {
  name: "listvn",
  alias: ["listvoice"],
  description: "Menampilkan semua daftar VN (voice note) yang tersimpan di database",
  access: { owner: true },
  run: async (m, { conn }) => {
    const vnPath = "./database/storage/vn.json";

    if (!fs.existsSync(vnPath)) {
      return m.reply("⚠️ Belum ada data VN tersimpan!");
    }

    const vnData = JSON.parse(fs.readFileSync(vnPath, "utf8"));
    if (!Array.isArray(vnData) || vnData.length === 0) {
      return m.reply("⚠️ Belum ada VN di database!");
    }

    const list = vnData.map((v, i) => `*${i + 1}.* ${v.name}`).join("\n");
    const caption = `🎧 *Daftar VN Tersimpan*\n\n${list}\n\nTotal: *${vnData.length}* VN`;

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  }
};
