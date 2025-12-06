"use strict";

export default {
  name: "fashion",
  alias: ["baju"],
  description: "Menampilkan baju",
  tags: ["tools"],
  access: { groupstore: true },
  run: async (m, { conn, args, setReply }) => {
    try {
      m.reply("belom ready cuy");
    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan.");
    }
  }
};
