import { addCmdOwner } from "../../middleware/cmdManager.js";

export default {
  name: "addcmdowner",
  alias: ["addownercmd"],
  description: "Menambahkan command owner baru",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return setReply("Masukkan nama command yang ingin ditambahkan sebagai owner");

    const result = addCmdOwner(command, m.sender);
    if (result) return setReply(`✅ Command *${command}* berhasil ditambahkan sebagai owner`);
    return setReply(`⚠️ Command *${command}* sudah ada di daftar owner`);
  }
};
