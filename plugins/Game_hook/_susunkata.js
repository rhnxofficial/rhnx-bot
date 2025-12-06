import stringSimilarity from "string-similarity";

export default {
  name: "susunkataHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.susunkata) conn.susunkata = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.susunkata)) return;

    let [msg, data, poin, timeoutId] = conn.susunkata[m.chat];
    let answer = data.jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similar = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.susunkata[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 11) + 10;

      user.exp += expRandom;
      user.balance += poin;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *Jawaban Benar!*\n` +
          `+${expRandom} Exp\n` +
          `+${poin} Balance\n` +
          `Jawaban: *${data.jawaban}*`
      );
    }

    if (similar >= 0.5) {
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(`❗ Dikit lagi kak! (${(similar * 100).toFixed(0)}% mirip)`);
    }
  }
};
