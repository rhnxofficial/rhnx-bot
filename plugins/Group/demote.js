export default {
  name: "demote",
  description: "Turunkan user dari admin grup",
  access: { admin: true, botadmin: true },
  async run(m, { conn, q }) {
    const text = q;
    if (!m.isGroup) return m.reply("❌ Fitur ini hanya untuk grup!");

    const members = m.groupMembers || [];
    let target;
    if (m.mentionByTag && m.mentionByTag().length > 0) {
      target = m.mentionByTag()[0];
    } else if (m.quoted) {
      target = m.quoted.sender;
    } else if (text) {
      const nomor = text.replace(/[^0-9]/g, "");
      if (nomor) target = nomor + "@s.whatsapp.net";
    }

    if (!target) return m.reply("❗ Tag, reply, atau ketik nomor user yang ingin diturunkan!");

    if (Array.isArray(target)) target = target[0];
    if (typeof target !== "string" || !target.endsWith("@s.whatsapp.net"))
      return m.reply("⚠️ Format target tidak valid!");

    const member = members.find((u) => u.id === target);
    if (!member) return m.reply("⚠️ User tidak ditemukan di grup ini!");
    if (member.admin === null) return m.reply("⚠️ User ini bukan admin!");

    try {
      await conn.groupParticipantsUpdate(m.chat, [target], "demote");
      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Berhasil menurunkan @${target.split("@")[0]} dari admin grup.`,
          mentions: [target]
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      m.reply("⚠️ Gagal menurunkan user!");
    }
  }
};
