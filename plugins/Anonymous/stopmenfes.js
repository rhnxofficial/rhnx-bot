import fs from "fs";
const MENFES_FILE = "./database/private/menfes.json";

function readDB() {
  if (!fs.existsSync(MENFES_FILE)) return {};
  return JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(MENFES_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: "stopmenfes",
  alias: ["endmenfes", "closemenfes", "stopmf"],
  description: "Mengakhiri sesi menfes aktif",
  access: { private: true },
  run: async (m, { conn }) => {
    let menfesDB = readDB();
    const thread = Object.values(menfesDB).find(
      (x) => x.status === false && (x.dari === m.sender || x.penerima === m.sender)
    );
    if (!thread) return m.reply("⚠️ Kamu tidak sedang dalam sesi Menfes.");

    thread.status = true;
    const { dari, penerima } = thread;
    const target = m.sender === dari ? penerima : dari;

    await conn.sendMessage(target, { text: "🔒 Sesi Menfes telah ditutup oleh lawan bicaramu." });
    await m.reply("👌 Sesi Menfes berhasil diakhiri.");

    menfesDB[thread.id] = thread;
    saveDB(menfesDB);
  }
};
