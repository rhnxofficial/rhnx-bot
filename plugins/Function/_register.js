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
          return m.reply(`✅ *Registrasi berhasil!*

Selamat ${m.pushName} Sekarang Anda Dapat Menggunakan Bot Silahkan Ketik *.menu* Untuk Melihat Daftar Fitur Yang Ada Di *RHNX*`);
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
