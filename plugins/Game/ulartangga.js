export default {
  name: "ulartangga",
  description: "Game ular tangga",
  access: { group: true, game: true },

  async run(m, { conn }) {
    if (!m.isGroup) return m.reply("❗ Game ini hanya untuk grup!");

    let mention = m.mentionByTag()[0] || m.quoted?.sender;
    if (!mention) return m.reply("Tag lawan: *ulartangga @user*");

    let p1 = m.sender;
    let p2 = mention;

    conn.ulartangga = conn.ulartangga || {};
    if (conn.ulartangga[m.chat]) return m.reply("❗ Masih ada game Ular Tangga berjalan!");

    let game = {
      p1,
      p2,
      pos1: 1,
      pos2: 1,
      turn: p1,
      snakes: { 17: 7, 54: 34, 62: 19, 98: 79 },
      ladders: { 3: 22, 8: 30, 28: 55, 58: 77 }
    };

    conn.ulartangga[m.chat] = game;

    await conn.sendMessage(m.chat, {
      text:
        `🎮 *Game Ular Tangga Dimulai!*\n\n` +
        `🟦 Player 1: @${p1.split("@")[0]}\n` +
        `🟥 Player 2: @${p2.split("@")[0]}\n\n` +
        `Giliran pertama: @${p1.split("@")[0]}\n\n` +
        `Ketik *roll* untuk lempar dadu.`,
      mentions: [p1, p2]
    });
  }
};
