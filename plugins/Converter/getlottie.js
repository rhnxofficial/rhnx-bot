export default {
  name: "getlottie",
  alias: ["lottie", "getjson"],
  description: "Ambil file lottie dari sticker",
  access: { group: true },

  run: async (m, { conn }) => {
    const quoted = m.quoted;

    const sticker =
      quoted?.message?.lottieStickerMessage?.message?.stickerMessage;

    if (!sticker || !sticker.isLottie) {
      return m.reply("❌ Reply ke *sticker lottie 🎭*");
    }

    try {
      m.reply("📦 Mengambil lottie...");

      const buffer = await conn.downloadMediaMessage(quoted);
      if (!buffer) return m.reply("❌ Gagal download sticker");

      await conn.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: "application/octet-stream",
          fileName: `lottie-${Date.now()}.was`,
          caption: "✅ Berhasil ambil file lottie"
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("GETLOTTIE ERROR:", e);
      m.reply("❌ Error:\n" + e.message);
    }
  }
};
