export default {
  name: "tebakkimia",
  description: "Game Tebak Lambang Unsur Kimia",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebakkimia) conn.tebakkimia = {};

    let poin = 1000;
    let timeout = 120000;

    if (m.chat in conn.tebakkimia) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkimia.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let soalUnsur = item.unsur;
    let jawaban = item.lambang.toLowerCase().trim();

    let caption = `
🔬 *TEBAK KIMIA – Lambang Unsur*

Unsur: *${soalUnsur}*

⏱ Waktu: ${timeout / 1000} detik  
🎁 Reward: +${poin} Balance

Masukkan lambang kimianya (contoh: H, He, Ag, Au…)
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebakkimia[m.chat] = [
      sent,
      jawaban,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${item.lambang}*\nUnsur: *${soalUnsur}*`);
        delete conn.tebakkimia[m.chat];
      }, timeout)
    ];
  }
};
