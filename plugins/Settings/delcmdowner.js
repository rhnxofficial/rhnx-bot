import { delCmdOwner } from "../../middleware/cmdManager.js";

export default {
  name: "delcmdowner",
  alias: ["delcmdowner"],
  description: "Menghapus command owner",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return setReply("Masukkan nama command yang ingin dihapus dari owner");

    const result = delCmdOwner(command);
    if (result) return setReply(`✅ Command *${command}* berhasil dihapus dari owner`);
    return setReply(`⚠️ Command *${command}* tidak ditemukan di daftar owner`);
  }
};
