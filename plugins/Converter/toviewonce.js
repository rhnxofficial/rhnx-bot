export default {
  name: "toviewonce",
  description: "Kirim file (image, video, audio, dokumen) sebagai ViewOnce",
  async run(m, { conn, args }) {
    try {
      if (!m.quoted) return m.reply("Reply file yang ingin dikirim sebagai ViewOnce.");

      const fileData = await m.quoted.download();
      const mimetype = m.quoted.type || "";

      let msgOptions = { viewOnce: true };
      if (mimetype.startsWith("image")) msgOptions.image = fileData;
      else if (mimetype.startsWith("video")) msgOptions.video = fileData;
      else if (mimetype.startsWith("audio")) msgOptions.audio = fileData;
      else msgOptions.document = fileData;

      await conn.sendMessage(m.chat, msgOptions);

      m.reply("Berhasil dikirim sebagai ViewOnce ✅");
    } catch (err) {
      console.error(err);
      m.reply("Gagal mengirim file sebagai ViewOnce ❌");
    }
  }
};
