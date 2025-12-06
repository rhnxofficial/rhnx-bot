"use strict";
import fs from "fs";

export default {
  name: "delvideo",
  alias: ["delvid", "hapusvideo"],
  description: "Hapus video dari database berdasarkan nama",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args.join(" ").toLowerCase().trim();
    if (!name)
      return m.reply("⚠️ Masukkan nama video yang ingin dihapus!\n\nContoh: *.delvideo intro*");

    const videoPath = "./database/storage/video.json";
    if (!fs.existsSync(videoPath)) {
      return m.reply("⚠️ Database video tidak ditemukan!");
    }

    const videoData = JSON.parse(fs.readFileSync(videoPath, "utf8"));
    const index = videoData.findIndex((v) => v.name.toLowerCase() === name);

    if (index === -1) {
      return m.reply(`❌ Video dengan nama *${name}* tidak ditemukan!`);
    }

    const deleted = videoData.splice(index, 1)[0];
    fs.writeFileSync(videoPath, JSON.stringify(videoData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ Video *${deleted.name}* berhasil dihapus dari database.` },
      { quoted: m }
    );
  }
};
