import { getAllJadiBot } from "../../lib/jadibot.js";

export default {
  name: "listjadibot",
  access: { premium: true },
  description: "Menampilkan semua bot yang aktif beserta status koneksinya.",
  run: async (m, { conn }) => {
    const bots = getAllJadiBot();

    if (!bots || bots.length === 0) {
      return conn.sendMessage(
        m.chat,
        { text: "❌ Tidak ada bot yang aktif saat ini." },
        { quoted: m }
      );
    }

    let botList = "🤖 *Daftar JadiBot Aktif*\n\n";

    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];
      const botConn = bot.conn;
      const jid = bot.jid;
      const number = jid.replace(/[^0-9]/g, "");

      botList += `*${i + 1}.* ${number}\n`;
      botList += `   ┗ 🧩 Status: ${bot.status}\n`;
    }

    await m.reply(botList);
  }
};
