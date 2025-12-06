export default {
  name: "welcome",
  description: "Aktifkan / Nonaktifkan fitur welcome di chat ini",
  access: { admin: true, botadmin: true, group: true },
  run: async (m, { conn, q, args, setReply }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat) return setReply("❌ Grup ini belum terdaftar di database bot.");

    if (!q) return setReply("❗ Masukkan query: `on` atau `off`");

    if (q.toLowerCase() === "on") {
      if (chat.welcome === true) return setReply("✅ Fitur welcome sudah aktif di grup ini.");
      chat.welcome = true;
      setReply("✅ Berhasil mengaktifkan fitur welcome pada grup ini.");
    } else if (q.toLowerCase() === "off") {
      if (chat.welcome === false) return setReply("⚠️ Fitur welcome sudah tidak aktif.");
      chat.welcome = false;
      setReply("✅ Berhasil menonaktifkan fitur welcome pada grup ini.");
    } else {
      setReply("❗ Query tidak valid. Pilih `on` atau `off`.");
    }
  }
};
