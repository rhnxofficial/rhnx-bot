import fs from "fs";
import { exec } from "child_process";

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

export default {
  name: "tomp3",
  description: "Ubah VN, video, atau dokumen audio menjadi MP3",
  access: {
    group: false,
    loading: true
  },
  run: async (m, { conn }) => {
    try {
      const isQuotedVideo = m.quoted && m.quoted.type === "videoMessage";
      const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";
      const isVideo = m.type === "videoMessage";
      const isAudio = m.type === "audioMessage";
      const isQuotedDocument =
        m.quoted && m.quoted.type === "documentMessage" && m.quoted.msg?.type?.startsWith("audio/");
      const isDocument = m.type === "documentMessage" && m.msg?.type?.startsWith("audio/");

      const media = await (m.quoted ? m.quoted.downloadAndSave() : m.downloadAndSave());
      const ran = getRandom(".mp3");

      const command =
        isQuotedAudio || isAudio || isQuotedDocument || isDocument
          ? `ffmpeg -i ${media} -q:a 0 -map a ${ran}`
          : `ffmpeg -i ${media} -vn ${ran}`;

      exec(command, async (err) => {
        fs.unlinkSync(media);
        if (err) return m.reply("❌ Gagal mengubah media ke MP3.");

        const buff = fs.readFileSync(ran);
        await conn.sendMusic(m.chat, buff, m);
        fs.unlinkSync(ran);
      });
    } catch (e) {
      console.error(e);
      m.reply("⚠️ Terjadi kesalahan saat memproses file.");
    }
  }
};
