export default {
  name: "jodohku",
  alias: ["jodoh"],
  description: "Menentukan jodohmu secara acak di dalam grup",
  access: { group: true },
  run: async (m, { conn }) => {
    try {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const participants = groupMetadata.participants.map((p) => p.id);

      const valid = participants.filter((v) => v !== conn.user.id && v !== m.sender);

      if (valid.length === 0)
        return conn.sendMessage(
          m.chat,
          { text: "❌ Tidak ada member lain untuk dijadikan jodoh." },
          { quoted: m }
        );

      const jodoh = valid[Math.floor(Math.random() * valid.length)];
      const jawab = `💘 Jodoh kamu adalah @${jodoh.split("@")[0]} 💘`;
      const menst = [jodoh];

      await conn.sendMessage(m.chat, { text: jawab, mentions: menst }, { quoted: m });
    } catch (err) {
      console.error("Error di fitur jodohku:", err);
      await conn.sendMessage(
        m.chat,
        { text: "⚠️ Terjadi kesalahan saat mencari jodohmu." },
        { quoted: m }
      );
    }
  }
};
