export default {
  name: "out",
  alias: ["leave", "keluar"],
  description: "Menampilkan daftar grup dan keluar dari grup tertentu",
  tags: ["owner"],
  access: { owner: true },
  run: async (m, { conn, args, setReply }) => {
    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups).filter((u) => !u.isCommunity && !u.isCommunityAnnounce);

    if (groups.length === 0) return setReply("Bot tidak tergabung di grup mana pun.");

    if (!args[0]) {
      let teks = "乂  *L I S T  G R O U P*\n\n";
      groups.forEach((g, i) => {
        teks += `◦ ${i + 1}. ${g.subject}\n`;
      });
      teks += `\nKetik *.out <nomor>* untuk keluar dari grup tertentu.\nContoh: *.out 1*`;

      return conn.sendMessage(m.chat, { text: teks }, { quoted: m });
    }

    let index = parseInt(args[0]);
    if (isNaN(index) || index < 1 || index > groups.length)
      return setReply("Nomor grup tidak valid.");

    let targetGroup = groups[index - 1];
    await conn.sendMessage(
      m.chat,
      {
        text: `Bot akan keluar dari grup:\n\n◦ Nama: ${targetGroup.subject}\n◦ ID: ${targetGroup.id}`
      },
      { quoted: m }
    );

    await conn.sendMessage(targetGroup.id, {
      text: `Bot keluar dari grup ini atas perintah owner.`
    });

    await conn.groupLeave(targetGroup.id);
    setReply(`✅ Berhasil keluar dari grup *${targetGroup.subject}*.`);
  }
};
