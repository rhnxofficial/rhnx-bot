export default {
  name: "kick",
  description: "Mengeluarkan anggota dari grup dengan tag, nomor, atau reply",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { conn, args }) => {
    let target = [];

    if (m.mentionByTag && m.mentionByTag().length > 0) {
      target = m.mentionByTag();
    } else if (m.quoted) {
      target = [m.quoted.sender];
    } else if (args[0]) {
      const nomor = args[0].replace(/[^0-9]/g, "");
      if (!nomor) return m.reply("⚠️ Nomor tidak valid.");
      target = [nomor + "@s.whatsapp.net"];
    } else {
      return m.reply(
        "⚠️ Tag, reply, atau tulis nomor yang ingin dikeluarkan.\n\nContoh:\n• !kick @user\n• !kick 6281234567890\n• Reply pesan lalu ketik !kick"
      );
    }
    if (target.length === 0) return m.reply("❌ Tidak ada target yang valid.");
    if (target.includes(conn.user.id)) return m.reply("😅 Gak bisa mengeluarkan bot sendiri!");
    if (target.includes(m.sender)) return m.reply("😅 Gak bisa mengeluarkan diri sendiri!");

    try {
      await conn.groupParticipantsUpdate(m.chat, target, "remove");

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ *Berhasil mengeluarkan:*\n${target
            .map((jid) => "• @" + jid.split("@")[0])
            .join("\n")}`,
          mentions: target
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      await m.reply("❌ Gagal mengeluarkan anggota, pastikan bot admin.");
    }
  }
};
