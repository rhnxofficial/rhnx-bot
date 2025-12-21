export default {
  name: "banchat",
  alias: ["ban", "banchat"],
  description: "Ban atau unban chat supaya bot nggak ganggu",
  access: { owner: true },
  run: async (m, { conn, q, args, setReply }) => {
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId];

    if (!q) return m.reply("❗ Masukin query kocak: `on` buat nge-ban, `off` buat unban");

    const status = q.toLowerCase();
    if (status === "on") {
      if (chat.banchat === true)
        return m.reply("🤡 Chat ini udah di-ban, bot ga bakal ganggu lagi!");
      chat.banchat = true;
      m.reply("🚫 Chat ini sekarang di-ban. Santai aja, bot nggak bakal ngerepotin kamu lagi 😎");
    } else if (status === "off") {
      if (chat.banchat === false || !chat.banchat) return m.reply("😅 Chat ini belum di-ban kok!");
      chat.banchat = false;
      m.reply("✅ Chat ini sekarang di-unban. Bot siap ganggu lagi kalau perlu 😏");
    } else {
      m.reply("❗ Query nggak valid. Pilih `on` buat nge-ban atau `off` buat unban.");
    }
  }
};
