export default {
  name: "listcmd",
  description: "Menampilkan daftar stiker yang memiliki command",
  category: "sticker",
  access: { premium: true },
  run: async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    const data = user?.sticker || {};

    const entries = Object.entries(data);
    if (entries.length === 0) return m.reply("❌ Belum ada stiker yang memiliki command.");

    let teks = `*Daftar Stiker Command Kamu:*\n\n`;
    entries.forEach(([hash, info], i) => {
      teks += `${i + 1} *ID* : ${hash.slice(0, 8)}...\n`;
      teks += `◦ *Command:* ${info.text}\n`;
      teks += `◦ *Creator:* @${info.creator.split("@")[0]}\n`;
      teks += `◦ *Tanggal:* ${new Date(info.at).toLocaleString("id-ID")}\n`;
      teks += `◦ *Locked:* ${info.locked ? "✅" : "❌"}\n\n`;
    });

    await conn.sendMessage(
      m.chat,
      {
        text: styleText(teks),
        mentions: entries.map(([_, info]) => info.creator)
      },
      { quoted: m }
    );
  }
};
