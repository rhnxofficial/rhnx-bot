import fs from "fs";

export default {
  name: "getppgc",
  description: "Mendapatkan foto profil grup",
  access: { group: true },

  run: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    try {
      const url = await conn.profilePictureUrl(m.chat).catch(() => null);

      if (!url) return m.reply("Grup ini belum memiliki foto profil.");

      const buffer = await (await fetch(url)).arrayBuffer();
      const fileBuffer = Buffer.from(buffer);
      await conn.sendMessage(m.chat, { image: fileBuffer, caption: "📸 Foto profil grup ini" });
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat mengambil foto profil grup.");
    }
  }
};
