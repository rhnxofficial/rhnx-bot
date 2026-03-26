export default {
  name: "daftar",
  alias: ["register", "reg"],
  description: "Fitur daftar dengan captcha",
  access: { private: false },

  run: async (m, { conn, args }) => {
    try {
      let user = global.db.data.users[m.sender] || {};

      if (user.registered) {
        return m.reply("❗ Kamu sudah terdaftar!");
      }

      if (!conn.captcha) conn.captcha = {};

      if (conn.captcha[m.sender]) {
        return m.reply(
          "❗ Kamu masih dalam proses verifikasi captcha!\nSilakan jawab captcha sebelumnya."
        );
      }
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let text = "";

      if (args[0]) {
        text = args[0]
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 8);
      } else {
        for (let i = 0; i < 5; i++) {
          text += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      let url = `${api.rhnx}/api/tools/captcha?width=200&height=80&length=5&hard=false&text=${text}&apikey=${key.rhnx}`;

      let res = await fetch(url);
if (!res.ok) return m.reply("Gagal mengambil captcha.");

let arrayBuffer = await res.arrayBuffer();
let buffer = Buffer.from(arrayBuffer);

      conn.captcha[m.sender] = {
        answer: text,
        timestamp: Date.now(),
        type: "register"
      };

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: styleText(
            `🔐 *Verifikasi CAPTCHA*\n\nHalo @${m.sender.split("@")[0]}! 🎉\nSilakan ketik teks yang ada di gambar dengan benar.\n\n> ⚠️ Jawaban akan expired dalam 30 detik!`
          ),
          mentions: [m.sender]
        },
        { quoted: fkontak }
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;

      setTimeout(() => {
        delete conn.botReplying[m.chat];
      }, 2000);

    } catch (e) {
      console.log(e);
      m.reply("Terjadi kesalahan pada sistem.");
    }
  }
};