export default {
  name: "antispam",
  alias: ["antispam"],
  description: "Aktifkan / Nonaktifkan fitur anti-spam di chat ini",
  access: { owner: true },
  run: async (m, { conn, q, args }) => {
    let chat = global.db.data.chats[m.chat];
    if (!chat) global.db.data.chats[m.chat] = {};
    if (typeof chat.antispam === "undefined") chat.antispam = false;

    let option = (args?.[0] || "").toLowerCase();

    if (option === "on") {
      chat.antispam = true;
      return m.reply("✅ Antispam berhasil *diaktifkan* untuk chat ini.");
    } else if (option === "off") {
      chat.antispam = false;
      return m.reply("❌ Antispam berhasil *dinonaktifkan* untuk chat ini.");
    } else {
      let status = chat.antispam ? "✅ Aktif" : "❌ Nonaktif";
      return m.reply(
        `⚙️ Antispam saat ini: *${status}*\n\n` +
          `Gunakan:\n` +
          `> .antispam on\n` +
          `> .antispam off`
      );
    }
  }
};
