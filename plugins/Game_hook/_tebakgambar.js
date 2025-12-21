import stringSimilarity from "string-similarity";

export default {
  name: "tebakgambarHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebakgambar) conn.tebakgambar = {};
    if (!m.isGroup) return;
    if (!(m.chat in conn.tebakgambar)) return;

    let [msg, jawaban, poin, timeoutId] = conn.tebakgambar[m.chat];
    let desc = conn.tebakgambar[m.chat + "_desc"] || "-";
    let answer = jawaban.toLowerCase().trim();
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    let similarity = stringSimilarity.compareTwoStrings(txt, answer);

    if (txt === answer) {
      clearTimeout(timeoutId);
      delete conn.tebakgambar[m.chat];
      delete conn.tebakgambar[m.chat + "_desc"];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 10) + 20;

      user.balance += poin;
      user.exp += expRandom;

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `🎉 *Benar!* 🎉\n` +
          `Jawaban: *${jawaban.toUpperCase()}*\n\n` +
          `💡 Deskripsi:\n${desc}\n\n` +
          `+${expRandom} Exp | +${poin} Balance`
      );
    }

    if (similarity >= 0.5) {
      return m.reply(`🧠 Hampir benar! (${(similarity * 100).toFixed(0)}% mirip)`);
    }
  }
};
