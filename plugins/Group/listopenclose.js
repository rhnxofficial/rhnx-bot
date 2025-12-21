import fs from "fs";

const dbPath = "./database/group/notification/openclose.json";

export default {
  name: "listopenclose",
  alias: ["openclose", "listoc"],
  description: "Menampilkan jadwal open & close grup",
  access: { group: true },

  run: async (m) => {
    try {
      if (!fs.existsSync(dbPath)) {
        return m.reply("❗ Belum ada jadwal open/close di grup ini.");
      }

      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      const groupData = data.filter((d) => d.groupId === m.chat);

      if (!groupData.length) {
        return m.reply("❗ Belum ada jadwal open/close di grup ini.");
      }

      groupData.sort((a, b) => a.time.localeCompare(b.time));

      let text = `📅 *JADWAL OPEN & CLOSE GRUP*\n\n`;

      groupData.forEach((d, i) => {
        const icon = d.type === "open" ? "🔓" : "🔒";
        const type = d.type.toUpperCase();

        text +=
          `${i + 1}. ${icon} *${type}*\n` +
          `   ◦ ID   : ${d.id}\n` +
          `   ◦ Jam  : ${d.time}\n` +
          `   ◦ Info : ${d.reason}\n\n`;
      });

      text += `🧹 Hapus jadwal:\n` + `*.delopenclose <ID>*`;

      m.reply(text);
    } catch (err) {
      console.error(err);
      m.reply("❗ Error menampilkan jadwal open/close.");
    }
  }
};
