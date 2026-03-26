const readmore = String.fromCharCode(8206).repeat(4001);

export default {
  name: "tagall",
  description: "Menandai semua anggota grup",
  access: { group: true, admin: true },

  run: async (m, { conn, args, q, setReply }) => {
    try {
      const metadata = await conn.groupMetadata(m.chat);
      const participants = metadata.participants || [];

      const inpo = q ? q : `I love you ${readmore}Tube :v`;

      const mentionList = participants.map((p) => p.id);
      const teks = `乂 *T A G  A L L*\n\n${inpo}\n\n${participants
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n")}`;

      await conn.sendMessage(
        m.chat,
        {
          text: teks,
          mentions: mentionList
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      await setReply("❌ Terjadi kesalahan saat menandai semua anggota.");
    }
  }
};
