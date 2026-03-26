export default {
  name: "listowner",
  alias: ["daftarowner"],
  description: "Melihat daftar nomor owner",
  access: { owner: true },
  run: async (m, { setReply }) => {
    let owners = global.db.data.data?.owner || {};

    if (!Object.keys(owners).length) {
      return setReply("⚠️ Belum ada nomor yang terdaftar sebagai owner.");
    }

    let teks = "👑 *Daftar Owner Bot:*\n\n";
    let no = 1;
    for (let id in owners) {
      let o = owners[id];
      teks += `${no++}. ${o.number}\n   📅 Sejak: ${o.since}\n`;
    }

    setReply(teks);
  }
};
