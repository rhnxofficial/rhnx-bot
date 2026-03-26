export default {
  name: "linkgc",
  description: "Mendapatkan link undangan grup",
  access: { group: true, admin: false, botadmin: true },

  run: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    try {
      const code = await conn.groupInviteCode(m.chat);
      const link = "https://chat.whatsapp.com/" + code;

      m.reply(`📎 Link undangan grup:\n${link}`);
    } catch (e) {
      console.error(e);
      m.reply(
        "❌ Terjadi kesalahan saat mengambil link undangan. Pastikan bot adalah admin di grup."
      );
    }
  }
};
