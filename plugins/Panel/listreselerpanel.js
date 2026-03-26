"use strict";

import fs from "fs";
import path from "path";

const DB_PATH = "./database/store/reselerpanel.json";

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH));
  } catch {
    return [];
  }
}

export default {
  name: "listreselerpanel",
  alias: ["listresellerpanel", "reselerpanel"],
  description: "Menampilkan daftar reseller panel",
  access: { owner: true },

  run: async (m, { conn }) => {
    const data = loadDB();

    if (!data.length) {
      return m.reply("📭 Belum ada reseller panel terdaftar.");
    }

    let teks = "📋 *DAFTAR RESELLER PANEL*\n\n";

    data.forEach((v, i) => {
      teks +=
        `*${i + 1}.* ${v.number}\n` +
        `• Status : ${v.active ? "🟢 Aktif" : "🔴 Nonaktif"}\n` +
        `• Ditambah: ${v.added_at}\n` +
        `• Oleh    : @${v.actor.split("@")[0]}\n\n`;
    });

    await conn.sendMessage(
      m.chat,
      {
        text: teks.trim(),
        mentions: data.map((v) => v.actor)
      },
      { quoted: m }
    );
  }
};
