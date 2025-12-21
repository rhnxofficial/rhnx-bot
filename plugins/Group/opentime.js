export default {
  name: "opentime",
  description: "Membuka grup otomatis setelah waktu tertentu",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { conn, args, prefix }) => {
    const math = (teks) => Math.floor(teks);
    const chat = db.data.chats[m.chat];

    if (!args[0] || !args[1]) return m.reply(`Contoh : ${prefix}opentime 5 menit`);

    let timer;
    if (args[1] == "detik") timer = args[0] * 1000;
    else if (args[1] == "menit") timer = args[0] * 60000;
    else if (args[1] == "jam") timer = args[0] * 3600000;
    else if (args[1] == "hari") timer = args[0] * 86400000;
    else return m.reply(`Contoh : ${prefix}opentime 5 menit`);

    let info = await conn.sendMessage(
      m.chat,
      { text: `Open time ${args[0]} ${args[1]} dimulai dari sekarang` },
      { quoted: m }
    );

    setTimeout(() => {
      try {
        conn.sendMessage(m.chat, { delete: info.key });
      } catch {}
    }, 5000);

    setTimeout(async () => {
      const buka = `*Tepat waktu*, grup telah dibuka kembali oleh admin.\nSekarang semua anggota dapat mengirim pesan.`;
      await conn.groupSettingUpdate(m.chat, "not_announcement");
      m.reply(buka);
    }, timer);
  }
};
