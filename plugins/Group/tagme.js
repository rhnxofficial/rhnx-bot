export default {
  name: "tagme",
  description: "Menandai diri sendiri di grup",
  access: { group: true },

  run: async (m, { conn }) => {
    try {
      const tag = `@${m.sender.split("@")[0]}`;

      await conn.sendMessage(
        m.chat,
        {
          text: tag,
          mentions: [m.sender]
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      await m.reply("❌ Gagal menandai diri sendiri.");
    }
  }
};
