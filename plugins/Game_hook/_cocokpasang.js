export default {
  name: "cocokpasangHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.cocokpasang) conn.cocokpasang = {};
    if (!conn.botReplying) conn.botReplying = {};

    if (!m.isGroup) return;
    if (!(m.chat in conn.cocokpasang)) return;

    let game = conn.cocokpasang[m.chat];
    let txt = m.text.trim().split(" ");

    if (txt.length !== 2) return;
    if (!txt.every((v) => /^[1-9]$|^1[0-2]$/.test(v))) return;

    let a = Number(txt[0]) - 1;
    let b = Number(txt[1]) - 1;

    if (a === b) return m.reply("Pilih 2 kotak *berbeda* ya!");

    if (game.open.includes(a) || game.open.includes(b)) {
      return m.reply("Kotak itu sudah terbuka!");
    }

    let reveal = [...game.display];
    reveal[a] = game.board[a];
    reveal[b] = game.board[b];

    let teks =
      `🔎 Membuka kotak *${txt[0]}* & *${txt[1]}*\n\n` +
      reveal.slice(0, 4).join(" ") +
      "\n" +
      reveal.slice(4, 8).join(" ") +
      "\n" +
      reveal.slice(8, 12).join(" ");

    await m.reply(teks);

    if (game.board[a] === game.board[b]) {
      game.open.push(a, b);
      game.display[a] = game.board[a];
      game.display[b] = game.board[b];

      if (game.open.length === 12) {
        clearTimeout(game.timeout);
        delete conn.cocokpasang[m.chat];

        let user = global.db.data.users[m.sender];
        let expRandom = Math.floor(Math.random() * 20) + 20;

        user.exp += expRandom;
        user.balance += game.reward;

        return m.reply(
          `🎉 *SEMPURNA! Semua pasangan cocok!* 🎉\n\n` +
            `+${expRandom} Exp\n` +
            `+${game.reward} Balance`
        );
      }

      return m.reply("✨ *Cocok!* Lanjut cari pasangan lainnya!");
    }

    // kalau salah → tutup lagi
    return m.reply("❌ Tidak cocok, coba lagi!");
  }
};
