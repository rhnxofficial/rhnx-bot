export default {
  name: "tebakbomHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.tebakbom) conn.tebakbom = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.tebakbom)) return;

    let game = conn.tebakbom[m.chat];
    let txt = m.text.trim();

    if (!/^[1-9]$/.test(txt)) return;
    let index = Number(txt) - 1;

    if (game.open.includes(index)) {
      return m.reply(`Kotak nomor *${txt}* sudah dibuka!`);
    }

    game.open.push(index);

    let isi = game.bom[index];

    if (isi === "💥") {
      clearTimeout(game.timeout);

      delete conn.tebakbom[m.chat];

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 1500);

      return m.reply(
        `💣 *BOOOM!* 💥\n` +
          `Kamu memilih kotak nomor *${txt}*\n` +
          `Sayang sekali, *kamu meledak!* 😂`
      );
    }

    let tampil = game.bom
      .map((v, i) => (game.open.includes(i) ? v : numberToEmoji(i + 1)))
      .join(" ");

    let text = `✅ Aman! Kotak nomor *${txt}* tidak ada bom.\n\n${tampil}`;

    let amanSemua = game.open.length >= 8;
    if (amanSemua) {
      clearTimeout(game.timeout);
      delete conn.tebakbom[m.chat];

      let user = global.db.data.users[m.sender];
      let expRandom = Math.floor(Math.random() * 11) + 15;

      user.exp += expRandom;
      user.balance += game.reward;

      return m.reply(
        `🎉 *SELAMAT! Semua kotak aman!* 🎉\n\n` +
          `+${expRandom} Exp\n` +
          `+${game.reward} Balance\n` +
          `🔥 Kamu berhasil menghindari bom!`
      );
    }

    return m.reply(text);
  }
};

function numberToEmoji(num) {
  const map = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  return map[num - 1];
}
