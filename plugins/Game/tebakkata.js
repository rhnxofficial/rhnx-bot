export default {
  name: "tebakkata",
  description: "Game Tebak Kata",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebakkata) conn.tebakkata = {};

    if (m.chat in conn.tebakkata) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let timeout = 120000;
    let poin = 1500;

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/tebakkata.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];

    let soal = item.soal;
    let jawaban = item.jawaban.toLowerCase().trim();

    let caption = `
🧠 *TEBAK KATA*

Petunjuk:
${soal
  .split(",")
  .map((v) => "• " + v.trim())
  .join("\n")}

⏱ Waktu: ${timeout / 1000} detik  
🎁 Reward: +${poin} Balance

*Jawab dengan 1 kata!*
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebakkata[m.chat] = [
      sent,
      jawaban,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${item.jawaban}*`);
        delete conn.tebakkata[m.chat];
      }, timeout)
    ];
  }
};
