import fs from "fs";

const dbPath = "./database/group/notification/openclose.json";

export default {
  name: "delopenclose",
  alias: ["deloc", "deleteopenclose"],
  description: "Menghapus jadwal open/close berdasarkan ID",
  access: { group: true, admin: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) {
        return m.reply("❗ Contoh:\n.delopenclose 3");
      }

      const id = parseInt(args[0]);
      if (isNaN(id)) {
        return m.reply("❗ ID harus berupa angka.");
      }

      if (!fs.existsSync(dbPath)) {
        return m.reply("❗ Database kosong.");
      }

      let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      const index = data.findIndex((d) => d.id === id && d.groupId === m.chat);

      if (index === -1) {
        return m.reply("❗ Jadwal tidak ditemukan di grup ini.");
      }

      const removed = data[index];
      data.splice(index, 1);

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

      const icon = removed.type === "open" ? "🔓" : "🔒";

      m.reply(
        `🧹 *JADWAL DIHAPUS*\n\n` +
          `${icon} ${removed.type.toUpperCase()}\n` +
          `◦ Jam  : ${removed.time}\n` +
          `◦ Info : ${removed.reason}`
      );
    } catch (err) {
      console.error(err);
      m.reply("❗ Error menghapus jadwal.");
    }
  }
};
