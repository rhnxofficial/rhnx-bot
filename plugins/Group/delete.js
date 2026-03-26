export default {
  name: "delete",
  alias: ["del"],
  description: "Menghapus pesan dengan mereply pesan yang ingin dihapus",
  access: { group: true },
  run: async (m, { conn, setReply }) => {
    try {
      if (!m.quoted) return setReply("❌ Reply pesan yang ingin kamu hapus.");

      // cek apakah pesan yang dihapus adalah pesan bot sendiri
      const isBotMsg = m.quoted.fromMe;

      // kalau bukan pesan bot, maka bot harus admin
      if (!isBotMsg && !m.isBotAdmin)
        return setReply("⚠️ Bot harus jadi admin untuk hapus pesan orang lain!");

      const key = {
        remoteJid: m.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender
      };

      await conn.sendMessage(m.chat, { delete: key });
    } catch (err) {
      console.error(err);
      setReply("⚠️ Gagal menghapus pesan.");
    }
  }
};
