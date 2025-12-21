import { textToVoice } from "../../lib/elevenlabs.js";

export default {
  name: "texttofetch",
  alias: ["t2f", "text2fetch"],
  description: "Convert text menjadi voice menggunakan ElevenLabs",
  access: { group: false },

  run: async (m, { conn, args }) => {
    try {
      const text = args.join(" ");
      if (!text) return m.reply("Masukkan teks yang mau diubah jadi suara!");

      const characterId = "RWiGLY9uXI70QL540WNd";

      const voice = await textToVoice(characterId, text).catch(() => null);
      if (!voice) return m.reply("Gagal membuat audio!");

      const mimeType = voice.endsWith(".opus") ? "audio/ogg; codecs=opus" : "audio/ogg";

      return conn.sendMessage(
        m.chat,
        { audio: { url: voice }, mimetype: mimeType, ptt: true },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      return m.reply("Terjadi kesalahan dalam memproses permintaan.");
    }
  }
};
