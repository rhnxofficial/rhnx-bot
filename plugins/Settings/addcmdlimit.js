import { addCmdLimit } from "../../middleware/cmdManager.js";

export default {
  name: "addcmdlimit",
  alias: ["addlimitcmd"],
  description: "Menambahkan command limit baru",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return m.reply("Masukkan nama command yang ingin ditambahkan sebagai limit");

    const result = addCmdLimit(command, m.sender);
    if (result) return m.reply(`✅ Command *${command}* berhasil ditambahkan sebagai limit`);
    return m.reply(`⚠️ Command *${command}* sudah ada di daftar limit`);
  }
};
