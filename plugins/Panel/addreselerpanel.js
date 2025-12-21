"use strict";

import fs from "fs";
import path from "path";

const DB_PATH = "./database/store/reselerpanel.json";

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  }
}

function loadDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function formatDate() {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta"
  });
}

export default {
  name: "addreselerpanel",
  description: "Menambahkan reseller panel",
  access: { owner: true },

  run: async (m, { conn, args }) => {
    try {
      let number;

      if (m.quoted?.sender) {
        number = m.quoted.sender.split("@")[0];
      } else if (args[0]) {
        number = args[0].replace(/[^0-9]/g, "");
      }

      if (!number || number.length < 8) {
        return m.reply(
          "❌ *Format salah*\n\n" +
            "Gunakan:\n" +
            "• `.addreselerpanel 628xxxx`\n" +
            "• reply chat target"
        );
      }

      const jid = `${number}@s.whatsapp.net`;

      const cek = (await conn.onWhatsApp(number))[0];
      if (!cek?.exists) {
        return m.reply("❌ Nomor tidak terdaftar di WhatsApp.");
      }

      const db = loadDB();
      if (db.some((v) => v.number === number)) {
        return m.reply("⚠️ Nomor ini sudah terdaftar sebagai reseller panel.");
      }

      const resellerData = {
        id: Date.now(),
        number,
        jid,
        added_at: formatDate(),
        actor: m.sender,
        active: true
      };

      db.push(resellerData);
      saveDB(db);

      const notifReseller = `🎉 *SELAMAT!*

Kamu telah ditambahkan sebagai
*RESELLER PANEL* ✅

▸ Nomor: ${number}
▸ Tanggal: ${resellerData.added_at}

⚠️ *INFO PENTING*
• Status reseller: AKTIF
• Gunakan akses dengan bijak
• Hubungi owner jika ada kendala

Terima kasih telah bergabung 🤝`;

      await conn.sendMessage(jid, { text: styleText(notifReseller) }).catch(() => {});

      const ownerText =
        `✅ *Reseller Panel Berhasil Ditambahkan!*\n\n` +
        `▸ Nomor: ${number}\n` +
        `▸ Ditambahkan oleh: @${m.sender.split("@")[0]}`;

      await conn.sendMessage(
        m.chat,
        {
          text: styleText(ownerText),
          mentions: [m.sender]
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ addreselerpanel error:", err);
      m.reply("❌ Gagal menambahkan reseller panel.");
    }
  }
};
