import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

const compressVideoSettings = {
  low:    { size: "640x?", videoBitrate: "500k", audioBitrate: "128k", fps: 24 },
  medium: { size: "480x?", videoBitrate: "300k", audioBitrate: "96k", fps: 20 },
  high:   { size: "360x?", videoBitrate: "180k", audioBitrate: "48k", fps: 15 },
};

const compressImageSettings = {
  low:    { size: "1280x?", quality: 2 }, 
  medium: { size: "800x?", quality: 5 },
  high:   { size: "480x?", quality: 10 },
};

export default {
  name: "compress",
  alias: ["compressvideo", "compressimage"],
  description: "Kompres video atau gambar (level: low, medium, high)",
  access: { group: false },

  run: async (m, { conn, args }) => {
    try {
      const isQuotedVideo = m.quoted?.type === "videoMessage";
      const isVideo = m.type === "videoMessage";
      const isQuotedImage = m.quoted?.type === "imageMessage";
      const isImage = m.type === "imageMessage";

      if (!isVideo && !isQuotedVideo && !isImage && !isQuotedImage)
        return m.reply("📎 Reply atau kirim video/gambar yang ingin dikompres!");

      const input = await (m.quoted ? m.quoted.downloadAndSave() : m.downloadAndSave());
      const output = getRandom(isVideo || isQuotedVideo ? ".mp4" : ".jpg");

      const level = args[0]?.toLowerCase();

      if (isVideo || isQuotedVideo) {
        if (!compressVideoSettings[level])
          return m.reply("❌ Level kompresi video tidak valid! Pilih: low, medium, high");

        const { size, videoBitrate, audioBitrate, fps } = compressVideoSettings[level];

        m.reply(`⏳ Mengompres video dengan level: ${level}...`);

        ffmpeg(input)
          .videoCodec("libx264")
          .audioCodec("aac")
          .size(size)
          .videoBitrate(videoBitrate)
          .audioBitrate(audioBitrate)
          .fps(fps)
          .output(output)
          .on("end", async () => {
            const buff = fs.readFileSync(output);
            await conn.sendMessage(m.chat, {
              video: buff,
              caption: `✔️ Video berhasil dikompres! Level: ${level}`
            });
            fs.unlinkSync(input);
            fs.unlinkSync(output);
          })
          .on("error", (err) => {
            console.error(err);
            m.reply("❌ Gagal mengompres video.");
            fs.unlinkSync(input);
          })
          .run();

      } else if (isImage || isQuotedImage) {
        if (!compressImageSettings[level])
          return m.reply("❌ Level kompresi gambar tidak valid! Pilih: low, medium, high");

        const { size, quality } = compressImageSettings[level];

        m.reply(`⏳ Mengompres gambar dengan level: ${level}...`);

        ffmpeg(input)
          .outputOptions([
            `-qscale:v ${quality}`, 
          ])
          .size(size)
          .output(output)
          .on("end", async () => {
            const buff = fs.readFileSync(output);
            await conn.sendMessage(m.chat, {
              image: buff,
              caption: `✔️ Gambar berhasil dikompres! Level: ${level}`
            });
            fs.unlinkSync(input);
            fs.unlinkSync(output);
          })
          .on("error", (err) => {
            console.error(err);
            m.reply("❌ Gagal mengompres gambar.");
            fs.unlinkSync(input);
          })
          .run();
      }

    } catch (e) {
      console.error(e);
      m.reply("⚠️ Terjadi kesalahan saat memproses file.");
    }
  }
};
