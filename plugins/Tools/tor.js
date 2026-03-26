import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export default {
  name: "tor",
  alias: ["tor"],
  description: "Upload media ke RHNX & dapatkan URL",
  async run(m, { conn, args }) {

    // ======= FUNCTION UPLOAD =======
    async function upload(file, opsi = "30", filename = "file.jpg") {
      const form = new FormData();
      const expire = opsi === "permanent" ? "0" : "30";

      if (Buffer.isBuffer(file)) {
        form.append("file", file, filename);
      } else if (typeof file === "string") {
        form.append("file", fs.createReadStream(file));
      } else {
        throw new Error("file harus berupa path atau Buffer");
      }

      form.append("expire", expire);

      try {
        const res = await axios.post(
          "https://cdn.rhnx.xyz/upload",
          form,
          { headers: form.getHeaders(), maxBodyLength: Infinity, timeout: 30000 }
        );
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.error || err.message);
      }
    }
    // ===== END FUNCTION UPLOAD =====

    try {
      // 1️⃣ Ambil file dari pesan atau reply
      let savedFile;
      if (m.quoted) {
        savedFile = await m.quoted.downloadAndSave();
      } else {
        savedFile = await m.downloadAndSave();
      }

      if (!savedFile) return m.reply("❌ Tidak ada media untuk diupload.");

      // 2️⃣ Baca file ke buffer
      const buffer = fs.readFileSync(savedFile);

      // 3️⃣ Tentukan opsi expire
      const opsi = args[0] === "permanent" ? "permanent" : "30";

      // 4️⃣ Upload
      const result = await upload(buffer, opsi, savedFile);

      // 5️⃣ Kirim URL ke user
      let replyText = `✅ File berhasil di-upload!\nURL: ${result.url}`;
      if (opsi === "30") replyText += `\n⏳ Auto delete in 30s`;

      await m.reply(replyText);

      // 6️⃣ Cleanup local file
      fs.unlink(savedFile, () => {});

    } catch (err) {
      console.error(err);
      await m.reply("❌ Gagal upload file: " + (err.message || err));
    }
  }
};