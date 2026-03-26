import moment from "moment-timezone";

export default {
  name: "listsewa",
  alias: ["sewalist", "sewastatus"],
  description: "Menampilkan semua group yang sedang disewa",
  access: { owner: true },
  run: async (m, { conn }) => {
    const chats = Object.values(global.db.data.chats || {}).filter(
      (c) => c.type === "group" && c.sewa
    );

    if (chats.length === 0) return m.reply("❌ Tidak ada group yang sedang disewa saat ini.");

    let teks = `📋 *Daftar Group Sewa Aktif:*\n\n`;
    for (let chat of chats) {
      const mulai = chat.sewasince ? moment(chat.sewasince).format("YYYY-MM-DD HH:mm") : "-";
      const selesai = chat.sewaends ? moment(chat.sewaends).format("YYYY-MM-DD HH:mm") : "-";
      const sisa = chat.sewaends ? moment(chat.sewaends).fromNow(true) : "-";

      teks += `*Nama:* ${chat.name || "Tidak diketahui"}\n`;
      teks += `*ID:* ${chat.id}\n`;
      teks += `*Mulai:* ${mulai}\n`;
      teks += `*Berakhir:* ${selesai}\n`;
      teks += `*Sisa waktu:* ${sisa}\n\n`;
    }

    m.reply(teks);
  }
};
