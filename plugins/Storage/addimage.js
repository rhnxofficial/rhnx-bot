"use strict";
import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

export default {
  name: "addimage",
  alias: ["addimg", "addimage"],
  description: "Tambahkan gambar ke database dengan nama tertentu",
  access: { owner: true },
  run: async (m, { args, conn }) => {
    const name = args[0];
    if (!name) return m.reply("⚠️ Contoh: *addimage kucing* (reply ke gambar)");

    const isImage = m.quoted && m.quoted.type === "imageMessage";
    if (!isImage) return m.reply("❌ Reply dulu ke *gambar* yang mau disimpan!");

    const imagePath = "./database/storage/image.json";
    if (!fs.existsSync(imagePath)) fs.writeFileSync(imagePath, "[]");

    const imageData = JSON.parse(fs.readFileSync(imagePath, "utf8"));

    if (imageData.some((i) => i.name === name)) {
      return m.reply(`⚠️ Gambar dengan nama *${name}* sudah ada!`);
    }

    try {
      const filePath = await m.quoted.downloadAndSave();
      const buffer = fs.readFileSync(filePath);

      const urlImage = await uploadToGithub(buffer);

      imageData.push({
        name,
        urlImage
      });

      fs.writeFileSync(imagePath, JSON.stringify(imageData, null, 2));

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Gambar *${name}* berhasil ditambahkan!\n\nURL: ${urlImage}`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      return m.reply("⚠️ Gagal menambahkan gambar. Coba lagi nanti!");
    }
  }
};
