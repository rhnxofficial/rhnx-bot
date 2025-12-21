"use strict";

export default {
  name: "mode",
  alias: ["public", "self"],
  description: "Ubah mode bot (public/self)",
  access: { owner: true },
  run: async (m, { conn, command }) => {
    if (!db.data.settings) db.data.settings = {};
    let mode;
    if (command === "public") {
      db.data.settings.public = true;
      mode = "🌍 Public";
    } else if (command === "self") {
      db.data.settings.public = false;
      mode = "🙈 Self";
    } else {
      return m.reply("❌ Gunakan: .public atau .self");
    }

    await m.reply(`✅ Mode berhasil diubah ke *${mode}*`);
  }
};
