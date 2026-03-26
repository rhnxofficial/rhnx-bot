export default {
  name: "igdl",
  alias: ["ig", "instagram"],
  description: "Download media dari Instagram",
  access: {
    register: true,
    limit: true,
    nocmdprivate: true,
    loading: true
  },
  async run(m, { conn, args }) {
    try {
      const text = m.quoted?.url || args.join(" ");

      if (!text || !/https?:\/\/(www\.)?instagram\.com\/[^\s]+/i.test(text)) {
        return m.reply("❌ Kirim atau reply pesan yang berisi URL Instagram yang valid!");
      }
      const apiUrl = `${api.rhnx}/api/downloader/ig?url=${encodeURIComponent(text)}&key=${key.rhnx}`;

      let res = await fetch(apiUrl);
      let json = await res.json();

      if (!json.success || !json.media) {
        return m.reply("❌ Gagal mengambil media dari Instagram.");
      }

      const caption = styleText(`
🎌 *Type:* ${json.type}
◦ *Caption:* ${json.caption || "-"}
◦ *User:* ${json.username || "-"}
◦ *Likes:* ${json.likes || "-"}
◦ *Comments:* ${json.comments || "-"}
`);

      const media = json.media;

      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        const cap = i === 0 ? caption : "";

        if (item.type === "video") {
          await conn.sendMessage(m.chat, { video: { url: item.url }, caption: cap }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { image: { url: item.url }, caption: cap }, { quoted: m });
        }
      }
    } catch (err) {
      console.error(err);
      m.reply("❌ Terjadi kesalahan pada server IG Downloader.");
    }
  }
};
