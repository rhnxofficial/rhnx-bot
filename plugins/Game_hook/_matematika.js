export default {
  name: "matematikaHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.matematika) conn.matematika = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.matematika)) return;

    let game = conn.matematika[m.chat];
    let txt = m.text.trim();

    if (!/^-?\d+(\.\d+)?$/.test(txt)) return;

    let userAnswer = parseFloat(txt);
    let correct = game.answer;

    if (userAnswer !== correct) return;

    clearTimeout(game.timeout);
    delete conn.matematika[m.chat];

    let user = global.db.data.users[m.sender];
    let expRandom = Math.floor(Math.random() * 10) + 10;

    user.exp += expRandom;
    user.balance += game.reward;

    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    return m.reply(
      `🎉 *Benar!* 🎉\n` +
        `Jawaban: *${correct}*\n\n` +
        `+${expRandom} Exp\n` +
        `+${game.reward} Balance\n\n` +
        `⚡ Kamu paling cepat!`
    );
  }
};
