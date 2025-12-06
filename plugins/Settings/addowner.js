import moment from "moment-timezone";

export default {
  name: "addowner",
  alias: ["addowner"],
  description: "Menambahkan nomor baru sebagai owner",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    let nomor = args[0]?.replace(/[^0-9]/g, "");
    if (!nomor && m.quoted) {
      nomor = m.quoted.sender?.split("@")[0] || "";
    }

    if (!nomor) {
      return m.reply(
        "⚠️ Masukkan nomor atau reply pesan orang yang mau dijadikan owner.\n\nContoh: .addowner 6281234567890"
      );
    }

    let id = nomor + "@s.whatsapp.net";

    if (!global.db.data.data) global.db.data.data = {};
    if (!global.db.data.data.owner) global.db.data.data.owner = {};

    if (global.db.data.data.owner[id]) {
      return m.reply(
        `⚠️ Nomor *${nomor}* sudah terdaftar sebagai owner sejak ${global.db.data.data.owner[id].since}`
      );
    }

    let since = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss");

    global.db.data.data.owner[id] = { number: nomor, since };

    m.reply(`✅ Nomor *${nomor}* berhasil ditambahkan sebagai owner\n📅 Sejak: ${since}`);
  }
};
