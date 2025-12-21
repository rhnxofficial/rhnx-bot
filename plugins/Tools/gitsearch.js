import axios from "axios";

export default {
  name: "gitsearch",
  alias: ["ghsearch", "githubsearch"],
  description: "Cari repository di GitHub berdasarkan keyword",
  access: { limit: false },

  async run(m, { conn, args }) {
    const text = m.quoted?.text?.trim() || args.join(" ");
    if (!text)
      return m.reply(
        "❌ Masukkan keyword untuk mencari repository!\nContoh:\n.gitsearch whatsapp bot esm"
      );

    m.react("⏱️");

    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=5`;
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const repos = data.items || [];
      if (!repos.length) return m.reply("🚫 Tidak ditemukan repository yang cocok di GitHub.");

      let caption = `🔍 *Hasil pencarian untuk:* ${text}\n\n`;

      repos.forEach((r, i) => {
        caption += `*${i + 1}. ${r.full_name}*\n`;
        caption += `⭐ ${r.stargazers_count} | 🍴 ${r.forks_count}\n`;
        caption += `📝 ${r.description ? r.description.slice(0, 120) : "-"}\n`;
        caption += `🔗 ${r.html_url}\n\n`;
      });

      await conn.sendMessage(
        m.chat,
        {
          text: caption.trim(),
          contextInfo: {
            externalAdReply: {
              title: "GitHub Search Results",
              body: "Menampilkan hasil dari GitHub API",
              thumbnailUrl:
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
              sourceUrl: "https://github.com/search?q=" + encodeURIComponent(text)
            }
          }
        },
        { quoted: m }
      );

      m.react("✅");
    } catch (e) {
      console.error("Error GitSearch:", e);
      m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
      m.react("❌");
    }
  }
};
