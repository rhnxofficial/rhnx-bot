import { listCmd } from "../../middleware/cmdManager.js";

export default {
  name: "listcmdlimit",
  alias: ["limitlist", "listlimitcmd"],
  description: "Menampilkan daftar command limit",
  access: { owner: true },
  run: async (m, { setReply }) => {
    const list = listCmd("cmdlimit");
    return setReply(`📌 Daftar command limit:\n${list}`);
  }
};
