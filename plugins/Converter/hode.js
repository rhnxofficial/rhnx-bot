import fs from "fs";
import { exec } from "child_process";

export default {
  name: "hode",
  description: "Ubah suara jadi lebih tinggi (efek Hode 🤭)",
  access: { group: true },

  run: async (m, { conn }) => {
    const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

    const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";
    if (!isQuotedAudio) {
      return m.reply("Reply ke audio yang ingin diubah jadi suara Hode 🤭");
    }

    try {
      m.reply("🎙️ Sedang memproses efek Hode...");

      const medok = await m.quoted.downloadAndSave();
      const ran = getRandom(".mp3");

      exec(`ffmpeg -i ${medok} -af atempo=4/3,asetrate=44500*3/4 ${ran}`, async (err) => {
        fs.unlinkSync(medok);

        if (err) {
          console.error(err);
          return m.reply("❌ Terjadi kesalahan saat membuat efek Hode.");
        }

        const buff = fs.readFileSync(ran);
        await conn.sendMusic(m.chat, buff, m);
        fs.unlinkSync(ran);

        m.reply("✅ Efek Hode berhasil diterapkan!");
      });
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
