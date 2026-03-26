export default {
  name: "groupupdate",
  description: "Aktifkan / Nonaktifkan notifikasi update grup",
  access: { owner: true, group: true },
  run: async (m, { conn, q, args, setReply }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat) return m.reply("❌ Grup ini belum terdaftar di database bot.");

    if (!q) return m.reply("❗ Masukkan query: `on` atau `off`");

    if (q.toLowerCase() === "on") {
      if (chat.groupupdate === true) return m.reply("✅ Notifikasi group update sudah aktif.");
      chat.groupupdate = true;
      m.reply("✅ Berhasil mengaktifkan notifikasi group update pada grup ini.");
    } else if (q.toLowerCase() === "off") {
      if (chat.groupupdate === false)
        return m.reply("⚠️ Notifikasi group update sudah tidak aktif.");
      chat.groupupdate = false;
      m.reply("✅ Berhasil menonaktifkan notifikasi group update pada grup ini.");
    } else {
      m.reply("❗ Query tidak valid. Pilih `on` atau `off`.");
    }
  }
};
