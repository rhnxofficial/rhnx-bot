import fetch from "node-fetch";

export default {
  name: "powerserver",
  description: "Control server panel (start|stop|restart|kill)",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      if (args.length < 2)
        return m.reply("❌ Format:\n.server <start|stop|restart|kill> <server_id>");

      const action = args[0].toLowerCase();
      const serverId = args[1].trim();

      const validAction = ["start", "stop", "restart", "kill"];
      if (!validAction.includes(action)) return m.reply("❌ Action tidak valid.");

      const owner = dataPanel.owner;
      const repo = dataPanel.repo;
      const path = dataPanel.path;

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${dataPanel.tokenGH}`,
          Accept: "application/vnd.github+json"
        }
      });

      if (!res.ok) return m.reply("❌ Gagal mengambil data panel.");

      const json = await res.json();
      const decoded = Buffer.from(json.content, "base64").toString("utf-8");
      const data = JSON.parse(decoded);

      if (!Array.isArray(data)) return m.reply("❌ Data panel tidak valid.");

      const panelData = data.find((v) => String(v.server_id) === serverId);

      if (!panelData) return m.reply("❌ Server ID tidak ditemukan di database.");

      const response = await fetch(`${panel.domain}/api/client/servers/${serverId}/power`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${panel.apiPlta}`
        },
        body: JSON.stringify({ signal: action })
      });

      if (!response.ok) {
        const text = await response.text();
        return m.reply(`❌ Gagal ${action} server.\n` + `Status: ${response.status}\n${text}`);
      }

      const emoji = {
        start: "▶️",
        stop: "⏹️",
        restart: "🔁",
        kill: "💀"
      };

      let teks = `${emoji[action]} *SERVER ${action.toUpperCase()}*\n\n`;
      teks += `👤 Buyer: ${panelData.buyer_name}\n`;
      teks += `🆔 Server ID: ${serverId}\n`;
      teks += `💾 RAM: ${panelData.data?.ram || "-"}\n`;
      teks += `📞 Nomor: ${panelData.number}\n`;

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❌ Terjadi error saat control server.");
    }
  }
};
