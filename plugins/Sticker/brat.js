"use strict";
import axios from "axios";

export default {
  name: "brat",
  alias: ["bratsticker"],
  desc: "Buat sticker dari teks dengan API Brat",
  run: async (m, { q, conn, setReply }) => {
    try {
      if (!q) throw `*• Example:* brat [text]`;
      m.react("⏳");
      const url = `${api.rhnx}/api/sticker/brat?text=${encodeURIComponent(q)}&key=${key.rhnx}`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(res.data, "binary");

      await conn.sendSticker(m.chat, buffer, m, {
        packname: sticker.packname,
        author: sticker.author
      });
    } catch (err) {
      console.error(err);
      m.reply("⚠️ Gagal membuat sticker Brat!");
    }
  }
};
