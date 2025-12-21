export default {
  name: "afk",
  description: "Aktifkan mode AFK",
  access: {
    group: true,
    admin: false,
    botadmin: false
  },
  run: async (m, { conn, q }) => {
    const text = q;
    const user = global.db.data.users[m.sender];

    const reason = text?.trim() || "Tidak ada alasan";
    user.afk = Date.now();
    user.afkReason = reason;

    await conn.sendMessage(
      m.chat,
      {
        text: styleText(`💤 *@${m.sender.split("@")[0]}* sekarang AFK\n📖 Alasan: ${reason}`),
        mentions: [m.sender]
      },
      { quoted: fkontak }
    );
  }
};
