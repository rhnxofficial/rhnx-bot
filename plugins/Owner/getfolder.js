import fs from "fs-extra";
import archiver from "archiver";

export default {
  name: "getfolder",
  alias: ["zipfolder", "folderzip"],
  description: "Ambil folder sebagai file ZIP",
  tags: ["owner"],
  access: { owner: true, nojadibot: true },
  run: async (m, { conn, q, setReply }) => {
    let mimetype = "application/zip";
    let name = `${q}.zip`;
    let jpegThumbnail = fs.readFileSync("./media/image/document.jpg");

    if (!q) {
      return setReply("📌 Example:\n.getfolder plugins");
    }

    try {
      let folderPath = `./${q}`;
      let folderExists = await fs.pathExists(folderPath);
      if (!folderExists) return m.reply("❌ Folder tidak ditemukan.");

      m.reply("⏳ Sedang membuat file ZIP, tunggu sebentar...");

      let output = fs.createWriteStream(name);
      let archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(folderPath, false);
      await archive.finalize();

      output.on("close", async () => {
        let file = fs.readFileSync(name);
        await conn.sendMessage(
          m.chat,
          { document: file, fileName: name, mimetype, jpegThumbnail },
          { quoted: m }
        );
        fs.unlinkSync(name);
      });
    } catch (error) {
      console.error(error);
      m.reply(`❌ Error: ${error.message}`);
    }
  }
};
