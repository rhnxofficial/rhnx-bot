"use strict";

import { langMap } from "../../media/text/langue.js";

export default {
  name: "setlangue",
  alias: ["language", "lang"],
  description: "Ubah bahasa bot",
  access: { owner: true },
  run: async (m, { q, setReply }) => {
    if (!q) {
      return setReply(
        "🌍 Pilih bahasa yang tersedia:\n\n" +
          Object.entries(langMap)
            .map(([code, name]) => `• ${code} = ${name}`)
            .join("\n") +
          "\n\nContoh:\n.setlang en\n"
      );
    }

    const code = q.toLowerCase();

    if (!langMap[code]) {
      return m.reply(
        `❌ Bahasa *${code}* tidak tersedia.\n\n` +
          "🌍 Pilih dari list berikut:\n" +
          Object.entries(langMap)
            .map(([c, name]) => `• ${c} = ${name}`)
            .join("\n")
      );
    }

    db.data.settings.language = code;
    global.language = code;

    m.reply(`✅ Bahasa bot berhasil diubah ke: *${langMap[code]}* (${code})`);
  }
};
