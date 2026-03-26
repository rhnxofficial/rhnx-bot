import fs from "fs";

const MENFES_FILE = "./database/private/menfes.json";

export default {
  name: "menfesku",
  alias: ["mfku", "menfesgue"],
  description: "Lihat daftar sesi menfes yang kamu kirim",
  access: { private: true },
  async run(m, { conn }) {
    if (!fs.existsSync(MENFES_FILE)) return m.reply("❌ Tidak ada database menfes.");

    const db = JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
    const list = Object.values(db).filter((x) => x.dari === m.sender);

    if (!list.length) return m.reply("📭 Kamu belum pernah kirim menfes!");

    let teks = `📌 *Menfes Kamu* (${list.length} sesi)\n\n`;

    list.forEach((s, i) => {
      const totalChat = 1 + (s.balasan?.length || 0);
      const totalMedia = (s.mediaUrl ? 1 : 0) + (s.balasan?.filter((b) => b.mediaUrl)?.length || 0);

      teks +=
        `#${i + 1}\n` +
        `• Ke: ${s.penerima.replace("@s.whatsapp.net", "")}\n` +
        `• Chat: ${totalChat} pesan` +
        (totalMedia > 0 ? ` (📎 ${totalMedia} media)` : "") +
        `\n` +
        `• Status: ${s.status ? "🔴 Selesai" : "🟢 Aktif"}\n\n`;
    });

    return m.reply(teks.trim());
  }
};
