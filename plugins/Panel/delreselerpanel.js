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

function saveDB(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export default {
  name: "delreselerpanel",
  description: "Menghapus reseller panel (permanen)",
  access: { owner: true },

  run: async (m, { conn, args }) => {
    try {
      let number;

      if (m.quoted?.sender) {
        number = m.quoted.sender.split("@")[0];
      } else if (args[0]) {
        number = args[0].replace(/[^0-9]/g, "");
      }

      if (!number) {
        return m.reply(
          "❌ *Format salah*\n\n" +
            "Gunakan:\n" +
            "• `.delreselerpanel 628xxxx`\n" +
            "• reply chat target"
        );
      }

      const data = loadDB();
      const index = data.findIndex((v) => v.number === number);

      if (index === -1) {
        return m.reply("⚠️ Nomor ini tidak terdaftar sebagai reseller panel.");
      }

      const removed = data[index];
      data.splice(index, 1);
      saveDB(data);

      const notif = `⚠️ *Akses Reseller Panel Di Cabut*

▸ Nomor: ${number}
▸ Tanggal: ${new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta"
      })}

Jika ini kesalahan, silakan hubungi owner.`;

      await conn.sendMessage(removed.jid, { text: styleText(notif) }).catch(() => {});

      await conn.sendMessage(
        m.chat,
        {
          text:
            `🗑️ *Reseller Panel Dihapus Permanen*\n\n` +
            `▸ Nomor: ${number}\n` +
            `▸ Oleh: @${m.sender.split("@")[0]}`,
          mentions: [m.sender]
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ delreselerpanel error:", err);
      m.reply("❌ Gagal menghapus reseller panel.");
    }
  }
};
