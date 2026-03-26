import moment from "moment-timezone";

export default {
  name: "infogc",
  alias: ["groupinfo", "infogrup"],
  description: "Menampilkan informasi lengkap grup saat ini",
  tags: ["group"],
  access: { group: true },
  run: async (m, { conn, setReply }) => {
    if (!m.isGroup) return setReply("Fitur ini hanya bisa digunakan di dalam grup.");

    let metadata = await conn.groupMetadata(m.chat);
    let creation = moment(metadata.creation * 1000).format("DD/MM/YYYY HH:mm:ss");
    let admins = metadata.participants.filter((v) => v.admin).map((v) => v.id);
    let memberCount = metadata.size || metadata.participants.length;
    let owner = metadata.owner || metadata.subjectOwner || "Tidak diketahui";
    if (owner?.endsWith("@lid")) {
      owner = metadata.ownerPn || metadata.subjectOwnerPn || "Tidak diketahui";
    }

    if (owner !== "Tidak diketahui" && !owner.endsWith("@s.whatsapp.net")) {
      owner = owner.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    }

    let info = `
乂  *G R O U P  I N F O*

◦ Nama Group: ${metadata.subject}
◦ ID Group: ${metadata.id}
◦ Dibuat Pada: ${creation}
◦ Owner: @${owner.split("@")[0]}
◦ Total Anggota: ${memberCount}
◦ Total Admin: ${admins.length}
◦ Mode Restrict: ${metadata.restrict ? "Aktif" : "Nonaktif"}
◦ Mode Announce: ${metadata.announce ? "Hanya Admin" : "Semua Member"}

${metadata.desc ? `◦ Deskripsi:\n${metadata.desc}` : "◦ Tidak ada deskripsi."}
    `.trim();

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        mentions: [owner],
        contextInfo: { mentionedJid: [owner] }
      },
      { quoted: m }
    );
  }
};
