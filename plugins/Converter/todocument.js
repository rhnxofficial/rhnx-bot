import fs from "fs";

export default {
  name: "todocument",
  alias: ["todoc", "asdoc"],
  description: "Ubah gambar, video, atau audio menjadi dokumen 📄",
  category: "converter",
  access: { group: true },

  run: async (m, { conn }) => {
    const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

    const isQuotedImage = m.quoted && m.quoted.type === "imageMessage";
    const isQuotedVideo = m.quoted && m.quoted.type === "videoMessage";
    const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";

    const isImage = m.type === "imageMessage";
    const isVideo = m.type === "videoMessage";
    const isAudio = m.type === "audioMessage";

    const quoted = m.quoted ? m.quoted : m;

    if (!(isQuotedImage || isQuotedVideo || isQuotedAudio || isImage || isVideo || isAudio)) {
      return m.reply("Reply atau kirim gambar, video, atau audio untuk dikirim sebagai dokumen!");
    }

    try {
      m.reply("📦 Proses mengubah ke dokumen...");

      const media = m.quoted ? await m.quoted.downloadAndSave() : await m.downloadAndSave();

      let ext = isQuotedImage || isImage ? ".jpg" : isQuotedVideo || isVideo ? ".mp4" : ".mp3";

      let fileName = getRandom(ext);
      fs.renameSync(media, fileName);

      await conn.sendMessage(
        m.chat,
        {
          document: { url: fileName },
          mimetype:
            isQuotedImage || isImage
              ? "image/jpeg"
              : isQuotedVideo || isVideo
                ? "video/mp4"
                : "audio/mpeg",
          fileName: `converted${ext}`
        },
        { quoted: m }
      );

      fs.unlinkSync(fileName);
      m.reply("✅ Media berhasil dikonversi menjadi dokumen!");
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat mengonversi ke dokumen!");
    }
  }
};
