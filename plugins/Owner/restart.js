"use strict";
import { fork } from "child_process";

export default {
  name: "restart",
  alias: ["reset", "reboot"],
  description: "Restart bot dengan child process, menyimpan context terakhir",
  access: { owner: true },
  run: async (m, { conn, q, extras }) => {
    if (!global.db.data.others) global.db.data.others = {};
    global.db.data.others["restart"] = {
      m,
      from: m.chat
    };

    await conn.sendMessage(m.chat, { text: `_Restarting ${global.bot?.name || "Bot"}..._` });
    await conn.sendMessage(m.chat, { text: "_Success ✅_" });
    const child = fork("./main.js", [], { stdio: "inherit" });

    child.on("message", (msg) => {
      if (msg === "ready") console.log("✅ Bot restarted successfully!");
    });
    process.exit(0);
  }
};
