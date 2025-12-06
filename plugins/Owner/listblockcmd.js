import { listBlockedCommands } from "../../middleware/blockcmd.js";

export default {
  name: "listblockcmd",
  alias: ["lbcmd"],
  description: "Daftar semua command yang diblokir",
  access: { owner: true },
  run: async (m, { setReply }) => {
    const list = listBlockedCommands();

    const msg = `📌 *Daftar Command Diblokir*\n\n${list}\n\n_Total: ${global.db.data.blockcmd?.length || 0} command_`;

    setReply(msg);
  }
};
