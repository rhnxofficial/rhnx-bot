"use strict";

import { styleText, styleSans, styleMono, styleSmallCaps } from "../../media/text/styleText.js";

export default {
  name: "setstyle",
  alias: ["style", "changestyle"],
  description: "Ubah gaya teks bot (normal, sans, mono, smallcaps)",
  access: { owner: true },

  run: async (m, { conn, q }) => {
    if (!q) {
      return m.reply(
        `⚙️ Pilih gaya teks yang tersedia:\n` +
          `- normal (default)\n` +
          `- sans\n` +
          `- mono\n` +
          `- smallcaps\n\n` +
          `Contoh: .setstyle sans`
      );
    }

    const styleOptions = ["normal", "sans", "mono", "smallcaps"];
    const chosen = q.trim().toLowerCase();

    if (!styleOptions.includes(chosen)) {
      return m.reply(`❌ Style "${q}" tidak tersedia.\n` + `Yang ada: ${styleOptions.join(", ")}`);
    }

    db.data = db.data || {};
    db.data.settings = db.data.settings || {};

    db.data.settings.style = chosen;

    if (typeof db.write === "function") {
      try {
        await db.write();
      } catch (e) {
        console.error("Gagal menyimpan db:", e);
      }
    }

    global.styleText = (text) => {
      if (typeof styleText === "function") {
        try {
          return styleText(text, chosen);
        } catch (e) {}
      }

      switch (chosen) {
        case "mono":
          return styleMono(text);
        case "smallcaps":
          return styleSmallCaps(text);
        case "sans":
          return styleSans(text);
        case "normal":
        default:
          return text;
      }
    };

    return m.reply(`✅ Style berhasil diubah ke: *${chosen}*`);
  }
};
