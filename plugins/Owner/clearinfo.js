"use strict";

export default {
  name: "clearinfo",
  alias: ["resetinfo", "hapusinfo"],
  description: "Hapus info terbaru",
  access: { owner: true },

  run: async (m, { conn, setReply }) => {
    let data = global.db.data.others["newinfo"];

    if (!data) return setReply("Tidak ada info yang tersimpan.");

    delete global.db.data.others["newinfo"];

    setReply("Info berhasil direset.");
  }
};
