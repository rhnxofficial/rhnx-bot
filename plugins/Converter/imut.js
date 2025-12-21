import fs from "fs";
import { exec } from "child_process";

export default {
  name: "imut",
  description: "Ubah suara jadi pelan dan imut (efek lucu 😳)",
  category: "audio",
  access: { group: true },
  run: async (m, { conn }) => {
    const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

    const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";
    if (!isQuotedAudio) {
      return m.reply("Reply ke audio yang ingin diubah jadi suara imut 😳");
    }

    try {
      m.reply("🎶 Sedang membuat suara jadi imut...");

      const medok = await m.quoted.downloadAndSave();
      const ran = getRandom(".mp3");

      exec(
        `ffmpeg -i ${medok} -af atempo=1/2,asetrate=44500*2/1 ${ran}`,
        async (err, stderr, stdout) => {
          fs.unlinkSync(medok);

          if (err) {
            console.error(err);
            return m.reply("❌ Terjadi kesalahan saat membuat efek imut.");
          }

          const buff = fs.readFileSync(ran);
          await conn.sendMusic(m.chat, buff, m);
          fs.unlinkSync(ran);

          m.reply("✅ Efek suara imut berhasil diterapkan!");
        }
      );
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
