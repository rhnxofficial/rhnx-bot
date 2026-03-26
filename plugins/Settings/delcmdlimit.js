import { delCmdLimit } from "../../middleware/cmdManager.js";

export default {
  name: "delcmdlimit",
  alias: ["dellimitcmd"],
  description: "Menghapus command limit",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const command = args[0]?.toLowerCase();
    if (!command) return setReply("Masukkan nama command yang ingin dihapus dari limit");

    const result = delCmdLimit(command);
    if (result) return setReply(`✅ Command *${command}* berhasil dihapus dari limit`);
    return setReply(`⚠️ Command *${command}* tidak ditemukan di daftar limit`);
  }
};
