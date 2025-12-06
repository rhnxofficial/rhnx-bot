export default {
  name: "jadian",
  description: "Menentukan dua orang acak yang jadian di grup",
  access: { group: true },
  run: async (m, { conn }) => {
    try {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const participants = groupMetadata.participants.map((p) => p.id);

      const valid = participants.filter((v) => v !== conn.user.id);

      if (valid.length < 2)
        return conn.sendMessage(
          m.chat,
          { text: "❌ Member tidak cukup untuk dijadikan pasangan." },
          { quoted: m }
        );
      const orang = valid[Math.floor(Math.random() * valid.length)];
      let jodoh;
      do {
        jodoh = valid[Math.floor(Math.random() * valid.length)];
      } while (jodoh === orang);

      const jawab = `Ciee yang jadian ❤️ Jangan lupa pajak jadiannya yee\n\n@${orang.split("@")[0]} ❤️ @${jodoh.split("@")[0]}`;

      await conn.sendMessage(
        m.chat,
        {
          text: jawab,
          mentions: [orang, jodoh]
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("Error di fitur jadian:", err);
      await conn.sendMessage(
        m.chat,
        { text: "⚠️ Terjadi kesalahan saat menentukan pasangan." },
        { quoted: m }
      );
    }
  }
};
