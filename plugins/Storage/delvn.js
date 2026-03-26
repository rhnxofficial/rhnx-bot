"use strict";
import fs from "fs";

export default {
  name: "delvn",
  alias: ["delvoice", "hapusvn"],
  description: "Hapus VN (voice note) dari database berdasarkan nama",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args.join(" ").toLowerCase().trim();
    if (!name) return m.reply("⚠️ Masukkan nama VN yang ingin dihapus!\n\nContoh: *.delvn halo*");

    const vnPath = "./database/storage/vn.json";
    if (!fs.existsSync(vnPath)) {
      return m.reply("⚠️ Database VN tidak ditemukan!");
    }

    const vnData = JSON.parse(fs.readFileSync(vnPath, "utf8"));
    const index = vnData.findIndex((v) => v.name.toLowerCase() === name);

    if (index === -1) {
      return m.reply(`❌ VN dengan nama *${name}* tidak ditemukan!`);
    }

    const deleted = vnData.splice(index, 1)[0];
    fs.writeFileSync(vnPath, JSON.stringify(vnData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ VN *${deleted.name}* berhasil dihapus dari database.` },
      { quoted: m }
    );
  }
};
