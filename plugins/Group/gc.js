export default {
  name: "gc",
  description: "Mengatur status grup: close atau open",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { conn, command, args }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    const q = args && args[0] ? args[0].toLowerCase() : null;

    try {
      if (command === "gc") {
        if (!q) {
          m.reply(
            `Kirim perintah ${command} _options_\nOptions: close & open\nContoh: ${command} close`
          );
        } else if (q === "close") {
          await conn.groupSettingUpdate(m.chat, "announcement");
          m.reply("🔒 Grup telah ditutup. Hanya admin yang bisa mengirim pesan.");
        } else if (q === "open") {
          await conn.groupSettingUpdate(m.chat, "not_announcement");
          m.reply("🔓 Grup telah dibuka. Semua member bisa mengirim pesan.");
        } else {
          m.reply(`Opsi tidak valid. Gunakan: close atau open`);
        }
      } else if (command === "close") {
        await conn.groupSettingUpdate(m.chat, "announcement");
        m.reply("🔒 Grup telah ditutup. Hanya admin yang bisa mengirim pesan.");
      } else if (command === "open") {
        await conn.groupSettingUpdate(m.chat, "not_announcement");
        m.reply("🔓 Grup telah dibuka. Semua member bisa mengirim pesan.");
      }
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan. Pastikan bot adalah admin di grup.");
    }
  }
};
