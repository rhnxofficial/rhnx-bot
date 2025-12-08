export default {
  name: "registerHook",
  type: "hook",

  async before(m, { conn }) {
    try {
      if (!conn.captcha) conn.captcha = {};
      if (!conn.botReplying) conn.botReplying = {};
      let session = conn.captcha[m.sender];
      if (!session) return;

      const EXPIRE_TIME = 30 * 1000;

      if (Date.now() - session.timestamp > EXPIRE_TIME) {
        delete conn.captcha[m.sender];
        return m.reply("⏳ *Waktu captcha habis!* Silakan ulangi perintah.");
      }

      if (!m.text) return;

      let input = m.text.trim().toLowerCase();
      let answer = session.answer.trim().toLowerCase();

      if (input === answer) {
        const user = db.data.users[m.sender] || {};
        if (session.type === "register") {
          user.registered = true;
          conn.botReplying[m.chat] = true;
          setTimeout(() => delete conn.botReplying[m.chat], 2000);

          delete conn.captcha[m.sender];
              m.react('✅')
           let teks = (
  `Woohoo! Registrasi sukses! 🎊\n\n` +
  `Hai *${m.pushName}*, selamat datang di dunia *RHNX*!\n` +
  `Sekarang kamu bisa main-main dengan semua fitur bot.\n` +
  `klik *button* di bawah untuk mulai menjelajah keseruan yang menunggu! 🚀`
);
       return conn.sendInteractive(
  m.chat,
  {
    text: styleText(teks),
    footer: bot.name,

    interactiveButtons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Menu",
          id: ".menu"
        })
      }
    ]
  },
  {
    quoted: fkontak,
    mentions: [m.sender],
    useAI: true
  }
)
        }
        if (session.type === "unreg") {
          user.registered = false;
          user.name = "";
          user.serial = "";

          conn.botReplying[m.chat] = true;
          setTimeout(() => delete conn.botReplying[m.chat], 2000);

          delete conn.captcha[m.sender];

          return m.reply("🗑️ *Akun berhasil dihapus!*\nKamu bisa daftar lagi kapan saja.");
        }

        conn.botReplying[m.chat] = true;
        setTimeout(() => delete conn.botReplying[m.chat], 2000);

        delete conn.captcha[m.sender];
        return;
      }

      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);

      delete conn.captcha[m.sender];
      return m.reply("❌ *Captcha salah!* Kirim ulang perintah.");
    } catch (err) {
      console.error(err);
    }
  }
};
