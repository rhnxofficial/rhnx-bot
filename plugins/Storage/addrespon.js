"use strict";
import fs from "fs";

export default {
  name: "addrespon",
  alias: ["addrespon", "addrsp"],
  description: "Tambahkan respon teks otomatis ke database",
  access: { group: true },
  run: async (m, { args, conn }) => {
    const input = args.join(" ");
    if (!input.includes(",")) {
      return m.reply("⚠️ Format salah!\n\nContoh: *.addrespon halo,hai juga bro!*");
    }

    const [name, ...rest] = input.split(",");
    const response = rest.join(",").trim();
    const keyword = name.trim().toLowerCase();

    if (!keyword || !response)
      return m.reply("⚠️ Format salah!\n\nContoh: *.addrespon halo,hai juga bro!*");

    const responPath = "./database/storage/respon.json";
    if (!fs.existsSync(responPath)) fs.writeFileSync(responPath, "[]");

    const responData = JSON.parse(fs.readFileSync(responPath, "utf8"));

    if (responData.some((r) => r.name === keyword && r.id === m.chat)) {
      return m.reply(`⚠️ Respon dengan kata *${keyword}* sudah ada di chat ini!`);
    }

    responData.push({
      id: m.chat,
      name: keyword,
      response
    });

    fs.writeFileSync(responPath, JSON.stringify(responData, null, 2));

    await conn.sendMessage(
      m.chat,
      { text: `✅ Respon *${keyword}* berhasil ditambahkan!\n\n💬 Balasan: ${response}` },
      { quoted: m }
    );
  }
};
