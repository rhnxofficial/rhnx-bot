import fs from "fs";
import moment from "moment-timezone";

const dbPath = "./database/group/notification/openclose.json";
const TIMEZONE = "Asia/Jakarta";

export default {
  name: "setclose",
  alias: ["closegroup"],
  description: "Set jadwal tutup grup",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { args }) => {
    try {
      if (!args.length) return m.reply("❗ Format:\n.setclose 22:00|Istirahat malam");

      const [jam, reason] = args.join(" ").split("|");
      if (!jam || !reason) return m.reply("❗ Format harus: <jam>|<alasan>");

      const time = moment.tz(jam.trim(), "HH:mm", TIMEZONE);
      if (!time.isValid()) return m.reply("❗ Format jam salah (HH:mm)");

      const finalTime = time.format("HH:mm");

      let data = [];
      if (fs.existsSync(dbPath)) {
        data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      }

      const duplicate = data.find(
        (d) => d.groupId === m.chat && d.type === "close" && d.time === finalTime
      );

      if (duplicate) {
        return m.reply(`❗ Jadwal CLOSE jam ${finalTime} sudah ada`);
      }

      const newId = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1;

      data.push({
        id: newId,
        groupId: m.chat,
        type: "close",
        time: finalTime,
        reason: reason.trim(),
        lastTrigger: null,
        createdAt: moment.tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss")
      });

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

      m.reply(
        `🔒 *Jadwal Close Ditambah Kan*\n\n` +
          `◦ ID : ${newId}\n` +
          `◦ Jam: ${finalTime}\n` +
          `◦ ${reason.trim()}`
      );
    } catch (err) {
      console.error(err);
      m.reply("❗ Error setclose.");
    }
  }
};
