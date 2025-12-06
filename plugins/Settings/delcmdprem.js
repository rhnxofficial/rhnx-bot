import { delCmdPrem } from "../../middleware/cmdManager.js";

export default {
  name: "delcmdprem",
  alias: ["delcmdprem"],
  description: "Menghapus command premium",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return setReply("Masukkan nama command yang ingin dihapus dari premium");

    const result = delCmdPrem(command);
    if (result) return setReply(`✅ Command *${command}* berhasil dihapus dari premium`);
    return setReply(`⚠️ Command *${command}* tidak ditemukan di daftar premium`);
  }
};
