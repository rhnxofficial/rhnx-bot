export default {
  name: "tictactoeHook",
  type: "hook",

  async before(m, { conn }) {
    conn.tictactoe = conn.tictactoe || {};
    if (!conn.botReplying) conn.botReplying = {};
    if (!m.isGroup) return;

    let game = conn.tictactoe[m.chat];
    if (!game) return;

    let { p1, p2, board, turn } = game;

    let txt = m.text?.trim();
    if (!txt) return;
    if (!["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(txt)) return;

    let user = m.sender;
    if (![p1, p2].includes(user)) return;

    if (user !== turn) {
      return conn.sendMessage(m.chat, {
        text: `Sekarang giliran @${turn.split("@")[0]} tolol 🤣`,
        mentions: [turn]
      });
    }

    let pos = parseInt(txt) - 1;

    if (board[pos] === "✖️" || board[pos] === "⭕") {
      return conn.sendMessage(m.chat, {
        text: `Kotak itu sudah diisi goblok 😭`,
        mentions: [user]
      });
    }

    let symbol = user === p1 ? "✖️" : "⭕";
    let enemySymbol = user === p1 ? "⭕" : "✖️";

    board[pos] = symbol;

    let winSym = checkWin(board);

    if (winSym) {
      let winner = winSym === "✖️" ? p1 : p2;
      let loser = winSym === "✖️" ? p2 : p1;

      global.db.data.users[winner].balance += 1500;
      global.db.data.users[loser].balance -= 1000;

      await conn.sendMessage(m.chat, {
        text: `🎉 *Pemenang:* @${winner.split("@")[0]}

${renderBoard(board)}

+1500 balance (Menang)
-1000 balance (Kalah)`,
        mentions: [winner, loser]
      });

      delete conn.tictactoe[m.chat];
      return;
    }

    if (board.every((v) => v === "✖️" || v === "⭕")) {
      await conn.sendMessage(m.chat, {
        text: `⚔️ *SERII!* Tidak ada pemenang.\n\n${renderBoard(board)}`,
        mentions: [p1, p2]
      });
      delete conn.tictactoe[m.chat];
      return;
    }

    game.turn = user === p1 ? p2 : p1;

    conn.sendMessage(m.chat, {
      text: `Giliran: @${game.turn.split("@")[0]}\n\n${renderBoard(board)}`,
      mentions: [p1, p2]
    });
  }
};

function checkWin(b) {
  let p = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let [a, b1, c] of p) {
    if ((b[a] === "✖️" || b[a] === "⭕") && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
}

function renderBoard(b) {
  return `${b[0]} ${b[1]} ${b[2]}\n${b[3]} ${b[4]} ${b[5]}\n${b[6]} ${b[7]} ${b[8]}`;
}
