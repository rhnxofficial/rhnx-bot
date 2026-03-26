import fs from "fs";

export default {
  name: "getfile",
  alias: ["getf"],
  description: "Ambil file dari direktori bot (support .js, .json, .jpg, .mp4, dll)",
  tags: ["owner"],
  access: { owner: true },

  run: async (m, { conn, q, setReply }) => {
    if (!q)
      return setReply(
        "Mau cari file apa?\n\nContoh:\n*.getfile group.js*\nTambah *-text* di akhir untuk kirim sebagai teks."
      );

    let teks = q.replace("-text", "").trim();
    let text = q.endsWith("-text");

    let format = teks.split(".").pop(); // aman untuk file.ber.titik.js

    if (!format)
      return setReply("Tipe file tidak diketahui. Gunakan ekstensi js, json, jpg, mp4, dll.");

    let mimetype =
      format === "js"
        ? "text/javascript"
        : format === "json"
          ? "application/json"
          : "application/octet-stream";

    let jpegThumbnail = fs.existsSync("./media/image/docMiku.jpg")
      ? fs.readFileSync("./media/image/docMiku.jpg")
      : null;

    m.reply("📂 *Getting File...*");

    async function getFolder() {
      let folders = fs
        .readdirSync(process.cwd(), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      // filter folder yang dibolehkan
      let arrayBaru = folders.filter(
        (kata) =>
          !kata.startsWith("node_modules") &&
          !kata.startsWith(".cache") &&
          !kata.startsWith(".lesson")
      );

      return arrayBaru;
    }

    // 1️⃣ cek file di root
    let ada = false;
    let dir = fs.existsSync(`./${teks}`);

    if (dir && text) {
      ada = true;
      return conn.sendMessage(
        m.chat,
        { text: fs.readFileSync(`./${teks}`, "utf-8") },
        { quoted: m }
      );
    }

    if (dir) {
      ada = true;
      return conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(`./${teks}`),
          fileName: teks,
          mimetype,
          jpegThumbnail
        },
        { quoted: m }
      );
    }

    // 2️⃣ cek folder lain
    let folders = await getFolder();

    for (let i of folders) {
      let filePath = `./${i}/${teks}`;

      if (fs.existsSync(filePath)) {
        ada = true;
        let file = fs.readFileSync(filePath);

        if (["mp4", "mkv"].includes(format)) {
          return conn.sendMessage(m.chat, { video: file }, { quoted: m });
        }

        if (["jpg", "jpeg", "png"].includes(format)) {
          return conn.sendMessage(m.chat, { image: file }, { quoted: m });
        }

        if (text) {
          return m.reply(fs.readFileSync(filePath, "utf-8"));
        }

        return conn.sendMessage(
          m.chat,
          { document: file, fileName: teks, mimetype, jpegThumbnail },
          { quoted: m }
        );
      }
    }

    if (!ada) return setReply(`❌ File *${teks}* tidak ditemukan di direktori manapun.`);
  }
};
