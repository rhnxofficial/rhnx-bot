import fs from "fs";
import { exec } from "child_process";
const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};

export default {
  name: "speedup",
  description: "Mempercepat audio (speed up)",
  access: { group: true },
  run: async (m, { conn }) => {
    const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";

    if (!isQuotedAudio) {
      return m.reply("Reply ke audio yang ingin dipercepat!");
    }

    try {
      m.reply("⚡ Sedang mempercepat audio...");
      const medok = await m.quoted.downloadAndSave();
      const ran = getRandom(".mp3");

      exec(`ffmpeg -i ${medok} -filter:a "atempo=1.1,asetrate=65100" ${ran}`, async (err) => {
        fs.unlinkSync(medok);

        if (err) {
          console.error(err);
          return m.reply("❌ Terjadi kesalahan saat mempercepat audio.");
        }

        const buff = fs.readFileSync(ran);
        await conn.sendMusic(m.chat, buff, m);

        fs.unlinkSync(ran);
        m.reply("✅ Audio berhasil dipercepat!");
      });
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
