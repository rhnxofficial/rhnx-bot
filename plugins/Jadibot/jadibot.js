import { startJadiBot, getPairingCode } from "../../lib/jadibot.js";

export default {
  name: "jadibot",
  access: { premium: true },
  description: "Menjalankan sub-bot WhatsApp menggunakan pairing code",
  category: "system",

  run: async (m, { conn, args }) => {
    if (!args[0]) {
      return m.reply("Masukkan nomor sub-bot. Contoh: jadibot 6281316643491");
    }

    let jid = args[0].replace(/\D/g, "");

    if (!jid.startsWith("62")) {
      return m.reply("Nomor harus diawali dengan 62, bukan 08 atau lainnya.");
    }

    try {
      await startJadiBot(jid, conn);

      const pairing = await getPairingCode(jid, jid);

      await m.reply(`✅ Bot ${jid} berhasil dijalankan.\n\n🔑 Pairing code: ${pairing.code}`);
    } catch (err) {
      console.error(err);
      await conn.sendMessage(
        m.chat,
        { text: `❌ Gagal menjalankan bot ${jid}:\n${err.message}` },
        { quoted: m }
      );
    }
  }
};
