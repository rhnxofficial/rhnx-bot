export default {
  name: "updategempa",
  description: "Aktifkan / Nonaktifkan notifikasi update gempa di grup ini",
  access: { admin: true, botadmin: true },
  run: async (m, { conn, q, args, setReply }) => {
    if (!m.isGroup) return setReply("❌ Perintah ini hanya bisa digunakan di grup!");

    const chat = global.db.data.chats[m.chat];
    if (!chat) return setReply("❌ Grup ini belum terdaftar di database bot.");

    if (!q) return setReply("❗ Masukkan query: `on` atau `off`");

    const opt = q.toLowerCase();

    if (opt === "on") {
      if (chat.updategempa === true)
        return setReply("✅ Fitur update gempa sudah aktif di grup ini.");
      chat.updategempa = true;
      setReply("✅ Berhasil mengaktifkan fitur *update gempa* pada grup ini.");
    } else if (opt === "off") {
      if (chat.updategempa === false) return setReply("⚠️ Fitur update gempa sudah tidak aktif.");
      chat.updategempa = false;
      setReply("✅ Berhasil menonaktifkan fitur *update gempa* pada grup ini.");
    } else {
      setReply("❗ Query tidak valid. Gunakan `on` atau `off`.");
    }
  }
};
