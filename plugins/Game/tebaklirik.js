export default {
  name: "tebaklirik",
  description: "Game Tebak Lirik Lagu",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebaklirik) conn.tebaklirik = {};

    if (m.chat in conn.tebaklirik) {
      return m.reply("❗ Masih ada soal sebelumnya belum dijawab!");
    }

    let timeout = 120000;
    let poin = 2000;

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/tebaklirik.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];

    let soal = item.soal;
    let jawaban = item.jawaban.toLowerCase().trim();

    let caption = `
🎶 *TEBAK LIRIK LAGU* 🎵

Lanjutkan lirik ini:
> _${soal}_

⏱ Waktu: ${timeout / 1000} detik  
🎁 Reward: +${poin} Balance
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebaklirik[m.chat] = [
      sent,
      jawaban,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!* Jawaban: *${item.jawaban}*`);
        delete conn.tebaklirik[m.chat];
      }, timeout)
    ];
  }
};
