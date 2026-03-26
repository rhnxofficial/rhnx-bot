import moment from "moment-timezone";

export default {
  name: "listgc",
  description: "Menampilkan daftar grup bot atau detail grup tertentu",
  tags: ["info"],
  access: { owner: true },

  run: async (m, { conn, args }) => {
    try {
      const getGroups = await conn.groupFetchAllParticipating();
      const groups = Object.values(getGroups);
      const gc = groups.filter((g) => !g.isCommunity && !g.isCommunityAnnounce);

      if (gc.length === 0)
        return conn.sendTextWithMentions(m.chat, "Tidak ada grup yang diikuti bot.", m);
      if (!args[0]) {
        let teks = "乂  *L I S T  G R O U P*\n\n";
        gc.forEach((g, i) => {
          teks += `◦ *${i + 1}.* ${g.subject || "TanpaNama"}\n`;
        });
        teks += `\nKetik *.listgc <nomor>* untuk melihat detail grup.`;
        return conn.sendTextWithMentions(m.chat, teks.trim(), m);
      }

      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= gc.length)
        return conn.sendTextWithMentions(m.chat, "Nomor grup tidak valid.", m);

      const g = gc[index];
      const metadata = await conn.groupMetadata(g.id).catch(() => g);

      let ownerNum = "Tidak diketahui";
      if (metadata.ownerPn) {
        ownerNum = metadata.ownerPn.split("@")[0];
      } else if (metadata.owner && typeof metadata.owner === "string") {
        ownerNum = metadata.owner.replace(/@.+/, "");
      }
      const creation = metadata.creation
        ? moment(metadata.creation * 1000)
            .tz("Asia/Jakarta")
            .format("DD/MM/YYYY HH:mm")
        : "-";

      const desc = metadata.desc || "Tidak ada deskripsi.";
      const botAdmin = metadata.participants?.find((p) => p.jid === conn.user?.id && p.admin)
        ? "Bot adalah admin"
        : "Bot bukan admin";

      const teks =
        `乂  *I N F O  G R O U P*\n\n` +
        `◦ *Nama:* ${metadata.subject || "Tanpa Nama"}\n` +
        `◦ *ID:* ${metadata.id}\n` +
        `◦ *Member:* ${metadata.participants?.length || 0}\n` +
        `◦ *Owner:* @${ownerNum}\n` +
        `◦ *Dibuat:* ${creation}\n` +
        `◦ *Status:* ${botAdmin}\n\n` +
        `◦ *Deskripsi:*\n${desc}`;

      await conn.sendTextWithMentions(m.chat, teks, m);
    } catch (e) {
      console.error("Error listgc:", e);
      await conn.sendTextWithMentions(
        m.chat,
        `⚠️ Terjadi kesalahan di plugin *listgc*:\n${e.message}`,
        m
      );
    }
  }
};
