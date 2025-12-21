export default {
  name: "siapakahaku",
  alias: ["siapaaku"],
  description: "Game Tebak Siapakah Aku",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.siapakahaku) conn.siapakahaku = {};

    if (m.chat in conn.siapakahaku) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let timeout = 120000;
    let poin = 1500;

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/siapakahaku.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let soal = item.soal;
    let jawaban = item.jawaban.toLowerCase().trim();

    let caption = `
🔍 *TEBAK “Siapakah Aku”*

Soal:
> _${soal}_

⏱ Waktu: ${timeout / 1000} detik  
🎁 Reward: +${poin} Balance

Jawab dengan tepat apa atau siapa yang dimaksud!
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.siapakahaku[m.chat] = [
      sent,
      jawaban,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${item.jawaban}*`);
        delete conn.siapakahaku[m.chat];
      }, timeout)
    ];
  }
};
