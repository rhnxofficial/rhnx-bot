export default {
  name: "tebakgambar",
  description: "Game Tebak Gambar",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebakgambar) conn.tebakgambar = {};

    if (m.chat in conn.tebakgambar) return m.reply("❗ Masih ada soal sebelumnya!");

    let timeout = 120000;
    let poin = 2000;

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/tebakgambar.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let img = item.img;
    let jawaban = item.jawaban.toLowerCase().trim();
    let deskripsi = item.deskripsi || "-";

    let caption = `
🧩 *TEBAK GAMBAR*

📌 Jawab berdasarkan gambar
💡 Clue: ${deskripsi}

⏱ Waktu: ${timeout / 1000} detik
🎁 Reward: +${poin} Balance

> *Jawab dengan cepat!*
`.trim();

    let sentMsg = await conn.sendMessage(m.chat, {
      image: { url: img },
      caption
    });

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebakgambar[m.chat] = [
      sentMsg,
      jawaban,
      poin,
      setTimeout(() => {
        m.reply(
          `⏱ *Waktu habis!*\n` +
            `Jawaban: *${item.jawaban}*\n\n` +
            `💡 Deskripsi:\n${item.deskripsi}`
        );
        delete conn.tebakgambar[m.chat];
      }, timeout)
    ];

    conn.tebakgambar[m.chat + "_desc"] = deskripsi;
  }
};
