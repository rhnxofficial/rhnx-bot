import fetch from "node-fetch";

export default {
  name: "unsuspendpanel",
  description: "Membuka suspend panel berdasarkan ID",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) return m.reply(" Contoh: .unsuspendpanel eVrM3FNe1y");

      const panelId = args[0];

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

      if (!res.ok) return m.reply("❗ Gagal mengambil data panel.");

      const json = await res.json();
      const decoded = Buffer.from(json.content, "base64").toString("utf-8");
      const data = JSON.parse(decoded);

      if (!Array.isArray(data)) return m.reply("❗ Data panel tidak valid.");

      const panelData = data.find((v) => v.id === panelId);

      if (!panelData) return m.reply("❗ Panel dengan ID tersebut tidak ditemukan.");

      const srv = panelData.server_id;
      if (!srv) return m.reply("❗ Server ID tidak ditemukan.");

      const response = await fetch(`${panel.domain}/api/application/servers/${srv}/unsuspend`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${panel.apiPlta}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        return m.reply(`❗ Gagal unsuspend panel.\nStatus: ${response.status}\n${text}`);
      }

      let teks = `✅ *Panel Aktif Kembali*\n\n`;
      teks += `👤 Buyer: ${panelData.buyer_name}\n`;
      teks += `🆔 ID Panel: ${panelData.id}\n`;
      teks += `🖥️ Server ID: ${srv}\n`;
      teks += `📞 Nomor: ${panelData.number}\n`;
      teks += `💾 RAM: ${panelData.data?.ram || "-"}\n`;

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat unsuspend panel.");
    }
  }
};
