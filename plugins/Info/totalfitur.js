"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsDir = path.join(process.cwd(), "plugins");

export default {
  name: "totalfitur",
  alias: ["totalcmd", "fitur"],
  description: "Menampilkan total semua fitur bot (bisa filter private/store)",
  run: async (m, { conn, args }) => {
    let mode = args[0]?.toLowerCase() || "all";
    let total = 0;
    let folderCount = 0;

    const folders = fs
      .readdirSync(pluginsDir)
      .filter((f) => fs.statSync(path.join(pluginsDir, f)).isDirectory());
    folderCount = folders.length;

    for (const folder of folders) {
      const folderPath = path.join(pluginsDir, folder);
      const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

      for (const file of files) {
        try {
          const { default: plugin } = await import(pathToFileURL(path.join(folderPath, file)).href);
          if (!plugin) continue;
          if (mode === "private" && !plugin.access?.private) continue;
          if (mode === "store" && !plugin.access?.groupstore) continue;

          if (plugin.subCategories) {
            total += Object.keys(plugin.subCategories).length;
          } else {
            total++;
          }
        } catch (err) {
          console.error(`❌ Gagal load plugin ${file}:`, err.message);
        }
      }
    }

    let titleMode = mode === "private" ? "(PRIVATE)" : mode === "store" ? "(STORE)" : "";

    const teks = styleSmallCaps(
      `乂  *F E A T U R E S ${titleMode}*\n\n` +
        `◦ Total Folder : ${folderCount}\n` +
        `◦ Total Fitur  : ${total}\n\n` +
        (mode === "private"
          ? `Fitur khusus mode private yang aktif.`
          : mode === "store"
            ? `Fitur khusus group store yang aktif.`
            : `Terhitung dari semua file di folder "plugins/"`)
    );

    await m.reply(teks);
  }
};
