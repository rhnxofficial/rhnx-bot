import axios from "axios";
import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

export default {
  name: "remini",
  alias: ["enhance", "hd"],
  description: "Meningkatkan kualitas foto dengan AI Remini",
  access: { limit: true },
  async run(m, { conn, prefix, command }) {
    try {
      const q = m.quoted ? m.quoted : m;
      const type = q.type || m.type;

      if (type !== "imageMessage") {
        return m.reply(
          `📸 *Opsi Penggunaan:*\n\nKirim atau reply foto dengan perintah *${prefix + command}*`
        );
      }

      await m.reply("⏳ Sedang mengupload gambar...");

      const filePath = m.quoted ? await m.quoted.downloadAndSave() : await m.downloadAndSave();

      if (!filePath || !fs.existsSync(filePath)) return m.reply("❌ Gagal menyimpan gambar.");

      const buffer = fs.readFileSync(filePath);

      let imageUrl;
      try {
        imageUrl = await uploadToGithub(buffer);
      } catch (err) {
        fs.unlinkSync(filePath);
        return m.reply(`Gagal upload gambar ke host: ${err.message}`);
      }

      await m.reply("✨ Sedang memproses gambar dengan AI Remini...");

      try {
        const { data } = await axios.get(
          `${api.neoxr}/api/remini?image=${encodeURIComponent(imageUrl)}&apikey=${key.neoxr}`
        );

        if (!data.status || !data.data?.url) {
          fs.unlinkSync(filePath);
          return m.reply("❌ Gagal mendapatkan hasil dari API Remini.");
        }

        await conn.sendMessage(
          m.chat,
          {
            image: { url: data.data.url },
            caption: "✨ Ini hasil *HD Remini*-nya!"
          },
          { quoted: m }
        );

        await m.react("✅");
      } catch (err) {
        return m.reply(`❌ Gagal memproses gambar: ${err.response?.data?.message || err.message}`);
      } finally {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(err);
      await m.react("❌");
      await m.reply("⚠️ Terjadi kesalahan pada fitur Remini.");
    }
  }
};
