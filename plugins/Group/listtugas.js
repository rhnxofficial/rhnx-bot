import fs from "fs";

const dbPath = "./database/group/notification/tugas.json";

export default {
  name: "listtugas",
  alias: ["tugas", "listtask"],
  description: "Menampilkan daftar tugas grup",
  access: { group: true },

  run: async (m) => {
    try {
      if (!fs.existsSync(dbPath)) {
        return m.reply("❗ Belum ada tugas di grup ini.");
      }

      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      const tasks = data.filter((t) => t.groupId === m.chat);

      if (!tasks.length) {
        return m.reply("❗ Belum ada tugas di grup ini.");
      }

      tasks.sort((a, b) => a.time.localeCompare(b.time));

      let text = `📚 *DAFTAR TUGAS GRUP*\n\n`;

      tasks.forEach((t, i) => {
        text +=
          `${i + 1}.  ID: ${t.id}\n` +
          `   ◦ Jam   : ${t.time}\n` +
          `   ◦ Judul : ${t.title}\n` +
          `   ◦ Pesan : ${t.message}\n` +
          `   ◦ Media : ${t.media ? "Ada" : "Tidak"}\n\n`;
      });

      text += `🧹 Hapus tugas:\n` + `*.deltugas <ID>*`;

      m.reply(text);
    } catch (err) {
      console.error(err);
      m.reply("❗ Error menampilkan daftar tugas.");
    }
  }
};
