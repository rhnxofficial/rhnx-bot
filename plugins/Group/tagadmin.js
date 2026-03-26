export default {
  name: "tagadmin",
  description: "Menandai semua admin di grup",
  access: { group: true },
  run: async (m, { conn, setReply }) => {
    try {
      const metadata = await conn.groupMetadata(m.chat);
      const admins = metadata.participants.filter((p) => p.admin);

      if (!admins.length) return setReply("❌ Tidak ada admin di grup ini.");

      const mentionList = admins.map((p) => p.id);
      const adminNames = admins.map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`).join("\n");

      await conn.sendMessage(
        m.chat,
        {
          text: `乂 *A D M I N  G R O U P*\n\n${adminNames}`,
          mentions: mentionList
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      setReply("❌ Terjadi kesalahan saat menandai admin.");
    }
  }
};
