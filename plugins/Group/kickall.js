export default {
  name: "kickall",
  description: "Mengeluarkan semua anggota dari grup kecuali admin dan bot",
  access: { group: true, admin: true, botadmin: true },
  run: async (m, { conn }) => {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin).map((p) => p.id);
    const botJid = conn.decodeJid(conn.user.id);

    const targets = groupMetadata.participants
      .filter((p) => !groupAdmins.includes(p.id) && p.id !== botJid)
      .map((p) => p.id);

    if (targets.length === 0) return m.reply("⚠️ Tidak ada anggota yang bisa dikeluarkan.");

    await m.reply(`⚠️ Mengeluarkan *${targets.length}* anggota dari grup...`);

    for (const user of targets) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.error(`Gagal kick ${user}:`, e.message);
      }
    }

    await conn.sendMessage(
      m.chat,
      {
        text: `✅ *Berhasil mengeluarkan ${targets.length} anggota!*\n${targets
          .map((jid) => "• @" + jid.split("@")[0])
          .join("\n")}`,
        mentions: targets
      },
      { quoted: m }
    );
  }
};
