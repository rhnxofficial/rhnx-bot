"use strict";
import fs from "fs";

export default {
  name: "listvideo",
  alias: ["listvid"],
  description: "Menampilkan semua daftar video yang tersimpan di database",
  access: { owner: true },
  run: async (m, { conn }) => {
    const videoPath = "./database/storage/video.json";

    if (!fs.existsSync(videoPath)) {
      return m.reply("⚠️ Belum ada data video tersimpan!");
    }

    const videoData = JSON.parse(fs.readFileSync(videoPath, "utf8"));
    if (!Array.isArray(videoData) || videoData.length === 0) {
      return m.reply("⚠️ Belum ada video di database!");
    }

    const list = videoData.map((v, i) => `*${i + 1}.* ${v.name}`).join("\n");

    const caption = `🎬 *Daftar Video Tersimpan*\n\n${list}\n\nTotal: *${videoData.length}* video`;
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  }
};
