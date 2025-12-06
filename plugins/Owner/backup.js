"use strict";

import fs from "fs";
import path from "path";
import archiver from "archiver";

export default {
  name: "backup",
  alias: ["backup"],
  description: "Membuat backup file bot dalam format zip",
  access: { owner: true, nojadibot: true },
  run: async (m, { conn }) => {
    try {
      const botName = global.bot?.name || "Bot";
      const backupFile = `${botName}_${calender}.zip`;
      const jpegThumbnail = fs.readFileSync("./media/image/document.jpg");

      m.reply("⏳ Membuat backup, mohon tunggu...");

      const output = fs.createWriteStream(backupFile);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", async () => {
        const totalSize = await FileSize(archive.pointer());
        await m.reply(`✅ Backup selesai\n📦 Ukuran: ${totalSize}`);

        await conn.sendMessage(
          m.sender,
          {
            document: fs.readFileSync(backupFile),
            jpegThumbnail,
            mimetype: "application/zip",
            fileName: backupFile
          },
          { quoted: m }
        );

        fs.unlinkSync(backupFile);
      });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(output);

      function addFilesAndFolders(dirPath, archive) {
        const items = fs.readdirSync(dirPath);
        const exclude = [
          "node_modules",
          ".git",
          ".config",
          ".pm2",
          "package-lock.json",
          ".heroku",
          ".profile.d",
          "vendor",
          ".npm"
        ];

        for (const item of items) {
          const fullPath = path.join(dirPath, item);

          if (fs.statSync(fullPath).isDirectory()) {
            if (!exclude.includes(item)) {
              archive.directory(fullPath, item);
            }
          } else if (!fullPath.endsWith(".xml")) {
            archive.file(fullPath, { name: item });
          }
        }
      }

      addFilesAndFolders(".", archive);
      await archive.finalize();
    } catch (e) {
      m.reply("❌ Gagal membuat backup: " + e.message);
    }
  }
};

async function FileSize(number) {
  const SI_POSTFIXES = ["B", "KB", "MB", "GB", "TB"];
  const tier = (Math.log10(Math.abs(number)) / 3) | 0;
  if (tier === 0) return number + " B";
  const postfix = SI_POSTFIXES[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = number / scale;
  let formatted = scaled.toFixed(1).replace(".", ",");
  if (/\,0$/.test(formatted)) formatted = formatted.slice(0, -2);
  return formatted + " " + postfix;
}
