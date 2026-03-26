function drawCard(card, suit) {
  return [`┌───────┐`, `│ ${card.padEnd(2)} ${suit} │`, `└───────┘`];
}

function renderCards(cards) {
  const suits = ["♠️", "♥️", "♦️", "♣️"];
  let rendered = cards.map((c) => drawCard(c, suits[Math.floor(Math.random() * suits.length)]));

  let l1 = rendered.map((r) => r[0]).join(" ");
  let l2 = rendered.map((r) => r[1]).join(" ");
  let l3 = rendered.map((r) => r[2]).join(" ");

  return `${l1}\n${l2}\n${l3}`;
}

function calcTotal(arr) {
  let total = 0,
    ace = 0;
  for (let c of arr) {
    if (c === "A") {
      total += 11;
      ace++;
    } else if (["J", "Q", "K"].includes(c)) total += 10;
    else total += Number(c);
  }
  while (total > 21 && ace > 0) {
    total -= 10;
    ace--;
  }
  return total;
}

export default {
  name: "blackjack",
  description: "Main game blackjack",
  access: {
    group: true,
    game: true,
    glimit: true
  },
  async run(m, { conn }) {
    if (!conn.blackjack) conn.blackjack = {};

    if (m.chat in conn.blackjack) {
      return m.reply("❗ Masih ada permainan Blackjack yang belum selesai!");
    }

    let user = global.db.data.users[m.sender];
    let bet = 1000;

    if (user.balance < bet) return m.reply("💸 Balance kamu tidak cukup untuk bermain!");

    user.balance -= bet;

    const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const draw = () => cards[Math.floor(Math.random() * cards.length)];

    // Kartu awal
    let player = [draw(), draw()];
    let dealer = [draw(), draw()];

    let pTotal = calcTotal(player);
    let dTotal = calcTotal(dealer);

    let text =
      `🃏 *BLACKJACK DIMULAI!*\n` +
      `Taruhan: -${bet} Balance\n\n` +
      `🎴 *Kartu Kamu*\n${renderCards(player)}\nTotal: *${pTotal}*\n\n` +
      `🎴 *Kartu Dealer*\n${renderCards([dealer[0], "🂠"])}\nKartu kedua disembunyikan.\n\n` +
      `Ketik: *hit* untuk tambah kartu\n` +
      `Ketik: *stand* untuk berhenti`;

    m.reply(text);

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);

    conn.blackjack[m.chat] = {
      player,
      dealer,
      bet,
      calcTotal,
      renderCards,
      step: "play"
    };
  }
};
