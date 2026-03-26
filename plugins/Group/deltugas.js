import fs from "fs";

const dbPath = "./database/group/notification/tugas.json";

export default {
  name: "deltugas",
  alias: ["deletetugas", "hapustugas"],
  description: "Menghapus tugas berdasarkan ID",
  access: { group: true, admin: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) {
        return m.reply("❗ Contoh penggunaan:\n.deltugas 2");
      }

      const id = parseInt(args[0]);
      if (isNaN(id)) {
        return m.reply("❗ ID harus berupa angka.");
      }

      if (!fs.existsSync(dbPath)) {
        return m.reply("❗ Database tugas kosong.");
      }

      let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      const index = data.findIndex((t) => t.id === id && t.groupId === m.chat);

      if (index === -1) {
        return m.reply("❗ Tugas tidak ditemukan di grup ini.");
      }

      const removed = data[index];
      data.splice(index, 1);

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

      m.reply(
        `🧹 *TUGAS DIHAPUS*\n\n` +
          `◦ ID    : ${removed.id}\n` +
          `◦ Jam   : ${removed.time}\n` +
          `◦ Judul: ${removed.title}`
      );
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat menghapus tugas.");
    }
  }
};
