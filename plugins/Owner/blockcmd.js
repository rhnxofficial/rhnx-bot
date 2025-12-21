import { blockCommand } from "../../middleware/blockcmd.js";

export default {
  name: "blockcmd",
  alias: ["blockcmd"],
  description: "Blok command sementara",
  access: { owner: true },
  run: async (m, { args, setReply }) => {
    const cmd = args.join(" ")?.toLowerCase();
    if (!cmd) return setReply("Masukkan command yang ingin diblokir");
    if (blockCommand(cmd)) setReply(`✅ Command *${cmd}* berhasil diblok sementara`);
    else setReply(`⚠️ Command *${cmd}* sudah diblok`);
  }
};
