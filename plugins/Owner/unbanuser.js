import chalk from "chalk";

export default {
  name: "unban",
  alias: ["unbanuser"],
  description: "Unban user (via reply atau nomor langsung)",
  tags: ["owner"],
  access: { owner: true },
  run: async (m, { conn, args }) => {
    if (!global.db.data.banned) global.db.data.banned = [];
    const banned = global.db.data.banned;

    let target;
    if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    } else if (args[0]) {
      target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    } else {
      return m.reply("⚠️ Reply pesan atau masukkan nomor.\nContoh: *.unban 6281234567890*");
    }

    const nomor = target.split("@")[0];
    const userBanned = banned.find((b) => b.id === nomor);
    if (!userBanned) return m.reply(`✅ Nomor *${nomor}* tidak ditemukan di daftar banned.`);

    banned.splice(banned.indexOf(userBanned), 1);
    console.log(chalk.green(`[UNBAN] ${nomor} dihapus dari daftar banned.`));

    await m.reply(`✅ Nomor *${nomor}* telah di-*unban*.`);
    try {
      await conn.sendMessage(target, { text: "✅ Kamu telah di-unban oleh owner bot." });
    } catch {}
  }
};
