"use strict";

import os from "os";
import { performance } from "perf_hooks";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default {
  name: "ping",
  alias: ["stats"],
  description: "Cek ping dan informasi sistem bot",
  access: { owner: false },
  run: async (m, { conn, setReply }) => {
    let old = performance.now();

    let neww = performance.now();
    let latensi = (neww - old) / 1000;
    let serverUptime = os.uptime();
    let processUptime = process.uptime();

    const cpus = os.cpus();
    const cpuUsage = cpus
      .map((cpu, i) => `  - Core ${i + 1}: ${cpu.model} @ ${cpu.speed}MHz`)
      .join("\n");

    const used = process.memoryUsage();
    const networkInfo = Object.entries(os.networkInterfaces())
      .map(([name, addresses]) => {
        const addrs = addresses
          .map(
            (address) =>
              ` - IP: ${address.address}\n   - MAC: ${address.mac}\n   - Family: ${address.family}\n   - Internal: ${address.internal}`
          )
          .join("\n");
        return `Interface ${name}:\n${addrs}`;
      })
      .join("\n\n");

    let respon = await styleSmallCaps(`
*⚡ Kecepatan Respon*: ${latensi.toFixed(4)} Detik

*📡 Info Server*:
- 🛡️ RAM: ${formatBytes(os.totalmem() - os.freemem())} / ${formatBytes(os.totalmem())}
- 🖥️ Platform: ${os.platform()}
- 📐 Arsitektur: ${os.arch()}
- ⏳ Uptime Server: ${formatUptime(serverUptime)}
- ⏱️ Uptime Bot: ${formatUptime(processUptime)}
- 🧪 Node.js Version: ${process.version}
- 🔢 Total CPU: ${cpus.length}
- 🔎 Informasi CPU:
${cpuUsage}

*📊 NodeJS Memory Usage*:
${Object.keys(used)
  .map((key) => ` - ${key.toUpperCase()}: ${formatBytes(used[key])}`)
  .join("\n")}

*🌐 Informasi Jaringan*:
${networkInfo}
`).trim();

    await setReply(respon);
  }
};
