export default {
  name: "setcmd",
  description: "Menautkan stiker ke command (per pengguna)",
  access: { owner: false },

  run: async (m, { q, prefix, command }) => {
    const text = q;
    if (!m.quoted) return m.reply(`Balas stiker dengan perintah *${prefix + command} <teks>*`);
    if (!m.quoted.fileSha256) return m.reply("⚠️ Stiker ini tidak memiliki hash SHA256.");
    if (!text)
      return m.reply(`Penggunaan:\n${prefix + command} <teks>\n\nContoh:\n${prefix + command} tes`);

    const user = global.db.data.users[m.sender] || {};
    if (!user.sticker) user.sticker = {};

    const hash = m.quoted.fileSha256.toString("base64");
    const sticker = user.sticker;

    if (sticker[hash] && sticker[hash].locked)
      return m.reply("🔒 Stiker ini dikunci dan tidak bisa diubah perintahnya.");

    if (sticker[hash])
      return m.reply(`❗ Stiker ini sudah terdaftar dengan command: *${sticker[hash].text}*`);

    sticker[hash] = {
      text,
      creator: m.sender,
      at: Date.now(),
      locked: false
    };

    global.db.data.users[m.sender].sticker = sticker;

    m.reply(`✅ Berhasil menautkan stiker dengan command: *${text}*`);
  }
};
