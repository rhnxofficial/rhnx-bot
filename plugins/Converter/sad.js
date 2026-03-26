import fs from "fs";
import axios from "axios";

export default {
  name: "sad",
  description: "Putar musik sedih dari koleksi sad1–sad34 😢",
  access: { group: true },
  run: async (m, { conn, args, prefix, command }) => {
    try {
      const maxSad = 34;

      if (!args[0]) {
        let list = `🎵 *Daftar Musik Sad (1–${maxSad})*\n\n`;
        for (let i = 1; i <= maxSad; i++) {
          list += `${i}. sad${i}.mp3\n`;
        }
        list += `\nKetik *${prefix}${command} [nomor]* untuk memutar.\nContoh: *${prefix}${command} 3*`;
        return m.reply(list);
      }

      const sadNumber = parseInt(args[0]);
      if (isNaN(sadNumber) || sadNumber < 1 || sadNumber > maxSad) {
        return m.reply(`❌ Nomor tidak valid! Pilih antara 1–${maxSad}.`);
      }
      const sadURL = `https://github.com/Rangelofficial/Sad-Music/raw/main/audio-sad/sad${sadNumber}.mp3`;
      m.reply(`🎧 Memutar *sad${sadNumber}.mp3* ...`);

      const { data } = await axios.get(sadURL, { responseType: "arraybuffer" });
      const buff = Buffer.from(data);
      await conn.sendMusic(m.chat, buff, m);
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
