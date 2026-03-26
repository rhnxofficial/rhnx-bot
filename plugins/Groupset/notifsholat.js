export default {
  name: "notifsholat",
  description: "Aktifkan / Nonaktifkan notifikasi waktu sholat di grup",
  access: { owner: true, group: true },

  run: async (m, { conn, args }) => {
    try {
      if (!args[0])
        return m.reply(
          "⚙️ Gunakan perintah:\n\n" +
            "• *.notifsholat on*  → Aktifkan notifikasi waktu sholat\n" +
            "• *.notifsholat off* → Nonaktifkan notifikasi waktu sholat"
        );

      const input = args[0].toLowerCase();
      const chat = global.db.data.chats[m.chat] || {};

      if (input === "on") {
        chat.notifsholat = true;
        m.reply("✅ Notifikasi waktu sholat *diaktifkan!* 🕌");
      } else if (input === "off") {
        chat.notifsholat = false;
        m.reply("❌ Notifikasi waktu sholat *dinonaktifkan!* 🙏");
      } else {
        return m.reply("⚠️ Pilihan tidak valid! Gunakan *on* atau *off*.");
      }

      global.db.data.chats[m.chat] = chat;
    } catch (e) {
      console.error("❌ Error notifsholat:", e);
      m.reply("⚠️ Terjadi kesalahan saat mengubah status notifsholat.");
    }
  }
};
