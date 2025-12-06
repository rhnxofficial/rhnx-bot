"use strict";

import fs from "fs";
import path from "path";

export default {
  name: "getplugin",
  alias: ["getplugin", "pluginget"],
  description: "Ambil plugin dari semua subfolder plugins",
  access: { owner: true, nojadibot: true },
  run: async (m, { q, conn, prefix, command }) => {
    if (!q) {
      return m.reply(
        `📌 Example:\n${prefix + command} menu\n📌 Example:\n${prefix + command} menu -text\n\nCukup ketik nama file, bot akan cari di semua subfolder plugins.`
      );
    }

    const parts = q.split(" ");
    const fileName = parts[0].endsWith(".js") ? parts[0] : `${parts[0]}.js`;
    const asText = parts.includes("-text");
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

      if (asText) {
        const code = fs.readFileSync(targetPath, "utf-8");
        conn.sendMessage(m.chat, { text: "```" + code + "```" }, { quoted: m });
      } else {
        await conn.sendMessage(
          m.chat,
          {
            document: fs.readFileSync(targetPath),
            fileName: path.basename(targetPath),
            mimetype: "application/javascript"
          },
          { quoted: m }
        );
      }
    } catch (e) {
      m.reply("❌ Gagal mengambil plugin: " + e.message);
    }
  }
};
