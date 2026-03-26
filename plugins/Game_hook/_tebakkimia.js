import stringSimilarity from "string-similarity";

export default {
  name: "tebakkimiaHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebakkimia) conn.tebakkimia = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.tebakkimia)) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebakkimia[m.chat];
    let answer = jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similarity = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.tebakkimia[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 11) + 10;

      user.exp += expRandom;
      user.balance += poin;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `✅ *BENAR!* 🎉\n` + `Lambang: *${jawaban}*\n` + `+${expRandom} Exp | +${poin} Balance`
      );
    }

    if (similarity >= 0.5) {
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(`⚠️ Hampir! (${(similarity * 100).toFixed(0)}% mirip)`);
    }
  }
};
