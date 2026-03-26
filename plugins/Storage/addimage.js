 "use strict";
import fs from "fs";
import { uploadToRHNX } from "../../lib/upload.js";

export default {
  name: "addimage",
  alias: ["addimg", "addimage"],
  description: "Tambahkan gambar ke database dengan nama tertentu",
  access: { owner: true },

  run: async (m, { args, conn }) => {
    try {
      const name = args[0];
      if (!name)
        return m.reply("⚠️ Contoh: *addimage kucing* (reply ke gambar)");
        
      if (!m.quoted || m.quoted.type !== "imageMessage") {
        return m.reply("❌ Reply dulu ke *gambar* yang mau disimpan!");
      }

      const imagePath = "./database/storage/image.json";
      if (!fs.existsSync(imagePath)) fs.writeFileSync(imagePath, "[]");

      const imageData = JSON.parse(fs.readFileSync(imagePath, "utf8"));

      if (imageData.some((i) => i.name === name)) {
        return m.reply(`⚠️ Gambar dengan nama *${name}* sudah ada!`);
      }

      const filePath = await m.quoted.downloadAndSave();
      if (!filePath) return m.reply("❌ Gagal menyimpan gambar");

      const result = await uploadToRHNX(filePath, "permanent");
      const urlImage = result.url;

      imageData.push({
        name,
        urlImage: urlImage
      });

      fs.writeFileSync(imagePath, JSON.stringify(imageData, null, 2));

      fs.unlink(filePath, () => {});

      await conn.sendMessage(
        m.chat,
        {
          text:
            `✅ Gambar *${name}* berhasil ditambahkan!\n\n` +
            `🔗 URL:\n${urlImage}`
        },
        { quoted: m }
      );

    } catch (e) {
      console.error(e);
      m.reply("⚠️ Gagal menambahkan gambar. Coba lagi nanti!");
    }
  }
};