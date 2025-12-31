"use strict";
import fs from "fs";
import { uploadToRHNX } from "../../lib/uploader.js";

export default {
  name: "addvn",
  alias: ["addvn", "addvoice"],
  description: "Tambahkan VN (voice note/audio) ke database dengan nama tertentu",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args[0];
    if (!name) return m.reply("⚠️ Contoh: *addvn halo* (reply ke voice note/audio)");

    const isAudio =
      (m.quoted && m.quoted.type === "audioMessage") ||
      (m.quoted && m.quoted.type && m.quoted.type.startsWith("audio/"));
    if (!isAudio) return m.reply("❌ Reply dulu ke *VN atau audio* yang mau disimpan!");

    const vnPath = "./database/storage/vn.json";
    if (!fs.existsSync(vnPath)) fs.writeFileSync(vnPath, "[]");

    const vnData = JSON.parse(fs.readFileSync(vnPath, "utf8"));
    if (vnData.some((v) => v.name === name)) {
      return m.reply(`⚠️ VN dengan nama *${name}* sudah ada!`);
    }

    try {
      const filePath = await m.quoted.downloadAndSave();
      const buffer = fs.readFileSync(filePath);
      const diUplod = await uploadToRHNX(buffer,'permanent');
      const urlVn = diUplod.url;
      
      vnData.push({
        name,
        urlVn
      });

      fs.writeFileSync(vnPath, JSON.stringify(vnData, null, 2));

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ VN *${name}* berhasil ditambahkan!\n\nURL: ${urlVn}`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      return m.reply("⚠️ Gagal menambahkan VN. Coba lagi nanti!");
    }
  }
};
