import axios from "axios";

export default {
  name: "tiktok",
  alias: ["tt", "tiktokdl"],
  description: "Download video / photo TikTok tanpa watermark",
  access: {
    register: true,
    nocmdprivate: true,
    limit: true,
    loading: true
  },
  run: async (m, { conn, args }) => {
    const text = m.quoted?.url || args.join(" ");

    if (!text || !/https?:\/\/(www\.)?(vt\.)?tiktok\.com\/[^\s]+/i.test(text))
      return m.reply("❌ Kirim atau reply URL TikTok yang valid!");

    try {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));

      // await m.react("⏱️");

      const url = `${api.rhnx}/api/downloader/tiktok?url=${encodeURIComponent(text)}&key=${key.rhnx}`;
      const { data } = await axios.get(url);

      if (data?.status === false) {
        return m.reply("```json\n" + JSON.stringify(data, null, 2) + "\n```");
      }

      if (!data?.data) {
        return m.reply(
          "```json\n" +
            JSON.stringify({ status: false, error: "Data tidak ditemukan" }, null, 2) +
            "\n```"
        );
      }

      const t = data.data;
      const stats = t.stats || {};

      const caption = styleSans(`
 ◦ *Judul:* ${t.title || "-"}
 ◦ *Author:* ${t.author || "-"} (@${t.username || "-"})
 ◦ *Likes:* ${stats.likes || 0}
 ◦ *Saves:* ${stats.saves || 0}
 ◦ *Shares:* ${stats.shares || 0}
 ◦ *Views:* ${stats.views || 0}
 ◦ *Musik:* ${t.musicTitle || "-"} - ${t.musicAuthor || "-"}
 ◦ *Region:* ${t.region || "-"}
`);

      if (t.type === "video" && t.noWatermark) {
        await conn.sendMessage(m.chat, { video: { url: t.noWatermark }, caption }, { quoted: m });

        if (t.music) {
          await wait(1200);
          await conn.sendMessage(
            m.chat,
            { audio: { url: t.music }, mimetype: "audio/mpeg", ptt: false },
            { quoted: m }
          );
        }
      } else if (t.type === "image" && Array.isArray(t.images)) {
        for (const img of t.images) {
          await conn.sendMessage(m.chat, { image: { url: img }, caption: "" }, { quoted: m });
          await wait(600);
        }

        if (t.music) {
          await conn.sendMessage(
            m.chat,
            { audio: { url: t.music }, mimetype: "audio/mpeg", ptt: false },
            { quoted: m }
          );
        }
      } else {
        return m.reply(
          "```json\n" +
            JSON.stringify({ status: false, error: "Konten tidak dikenali" }, null, 2) +
            "\n```"
        );
      }
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        return m.reply("```json\n" + JSON.stringify(err.response.data, null, 2) + "\n```");
      }

      return m.reply(
        "```json\n" + JSON.stringify({ status: false, error: err.message }, null, 2) + "\n```"
      );
    }
  }
};
