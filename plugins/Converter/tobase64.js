import fs from "fs";

export default {
  name: "tobase64",
  alias: ["base64", "to64"],
  description: "Ubah sticker / media jadi base64 file",
  access: { group: true },

  run: async (m, { conn }) => {
    const quoted = m.quoted ? m.quoted : m;

    const isSticker = quoted.type === "stickerMessage";
    const isImage = quoted.type === "imageMessage";
    const isVideo = quoted.type === "videoMessage";
    const isDoc = quoted.type === "documentMessage";

    if (!isSticker && !isImage && !isVideo && !isDoc) {
      return m.reply("Reply ke *sticker / image / video / dokumen*");
    }

    try {
      m.reply("🧩 Processing...");

      const buffer = await conn.downloadMediaMessage(quoted);
      if (!buffer) return m.reply("❌ Gagal download media");

      const base64 = buffer.toString("base64");

      const filePath = `./base64-${Date.now()}.txt`;
      fs.writeFileSync(filePath, base64);
        
      await conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(filePath),
          fileName: "base64.txt",
          mimetype: "text/plain",
          caption: "Base64 berhasil dibuat"
        },
        { quoted: m }
      );

      fs.unlinkSync(filePath);

    } catch (e) {
      console.error(e);
      m.reply("❌ Error:\n" + e.message);
    }
  }
};
