import { listCmd } from "../../middleware/cmdManager.js";

export default {
  name: "listcmdowner",
  alias: ["ownerlist", "listownercmd"],
  description: "Menampilkan daftar command owner",
  access: { owner: true },
  run: async (m, { setReply }) => {
    const list = listCmd("cmdowner");
    return setReply(`📌 Daftar command owner:\n${list}`);
  }
};
