export default {
  name: "owner",
  alias: ["creator", "ownerinfo"],
  description: "Mengirim kontak owner dan bot",

  run: async (m, { conn }) => {
    try {
      const contacts = [
        [
          owner.contact,
          owner.name,
          "🧑‍💻 Develover Bot",
          "✍️ Masih belajar, jangan dibully ya!",
          "owner@gmail.com",
          "Indonesia",
          "https://example.com",
          "Owner"
        ],
        [
          bot.number,
          "RHNX",
          "🤖 I'm Bot WhatsApp",
          "⚠️ Jangan Spam Bisa Kena Block/Ban!",
          "bot@gmail.com",
          "Server Indonesia",
          "https://botwebsite.com",
          "Bot Official"
        ]
      ];

      await conn.sendContactArray(m.chat, contacts, m);

      await m.reply(
        `Oke kak, ini kontak owner & bot ya 👇\n` + `Silakan hubungi kalau ada keperluan.`
      );
    } catch (err) {
      console.error(err);
      return m.reply("❌ Gagal mengirim kontak.");
    }
  }
};
