export default {
  name: "delpremium",
  alias: ["hapuspremium", "delprem"],
  description: "Menghapus status Premium dari user",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    let nomor = args[0]?.replace(/[^0-9]/g, "");
    if (!nomor && m.quoted) {
      nomor = m.quoted.sender?.split("@")[0] || "";
    }

    if (!nomor) {
      return setReply("⚠️ Masukkan nomor atau reply pesan user yang mau dihapus dari premium.");
    }

    let id = nomor + "@s.whatsapp.net";

    if (!global.db.data.users[id]?.premium) {
      return setReply(`⚠️ Nomor *${nomor}* tidak terdaftar sebagai premium.`);
    }

    global.db.data.users[id].premium = false;
    delete global.db.data.users[id].premiumsince;
    delete global.db.data.users[id].premiumend;

    setReply(`✅ Nomor *${nomor}* berhasil dihapus dari daftar Premium.`);
  }
};
