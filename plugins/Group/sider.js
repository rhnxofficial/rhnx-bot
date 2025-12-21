import moment from "moment-timezone";

export default {
  name: "sider",
  description: "Menampilkan daftar member yang tidak aktif selama lebih dari 7 hari",
  access: { group: true, admin: true },
  run: async (m, { conn, q }) => {
    const text = q;

    const groupMetadata = await conn.groupMetadata(m.chat);
    const lama = 86400000 * 7;
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const milliseconds = new Date(now).getTime();

    const member = groupMetadata.participants.map((v) => v.id);
    const pesan = text || "Harap aktif di grup karena akan ada pembersihan member setiap saat.";

    let total = 0;
    let sider = [];

    for (const id of member) {
      const users = m.isGroup ? groupMetadata.participants.find((u) => u.id === id) : {};

      const dataUser = global.db.data.users[id];

      const notActive = !dataUser || milliseconds - (dataUser.lastseen || 0) > lama;

      if (notActive && !users?.admin && !users?.isAdmin && !users?.isSuperAdmin) {
        total++;
        sider.push(id);
      }
    }

    if (total === 0) return m.reply(`✅ *Tidak ada member yang tergolong sider.*`);

    let teks = `乂  *S I D E R  L I S T*\n\n`;
    teks += `📅 *Tidak aktif lebih dari 7 hari*\n`;
    teks += `📢 *Pesan:* ${pesan}\n\n`;
    teks += `📋 *${total}/${member.length}* anggota tidak aktif:\n\n`;

    for (const id of sider) {
      const userData = global.db.data.users[id];
      const lastseen = userData?.lastseen
        ? moment(userData.lastseen).tz("Asia/Jakarta").fromNow()
        : "Belum pernah aktif";

      teks += `◦ @${id.split("@")[0]} (${lastseen})\n`;
    }

    conn.sendMessage(m.chat, { text: teks, mentions: sider }, { quoted: m });
  }
};
