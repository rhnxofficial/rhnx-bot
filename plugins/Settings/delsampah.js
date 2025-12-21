import fs from "fs";
import path from "path";

export default {
  name: "delsampah",
  description: "Menghapus semua file sampah (media) di folder utama dan ./temp",
  access: { owner: true },

  run: async (m) => {
    try {
      const targetDirs = ["./", "./temp"];
      const exts = [
        ".gif",
        ".png",
        ".mp3",
        ".mp4",
        ".jpg",
        ".webp",
        ".webm",
        ".opus",
        ".jpeg",
        ".ogg"
      ];

      let totalDeleted = 0;
      let totalFound = 0;
      let reportText = "🧹 *Pembersihan File Sampah*\n\n";

      for (const dir of targetDirs) {
        const directoryPath = path.resolve(dir);
        if (!fs.existsSync(directoryPath)) continue;

        const files = fs.readdirSync(directoryPath);
        const filteredFiles = files.filter((file) => exts.some((ext) => file.endsWith(ext)));

        totalFound += filteredFiles.length;

        if (filteredFiles.length > 0) {
          reportText += `📁 *${dir}* → ${filteredFiles.length} file ditemukan:\n`;
          filteredFiles.forEach((file, i) => {
            reportText += `   ${i + 1}. ${file}\n`;
            fs.unlinkSync(path.join(directoryPath, file));
            totalDeleted++;
          });
          reportText += "\n";
        }
      }

      if (totalFound === 0) {
        return m.reply("✨ Tidak ada file sampah ditemukan, semua sudah bersih!");
      }

      reportText += `✅ *Berhasil menghapus ${totalDeleted} file sampah dari ${targetDirs.length} folder.*`;
      await m.reply(reportText);
    } catch (err) {
      console.error("Error saat menghapus file:", err);
      await m.reply("❌ Terjadi kesalahan saat menghapus file: " + err.message);
    }
  }
};
