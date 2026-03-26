import fs from "fs";

export default {
  name: "setppgc",
  description: "Mengganti foto profil grup",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    let savedFile;
    if (m.quoted) {
      savedFile = await m.quoted.downloadAndSave();
    } else {
      savedFile = await m.downloadAndSave();
    }

    if (!savedFile) return m.reply("Kirim atau reply gambar dengan caption *setppgc*.");

    if (m.type !== "imageMessage" && (!m.quoted || m.quoted.type !== "imageMessage"))
      return m.reply("File yang kamu kirim bukan gambar.");

    try {
      const buffer = fs.readFileSync(savedFile);
      await conn.updateProfilePicture(m.chat, buffer);
      m.reply("✅ Foto profil grup berhasil diperbarui.");
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat mengganti foto profil grup.");
    } finally {
      try {
        fs.unlinkSync(savedFile);
      } catch {}
    }
  }
};
