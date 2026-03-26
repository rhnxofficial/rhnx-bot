import fs from "fs";
import moment from "moment-timezone";

const alarmPath = "./database/group/notification/alarm.json";
const TIMEZONE = "Asia/Jakarta";

export default {
  name: "addalarm",
  alias: ["setalarm"],
  description: "Menambahkan alarm grup (anti duplikat jam)",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { args }) => {
    try {
      if (!args.length) {
        return m.reply(
          "❗ Format salah\n\n" + "Contoh:\n" + ".setalarm 12:00|Jam makan|Selamat makan!"
        );
      }

      const input = args.join(" ");
      const [jam, nama, pesan] = input.split("|");

      if (!jam || !nama || !pesan) {
        return m.reply("❗ Format tidak lengkap\n" + "Gunakan: <jam>|<nama alarm>|<pesan>");
      }

      const time = moment.tz(jam.trim(), "HH:mm", TIMEZONE);
      if (!time.isValid()) {
        return m.reply("❗ Format jam tidak valid. Gunakan HH:mm (contoh 07:30)");
      }

      const finalTime = time.format("HH:mm");

      let alarms = [];
      if (fs.existsSync(alarmPath)) {
        alarms = JSON.parse(fs.readFileSync(alarmPath, "utf8"));
      }

      const duplicate = alarms.find((a) => a.groupId === m.chat && a.time === finalTime);

      if (duplicate) {
        return m.reply(
          `⛔ *ALARM SUDAH ADA*\n\n` +
            `Grup ini sudah memiliki alarm di jam *${finalTime}*\n` +
            `📛 Nama: *${duplicate.name}*`
        );
      }

      const alarmData = {
        id: Date.now(),
        groupId: m.chat,
        time: finalTime,
        name: nama.trim(),
        message: pesan.trim(),
        createdAt: moment.tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss")
      };

      alarms.push(alarmData);
      fs.writeFileSync(alarmPath, JSON.stringify(alarms, null, 2));

      m.reply(
        `✅ *Alarm Berhasil Di Tambahkan*\n\n` +
          `◦ Jam   : ${alarmData.time}\n` +
          `◦ Nama  : ${alarmData.name}\n` +
          `◦ Pesan : ${alarmData.message}`
      );
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat menambahkan alarm.");
    }
  }
};
