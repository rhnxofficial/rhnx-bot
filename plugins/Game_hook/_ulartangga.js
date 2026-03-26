export default {
  name: "ulartanggaHook",
  type: "hook",

  async before(m, { conn }) {
    if (!m.isGroup) return;

    conn.ulartangga = conn.ulartangga || {};
    let game = conn.ulartangga[m.chat];
    if (!game) return;

    let txt = (m.text || "").toLowerCase().trim();
    if (!txt) return;

    const valid = ["roll", ".roll", "lempar", "dadu"];
    if (!valid.includes(txt)) return;

    if (m.sender !== game.turn) return m.reply("⏳ *Belum giliran kamu!*");

    let roll = Math.floor(Math.random() * 6) + 1;
    let isP1 = m.sender === game.p1;
    let pos = isP1 ? game.pos1 : game.pos2;

    let oldPos = pos;
    pos += roll;
    if (pos > 100) pos = 100;

    let extraInfo = "";

    if (game.ladders[pos]) {
      let newPos = game.ladders[pos];
      extraInfo = `🪜 *Naik tangga!* ${pos} → ${newPos}`;
      pos = newPos;
    } else if (game.snakes[pos]) {
      let newPos = game.snakes[pos];
      extraInfo = `🐍 *Kena ular!* ${pos} → ${newPos}`;
      pos = newPos;
    }

    if (isP1) game.pos1 = pos;
    else game.pos2 = pos;

    if (pos >= 100) {
      let winner = m.sender;
      let loser = isP1 ? game.p2 : game.p1;

      let reward = 1500;
      let penalty = 500;

      global.db.data.users[winner].balance += reward;
      global.db.data.users[loser].balance -= penalty;

      delete conn.ulartangga[m.chat];

      return conn.sendMessage(m.chat, {
        text:
          `🏁 *GAME SELESAI!*\n\n` +
          `🏆 Pemenang: @${winner.split("@")[0]} (+${reward})\n` +
          `😭 Kalah: @${loser.split("@")[0]} (-${penalty})`,
        mentions: [winner, loser]
      });
    }

    game.turn = isP1 ? game.p2 : game.p1;

    return conn.sendMessage(m.chat, {
      text:
        `🎲 *Roll:* ${roll}\n` +
        `📍 Dari ${oldPos} → ${pos}\n` +
        (extraInfo ? `${extraInfo}\n\n` : "\n") +
        `Giliran selanjutnya: @${game.turn.split("@")[0]}\n\n` +
        drawBoard(game),
      mentions: [game.turn]
    });
  }
};

function drawBoard(g) {
  let out = "\n⬛⬛⬛ *BOARD* ⬛⬛⬛\n\n";

  for (let i = 100; i > 0; i -= 10) {
    let row = [];

    for (let x = i; x > i - 10; x--) {
      let cell = "⬛";

      if (g.pos1 === x) cell = "🟦";
      else if (g.pos2 === x) cell = "🟥";
      else if (g.snakes[x]) cell = "🐍";
      else if (g.ladders[x]) cell = "🪜";

      row.push(cell);
    }

    out += row.join("") + "\n";
  }

  return out;
}
