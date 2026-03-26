"use strict";
import fs from "fs";

export default {
  name: "responstorage",
  description: "Hook untuk respon otomatis dari semua storage (sticker, image, vn, video, text)",
  type: "hook",

  before: async (m, { conn }) => {
    try {
      if (m.isBaileys || !m.text) return;
      const text = m.text.trim().toLowerCase();

      const isExact = (name) => text === name.toLowerCase().trim();

      const stickerPath = "./database/storage/sticker.json";
      if (fs.existsSync(stickerPath)) {
        const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
        const foundSticker = stickerData.find((s) => isExact(s.name));
        if (foundSticker) {
          await conn.sendMessage(
            m.chat,
            { sticker: { url: foundSticker.urlSticker } },
            { quoted: m }
          );
          console.log(`[AUTO RESPON] Sticker: ${foundSticker.name}`);
          return;
        }
      }

      const imagePath = "./database/storage/image.json";
      if (fs.existsSync(imagePath)) {
        const imageData = JSON.parse(fs.readFileSync(imagePath, "utf8"));
        const foundImage = imageData.find((i) => isExact(i.name));
        if (foundImage) {
          await conn.sendMessage(m.chat, { image: { url: foundImage.urlImage } }, { quoted: m });
          console.log(`[AUTO RESPON] Image: ${foundImage.name}`);
          return;
        }
      }

      const vnPath = "./database/storage/vn.json";
      if (fs.existsSync(vnPath)) {
        const vnData = JSON.parse(fs.readFileSync(vnPath, "utf8"));
        const foundVn = vnData.find((v) => isExact(v.name));
        if (foundVn) {
          await conn.sendMessage(
            m.chat,
            { audio: { url: foundVn.urlVn }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
          console.log(`[AUTO RESPON] VN: ${foundVn.name}`);
          return;
        }
      }

      const videoPath = "./database/storage/video.json";
      if (fs.existsSync(videoPath)) {
        const videoData = JSON.parse(fs.readFileSync(videoPath, "utf8"));
        const foundVideo = videoData.find((v) => isExact(v.name));
        if (foundVideo) {
          await conn.sendMessage(m.chat, { video: { url: foundVideo.urlVideo } }, { quoted: m });
          console.log(`[AUTO RESPON] Video: ${foundVideo.name}`);
          return;
        }
      }

      const responPath = "./database/storage/respon.json";
      if (fs.existsSync(responPath)) {
        const responData = JSON.parse(fs.readFileSync(responPath, "utf8"));
        const foundRes = responData.find((r) => r.id === m.chat && isExact(r.name));
        if (foundRes) {
          await conn.sendMessage(m.chat, { text: foundRes.response }, { quoted: m });
          console.log(`[AUTO RESPON] Text: ${foundRes.name}`);
          return;
        }
      }
    } catch (e) {
      console.error("[responstorage error]", e);
    }
  }
};
