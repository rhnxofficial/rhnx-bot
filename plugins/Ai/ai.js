import axios from "axios";

export default {
  name: "ai",
  alias: ["gemini", "ask"],
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

    const defaultPrompt = `
Kamu adalah AI pintar. 
Jika kamu bingung atau tidak yakin, jangan menyerah—coba lagi sampai menemukan jawaban yang paling masuk akal.
Jangan bilang "saya tidak tahu", cobalah memberikan jawaban terbaik.
`;

    try {
      const url = `${api.rhnx}/api/ai?text=${encodeURIComponent(
        inputText
      )}&prompt=${encodeURIComponent(defaultPrompt)}&key=${key.rhnx}`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data.status || !data.data?.result) return m.reply("Gagal mendapatkan jawaban dari AI.");

      let hasil = data.data.result;
      await conn.sendMessage(m.chat, { text: hasil }, { quoted: m });
    } catch (err) {
      console.log("Error AI:", err);
      return m.reply("Terjadi kesalahan saat menghubungi AI.");
    }
  }
};
