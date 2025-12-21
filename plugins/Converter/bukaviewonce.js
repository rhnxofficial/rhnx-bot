export default {
  name: "rvo",
  description: "Membuka pesan ViewOnce langsung tanpa cek, kirim ulang media",
  async run(m, { conn }) {
    try {
      const quoted = m.quoted ? m.quoted : m;
      const mediaBuffer = await quoted.download();

      const messageKeys = Object.keys(quoted.message || quoted);
      let msgOptions = {};

      if (messageKeys.includes("imageMessage")) msgOptions.image = mediaBuffer;
      else if (messageKeys.includes("videoMessage")) msgOptions.video = mediaBuffer;
      else if (messageKeys.includes("audioMessage")) msgOptions.audio = mediaBuffer;
      else if (messageKeys.includes("documentMessage")) msgOptions.document = mediaBuffer;
      else if (messageKeys.includes("stickerMessage")) msgOptions.sticker = mediaBuffer;
      else return m.reply("Tipe file tidak didukung.");

      await conn.sendMessage(m.chat, msgOptions);
      m.reply("Berhasil membuka media ✅");
    } catch (err) {
      console.error(err);
      m.reply("Gagal membuka media ❌");
    }
  }
};
