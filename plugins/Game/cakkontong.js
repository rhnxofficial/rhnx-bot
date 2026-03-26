export default {
  name: "caklontong",
  description: "Game Cak Lontong (Tebak Jawaban kocak)",
  access: {
    group: true,
    game: true,
    glimit: true
  },
  async run(m, { conn }) {
    if (!conn.caklontong) conn.caklontong = {};

    let poin = 1000;
    let timeout = 120000;

    if (m.chat in conn.caklontong) {
      return m.reply("❗ Masih ada pertanyaan yang belum dijawab!");
    }

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/caklontong.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let soal = item.soal;
    let jawaban = item.jawaban.toLowerCase().trim();
    let deskripsi = item.deskripsi;

    let caption = `
🧠 *CAK LONTONG QUIZ*

${soal}

⏱ Timeout: ${timeout / 1000} detik
🎁 Reward: +${poin} Balance

> Jawaban biasanya *nyeleneh* 🤣
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.caklontong[m.chat] = [
      sent,
      jawaban,
      deskripsi,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${item.jawaban}*\n💡 ${deskripsi}`);
        delete conn.caklontong[m.chat];
      }, timeout)
    ];
  }
};
