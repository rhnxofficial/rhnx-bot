"use strict";

import fs from "fs";
import path from "path";

export default {
  name: "addplugin",
  alias: ["addplugin", "pluginadd"],
  description: "Tambah plugin baru dengan reply kode",
  access: { owner: true },
  run: async (m, { conn, q, command, prefix }) => {
    if (!q) {
      return m.reply(
        `📌 Example:\n${prefix + command} Owner/menu.js\n\nReply pesan berisi kode JS untuk disimpan.`
      );
    }

    if (!m.quoted || !m.quoted.text) {
      return m.reply("❌ Reply sebuah pesan yang berisi code JS!");
    }

    const filePath = q.endsWith(".js") ? q : `${q}.js`;
    const savePath = path.join("plugins", filePath);

    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, m.quoted.text, "utf-8");

    m.reply(`✅ Plugin tersimpan:\n📂 ${savePath}`);
  }
};
