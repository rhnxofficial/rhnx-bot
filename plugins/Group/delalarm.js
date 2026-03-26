import fs from "fs";

const alarmPath = "./database/group/notification/alarm.json";

export default {
  name: "delalarm",
  alias: ["hapusalarm", "deletealarm"],
  description: "Hapus alarm pakai ID atau nomor list",
  access: { group: true, admin: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) {
        return m.reply(
          "❗ Masukkan ID atau nomor alarm\n\n" + "Contoh:\n.delalarm 2\n.delalarm 1734321123123"
        );
      }

      const input = args[0];

      if (!fs.existsSync(alarmPath)) {
        return m.reply("❗ Database alarm belum ada.");
      }

      let alarms = JSON.parse(fs.readFileSync(alarmPath, "utf8"));

      const groupAlarms = alarms.filter((a) => a.groupId === m.chat);

      if (!groupAlarms.length) {
        return m.reply("❗ Tidak ada alarm di grup ini.");
      }

      let deleted;

      if (!isNaN(input)) {
        const num = Number(input);

        if (num >= 1 && num <= groupAlarms.length) {
          deleted = groupAlarms[num - 1];
        } else {
          deleted = groupAlarms.find((a) => a.id === num);
        }
      }

      if (!deleted) {
        return m.reply("❗ Alarm tidak ditemukan.");
      }

      alarms = alarms.filter((a) => a.id !== deleted.id);
      fs.writeFileSync(alarmPath, JSON.stringify(alarms, null, 2));

      m.reply(
        `🧹 *ALARM DIHAPUS*\n\n` +
          `◦ ID   : ${deleted.id}\n` +
          `◦ Jam  : ${deleted.time}\n` +
          `◦ Nama : ${deleted.name}`
      );
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat menghapus alarm.");
    }
  }
};
