export default {
  name: "blackjackHook",
  type: "hook",

  async before(m, { conn }) {
    if (!conn.blackjack) return;
    if (!m.isGroup) return;
    if (!(m.chat in conn.blackjack)) return;
    if (!conn.botReplying) conn.botReplying = {};
    let game = conn.blackjack[m.chat];

    let txt = (m.text || "").toLowerCase().trim();
    if (!["hit", "stand"].includes(txt)) return;

    let { player, dealer, bet, calcTotal, renderCards } = game;
    let user = global.db.data.users[m.sender];

    if (txt === "hit") {
      const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const draw = () => cards[Math.floor(Math.random() * cards.length)];

      player.push(draw());
      let pTotal = calcTotal(player);

      if (pTotal > 21) {
        delete conn.blackjack[m.chat];
        return m.reply(
          `💥 *BUST! Kamu Kalah!*\n` +
            `Total Kamu: *${pTotal}*\n\n` +
            `Kartu Kamu:\n${renderCards(player)}\n\n` +
            `💸 -${bet} Balance`
        );
      }

      return m.reply(
        `🎴 *Kamu mengambil kartu*\n` +
          `${renderCards(player)}\nTotal: *${pTotal}*\n\n` +
          `Ketik *hit* atau *stand*`
      );
    }

    if (txt === "stand") {
      let dTotal = calcTotal(dealer);
      let pTotal = calcTotal(player);

      while (dTotal < 17) {
        const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        dealer.push(cards[Math.floor(Math.random() * cards.length)]);
        dTotal = calcTotal(dealer);
      }

      let msg = `🎴 *Hasil Permainan*\n\n`;

      msg += `Kartu Kamu:\n${renderCards(player)}\nTotal: *${pTotal}*\n\n`;
      msg += `Kartu Dealer:\n${renderCards(dealer)}\nTotal: *${dTotal}*\n\n`;

      if (dTotal > 21 || pTotal > dTotal) {
        user.balance += bet * 2;
        msg += `🏆 *Kamu Menang!*\n💰 +${bet * 2} Balance`;
      } else if (pTotal === dTotal) {
        user.balance += bet;
        msg += `⚖️ *Seri!* Taruhan dikembalikan.\n💰 +${bet} Balance`;
      } else {
        msg += `💥 *Kamu Kalah!*\n💸 -${bet} Balance`;
      }

      delete conn.blackjack[m.chat];
      return m.reply(msg);
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);
    }
  }
};
