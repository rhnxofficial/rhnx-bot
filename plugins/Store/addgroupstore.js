import fs from "fs";
import moment from "moment-timezone";

export default {
  name: "addgroupstore",
  alias: ["addgcstore"],
  description: "Tambahkan grup ini ke store",
  access: { owner: true },
  run: async (m, { conn, q, args }) => {
    const path = "./database/store/groupstore.json";

    let database = [];
    if (fs.existsSync(path)) {
      const rawData = fs.readFileSync(path, "utf-8");
      database = JSON.parse(rawData);
    }

    let groupData = database.find((g) => g.idGc === m.chat);
    if (groupData) {
      return m.reply("❌ Grup ini sudah terdaftar di database.");
    }

    const text = q || args.join(" ");
    if (!text) {
      return m.reply(
        "⚠️ Apakah Anda ingin menambahkan grup ini ke store? Balas dengan *.addgroupstore YES* atau *.addgroupstore NO*"
      );
    }

    if (text.toLowerCase() === "no") {
      return m.reply("❌ Proses dibatalkan.");
    }

    if (text.toLowerCase() !== "yes") {
      return m.reply(
        "⚠️ Harap balas dengan *YES* untuk mengkonfirmasi atau *NO* untuk membatalkan."
      );
    }

    const newGroup = {
      namaGc: m.groupName || "Unknown Group",
      idGc: m.chat,
      mulaiDari: `${week}, ${calender}`,
      notification: false,
      timeOpen: "",
      timeClose: "",
      reasonOpen: "",
      reasonClose: ""
    };

    database.push(newGroup);
    fs.writeFileSync(path, JSON.stringify(database, null, 2));

    m.reply("✅ Grup berhasil ditambahkan ke store dengan pengaturan khusus.");
  }
};
