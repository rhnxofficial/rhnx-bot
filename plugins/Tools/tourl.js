import { uploadToRHNX } from "../../lib/uploader.js";

export default {
  name: "tourl",
  alias: ["tourl"],
  description: "Upload media ke RHNX & dapatkan URL",
  async run(m, { args }) {
    try {
      const opsi = args[0] === "permanent" ? "permanent" : "30";

      let buffer, filename;

      if (m.quoted) {
        buffer = await m.quoted.download();
        filename = m.quoted.filename;
      } else {
        buffer = await m.download();
        filename = m.filename;
      }

      if (!buffer) return m.reply("❌ Tidak ada media.");

      const result = await uploadToRHNX(buffer, opsi, filename);

      await m.reply(
        `✅ Upload berhasil\n` +
        `⏱ Expire: ${opsi}\n` +
        `🔗 URL: ${result.url}`
      );

    } catch (err) {
      console.error(err);
      await m.reply("❌ Gagal upload: " + (err.message || err));
    }
  }
};