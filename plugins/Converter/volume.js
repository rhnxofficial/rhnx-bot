import fs from "fs";
import { exec } from "child_process";

export default {
  name: "volume",
  alias: ["vol", "addvol", "kurangvol", "volumedia"],
  description: "Ubah volume audio/video (maksimal 10x 🔊 dan durasi ≤ 3 menit)",
  access: { group: true },

  run: async (m, { conn, args }) => {
    const getRandom = (ext = "") => `${Math.floor(Math.random() * 10000)}${ext}`;
    const quoted = m.quoted;

    if (!quoted) return m.reply("Reply ke *audio* atau *video* yang ingin diubah volumenya 🔉");

    const type = quoted.type;
    const isAudio = type === "audioMessage";
    const isVideo = type === "videoMessage";

    if (!isAudio && !isVideo)
      return m.reply("❌ Format tidak didukung. Harap reply ke *audio* atau *video*!");

    if (m.quoted.type?.seconds < 180) {
      return m.reply("⚠️ Durasi maksimal yang bisa diubah volumenya adalah *3 menit (180 detik)*!");
    }

    let vol = parseFloat(args[0]);
    if (!vol || isNaN(vol)) return m.reply("Masukkan angka volume!\nContoh: *.volume 2*");
    if (vol > 10) return m.reply("⚠️ Maksimal volume adalah 10x!");
    if (vol <= 0) return m.reply("⚠️ Volume tidak boleh 0 atau negatif!");

    const ext = isAudio ? ".mp3" : ".mp4";
    const kind = isAudio ? "audio" : "video";

    try {
      m.reply(`🎚️ Sedang mengubah volume ${kind} ke level *${vol}x*...`);

      const media = await quoted.downloadAndSave();
      const output = getRandom(ext);

      exec(`ffmpeg -i ${media} -filter:a "volume=${vol}" ${output}`, async (err) => {
        fs.unlinkSync(media);
        if (err) {
          console.error(err);
          return m.reply(`❌ Terjadi kesalahan saat mengubah volume ${kind}.`);
        }

        const buff = fs.readFileSync(output);

        if (isAudio) {
          await conn.sendMessage(m.chat, { audio: buff, mimetype: "audio/mpeg" }, { quoted: m });
        } else {
          await conn.sendMessage(
            m.chat,
            {
              video: buff,
              mimetype: "video/mp4",
              caption: `✅ Volume ${kind} berhasil diubah ke *${vol}x*!`
            },
            { quoted: m }
          );
        }

        fs.unlinkSync(output);
        m.reply(`✅ Volume ${kind} berhasil diubah ke *${vol}x*!`);
      });
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
