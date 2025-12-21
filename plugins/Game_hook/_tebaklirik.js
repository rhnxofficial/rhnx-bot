import stringSimilarity from "string-similarity";

export default {
  name: "tebaklirikHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebaklirik) conn.tebaklirik = {};
    if (!m.isGroup) return;
    if (!(m.chat in conn.tebaklirik)) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebaklirik[m.chat];
    let answer = jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similarity = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.tebaklirik[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 10) + 20;

      user.exp += expRandom;
      user.balance += poin;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *Benar!* 🎉\n` + `Jawaban: *${jawaban}*\n\n` + `+${expRandom} Exp | +${poin} Balance`
      );
    }

    if (similarity >= 0.5) {
      return m.reply(`🎤 Sedikit lagi! (${(similarity * 100).toFixed(0)}% mirip)`);
    }
  }
};
