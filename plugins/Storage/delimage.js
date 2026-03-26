"use strict";
import fs from "fs";

export default {
  name: "delimage",
  alias: ["delimg", "hapusimage"],
  description: "Hapus image dari database berdasarkan nama",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args.join(" ").toLowerCase().trim();
    if (!name)
      return m.reply("⚠️ Masukkan nama image yang ingin dihapus!\n\nContoh: *.delimage kucing*");

    const imagePath = "./database/storage/image.json";
    if (!fs.existsSync(imagePath)) {
      return m.reply("⚠️ Database image tidak ditemukan!");
    }

    const imageData = JSON.parse(fs.readFileSync(imagePath, "utf8"));
    const index = imageData.findIndex((i) => i.name.toLowerCase() === name);

    if (index === -1) {
      return m.reply(`❌ Image dengan nama *${name}* tidak ditemukan!`);
    }

    const deleted = imageData.splice(index, 1)[0];
    fs.writeFileSync(imagePath, JSON.stringify(imageData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ Image *${deleted.name}* berhasil dihapus dari database.` },
      { quoted: m }
    );
  }
};
