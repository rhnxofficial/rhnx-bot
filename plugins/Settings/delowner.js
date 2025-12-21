export default {
  name: "delowner",
  alias: ["hapusowner"],
  description: "Menghapus nomor dari daftar owner",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    let nomor = args[0]?.replace(/[^0-9]/g, "");
    if (!nomor && m.quoted) {
      nomor = m.quoted.sender?.split("@")[0] || "";
    }

    if (!nomor) {
      return setReply(
        "⚠️ Masukkan nomor atau reply pesan orang yang mau dihapus dari owner.\n\nContoh: .delowner 6281234567890"
      );
    }

    let id = nomor + "@s.whatsapp.net";

    if (!global.db.data.data?.owner || !global.db.data.data.owner[id]) {
      return setReply(`⚠️ Nomor *${nomor}* tidak ada di daftar owner.`);
    }

    delete global.db.data.data.owner[id];

    setReply(`✅ Nomor *${nomor}* berhasil dihapus dari daftar owner.`);
  }
};
