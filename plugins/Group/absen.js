export default {
  name: "absen",
  description: "Fitur absen harian di grup.",
  access: { group: true, admin: false, botadmin: false },
  run: async (m, { conn, command, args }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    conn.absen = conn.absen ? conn.absen : {};
    const id = m.chat;

    const sub = args && args[0] ? args[0].toLowerCase() : null;
    if (!sub || !["start", "in", "list", "end"].includes(sub))
      return m.reply(`Gunakan:
• ${command} start — mulai sesi absen baru
• ${command} in — ikut absen
• ${command} list — lihat daftar absen
• ${command} end — akhiri sesi absen`);

    if (sub === "start") {
      if (conn.absen[id])
        return m.reply(
          "⚠️ Sesi absen sudah dimulai sebelumnya.\nGunakan *absen end* untuk mengakhirinya."
        );
      conn.absen[id] = {
        started: true,
        participants: [],
        time: new Date()
      };
      return conn.sendMessage(m.chat, {
        text: `📋 *Sesi absen dimulai!*\nKetik *${command} in* untuk ikut absen.`
      });
    }

    if (sub === "in") {
      if (!conn.absen[id])
        return m.reply("Belum ada sesi absen yang dimulai.\nGunakan *absen start* dulu.");
      const sender = m.sender;
      if (conn.absen[id].participants.includes(sender))
        return m.reply("⚠️ Kamu sudah absen sebelumnya.");

      conn.absen[id].participants.push(sender);
      await conn.sendMessage(m.chat, {
        text: `✅ @${sender.split("@")[0]} telah absen.`,
        mentions: [sender]
      });
    }

    if (sub === "list") {
      if (!conn.absen[id]) return m.reply("Belum ada sesi absen yang dimulai.");
      const list = conn.absen[id].participants;
      const teks =
        list.length > 0
          ? list.map((x, i) => `${i + 1}. @${x.split("@")[0]}`).join("\n")
          : "_Belum ada yang absen._";

      return conn.sendMessage(m.chat, {
        text: `📋 *Daftar Absen:*\n${teks}`,
        mentions: conn.absen[id].participants
      });
    }

    if (sub === "end") {
      if (!conn.absen[id]) return m.reply("Tidak ada sesi absen yang aktif.");
      const total = conn.absen[id].participants.length;
      const teks =
        total > 0
          ? conn.absen[id].participants.map((x, i) => `${i + 1}. @${x.split("@")[0]}`).join("\n")
          : "_Tidak ada yang absen._";
      delete conn.absen[id];

      return conn.sendMessage(m.chat, {
        text: `📝 *Sesi absen berakhir!*\n\nTotal yang absen: *${total}*\n\n${teks}`,
        mentions: conn.absen[id]?.participants || []
      });
    }
  }
};
