import fs from "fs-extra";

export default {
  name: "clearsession",
  alias: ["clearsesi"],
  description: "Menghapus semua file session sementara",
  access: { owner: true },
  run: async (m) => {
    try {
      const files = await fs.readdir("./session");

      const filteredArray = files.filter(
        (item) =>
          item.startsWith("pre-key") ||
          item.startsWith("sender-key") ||
          item.startsWith("session-") ||
          item.startsWith("app-state")
      );

      let teks = `Terdeteksi ${filteredArray.length} file sampah\n\n`;
      if (filteredArray.length === 0) return m.reply(teks);

      filteredArray.forEach((e, i) => {
        teks += `${i + 1}. ${e}\n`;
      });

      await m.reply(teks);

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      await sleep(2000);
      await m.reply("Menghapus file sampah...");

      for (const file of filteredArray) {
        await fs.unlink(`./session/${file}`);
      }

      await sleep(2000);
      await m.reply("✅ Berhasil menghapus semua kenangan Mantan");
    } catch (err) {
      console.error(err);
      m.reply("❌ Terjadi kesalahan: " + err);
    }
  }
};
