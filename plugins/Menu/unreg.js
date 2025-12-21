export default {
  name: "unreg",
  alias: ["unregister", "hapusakun"],
  description: "Hapus akun dengan verifikasi captcha",
  access: { private: false },

  run: async (m, { conn }) => {
    try {
      let user = global.db.data.users[m.sender] || {};

      if (!user.registered) {
        return m.reply("❗ Kamu belum terdaftar!");
      }

      if (!conn.captcha) conn.captcha = {};

      if (conn.captcha[m.sender]) {
        return m.reply(
          "❗ Kamu masih dalam proses verifikasi captcha!\nSilakan jawab captcha sebelumnya."
        );
      }

      let url = `${api.rhnx}/api/captcha?text=UNREG&width=200&height=60&key=${key.rhnx}`;

      let res = await fetch(url);
      let json = await res.json();
      if (!json.status) return m.reply("Gagal mengambil captcha.");

      let base64 = json.image.replace("data:image/png;base64,", "");
      let buffer = Buffer.from(base64, "base64");

      conn.captcha[m.sender] = {
        answer: json.text,
        timestamp: Date.now(),
        type: "unreg"
      };

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: styleText(
            `⚠️ *Konfirmasi Hapus Akun*\n\nSilakan jawab captcha.\nJika jawabannya benar, akun kamu akan dihapus permanen.`
          )
        },
        { quoted: m }
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);
    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan.");
    }
  }
};
