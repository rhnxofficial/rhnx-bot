import axios from "axios";

export default {
  name: "ghuser",
  alias: ["githubuser", "ghprofile"],
  description: "Lihat informasi profil GitHub user",
  access: { limit: false },

  async run(m, { conn, args }) {
    const text = m.quoted?.text?.trim() || args.join(" ");
    if (!text) return m.reply("❌ Masukkan username GitHub!\nContoh: `.ghuser rhnxofficial`");

    m.react("⏱️");

    try {
      const url = `https://api.github.com/users/${encodeURIComponent(text)}`;
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      if (!data || data.message === "Not Found")
        return m.reply(`🚫 User *${text}* tidak ditemukan di GitHub.`);

      const caption = `
👤 *${data.name || data.login}* (@${data.login})
🧭 ID: ${data.id}
📝 Bio: ${data.bio || "-"}
🏙️ Lokasi: ${data.location || "-"}
🏢 Perusahaan: ${data.company || "-"}
📦 Public Repo: ${data.public_repos}
👥 Followers: ${data.followers}
👣 Following: ${data.following}
📅 Dibuat: ${new Date(data.created_at).toLocaleDateString("id-ID")}
🔗 ${data.html_url}
`.trim();

      await conn.sendMessage(
        m.chat,
        {
          text: caption,
          contextInfo: {
            externalAdReply: {
              title: `${data.login}`,
              body: "GitHub User Info",
              thumbnailUrl: data.avatar_url,
              sourceUrl: data.html_url
            }
          }
        },
        { quoted: m }
      );

      m.react("✅");
    } catch (e) {
      console.error("Error GHUser:", e);
      m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
      m.react("❌");
    }
  }
};
