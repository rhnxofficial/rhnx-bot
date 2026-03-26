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

      // 🔥 Generate random text
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let text = "";
      for (let i = 0; i < 5; i++) {
        text += chars[Math.floor(Math.random() * chars.length)];
      }

      // 🔥 URL sesuai endpoint kamu
      let url = `https://api.rhnx.xyz/api/tools/captcha?width=200&height=80&length=5&hard=false&text=${text}&apikey=${key.rhnx}`;

      let res = await fetch(url);
if (!res.ok) return m.reply("Gagal mengambil captcha.");

let arrayBuffer = await res.arrayBuffer();
let buffer = Buffer.from(arrayBuffer);

      // 🔥 Simpan jawaban
      conn.captcha[m.sender] = {
        answer: text,
        timestamp: Date.now(),
        type: "unreg"
      };

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: styleText(
            `⚠️ *Konfirmasi Hapus Akun*\n\nSilakan jawab captcha pada gambar.\nJika jawabannya benar, akun kamu akan dihapus permanen.`
          )
        },
        { quoted: m }
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;

      setTimeout(() => {
        delete conn.botReplying[m.chat];
      }, 2000);

    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan.");
    }
  }
};
