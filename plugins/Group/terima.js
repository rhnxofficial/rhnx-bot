export default {
  name: "terima",
  description: "Terima tembakan 😳",
  access: { group: true },
  async run(m, { conn }) {
    if (!conn._tembak) conn._tembak = {};
    const penembak = conn._tembak[m.sender];
    if (!penembak) return conn.sendMessage(m.chat, { text: "Gak ada yang lagi nembak kamu." });

    const user = global.db.data.users[m.sender] || { pasangan: [] };
    const target = global.db.data.users[penembak] || { pasangan: [] };

    user.pasangan = [penembak];
    target.pasangan = [m.sender];

    delete conn._tembak[m.sender];
    await global.db.write();

    await conn.sendMessage(m.chat, {
      text: `💞 Selamat! @${penembak.split("@")[0]} dan @${m.sender.split("@")[0]} kini resmi menjadi pasangan! 💘`,
      mentions: [penembak, m.sender]
    });
  }
};
