import axios from "axios";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export default {
  name: "getfilegithub",
  alias: ["getfilegh"],
  description: "Ambil isi file atau folder dari GitHub (otomatis kirim ZIP kalau folder)",
  access: { limit: true },

  async run(m, { conn, args }) {
    const text = m.quoted?.url || args.join(" ");
    if (
      !text ||
      !/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+\/(blob|tree)\/[^/]+\/.+/i.test(text)
    )
      return m.reply(
        "🙆 Kirim atau reply pesan berisi URL GitHub yang valid!\n\nContoh:\n.getraw https://github.com/ehanzdev/bot-wa/blob/main/simple.js"
      );

    m.react("⏱️");

    try {
      const [, user, repo, type, branch, ...paths] = text
        .match(/github\.com\/([^/]+)\/([^/]+)\/(blob|tree)\/([^/]+)\/(.+)/i)
        .slice(1, 6);
      const pathPart = paths.join("/");
      const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${pathPart}?ref=${branch}`;

      let { data } = await axios
        .get(apiUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/vnd.github.v3+json"
          }
        })
        .catch(() => ({ data: null }));

      if (!data) {
        const rawUrl = text
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");
        try {
          const res = await axios.get(rawUrl, { responseType: "arraybuffer" });
          const fileName = rawUrl.split("/").pop() || "file.bin";
          const filePath = `/tmp/${fileName}`;
          fs.writeFileSync(filePath, res.data);
          await conn.sendMessage(
            m.chat,
            {
              document: { url: filePath },
              mimetype: "text/plain",
              fileName,
              caption: `📄 *${fileName}*\nSumber: ${text}`
            },
            { quoted: m }
          );
          fs.unlinkSync(filePath);
          return m.react("✅");
        } catch {
          return m.reply("🚫 File atau folder tidak ditemukan di GitHub.");
        }
      }

      if (Array.isArray(data)) {
        const zipPath = `/tmp/${repo}-${Date.now()}.zip`;
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.pipe(output);

        for (const file of data) {
          if (file.type === "file" && file.download_url) {
            const res = await axios.get(file.download_url, {
              responseType: "arraybuffer"
            });
            archive.append(res.data, { name: file.path.replace(`${pathPart}/`, "") });
          }
        }

        await archive.finalize();

        await conn.sendMessage(
          m.chat,
          {
            document: { url: zipPath },
            mimetype: "application/zip",
            fileName: `${repo}-${path.basename(pathPart)}.zip`,
            caption: `📦 Folder dari *${repo}*\nPath: \`${pathPart}\``
          },
          { quoted: m }
        );

        fs.unlinkSync(zipPath);
        m.react("✅");
        return;
      }

      const rawUrl = data.download_url;
      const ext = path.extname(data.name).toLowerCase();
      const isText = /\.(js|json|txt|md|html|css|py|java|c|cpp|ts)$/i.test(ext);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext);
      const isAudio = /\.(mp3|m4a|ogg|wav)$/i.test(ext);
      const isVideo = /\.(mp4|mkv|webm)$/i.test(ext);

      if (isText) {
        const content = await axios.get(rawUrl, { responseType: "text" });
        if (content.data.length > 1500) {
          const filePath = `/tmp/${data.name}`;
          fs.writeFileSync(filePath, content.data);
          await conn.sendMessage(
            m.chat,
            {
              document: { url: filePath },
              mimetype: "text/plain",
              fileName: data.name,
              caption: `📄 *${data.name}*\nSumber: ${text}`
            },
            { quoted: m }
          );
          fs.unlinkSync(filePath);
        } else {
          await m.reply(`📂 *${data.name}*\n\n\`\`\`\n${content.data}\n\`\`\``);
        }
      } else if (isImage) {
        await conn.sendMessage(
          m.chat,
          { image: { url: rawUrl }, caption: data.name },
          { quoted: m }
        );
      } else if (isAudio) {
        await conn.sendMessage(
          m.chat,
          { audio: { url: rawUrl }, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      } else if (isVideo) {
        await conn.sendMessage(
          m.chat,
          { video: { url: rawUrl }, caption: data.name },
          { quoted: m }
        );
      } else {
        await conn.sendMessage(
          m.chat,
          {
            document: { url: rawUrl },
            fileName: data.name,
            mimetype: "text/plain",
            caption: `📦 *${data.name}*`
          },
          { quoted: m }
        );
      }

      m.react("✅");
    } catch (err) {
      console.error("❌ Error getraw:", err);
      m.reply(`⚠️ Terjadi kesalahan: ${err.message}`);
      m.react("❌");
    }
  }
};
