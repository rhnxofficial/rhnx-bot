"use strict";

import fs from "fs";
import path from "path";

export default {
  name: "delplugin",
  alias: ["delplugin", "hapusplugin"],
  description: "Hapus plugin dari semua subfolder plugins",
  access: { owner: true },

  run: async (m, { q, prefix, command }) => {
    if (!q) {
      return m.reply(
        `📌 Example:\n${prefix + command} ai.js\n\nCukup nama file aja, bot akan cari di semua subfolder plugins.`
      );
    }

    const fileName = q.endsWith(".js") ? q : `${q}.js`;
    const baseDir = path.join("plugins");

    function findFile(dir, file) {
      const files = fs.readdirSync(dir);
      for (let f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findFile(fullPath, file);
          if (found) return found;
        } else if (f === file) {
          return fullPath;
        }
      }
      return null;
    }

    try {
      const targetPath = findFile(baseDir, fileName);

      if (!targetPath) {
        return m.reply(`❌ File tidak ditemukan di folder plugins:\n📂 ${fileName}`);
      }

      fs.unlinkSync(targetPath);
      m.reply(`✅ Plugin berhasil dihapus:\n📂 ${targetPath}`);
    } catch (e) {
      m.reply("❌ Gagal menghapus plugin: " + e.message);
    }
  }
};
