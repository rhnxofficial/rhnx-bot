"use strict";

import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

export default {
  name: "tourl",
  alias: ["tourl"],
  description: "Upload media ke GitHub & dapatkan URL",
  async run(m, { conn }) {
    try {
      let savedFile;

      if (m.quoted) {
        savedFile = await m.quoted.downloadAndSave();
      } else {
        savedFile = await m.downloadAndSave();
      }

      if (!savedFile) return m.reply("❌ Tidak ada media untuk diupload.");

      const buffer = fs.readFileSync(savedFile);

      const url = await uploadToGithub(buffer);

      fs.unlinkSync(savedFile);

      if (url) {
        m.reply(`✅ Media berhasil diupload:\n${url}`);
      } else {
        m.reply("❌ Gagal upload media ke GitHub.");
      }
    } catch (e) {
      console.error("tourl error:", e);
      m.reply("❌ Terjadi kesalahan saat upload media.");
    }
  }
};
