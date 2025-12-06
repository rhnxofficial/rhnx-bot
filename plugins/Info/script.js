import fetch from "node-fetch";

export default {
  name: "script",
  alias: ["sc"],
  description: "Menampilkan informasi script bot dari GitHub",

  async run(m, { conn }) {
    let apiUrl = "https://api.github.com/repos/rhnxofficial/rhnx-bot-esm";

    try {
      let res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Gagal mengambil data GitHub");

      let json = await res.json();

      let text = `
📦 *SCRIPT BOT WHATSAPP*

✨ *Nama Repo:* ${json.name}
👤 *Owner:* ${json.owner?.login}
📝 *Deskripsi:* ${json.description || "-"}
⭐ *Stars:* ${json.stargazers_count}
🍴 *Forks:* ${json.forks_count}
📁 *Size:* ${json.size} KB
🆔 *Visibility:* ${json.visibility}
📅 *Update Terakhir:* ${new Date(json.updated_at).toLocaleString("id-ID")}

🌐 *GitHub URL:* 
${json.html_url}

📥 *Download ZIP:* 
${json.html_url}/archive/refs/heads/main.zip
`.trim();

      return conn.sendThumbnail(m.chat, text, m, {
        title: `${json.name}`,
        body: `${json.description || "-"}`,
        thumbnailUrl: image.default,
        mediaUrl: sosmed.youtube,
        sourceUrl: "",
        quoted: m
      });
    } catch (e) {
      console.error(e);
      return m.reply("⚠️ Gagal mengambil data GitHub. Coba lagi nanti.");
    }
  }
};
