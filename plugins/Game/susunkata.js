export default {
  name: "susunkata",
  description: "Game susun kata",
  access: { group: true, game: true, glimit: true },
  async run(m, { conn }) {
    if (!conn.susunkata) conn.susunkata = {};

    let poin = 1000;
    let timeout = 120000;

    if (m.chat in conn.susunkata) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/main/games/susunkata.json"
      )
    ).json();
    let item = data[Math.floor(Math.random() * data.length)];

    let teks =
      `🎮 *GAME SUSUN KATA*\n\n` +
      `Soal: *${item.soal}*\n` +
      `Tipe: *${item.tipe}*\n\n` +
      `⏱ Timeout: ${timeout / 1000} detik\n` +
      `🎁 Reward: +${poin} Balance`;

    let sent = await m.reply(teks);
    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.susunkata[m.chat] = [
      sent,
      item,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban: *${item.jawaban}*`);
        delete conn.susunkata[m.chat];
      }, timeout)
    ];
  }
};
