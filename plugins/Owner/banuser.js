import chalk from "chalk";

export default {
  name: "ban",
  alias: ["banuser"],
  description: "Ban user (via reply atau nomor langsung)",
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
      return m.reply("⚠️ Reply pesan atau masukkan nomor.\nContoh: *.ban 6281234567890*");
    }

    const nomor = target.split("@")[0];
    const userBanned = banned.find((b) => b.id === nomor);
    if (userBanned) return m.reply(`🚫 Nomor *${nomor}* sudah dalam daftar banned.`);

    banned.push({ id: nomor, time: Date.now() });
    console.log(chalk.red(`[BAN] ${nomor} ditambahkan ke daftar banned.`));

    await m.reply(`🚫 Nomor *${nomor}* berhasil di-*banned* sementara.`);
    try {
      await conn.sendMessage(target, { text: "🚫 Kamu telah dibanned sementara oleh owner bot." });
    } catch {}
  }
};
