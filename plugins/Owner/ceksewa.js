import moment from "moment-timezone";

export default {
  name: "ceksewa",
  alias: ["sewacek", "statussewa"],
  description: "Cek status sewa group",
  access: { owner: true },
  run: async (m, { conn, q }) => {
    let chatId;

    if (m.isGroup) {
      chatId = m.chat;
    } else {
      if (!q) return m.reply("❌ Masukkan ID atau link group!");

      if (q.startsWith("https://chat.whatsapp.com/")) {
        chatId = await getChatIdFromLink(q, conn);
        if (!chatId) return m.reply("❌ Bot belum join group dari link itu.");
      } else {
        chatId = q;
      }
    }

    const chat = global.db.data.chats[chatId];
    if (!chat) return m.reply("❌ Data group tidak ditemukan di database.");

    let teks = `📋 *Status Sewa Group*\n\n`;
    teks += `*Nama:* ${chat.name || "Tidak diketahui"}\n`;
    teks += `*ID:* ${chat.id}\n`;
    teks += `*Sewa Aktif:* ${chat.sewa ? "✅ Ya" : "❌ Tidak"}\n`;

    if (chat.sewa) {
      const mulai = chat.sewasince ? moment(chat.sewasince).format("YYYY-MM-DD HH:mm") : "-";
      const selesai = chat.sewaends ? moment(chat.sewaends).format("YYYY-MM-DD HH:mm") : "-";
      const sisa = chat.sewaends ? moment(chat.sewaends).fromNow(true) : "-";

      teks += `*Mulai:* ${mulai}\n`;
      teks += `*Berakhir:* ${selesai}\n`;
      teks += `*Sisa waktu:* ${sisa}\n`;
    }

    return m.reply(teks);
  }
};

async function getChatIdFromLink(link, conn) {
  try {
    const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
    const match = rex1.exec(link);
    if (!match || !match[1]) return null;

    const code = match[1];
    const chatId = await conn.groupAcceptInvite(code).catch(() => null);
    return chatId;
  } catch (err) {
    console.error(err);
    return null;
  }
}
