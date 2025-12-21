import { addCmdPrem } from "../../middleware/cmdManager.js";

export default {
  name: "addcmdprem",
  alias: ["addcmdprem"],
  description: "Menambahkan command premium baru",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return setReply("Masukkan nama command yang ingin ditambahkan sebagai premium");

    const result = addCmdPrem(command, m.sender);
    if (result) return setReply(`✅ Command *${command}* berhasil ditambahkan sebagai premium`);
    return setReply(`⚠️ Command *${command}* sudah ada di daftar premium`);
  }
};
