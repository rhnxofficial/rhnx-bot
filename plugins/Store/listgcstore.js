import fs from "fs";

export default {
  name: "listgroupstore",
  alias: ["listgcstore"],
  description: "Menampilkan semua grup yang ada di store",
  access: { owner: true },
  run: async (m) => {
    const path = "./database/store/groupstore.json";

    if (!fs.existsSync(path)) {
      return m.reply("❌ Database grup kosong.");
    }

    const rawData = fs.readFileSync(path, "utf-8");
    const database = JSON.parse(rawData);

    if (!database.length) {
      return m.reply("❌ Belum ada grup yang ditambahkan ke store.");
    }

    let teks = "📂 *Daftar Grup di Store:*\n\n";
    database.forEach((g, i) => {
      teks += `${i + 1}. ${g.namaGc} (${g.idGc})\nMulai Dari: ${g.mulaiDari}\n\n`;
    });

    return m.reply(teks);
  }
};
