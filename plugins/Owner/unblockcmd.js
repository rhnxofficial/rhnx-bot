import { unblockCommand } from "../../middleware/blockcmd.js";

export default {
  name: "unblockcmd",
  alias: ["unblockcmd"],
  description: "Buka blokir command sementara",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const cmd = args.join(" ")?.toLowerCase();
    if (!cmd) return setReply("Masukkan command yang ingin dibuka bloknya");
    if (unblockCommand(cmd)) setReply(`✅ Command *${cmd}* berhasil dibuka`);
    else setReply(`⚠️ Command *${cmd}* tidak ditemukan di blok`);
  }
};
