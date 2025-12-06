import { listCmd } from "../../middleware/cmdManager.js";

export default {
  name: "listcmdprem",
  alias: ["premlist", "listpremcmd"],
  description: "Menampilkan daftar command premium",
  access: { owner: true },
  run: async (m, { setReply }) => {
    const list = listCmd("cmdprem");
    return setReply(`📌 Daftar command premium:\n${list}`);
  }
};
