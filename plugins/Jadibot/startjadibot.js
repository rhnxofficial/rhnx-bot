import { startJadiBot } from "../../lib/jadibot.js";

export default {
  name: "startjadibot",
  access: { premium: true },
  description: "Memulai kembali bot yang dihentikan.",
  run: async (m, { conn, args }) => {
    if (!args[0]) {
      return m.reply("Masukkan ID bot yang ingin dijalankan. Contoh: startjadibot 6281316643491");
    }
    const jid = args[0].replace(/[^0-9]/g, "");
    try {
      const sock = await startJadiBot(jid);
      await m.reply(`✅ Bot dengan ID ${jid} berhasil dijalankan kembali.`);
    } catch (err) {
      console.error(err);
      await m.reply(`❌ Gagal menjalankan bot ${jid}: ${err.message}`);
    }
  }
};
