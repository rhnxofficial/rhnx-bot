export default {
  name: "closetime",
  alias: ["ct", "closetime"],
  description: "Menutup grup otomatis setelah waktu tertentu",
  access: { group: true, admin: true, botadmin: true },
  run: async (m, { conn, args, prefix, q }) => {
    try {
      if (!args[0] || !args[1]) return m.reply(`Contoh penggunaan:\n${prefix}closetime 5 menit`);

      const math = (teks) => Math.floor(teks);
      const chat = db.data.chats[m.chat];

      let timer;
      if (args[1] === "detik") timer = args[0] * 1000;
      else if (args[1] === "menit") timer = args[0] * 60000;
      else if (args[1] === "jam") timer = args[0] * 3600000;
      else if (args[1] === "hari") timer = args[0] * 86400000;
      else return m.reply(`Format salah!\nContoh: ${prefix}closetime 10 menit`);

      const msg = await conn.sendMessage(
        m.chat,
        { text: `✅ Grup akan *ditutup* dalam waktu ${args[0]} ${args[1]} mulai sekarang.` },
        { quoted: m }
      );

      setTimeout(async () => {
        try {
          await conn.sendMessage(m.chat, { delete: msg.key });
        } catch {}
      }, 5000);

      setTimeout(async () => {
        try {
          await conn.groupSettingUpdate(m.chat, "announcement");
          m.reply(
            `📢 *Waktu habis!*\n\nGrup telah ditutup oleh admin.\nSekarang hanya admin yang dapat mengirim pesan.`
          );
        } catch (err) {
          console.error("Gagal menutup grup:", err);
          m.reply("❌ Gagal menutup grup, pastikan bot adalah admin.");
        }
      }, math(timer));
    } catch (err) {
      console.error("[ERROR closetime.js]", err);
      m.reply("Terjadi kesalahan saat menjalankan perintah closetime.");
    }
  }
};
