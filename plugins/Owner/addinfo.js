"use strict";
import moment from "moment-timezone";

export default {
  name: "addinfo",
  alias: ["newinfo"],
  description: "Isi info terbaru",
  access: { owner: true },

  run: async (m, { conn, args, setReply }) => {
    const q = args.join(" ");
    if (!q) return setReply("Masukkan info terbaru");

    const formattedDate = moment().tz("Asia/Jakarta").format("DD/MM/YYYY");

    let data = global.db.data.others["newinfo"];

    if (data) {
      data.info = q;
      data.lastinfo = formattedDate;
      setReply("Berhasil memperbarui info update");
    } else {
      global.db.data.others["newinfo"] = {
        info: q,
        lastinfo: formattedDate
      };
      setReply("Berhasil membuat info update");
    }
  }
};
