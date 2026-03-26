"use strict";

import axios from "axios";

export default {
  name: "play",
  alias: ["ytplay", "song"],
  description: "Play lagu dari judul (Izumi API)",
  access: {
    register: true,
    nocmdprivate: true,
    limit: true,
    loading: true
  },

  async run(m, { conn, args }) {
    if (!args.length) {
      return m.reply("Masukkan judul lagu.\nContoh: .play DJ Remix");
    }

    try {
      const query = args.join(" ");

      /* =========================
         1️⃣ REQUEST API
      ========================== */
      const apiUrl =
        "https://api.ootaizumi.web.id/downloader/youtube/play";

      const { data } = await axios.get(apiUrl, {
        params: {
          query: query
        },
        timeout: 20000
      });

      if (!data.status || !data.result) {
        return m.reply("Lagu tidak ditemukan.");
      }

      const res = data.result;

      
      const text = `◦ *Judul* : ${res.title}
◦ *Channel* : ${res.author?.name || "-"}
◦ *Durasi* : ${res.timestamp}
◦ *Views* : ${res.views?.toLocaleString() || "-"}
◦ *Upload* : ${res.ago}
◦ *Url* : ${res.url}

🎧 Audio sedang dikirim...`;

      await conn.sendThumbnail(m.chat, text, m, {
        title: res.title,
        body: res.author?.name || "-",
        thumbnailUrl: res.thumbnail,
        mediaUrl: res.url,
        sourceUrl: res.url,
        quoted: m
      });

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: res.download },
          mimetype: "audio/mpeg",
          fileName: `${res.title}.mp3`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("PLAY ERROR:", err.response?.data || err.message);
      m.reply("Terjadi kesalahan saat memproses lagu.");
    }
  }
};