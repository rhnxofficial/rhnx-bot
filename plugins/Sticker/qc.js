import fs from "fs";
import axios from "axios";
import { exec } from "child_process";
import { uploadImage } from "../../lib/uploader.js";

export default {
  name: "qc",
  desc: "Buat quote dari teks, gambar, atau sticker",
  async run(m, { conn, args }) {
    try {
      const randomColor = [
        "#ef1a11",
        "#89cff0",
        "#660000",
        "#87a96b",
        "#e9f6ff",
        "#ffe7f7",
        "#ca86b0",
        "#83a3ee",
        "#abcc88",
        "#80bd76",
        "#6a84bd",
        "#5d8d7f",
        "#530101",
        "#863434",
        "#013337",
        "#133700",
        "#2f3641",
        "#cc4291",
        "#7c4848",
        "#8a496b",
        "#722f37",
        "#0fc163",
        "#2f3641",
        "#e7a6cb",
        "#64c987",
        "#e6e6fa"
      ];

      const apiColor = randomColor[Math.floor(Math.random() * randomColor.length)];
      const quoted = m.quoted;
      const isImage = m.type === "imageMessage" || (quoted && quoted.type === "imageMessage");
      const isSticker = m.type === "stickerMessage" || (quoted && quoted.type === "stickerMessage");
      const isText = m.type === "conversation" || m.type === "extendedTextMessage";

      const dia = quoted?.sender || m.sender;
      const name = m.pushName;
      const avatar = await conn
        .profilePictureUrl(dia, "image")
        .catch(() => "https://telegra.ph/file/89c1638d9620584e6e140.png");

      const getRandomFile = (ext) => `./temp/${Math.floor(Math.random() * 9999)}${ext}`;

      // tentuin teks-nya
      let teks;
      if (args.length > 0) {
        teks = args.join(" ");
      } else if (quoted && quoted.text && !m.text.endsWith("qc")) {
        teks = quoted.text;
      } else {
        teks = m.text?.replace(/^\.qc\s*/, "") || "";
      }

      if (!teks && !isImage && !isSticker)
        return m.reply("Kirim atau reply teks, gambar, atau stiker untuk membuat quote!");
      m.react("⏳");

      const generateQuote = async (imageUrl) => {
        const json = {
          type: "quote",
          format: "png",
          backgroundColor: apiColor,
          width: 512,
          height: 768,
          scale: 2,
          messages: [
            {
              entities: "auto",
              media: imageUrl ? { url: imageUrl } : undefined,
              avatar: true,
              from: { id: Math.floor(Math.random() * 10), name, photo: { url: avatar } },
              text: teks,
              replyMessage: {}
            }
          ]
        };
        const { data } = await axios
          .post("https://bot.lyo.su/quote/generate", json, {
            headers: { "Content-Type": "application/json" }
          })
          .catch((e) => e.response || {});
        if (!data.ok) throw data;
        return Buffer.from(data.result.image, "base64");
      };

      let buffer;
      if (isImage) {
        const media = quoted ? await quoted.download() : await m.download();
        const imageUrl = await uploadImage(media);
        buffer = await generateQuote(imageUrl);
      } else if (isSticker) {
        const media = quoted ? await quoted.download() : await m.download();
        const tmpPath = getRandomFile(".webp");
        const pngPath = getRandomFile(".png");
        fs.writeFileSync(tmpPath, media);

        await new Promise((resolve, reject) => {
          exec(`ffmpeg -i ${tmpPath} ${pngPath}`, (err) => {
            fs.unlinkSync(tmpPath);
            if (err) reject(err);
            else resolve();
          });
        });

        const imageBuffer = fs.readFileSync(pngPath);
        const imageUrl = await uploadImage(imageBuffer);
        buffer = await generateQuote(imageUrl);
        fs.unlinkSync(pngPath);
      } else if (isText) {
        buffer = await generateQuote();
      }

      await conn.sendSticker(m.chat, buffer, m, {
        packname: styleSans(`${m.pushName}`),
        author: styleSans(sticker.author)
      });
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat membuat quote!");
    }
  }
};
