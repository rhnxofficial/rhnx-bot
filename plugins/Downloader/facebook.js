"use strict";

import fetch from "node-fetch";

export default {
  name: "facebook",
  alias: ["fb"],
  description: "Download video Facebook",
  access: {
    register: true,
    limit: true,
    nocmdprivate: true,
    loading: true
  },
  run: async (m, { conn, q, args, command, prefix }) => {
    const text = q || m.quoted?.url || "";
    const url = text.trim();

    const fbRegex = /^(https?:\/\/)?(www\.|m\.)?(facebook|fb)\.com\/.+/i;
    if (!url || !fbRegex.test(url))
      return m.reply(
        `❌ URL tidak valid!\nGunakan format: ${prefix + command} <url_facebook>\n\nAtau reply pesan yang berisi link Facebook.`
      );

    try {
      const apiURL = `${api.rhnx}/api/downloader/fb?url=${encodeURIComponent(url)}&key=${key.rhnx}`;

      const res = await fetch(apiURL);
      const json = await res.json();

      if (!json.status || json.status !== "success")
        return m.reply("❌ Gagal mendapatkan video. URL mungkin tidak didukung.");

      const videoHD = json.hd;
      const videoSD = json.sd;

      if (!videoHD && !videoSD) return m.reply("❌ Video tidak tersedia dalam kualitas HD/SD.");

      const finalVideo = videoHD || videoSD;
      const quality = videoHD ? "HD" : "SD";

      await conn.sendMessage(
        m.chat,
        {
          video: { url: finalVideo },
          caption: `🎌 *Berhasil mengunduh video Facebook!*\n *Kualitas:* ${quality}`
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("FB Downloader Error:", err);
      m.reply("⚠️ Terjadi kesalahan saat mengambil data. Coba lagi nanti.");
    }
  }
};
