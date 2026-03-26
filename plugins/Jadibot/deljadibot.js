import { deleteSession } from "../../lib/jadibot.js";

export default {
  name: "deljadibot",
  access: { premium: true },
  description: "Menghapus session bot dan seluruh data terkait.",
  run: async (m, { conn, args }) => {
    if (!args[0]) {
      return m.reply("Masukkan ID bot yang ingin dihapus. Contoh: deljadibot 6281316643491");
    }
    const jid = args[0].replace(/[^0-9]/g, "");
    const result = deleteSession(jid);

    if (result) {
      await m.reply(`✅ Bot dengan ID ${jid} dan session-nya telah dihapus.`);
    } else {
      await m.reply(`Bot dengan ID ${jid} tidak ditemukan atau sudah dihapus.`);
    }
  }
};
