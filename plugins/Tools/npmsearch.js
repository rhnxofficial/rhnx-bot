import axios from "axios";

export default {
  name: "npmsearch",
  alias: ["npminfo", "npm"],
  description: "Cari informasi package di NPM",
  access: { limit: false },

  async run(m, { conn, args }) {
    const text = m.quoted?.text?.trim() || args.join(" ");

    if (!text)
      return m.reply("❌ Masukkan nama package NPM yang ingin dicari!\nContoh: `.npm axios`");

    m.react("⏱️");

    try {
      // Ambil data dari NPM Registry
      const url = `https://registry.npmjs.org/${encodeURIComponent(text)}`;
      const { data } = await axios.get(url);

      // Ambil versi terbaru
      const latest = data["dist-tags"]?.latest || Object.keys(data.versions).pop();
      const info = data.versions[latest] || {};
      const author = info.author?.name || data.author?.name || "-";
      const homepage = info.homepage || data.homepage || `https://www.npmjs.com/package/${text}`;
      const license = info.license || data.license || "N/A";

      const caption = `
📦 *${data.name || text}*
🆕 Versi: ${latest}
👨‍💻 Author: ${author}
📄 License: ${license}
📝 Deskripsi: ${data.description || "-"}
⬇️ Instalasi:
\`\`\`bash
npm i ${data.name}
\`\`\`
🌐 ${homepage}
`.trim();

      await conn.sendMessage(
        m.chat,
        {
          text: caption,
          contextInfo: {
            externalAdReply: {
              title: data.name || text,
              body: `NPM Package Info`,
              thumbnailUrl: "https://static.npmjs.com/da3e4a3bfb8a86e86c7980a79ce0f00e.svg",
              sourceUrl: homepage
            }
          }
        },
        { quoted: m }
      );

      m.react("✅");
    } catch (e) {
      console.error("Error NPMSearch:", e);
      if (e.response?.status === 404)
        return m.reply(`🚫 Package *${text}* tidak ditemukan di NPM.`);
      m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
      m.react("❌");
    }
  }
};
