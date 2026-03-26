export default {
  name: "cekpacar",
  description: "Cek siapa pasanganmu 😳",
  async run(m, { conn }) {
    const user = global.db.data.users[m.sender];
    if (!user || !user.pasangan || !user.pasangan.length) return m.reply("Kamu lagi jomblo 😅");

    const pasangan = user.pasangan[0];
    await conn.sendMessage(m.chat, {
      text: `💘 Pasanganmu saat ini adalah @${pasangan.split("@")[0]} 💞`,
      mentions: [pasangan]
    });
  }
};
