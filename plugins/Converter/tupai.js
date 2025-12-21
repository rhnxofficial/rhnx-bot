import fs from "fs";
import { exec } from "child_process";

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

export default {
  name: "tupai",
  description: "Ubah suara audio/video jadi cepat dan tinggi seperti tupai 🐿️",
  category: "audio",
  access: { group: true },

  run: async (m, { conn }) => {
    try {
      const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";
      const isQuotedVideo = m.quoted && m.quoted.type === "videoMessage";
      const isAudio = m.type === "audioMessage";
      const isVideo = m.type === "videoMessage";

      if (!isAudio && !isVideo && !isQuotedAudio && !isQuotedVideo) {
        return m.reply("Reply atau kirim audio/video yang ingin dijadikan suara tupai 🐿️");
      }

      m.reply("🎶 Sedang membuat efek suara tupai...");

      const media = await (m.quoted ? m.quoted.downloadAndSave() : m.downloadAndSave());
      const out = isAudio || isQuotedAudio ? getRandom(".mp3") : getRandom(".mp4");

      const ffmpegCmd =
        isAudio || isQuotedAudio
          ? `ffmpeg -i ${media} -filter:a "atempo=1.4,asetrate=65100" ${out}`
          : `ffmpeg -i ${media} -filter:a "atempo=1.4,asetrate=65100" -c:v copy ${out}`;

      exec(ffmpegCmd, async (err) => {
        fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Terjadi kesalahan saat membuat efek tupai.");
        }
        const buff = fs.readFileSync(out);
        if (isAudio || isQuotedAudio) {
          await conn.sendMusic(m.chat, buff, m);
        } else {
          await conn.sendMessage(
            m.chat,
            { video: buff, caption: "🐿️ Suara diubah jadi tupai!" },
            { quoted: m }
          );
        }

        fs.unlinkSync(out);
      });
    } catch (e) {
      console.error(e);
      m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
    }
  }
};
