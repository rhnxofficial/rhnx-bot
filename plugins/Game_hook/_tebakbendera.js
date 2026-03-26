import stringSimilarity from "string-similarity";

export default {
  name: "tebakbenderaHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebakbendera) conn.tebakbendera = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.tebakbendera)) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebakbendera[m.chat];
    let answer = jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similar = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.tebakbendera[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 11) + 10;

      user.exp += expRandom;
      user.balance += poin;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *BENAR!*\n` + `Negara: *${jawaban}*\n` + `+${expRandom} Exp | +${poin} Balance`
      );
    }

    if (similar >= 0.5) {
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(`⚠️ Hampir! (${(similar * 100).toFixed(0)}% mirip)`);
    }
  }
};
