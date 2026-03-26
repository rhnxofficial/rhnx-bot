export default {
  name: "family100",
  alias: ["fam100", "fam"],
  description: "Game Family 100",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.family100) conn.family100 = {};

    if (m.chat in conn.family100) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let timeout = 180000;
    let poin = 100;
    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/family100.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let soal = item.soal;
    let jawaban = item.jawaban.map((v) => v.toLowerCase().trim());
    let listJawaban = jawaban.map(() => false);

    let caption = `
🎯 *Family 100*
Soal: *${soal}*

Ada *${jawaban.length}* jawaban yang benar!
⏱ Waktu: ${timeout / 1000} detik

Jawab sekarang di grup ini!
`.trim();

    let sent = await m.reply(caption);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.family100[m.chat] = {
      msg: sent,
      soal,
      jawaban,
      sudah: listJawaban,
      poin,
      timeout: setTimeout(() => {
        let reveal = jawaban.map((v, i) => `${i + 1}. ${v.toUpperCase()}`).join("\n");
        m.reply(`⏱ *Waktu Habis!*\n\nJawaban:\n${reveal}`);
        delete conn.family100[m.chat];
      }, timeout)
    };
  }
};
