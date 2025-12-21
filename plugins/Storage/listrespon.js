"use strict";
import fs from "fs";

export default {
  name: "listrespon",
  alias: ["listrsp"],
  description: "Menampilkan semua respon teks otomatis khusus chat ini",
  access: { group: true },
  run: async (m, { conn }) => {
    const responPath = "./database/storage/respon.json";

    if (!fs.existsSync(responPath)) {
      return m.reply("⚠️ Belum ada respon yang tersimpan!");
    }

    const responData = JSON.parse(fs.readFileSync(responPath, "utf8"));
    const filtered = responData.filter((r) => r.id === m.chat);

    if (filtered.length === 0) {
      return m.reply("📭 Belum ada respon tersimpan untuk chat ini!");
    }

    const list = filtered.map((r, i) => `*${i + 1}.* ${r.name} → ${r.response}`).join("\n");

    const caption = `💬 *Daftar Respon untuk Chat Ini*\n\n${list}\n\nTotal: *${filtered.length}* respon`;
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  }
};
