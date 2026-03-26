import { stopJadiBot } from "../../lib/jadibot.js";

export default {
  name: "stopjadibot",
  access: { premium: true },
  description: "Menghentikan bot berdasarkan ID.",
  run: async (m, { conn, args }) => {
    if (!args[0]) {
      return m.reply("Masukkan ID bot yang ingin dihentikan. Contoh: stopjadibot 6281316643491");
    }
    const jid = args[0].replace(/[^0-9]/g, "");
    const result = stopJadiBot(jid);
    if (result) {
      await m.reply(`✅ Bot dengan ID ${jid} berhasil dihentikan.`);
    } else {
      await m.reply(`❌ Bot dengan ID ${jid} tidak ditemukan atau sudah dihentikan.`);
    }
  }
};
