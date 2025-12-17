import fs from "fs";

const alarmPath = "./database/group/notification/alarm.json";

export default {
  name: "listalarm",
  alias: ["listalalarm", "cekalarm"],
  description: "Menampilkan daftar alarm di grup",
  access: { group: true },

  run: async (m) => {
    try {
      if (!fs.existsSync(alarmPath)) {
        return m.reply("❗ Belum ada alarm di grup ini.");
      }

      const alarms = JSON.parse(fs.readFileSync(alarmPath, "utf8")).filter(
        (a) => a.groupId === m.chat
      );

      if (!alarms.length) {
        return m.reply("❗ Belum ada alarm di grup ini.");
      }

      let teks = `⏰ *DAFTAR ALARM GRUP*\n\n`;

      alarms.forEach((a, i) => {
        teks +=
          `${i + 1}. *${a.id}*\n` +
          `   ◦ Jam  : ${a.time}\n` +
          `   ◦ Nama : ${a.name}\n` +
          `   ◦ Pesan: ${a.message}\n\n`;
      });

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat menampilkan daftar alarm.");
    }
  }
};
