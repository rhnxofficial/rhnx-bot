"use strict";

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const filePath = fileURLToPath(import.meta.url);

const plugin = {
  name: "case",
  alias: ["listcase", "getcase"],
  description: "Ubah teks atau kelola case text formatter",
  access: { owner: false },
  subCategories: {
    listcase: "Owner",
    getcase: "Owner"
  },
  subDescriptions: {
    listcase: "Melihat daftar case",
    getcase: "ambil csse"
  },

  run: async (m, { conn, command, q, setReply }) => {
    try {
      switch (command) {
        case "listcase":
          {
            const names = Object.keys(plugin.subCategories);
            if (names.length === 0) return setReply("📂 Belum ada case.");

            let teks = "📋 *Daftar Case:*\n\n";
            names.forEach((n, i) => {
              teks += `${i + 1}. ${n} [${plugin.subCategories[n]}]\n`;
            });
            setReply(teks);
          }
          break;

        case "getcase":
          {
            if (!q) return setReply("❌ Format: .getcase <nama>");

            const cat = plugin.subCategories[q];
            const desc = plugin.subDescriptions[q];

            if (!cat || !desc) return setReply(`❌ Case '${q}' tidak ditemukan.`);

            const content = fs.readFileSync(filePath, "utf8");
            const regex = new RegExp(`case\\s+['"\`]${q}['"\`][\\s\\S]*?break;`, "g");
            const match = content.match(regex);

            let kode = match ? match[0] : "// Tidak bisa menemukan kode case.";

            let teks = `📌 *Detail Case: ${q}*\n`;
            teks += `- Kategori : ${cat}\n`;
            teks += `- Deskripsi : ${desc}\n\n`;
            teks += `💻 *Kode Case:*\n\`\`\`js\n${kode}\n\`\`\``;

            setReply(teks);
          }
          break;

        default:
          setReply("❌ Command tidak dikenal.");
          break;
      }
    } catch (err) {
      console.error("[Case Error]", err);
      await setReply("Terjadi error saat mengeksekusi command.");
    }
  }
};

export default plugin;
