export default {
  name: "join",
  alias: ["joingc"],
  description: "Bot join ke group via link",
  access: { owner: true },
  run: async (m, { conn, q }) => {
    if (!q)
      return m.reply("❌ Masukkan link group!\n\nContoh: .join https://chat.whatsapp.com/XXXX");

    const rex = /chat\.whatsapp\.com\/([\w\d]*)/i;
    const match = q.match(rex);
    if (!match) return m.reply("❌ Link group tidak valid!");

    try {
      const code = match[1];
      const groupId = await conn.groupAcceptInvite(code);
      return m.reply(`✅ Bot berhasil join ke group: ${groupId}`);
    } catch (err) {
      console.error(err);
      return m.reply("❌ Gagal join group: " + err.message);
    }
  }
};
