export default {
  name: "tictactoe",
  description: "Main TicTacToe melawan teman",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    conn.tictactoe = conn.tictactoe || {};
    let p1 = m.sender;
    let p2 = m.mentionByTag()[0] || m.quoted?.sender;

    if (!p2)
      return conn.sendMessage(m.chat, {
        text: `Tag lawan atau reply orangnya!\n\nContoh:\n.tictactoe @user`,
        mentions: [p1]
      });

    if (p1 === p2)
      return conn.sendMessage(m.chat, {
        text: `Gak bisa lawan diri sendiri njir 🤣`,
        mentions: [p1]
      });

    if (conn.tictactoe[m.chat])
      return conn.sendMessage(m.chat, {
        text: `Masih ada game belum selesai.`,
        mentions: [p1]
      });

    let board = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    conn.tictactoe[m.chat] = {
      p1,
      p2,
      board,
      turn: p1,
      winner: null
    };

    let teks = `🎮 *TIC TAC TOE DIMULAI!*\n
✖️ @${p1.split("@")[0]} (Hitam)\n⭕ @${p2.split("@")[0]} (Merah)
\nGiliran: @${p1.split("@")[0]}\n
${renderBoard(board)}`;

    return conn.sendMessage(m.chat, {
      text: teks,
      mentions: [p1, p2]
    });
  }
};

function renderBoard(b) {
  return `${b[0]} ${b[1]} ${b[2]}\n${b[3]} ${b[4]} ${b[5]}\n${b[6]} ${b[7]} ${b[8]}`;
}
