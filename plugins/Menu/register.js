export default {
  name: "daftar",
  alias: ["register", "reg"],
  description: "Fitur daftar dengan captcha",
  access: { private: false },

  run: async (m, { conn, args }) => {
    try {
      let textCustom = args[0] || "RHNX";

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

      let url = `${api.rhnx}/api/captcha?text=${encodeURIComponent(textCustom)}&width=200&height=50&key=${key.rhnx}`;

      let res = await fetch(url);
      let json = await res.json();

      if (!json.status) {
        return m.reply("Gagal mengambil captcha.");
      }

      let base64 = json.image.replace("data:image/png;base64,", "");
      let buffer = Buffer.from(base64, "base64");

      conn.captcha[m.sender] = {
        answer: json.text,
        timestamp: Date.now(),
        type: "register"
      };

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: styleText(
            `🔐 *Verifikasi CAPTCHA*\n\nHalo @${m.sender.split("@")[0]}! 🎉\nSilakan ketik teks yang ada di gambar dengan benar.\n\n> ⚠️ *Perhatian*: jawaban akan expired dalam 30 detik!`
          ),
          mentions: [m.sender]
        },
        { quoted: fkontak }
      );

      conn.botReplying = conn.botReplying || {};
      conn.botReplying[m.chat] = true;
      setTimeout(() => delete conn.botReplying[m.chat], 2000);
    } catch (e) {
      console.log(e);
      m.reply("Terjadi kesalahan pada sistem.");
    }
  }
};
