import fs from "fs";
import path from "path";
import { exec } from "child_process";

const getRandom = (ext = "") => `${Math.floor(Math.random() * 10000)}${ext}`;

export default {
  name: "cut",
  alias: ["potong", "split"],
  description: "Potong audio atau video menjadi bagian per 30 detik",
  access: { group: true },

  run: async (m, { conn }) => {
    const quoted = m.quoted;
    if (!quoted) return m.reply("Reply ke audio atau video yang ingin dipotong!");

    const type = quoted.type;
    const isAudio = type === "audioMessage";
    const isVideo = type === "videoMessage";

    if (!isAudio && !isVideo)
      return m.reply("❌ Format tidak didukung. Harap reply ke *audio* atau *video*!");

    if (m.quoted.type?.seconds < 30) {
      return m.reply("Harus lebih dari 30 detik untuk bisa dipotong!");
    }

    const kind = isAudio ? "audio" : "video";
    const ext = isAudio ? ".mp3" : ".mp4";

    try {
      m.reply(`⏳ Sedang memotong ${kind} menjadi bagian per 30 detik...`);

      const media = await quoted.downloadAndSave();
      const outputBase = getRandom("");
      const directoryPath = path.resolve("./temp/");
      if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });

      const ffmpegCmd = isAudio
        ? `ffmpeg -i ${media} -f segment -segment_time 30 -reset_timestamps 1 ${directoryPath}/${outputBase}_%03d${ext}`
        : `ffmpeg -i ${media} -c copy -map 0 -f segment -segment_time 30 -reset_timestamps 1 ${directoryPath}/${outputBase}_%03d${ext}`;

      exec(ffmpegCmd, async (err) => {
        fs.unlinkSync(media);
        if (err) {
          console.error(err);
          return m.reply(`❌ Gagal memproses ${kind}.`);
        }

        fs.readdir(directoryPath, async (err, files) => {
          if (err) return m.reply("❌ Gagal membaca hasil potongan.");

          const hasil = files.filter((f) => f.startsWith(outputBase) && f.endsWith(ext));
          if (!hasil.length) return m.reply("❌ Tidak ada hasil potongan ditemukan.");

          for (const file of hasil) {
            const filePath = path.join(directoryPath, file);
            if (!fs.existsSync(filePath)) continue;

            const sendOpts = isAudio
              ? { audio: fs.readFileSync(filePath), mimetype: "audio/mp4" }
              : {
                  video: fs.readFileSync(filePath),
                  mimetype: "video/mp4",
                  caption: `🎬 Potongan: ${file}`
                };

            await conn.sendMessage(m.chat, sendOpts, { quoted: m });
            fs.unlinkSync(filePath);
          }

          m.reply(
            `✅ ${kind.charAt(0).toUpperCase() + kind.slice(1)} berhasil dipotong menjadi beberapa bagian!`
          );
        });
      });
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
