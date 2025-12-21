export default {
  name: "banstik",
  description: "Ban stiker agar tidak bisa digunakan di grup",
  category: "sticker",
  access: { admin: true, group: true },

  run: async (m, { conn, prefix, command }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat) global.db.data.chats[m.chat] = {};
    if (
      typeof global.db.data.chats[m.chat].banstik !== "object" ||
      Array.isArray(global.db.data.chats[m.chat].banstik)
    ) {
      global.db.data.chats[m.chat].banstik = {};
    }
    const banstik = global.db.data.chats[m.chat].banstik;

    if (!m.quoted) return m.reply(`Balas stiker dengan perintah *${prefix + command}*`);
    if (m.quoted.type !== "stickerMessage") return m.reply("Yang kamu balas bukan stiker!");
    if (!m.quoted.fileSha256) return m.reply("Sticker tidak memiliki hash (fileSha256)!");

    const hash = m.quoted.fileSha256.toString("base64");

    if (banstik[hash]) return m.reply("❌ Stiker ini sudah dibanned di grup ini.");

    banstik[hash] = {
      addedBy: m.sender,
      date: Date.now()
    };

    m.reply("✅ Stiker berhasil dimasukkan ke daftar *banstik* grup ini.");
  }
};
