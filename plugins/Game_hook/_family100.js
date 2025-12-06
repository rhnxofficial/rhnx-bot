export default {
  name: "family100Hook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.family100) conn.family100 = {};
    if (!m.isGroup) return;
    if (!(m.chat in conn.family100)) return;

    let session = conn.family100[m.chat];
    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    if (["nyerah", "menyerah", "batal", "udah lah", "skip"].includes(txt)) {
      clearTimeout(session.timeout);
      delete conn.family100[m.chat];

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      return m.reply(
        `😔 *Yah Menyerah?*\n\n` +
          `Semua jawaban:\n` +
          session.jawaban.map((v, i) => `${i + 1}. ${v.toUpperCase()}`).join("\n") +
          `\n\nGame berakhir!`
      );
    }

    let index = session.jawaban.indexOf(txt);
    if (index < 0) return;
    if (session.sudah[index]) return;

    session.sudah[index] = true;

    let progress = session.jawaban
      .map((v, i) => (session.sudah[i] ? `${i + 1}. ${v.toUpperCase()} ✔️` : `${i + 1}. ???`))
      .join("\n");

    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    m.reply(`🎯 *Family100 — Progress Jawaban*\n` + `Soal: *${session.soal}*\n\n${progress}`);

    if (session.sudah.every((v) => v)) {
      clearTimeout(session.timeout);

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 50) + 100;
      user.exp += expRandom;
      user.balance += session.poin;

      delete conn.family100[m.chat];

      return m.reply(
        `🎉 *SEMUA JAWABAN LENGKAP!* 🎉\n\n` + `+${expRandom} Exp | +${session.poin} Balance`
      );
    }
  }
};
