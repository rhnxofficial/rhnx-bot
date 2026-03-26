import fs from "fs";
import { exec } from "child_process";
import path from "path";

export default {
  name: "toimg",
  alias: ["toimage", "imgfromsticker"],
  description: "Ubah sticker atau dokumen menjadi foto (JPG/PNG)",
  access: { group: true },

  run: async (m, { conn }) => {
    const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
    const isSticker = m.quoted && m.quoted.type === "stickerMessage";

    const isQuotedDocument = m.quoted && m.quoted.type === "documentMessage";

    if (!isSticker && !isQuotedDocument) {
      return m.reply("Reply ke *sticker* atau *dokumen* untuk diubah ke foto 🖼️");
    }

    try {
      m.reply("🧩 Sedang mengubah ke gambar...");

      // Download file
      const media = await m.quoted.downloadAndSave();
      const outputFile = getRandom(".png");

      exec(`ffmpeg -y -i ${media} ${outputFile}`, async (err) => {
        fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Terjadi kesalahan saat mengubah ke gambar.");
        }

        const buff = fs.readFileSync(outputFile);

        await conn.sendMessage(
          m.chat,
          { image: buff, caption: "✅ Berhasil diubah menjadi gambar!" },
          { quoted: m }
        );

        fs.unlinkSync(outputFile);
      });
    } catch (e) {
      console.error(e);
      m.reply(`❌ Terjadi kesalahan: ${e.message}`);
    }
  }
};
