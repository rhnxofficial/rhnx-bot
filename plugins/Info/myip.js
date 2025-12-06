"use strict";

import axios from "axios";

export default {
  name: "myip",
  alias: ["cekip", "ipku"],
  description: "Menampilkan IP publik pengguna",
  tags: ["tools"],
  access: { private: true },
  run: async (m, { conn, q }) => {
    try {
      const { data } = await axios.get("https://api.ipify.org");

      await conn.sendMessage(
        m.chat,
        {
          text: `🌐 IP publik kamu adalah: ${data}`
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error mendapatkan IP:", error);
      await conn.sendMessage(
        m.chat,
        {
          text: `⚠️ Terjadi kesalahan saat mengambil IP.\n${error.message}`
        },
        { quoted: m }
      );
    }
  }
};
