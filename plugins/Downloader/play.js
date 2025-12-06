import fetch from "node-fetch";

export default {
  name: "play",
  alias: ["ytplay", "song"],
  description: "Play lagu dari judul",
  access: {
    register: true,
    limit: true,
    nocmdprivate: true,
    loading: true
  },
  async run(m, { conn, args }) {
    if (!args[0]) return m.reply("Masukkan judul lagu.\nContoh: .play judul lagu");

    const query = encodeURIComponent(args.join(" "));
    const api = `https://api.nekolabs.web.id/downloader/youtube/play/v1?q=${query}`;

    try {
      const res = await fetch(api);
      if (!res.ok) throw new Error("Gagal mengambil data API");

      const json = await res.json();
      if (!json.success) throw new Error("API gagal mengembalikan data");

      const { metadata, downloadUrl } = json.result;

      let text = `◦ *Judul* : ${metadata.title}
◦ *Channel* : ${metadata.channel}
◦ *Durasi* : ${metadata.duration}
◦ *Url* : ${metadata.url}

🎌 Audio Sedang Di Kirim ....`;
      await conn.sendThumbnail(m.chat, text, m, {
        title: `${metadata.channel}`,
        body: `${metadata.title || "-"}`,
        thumbnailUrl: metadata.cover,
        mediaUrl: metadata.url,
        sourceUrl: "",
        quoted: m
      });

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${metadata.title}.mp3`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      setReply("❌ Terjadi kesalahan saat memproses permintaan.");
    }
  }
};
