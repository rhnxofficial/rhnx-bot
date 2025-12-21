export default {
  name: "cocokpasang",
  description: "Game Cocok Pasang (Memory Card)",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.cocokpasang) conn.cocokpasang = {};

    if (m.chat in conn.cocokpasang) {
      return m.reply("❗ Game sebelumnya belum selesai!");
    }

    let reward = 2000;
    let timeout = 180000;

    const emojiPair = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒"];
    let board = [...emojiPair, ...emojiPair].sort(() => Math.random() - 0.5);

    let display = [...Array(12)].map((_, i) => numberToEmoji(i + 1));

    let teks =
      `🧠 *MEMORY GAME - COCOK PASANG*\n\n` +
      `Pilih *2 angka* (contoh: 3 8) untuk membuka kotak.\n` +
      `Cocokkan semua pasangan emoji untuk menang!\n\n` +
      display.slice(0, 4).join(" ") +
      "\n" +
      display.slice(4, 8).join(" ") +
      "\n" +
      display.slice(8, 12).join(" ");

    let sent = await m.reply(teks);

    conn.cocokpasang[m.chat] = {
      msg: sent,
      board,
      display,
      open: [],
      picks: [],
      reward,
      timeout: setTimeout(() => {
        m.reply(`⏱ *Waktu habis!* Game berakhir.`);
        delete conn.cocokpasang[m.chat];
      }, timeout)
    };

    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);
  }
};

function numberToEmoji(num) {
  const map = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "1️⃣1️⃣", "1️⃣2️⃣"];
  return map[num - 1];
}
