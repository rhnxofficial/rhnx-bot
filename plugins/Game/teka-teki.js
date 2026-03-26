export default {
  name: "tekateki",
  description: "Game Teka-Teki Santai",
  access: { group: true, game: true, glimit: true },
  async run(m, { conn }) {
    if (!conn.tekateki) conn.tekateki = {};

    let poin = 1000;
    let timeout = 120000;

    if (m.chat in conn.tekateki) {
      return m.reply("❗ Masih ada teka-teki yang belum dijawab!");
    }

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/tekateki.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let soal = item.soal || item.question;
    let jawaban = item.jawaban || item.answer;

    let teks = `
🧩 *TEKA-TEKI BERGAMBAR* (bukan gambar sih 😆)
  
Soal:
• *${soal}*

⏱ Timeout: ${timeout / 1000} detik
🎁 Reward: +${poin} Balance
`.trim();

    let sent = await m.reply(teks);
    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tekateki[m.chat] = [
      sent,
      jawaban.toLowerCase(),
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${jawaban}*`);
        delete conn.tekateki[m.chat];
      }, timeout)
    ];
  }
};
