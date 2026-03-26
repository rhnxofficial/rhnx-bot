import moment from "moment-timezone";

export default {
  name: "addpremium",
  alias: ["tambahpremium", "addprem"],
  description: "Menambahkan user sebagai Premium",
  access: { owner: true },
  run: async (m, { args, conn, setReply }) => {
    let nomor,
      duration = "7d";

    if (m.quoted) {
      nomor = m.quoted.sender.split("@")[0];
      if (args[0]) duration = args[0];
    } else if (args[0]?.includes("|")) {
      [nomor, duration] = args[0].split("|");
    } else {
      return m.reply(
        `Gunakan:
.addprem <nomor>|<durasi>
Atau reply ke user dengan:
.addprem 7d

Note:
d = hari
h = jam
m = menit`
      );
    }

    let unit = duration.slice(-1);
    let count = parseInt(duration.slice(0, -1));
    let addMs = 0;
    if (unit === "d") addMs = count * 24 * 60 * 60 * 1000;
    else if (unit === "h") addMs = count * 60 * 60 * 1000;
    else if (unit === "m") addMs = count * 60 * 1000;
    else addMs = 7 * 24 * 60 * 60 * 1000;
    let id = nomor + "@s.whatsapp.net";
    if (!global.db.data.users[id]) global.db.data.users[id] = {};

    const since = moment().tz("Asia/Jakarta");
    const expired = moment(since).add(addMs, "ms");

    global.db.data.users[id].premium = true;
    global.db.data.users[id].premiumsince = since.format("DD/MM/YYYY HH:mm:ss");
    global.db.data.users[id].premiumend = expired.format("DD/MM/YYYY HH:mm:ss");

    try {
      await conn.sendMessage(id, {
        text: `✨ Selamat! Anda sekarang menjadi *User Premium*.\n📅 Sejak: ${global.db.data.users[id].premiumsince}\n⏳ Expired: ${global.db.data.users[id].premiumend}`
      });
    } catch (e) {
      console.error(`Gagal notif user premium: ${id}`, e);
    }

    const ownerData = Object.values(global.db.data.data.owner || {});
    for (let o of ownerData) {
      const ownerJid = o.number + "@s.whatsapp.net";
      try {
        await conn.sendMessage(ownerJid, {
          text: `⚡ User Premium baru:\nNomor: ${nomor}\nSejak: ${global.db.data.users[id].premiumsince}\nExpired: ${global.db.data.users[id].premiumend}`
        });
      } catch (e) {
        console.error(`Gagal notif owner: ${ownerJid}`, e);
      }
    }

    m.reply(
      `✅ Nomor *${nomor}* berhasil dijadikan Premium
📅 Sejak: ${global.db.data.users[id].premiumsince}
⏳ Expired: ${global.db.data.users[id].premiumend}`
    );
  }
};
