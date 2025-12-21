export default {
  name: "delcmd",
  description: "Hapus command dari stiker",
  category: "sticker",
  access: { owner: true },

  run: async (m, { prefix, command }) => {
    if (!m.quoted)
      return m.reply(`Balas stiker yang ingin dihapus perintahnya dengan *${prefix + command}*`);
    if (!m.quoted.fileSha256) return m.reply("⚠️ Stiker ini tidak memiliki hash SHA256.");

    const user = global.db.data.users[m.sender];
    const hash = m.quoted.fileSha256.toString("base64");

    if (!user?.sticker?.[hash])
      return m.reply("❌ Stiker ini tidak memiliki command yang tersimpan.");

    delete user.sticker[hash];
    m.reply("✅ Command untuk stiker ini berhasil dihapus!");
  }
};
