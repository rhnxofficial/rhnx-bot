export default {
  name: "matematika",
  description: "Game matematika cepat",
  access: { group: true, game: true, glimit: true },

  async run(m, { conn }) {
    if (!conn.matematika) conn.matematika = {};

    if (m.chat in conn.matematika) {
      return m.reply("❗ Masih ada game matematika yang belum selesai!");
    }

    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 5;
    const ops = ["+", "-", "×", "÷"];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let hasil;
    switch (op) {
      case "+":
        hasil = a + b;
        break;
      case "-":
        hasil = a - b;
        break;
      case "×":
        hasil = a * b;
        break;
      case "÷":
        hasil = parseFloat((a / b).toFixed(2));
        break;
    }

    let reward = 800;
    let timeout = 15000;

    let teks =
      `🧮 *SIAPA CEPAT DIA DAPAT!*\n\n` +
      `Soal:\n` +
      `➡️  *${a} ${op} ${b} = ?*\n\n` +
      `⏱ Waktu: ${timeout / 1000} detik\n` +
      `🎁 Reward: +${reward} Balance`;

    let sent = await m.reply(teks);

    conn.matematika[m.chat] = {
      msg: sent,
      answer: hasil,
      reward,
      timeout: setTimeout(() => {
        m.reply(`⏱ *Waktu habis!*\nJawaban yang benar adalah *${hasil}*`);
        delete conn.matematika[m.chat];
      }, timeout)
    };

    conn.botReplying = conn.botReplying || {};
    conn.botReplying[m.chat] = true;
    setTimeout(() => delete conn.botReplying[m.chat], 2000);
  }
};
