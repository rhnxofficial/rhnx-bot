import moment from "moment-timezone";

export default {
  name: "cekprem",
  alias: ["checkprem", "premiumcek"],
  description: "Cek status premium kamu",
  access: { owner: false, premium: false },
  run: async (m, { setReply }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return setReply("⚠️ Data kamu tidak ditemukan di database.");

    if (user.premium) {
      let since = user.premiumsince
        ? moment(user.premiumsince, "DD/MM/YYYY HH:mm:ss")
            .tz("Asia/Jakarta")
            .format("DD MMMM YYYY, HH:mm:ss")
        : "-";
      let end =
        user.premiumend === "Infinity"
          ? "∞ Unlimited"
          : moment(user.premiumend, "DD/MM/YYYY HH:mm:ss")
              .tz("Asia/Jakarta")
              .format("DD MMMM YYYY, HH:mm:ss");

      setReply(
        `✨ Status Premium Kamu ✨

📛 Nama: ${user.name || "-"}
📱 Nomor: ${m.sender.split("@")[0]}
⭐ Premium: ✅ Aktif
📅 Sejak: ${since}
⏳ Berakhir: ${end}`
      );
    } else {
      setReply(
        `❌ Kamu belum terdaftar sebagai *User Premium*.

👉 Hubungi Owner untuk membeli akses premium.`
      );
    }
  }
};
