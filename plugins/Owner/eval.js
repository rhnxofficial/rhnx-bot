"use strict";

import util from "util";

export default {
  name: ">",
  access: { owner: true },
  description: "Menjalankan kode JavaScript (khusus owner)",
  run: async (m, { conn, args, isOwner }) => {
    const code = args.join(" ");
    if (!code) return m.reply("❌ Masukkan kode JavaScript!");

    try {
      const start = process.hrtime.bigint();
      let result = await eval(code);

      if (typeof result !== "string") {
        result = util.inspect(result, { depth: null, maxArrayLength: null });
      }

      const end = process.hrtime.bigint();
      const execTime = Number(end - start) / 1e6;

      await conn.sendMessage(
        m.chat,
        {
          text: `✅ *Eval sukses!*\n\n📥 Input:\n\`\`\`\n${code}\n\`\`\`\n\n📤 Output:\n\`\`\`\n${result}\n\`\`\`\n⏱ ${execTime.toFixed(2)} ms`
        },
        { quoted: m }
      );
    } catch (err) {
      await m.reply(`❌ *Eval error:*\n\`\`\`\n${err}\n\`\`\``);
    }
  }
};
