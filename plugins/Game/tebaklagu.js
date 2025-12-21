export default {
  name: "tebaklagu",
  description: "Game Tebak Lagu (judul saja!)",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebaklagu) conn.tebaklagu = {};
    if (m.chat in conn.tebaklagu) return m.reply("❗ Masih ada soal sebelumnya!");

    let timeout = 30000;
    let poin = 3000;

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/main/games/tebaklagu.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];

    let lagu = item.lagu;
    let judul = item.judul.toLowerCase().trim();

    let audioMsg = await conn.sendMessage(m.chat, {
      audio: { url: lagu },
      mimetype: "audio/mpeg",
      ptt: false
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `
🎶 *TEBAK LAGU*

🧑‍🎤 Artis: *${item.artis}*
📌 Tebak *judul lagunya saja!*
⏱ Timeout: ${timeout / 1000} detik
🎁 Reward: +${poin} Balance
`.trim()
      },
      { quoted: audioMsg }
    );

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebaklagu[m.chat] = [
      audioMsg,
      judul,
      poin,
      setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\n` + `🎧 Judul: *${item.judul}*\n` + `🧑‍🎤 Artis: *${item.artis}*`);
        delete conn.tebaklagu[m.chat];
      }, timeout)
    ];
  }
};
