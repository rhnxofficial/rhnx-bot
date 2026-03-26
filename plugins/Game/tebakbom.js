export default {
  name: "tebakbom",
  description: "Game Tebak BOM",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.tebakbom) conn.tebakbom = {};
    if (m.chat in conn.tebakbom) {
      return m.reply("❗ Masih ada game yang belum selesai!");
    }

    let reward = 1500;
    let timeout = 120000;

    const bom = ["💥", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"].sort(
      () => Math.random() - 0.5
    );
    const number = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    let teks = `❏  *B O M B*\n\n`;
    teks += `Kirim angka *1 - 9* untuk memilih kotak.\n`;
    teks += `Hati-hati, salah pilih bisa *MELEDAK!* 💣💥\n\n`;
    teks += number.join(" ");

    let sent = await m.reply(teks);

    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.tebakbom[m.chat] = {
      msg: sent,
      bom,
      open: [],
      reward,
      timeout: setTimeout(() => {
        m.reply(`⏱ *Waktu habis! Game berakhir.*`);
        delete conn.tebakbom[m.chat];
      }, timeout)
    };
  }
};
