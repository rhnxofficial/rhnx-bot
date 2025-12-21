"use strict";
import fs from "fs";

export default {
  name: "delrespon",
  alias: ["delrsp", "hapusrespon"],
  description: "Hapus respon teks dari database khusus chat ini",
  access: { group: true },
  run: async (m, { args, conn }) => {
    const name = args.join(" ").toLowerCase().trim();
    if (!name)
      return m.reply("⚠️ Masukkan nama respon yang ingin dihapus!\n\nContoh: *.delrespon halo*");

    const responPath = "./database/storage/respon.json";
    if (!fs.existsSync(responPath)) {
      return m.reply("⚠️ Database respon tidak ditemukan!");
    }

    const responData = JSON.parse(fs.readFileSync(responPath, "utf8"));
    const index = responData.findIndex((r) => r.id === m.chat && r.name.toLowerCase() === name);

    if (index === -1) {
      return m.reply(`❌ Respon dengan nama *${name}* tidak ditemukan di chat ini!`);
    }

    const deleted = responData.splice(index, 1)[0];
    fs.writeFileSync(responPath, JSON.stringify(responData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ Respon *${deleted.name}* berhasil dihapus dari database.` },
      { quoted: m }
    );
  }
};
