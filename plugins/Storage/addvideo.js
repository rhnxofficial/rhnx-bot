"use strict";
import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

export default {
  name: "addvideo",
  alias: ["addvid", "addvideo"],
  description: "Tambahkan video ke database dengan nama tertentu",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args[0];
    if (!name) return m.reply("⚠️ Contoh: *addvideo lucu* (reply ke video)");

    const isVideo = m.quoted && m.quoted.type === "videoMessage";
    if (!isVideo) return m.reply("❌ Reply dulu ke *video* yang mau disimpan!");

    const videoPath = "./database/storage/video.json";
    if (!fs.existsSync(videoPath)) fs.writeFileSync(videoPath, "[]");

    const videoData = JSON.parse(fs.readFileSync(videoPath, "utf8"));

    if (videoData.some((v) => v.name === name)) {
      return m.reply(`⚠️ Video dengan nama *${name}* sudah ada!`);
    }

    try {
      const filePath = await m.quoted.downloadAndSave();
      const buffer = fs.readFileSync(filePath);
      const urlVideo = await uploadToGithub(buffer);
      videoData.push({
        name,
        urlVideo
      });

      fs.writeFileSync(videoPath, JSON.stringify(videoData, null, 2));

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Video *${name}* berhasil ditambahkan!\n\nURL: ${urlVideo}`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      return m.reply("⚠️ Gagal menambahkan video. Coba lagi nanti!");
    }
  }
};
