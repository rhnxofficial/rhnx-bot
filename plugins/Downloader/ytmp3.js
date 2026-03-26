import fetch from "node-fetch";

export default {
  name: "ytmp3",
  alias: ["yta", "mp3"],
  description: "Download audio dari YouTube",
  access: {
    limit: true,
    nocmdprivate: true,
    loading: true,
    register: true
  },
  async run(m, { conn, args, setReply }) {
    const pesan = m.quoted?.url || args.join(" ");

    if (!pesan[0]) return setReply("Masukkan URL YouTube\nContoh: .ytmp3 https://youtu.be/xxxx");

    const urlPesan = pesan;
    const apiUrl = `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(urlPesan)}&format=mp3`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Gagal mengambil data API");

      const json = await res.json();
      if (!json.success) throw new Error("API gagal mengembalikan data");

      const { title, duration, cover, quality, downloadUrl } = json.result;

      let text = styleText(` ◦ *Judul:* ${title}
◦ *Durasi:* ${duration}
◦ *Quality:* ${quality}kbps
◦ *URL:* ${urlPesan}

🎌 Sanding Audio...`);
      await conn.sendThumbnail(m.chat, text, m, {
        title: `${title}`,
        body: "",
        thumbnailUrl: cover,
        mediaUrl: urlPesan,
        sourceUrl: "",
        quoted: m
      });
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        },
        { quoted: m }
      );
    } catch (err) {
      console.log(err);
      setReply("❌ Terjadi kesalahan saat mengambil audio.");
    }
  }
};
