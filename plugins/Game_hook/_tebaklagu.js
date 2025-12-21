export default {
  name: "tebaklaguHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebaklagu) conn.tebaklagu = {};
    if (!m.isGroup) return;
    if (!(m.chat in conn.tebaklagu)) return;
    if (!m.text) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebaklagu[m.chat];
    let txt = m.text.toLowerCase().trim();

    if (txt == "nyerah" || txt == ".nyerah") {
      clearTimeout(timeoutId);

      await m.reply(
        `🏳️ *Menyerah ya?* 😜\n` + `Jawaban yang benar:\n🎧 *${jawaban.toUpperCase()}*`
      );
      delete conn.tebaklagu[m.chat];
      return;
    }

    if (txt == jawaban) {
      clearTimeout(timeoutId);

      let user = global.db.data.users[m.sender];
      let expGain = Math.floor(Math.random() * 11) + 10; // 10-20 exp

      user.exp += expGain;
      user.balance += poin;

      delete conn.tebaklagu[m.chat];

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *BENAR!* 🥳\n\n` +
          `🎧 Judul: *${jawaban.toUpperCase()}*\n` +
          `+${expGain} Exp\n` +
          `+${poin} Balance 💰`
      );
    }
  }
};
