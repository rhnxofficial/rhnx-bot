import fs from "fs";

const MENFES_FILE = "./database/private/menfes.json";

export default {
  name: "detailmenfes",
  alias: ["dmf"],
  description: "Owner: lihat detail lengkap sesi Menfes",
  access: { owner: true, private: true },

  async run(m, { conn, args }) {
    if (!args[0]) return m.reply("⚠️ Masukkan ID sesi!\nContoh: .detailmenfes 123456");

    const id = args[0];
    if (!fs.existsSync(MENFES_FILE)) return m.reply("❌ DB tidak ditemukan!");

    const db = JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
    const s = db[id];
    if (!s) return m.reply("⚠️ ID tidak ditemukan!");

    let teks = `📑 *Detail Menfes*\nID: ${s.id}\n`;
    teks += `\n👤 Dari: wa.me/${s.dari.replace("@s.whatsapp.net", "")}`;
    teks += `\n🎯 Ke: wa.me/${s.penerima.replace("@s.whatsapp.net", "")}`;
    teks += `\n📌 Status: ${s.status ? "🔴 Selesai" : "🟢 Aktif"}\n\n`;

    teks += `──💌 Pesan Awal──\n`;
    teks += `${s.pesan || "-"} ${s.mediaUrl ? "(📎 Media)" : ""}\n\n`;

    if (!s.balasan || s.balasan.length === 0) {
      teks += `Tidak ada balasan.\n`;
    } else {
      teks += `──💬 Riwayat Chat──\n`;
      s.balasan.forEach((b, i) => {
        const from = b.dari === s.dari ? "Pengirim" : "Penerima";
        teks += `${i + 1}. [${from}] → ${b.text || ""} ${b.mediaUrl ? "(📎 Media)" : ""}\n`;
      });
    }

    return m.reply(teks.trim());
  }
};
