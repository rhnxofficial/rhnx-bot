"use strict";

import axios from "axios";
import { sendMixedMessage } from "../../lib/sendMixedMessage.js";

export default {
  name: "ai",
  alias: ["rynex", "ask"],
  description: "Chat Ai",
  access: { group: false },

  run: async (m, { conn, args, prefix, command }) => {
    let inputText = args.join(" ");

    if (!inputText && m.quoted && m.quoted.text) {
      inputText = m.quoted.text;
    }

    if (!inputText)
      return m.reply(
        `Contoh penggunaan:\n${prefix + command} Halo apa kabar\natau reply pesan lalu ketik:\n${prefix + command}`
      );
m.react('✳️')
    const defaultPrompt = `
Kamu adalah AI pintar. 
Jika kamu bingung atau tidak yakin, jangan menyerah—coba lagi sampai menemukan jawaban yang paling masuk akal.
Jangan bilang "saya tidak tahu", cobalah memberikan jawaban terbaik.
`;

    try {
      const url = `${api.rhnx}/api/ai/rynexchat?text=${encodeURIComponent(
        inputText
      )}&prompt=${encodeURIComponent(defaultPrompt)}&key=${key.rhnx}`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data.status || !data.data?.result) {
        return m.reply("Gagal mendapatkan jawaban dari AI.");
      }

      let hasil = data.data.result;
        
      await sendMixedMessage(conn, m, hasil);

    } catch (err) {
      console.log("Error AI:", err);
      return m.reply("Terjadi kesalahan saat menghubungi AI.");
    }
  }
};
