export default {
  name: "tebakbendera",
  description: "Game Tebak Bendera Negara",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebakbendera) conn.tebakbendera = {};

    let poin = 1000;
    let timeout = 120000;

    if (m.chat in conn.tebakbendera) {
      return m.reply("❗ Masih ada soal yang belum dijawab!");
    }

    let data = await (
      await fetch(
        "https://raw.githubusercontent.com/rhnxofficial/database/master/games/tebakbendera.json"
      )
    ).json();

    let item = data[Math.floor(Math.random() * data.length)];
    let { img, name } = item;
    let jawaban = name.toLowerCase();

    let caption = `
🚩 *TEBAK BENDERA NEGARA*

⏱ Waktu: ${timeout / 1000} detik  
🎁 Reward: +${poin} Balance

Jawab nama negara ini!
`.trim();

    async function downloadImageToBuffer(url) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
          },
          redirect: "follow"
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (e) {
        throw e;
      }
    }
    try {
      const imageBuffer = await downloadImageToBuffer(img);

      let sent = await conn.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption
        },
        { quoted: m }
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      conn.tebakbendera[m.chat] = [
        sent,
        jawaban,
        poin,
        setTimeout(() => {
          m.reply(`⏱ *Waktu habis!*\nJawaban: *${name}*`);
          delete conn.tebakbendera[m.chat];
        }, timeout)
      ];
    } catch (err) {
      console.error("tebakbendera: gagal download/gagal kirim image:", err);

      let sent = await m.reply(
        caption + `\n\n⚠️ Gagal menampilkan gambar otomatis. Buka link: ${img}`
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      conn.tebakbendera[m.chat] = [
        sent,
        jawaban,
        poin,
        setTimeout(() => {
          m.reply(`⏱ *Waktu habis!*\nJawaban: *${name}*`);
          delete conn.tebakbendera[m.chat];
        }, timeout)
      ];
    }
  }
};
