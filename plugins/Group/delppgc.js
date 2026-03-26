export default {
  name: "delppgc",
  description: "Menghapus foto profil grup",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    try {
      await conn.removeProfilePicture(m.chat);
      m.reply("✅ Foto profil grup berhasil dihapus.");
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat menghapus foto profil grup. Pastikan bot adalah admin.");
    }
  }
};
