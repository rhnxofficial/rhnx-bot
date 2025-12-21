import stringSimilarity from "string-similarity";

export default {
  name: "tebakkataHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebakkata) conn.tebakkata = {};
    if (!m.isGroup) return;
    if (!(m.chat in conn.tebakkata)) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebakkata[m.chat];
    let answer = jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similarity = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.tebakkata[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 10) + 15;

      user.balance += poin;
      user.exp += expRandom;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *BENAR!* \n` +
          `Jawaban: *${jawaban.toUpperCase()}*\n\n` +
          `+${expRandom} Exp | +${poin} Balance`
      );
    }

    if (similarity >= 0.5) {
      return m.reply(`⚠️ Hampir benar! (${(similarity * 100).toFixed(0)}% mirip)`);
    }
  }
};
