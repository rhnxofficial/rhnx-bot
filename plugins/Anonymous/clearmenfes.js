import fs from "fs";
const MENFES_FILE = "./database/private/menfes.json";

export default {
  name: "clearmenfes",
  description: "Hapus semua data Menfess",
  access: { private: true, owner: true },
  run: async (m, { conn }) => {
    try {
      if (!fs.existsSync(MENFES_FILE)) {
        return m.reply("📭 Tidak ada file database Menfess yang ditemukan.");
      }
      fs.writeFileSync(MENFES_FILE, JSON.stringify({}, null, 2));

      await m.reply(
        "✅ *Berhasil menghapus semua data Menfess!*\n\nDatabase sudah dikosongkan sepenuhnya."
      );

      console.log("[SYSTEM] Semua data Menfess telah dihapus oleh owner.");
    } catch (e) {
      console.error(e);
      m.reply("⚠️ Terjadi kesalahan saat menghapus data Menfess.");
    }
  }
};
