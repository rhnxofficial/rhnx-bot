import translate from "@iamtraction/google-translate";
import { langMap } from "../../media/text/langue.js";

export default {
  name: "translate",
  alias: ["tr"],
  description: "Menerjemahkan teks ke bahasa lain.",
  category: "tools",
  async run(m, { conn, args }) {
    try {
      if (!args[0]) {
        return m.reply(
          "🌍 *Daftar Kode Bahasa yang Tersedia:*\n\n" +
            Object.entries(langMap)
              .map(([code, name]) => `• ${code} = ${name}`)
              .join("\n") +
            `\n\nContoh penggunaan:\n> tr id hello world\n> tr en halo dunia`
        );
      }

      const toLang = args[0].toLowerCase();
      const quoted = m.quoted && m.quoted.text ? m.quoted.text : null;
      const text = quoted ? quoted : args.slice(1).join(" ");

      if (!text) return m.reply("❗Masukkan teks atau reply pesan yang ingin diterjemahkan.");

      if (!langMap[toLang]) {
        return m.reply(
          `⚠️ Kode bahasa *${toLang}* tidak dikenali.\n\nGunakan perintah tanpa argumen untuk melihat daftar lengkap.`
        );
      }

      const result = await translate(text, { to: toLang });

      m.reply(
        `🌐 *Hasil Terjemahan (${langMap[toLang]}):*\n\n🗣️ Dari: ${result.from.language.iso.toUpperCase()}\n\n📜 *Teks:* ${result.text}`
      );
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat menerjemahkan teks.");
    }
  }
};
