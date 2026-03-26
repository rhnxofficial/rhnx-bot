import moment from "moment-timezone";

export default {
  name: "premiumCheckHook",
  description: "Hook untuk cek & update status premium user",
  type: "hook",

  before: async (m, { conn }) => {
    let users = global.db.data.users;
    if (!users) return;

    for (let jid in users) {
      let user = users[jid];
      if (!user.premium || !user.premiumend || user.premiumend === "Infinity") continue;

      let now = moment().tz("Asia/Jakarta");
      let end = moment(user.premiumend, "DD/MM/YYYY HH:mm:ss").tz("Asia/Jakarta");

      if (now.isAfter(end)) {
        user.premium = false;
        user.premiumsince = null;
        user.premiumend = null;

        try {
          await conn.sendMessage(user.id || jid, {
            text: `⚠️ Masa aktif *Premium* kamu sudah *berakhir*.\n\n📅 Expired: ${end.format("DD/MM/YYYY HH:mm:ss")}\n\nSilakan hubungi owner untuk perpanjangan.`
          });

          let owner = global.owner?.contact || "6281316643491";
          await conn.sendMessage(owner + "@s.whatsapp.net", {
            text: `📢 Premium user *berakhir*\n\n👤 User: ${user.name || jid}\n📱 Nomor: ${jid}\n📅 Expired: ${end.format("DD/MM/YYYY HH:mm:ss")}`
          });
        } catch (e) {
          console.error("Gagal kirim notifikasi premium habis:", e);
        }
      }
    }
  }
};
