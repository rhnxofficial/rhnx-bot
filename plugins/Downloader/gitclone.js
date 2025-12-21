import axios from "axios";

export default {
  name: "gitclone",
  alias: ["git", "githubdl"],
  description: "Download repository GitHub dalam bentuk ZIP",
  access: { limit: true },
  async run(m, { conn, args }) {
    const text = m.quoted?.url || args.join(" ");

    if (!text || !/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/i.test(text))
      return m.reply(
        "Kirim atau reply URL repository GitHub yang valid!\nContoh: `.gitclone https://github.com/rhnxofficial/bot-wa`"
      );

    m.react("⏱️");

    try {
      const cleanUrl = text
        .split("?")[0]
        .replace(/\.git$/, "")
        .replace(/\/$/, "");
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
      if (!match) return m.reply("⚠️ URL GitHub tidak valid.");

      const [_, user, repo] = match;

      let branch = "main";
      let zipUrl = `https://github.com/${user}/${repo}/archive/refs/heads/${branch}.zip`;

      let res = await axios.head(zipUrl).catch(() => null);

      if (!res || res.status !== 200) {
        branch = "master";
        zipUrl = `https://github.com/${user}/${repo}/archive/refs/heads/${branch}.zip`;
        res = await axios.head(zipUrl).catch(() => null);

        if (!res || res.status !== 200)
          return m.reply(
            `⚠️ Tidak bisa menemukan cabang *main* maupun *master*.\nPastikan repo publik dan memiliki branch utama.`
          );
      }

      await conn.sendMessage(
        m.chat,
        {
          document: { url: zipUrl },
          mimetype: "application/zip",
          fileName: `${repo}-${branch}.zip`,
          caption: styleText(`◦ Repo: ${user}/${repo}\n◦ Branch: ${branch}\n◦ ${cleanUrl}`)
        },
        { quoted: m }
      );

      m.react("✅");
    } catch (err) {
      console.error("Error GitClone:", err);
      m.reply(`⚠️ Terjadi kesalahan: ${err.message}`);
      m.react("❌");
    }
  }
};
