import fs from "fs";

export default {
  name: "delgroupstore",
  alias: ["delgcstore"],
  description: "Menghapus grup saat ini dari store",
  access: { owner: true },
  run: async (m) => {
    const path = "./database/store/groupstore.json";

    if (!fs.existsSync(path)) {
      return m.reply("❌ Database grup kosong.");
    }
    const rawData = fs.readFileSync(path, "utf-8");
    let database = JSON.parse(rawData);
    const index = database.findIndex((g) => g.idGc === m.chat);
    if (index === -1) {
      return m.reply("❌ Grup ini tidak ditemukan di database store.");
    }
    const removed = database.splice(index, 1)[0];
    fs.writeFileSync(path, JSON.stringify(database, null, 2));
    return m.reply(`✅ Grup *${removed.namaGc}* berhasil dihapus dari store.`);
  }
};
