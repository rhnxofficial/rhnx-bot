export default {
  name: "cekbot",
  alias: ["checkbot", "isbot"],
  description: "Cek apakah bot ada di grup tertentu",
  category: "tools",
  usage: "cekbot <idgc>",

  async run(m, { conn, args }) {
    const idgc = args[0];

    if (!idgc) return m.reply("❗ Contoh:\n`cekbot 120363186496147039@g.us`");
    if (!idgc.endsWith("@g.us")) return m.reply("❗ Format ID grup tidak valid.");

    // Cek bot ada + admin
    const check = await m.isBotInGroup(idgc);

    if (!check.inGroup) {
      return m.reply(`❌ Bot *TIDAK ADA* atau *SUDAH KELUAR* dari grup:\n${idgc}`);
    }

    const meta = await conn.groupMetadata(idgc).catch(() => null);
    if (!meta) return m.reply(`⚠️ Bot ada, tapi gagal ambil metadata grup.`);

    const groupName = meta.subject || "(Tanpa nama)";
    const memberCount = meta.participants?.length || 0;
    const owner = meta.owner || meta.subjectOwner || "Tidak diketahui";

    return m.reply(
      `✅ *Bot ADA di grup!*

📛 Grup: ${groupName}
👥 Member: ${memberCount}
👤 Owner: ${owner}
🆔 ID: ${idgc}

🔐 Status Bot: ${check.isAdmin ? "🛡️ BOT ADMIN" : "⚠️ BOT BUKAN ADMIN"}`
    );
  }
};
