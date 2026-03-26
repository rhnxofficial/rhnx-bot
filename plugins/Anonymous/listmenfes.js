import fs from "fs";

const MENFES_FILE = "./database/private/menfes.json";

export default {
  name: "listmenfes",
  alias: ["lmenfes"],
  description: "Owner: lihat semua sesi Menfes",
  access: { owner: true, private: true },

  async run(m, { conn }) {
    if (!fs.existsSync(MENFES_FILE)) return m.reply("❌ Tidak ada database menfes.");

    const db = JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
    const list = Object.values(db);

    if (!list.length) return m.reply("📭 Belum ada sesi Menfes di database.");

    let teks = `📁 *Semua Sesi Menfes* (${list.length})\n\n`;

    list.forEach((s, i) => {
      const totalChat = 1 + (s.balasan?.length || 0);
      const totalMedia = (s.mediaUrl ? 1 : 0) + (s.balasan?.filter((b) => b.mediaUrl)?.length || 0);

      teks +=
        `${i + 1} (ID: ${s.id})\n` +
        `• Dari: wa.me/${s.dari.replace("@s.whatsapp.net", "")}\n` +
        `• Ke: ${s.penerima.replace("@s.whatsapp.net", "")}\n` +
        `• Chat: ${totalChat} pesan` +
        (totalMedia > 0 ? ` (📎 ${totalMedia} media)` : "") +
        `\n` +
        `• Status: ${s.status ? "🔴 Selesai" : "🟢 Aktif"}\n\n`;
    });

    return m.reply(teks.trim());
  }
};
