import fetch from "node-fetch";

export default {
  name: "panelku",
  alias: ["mypanel"],
  description: "Melihat data panel milik sendiri",
  access: { storewithprivate: true },

  run: async (m, { conn }) => {
    try {
      const nomor = m.sender.split("@")[0];

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

      if (!res.ok) {
        return m.reply("❌ Gagal mengambil data panel.");
      }

      const json = await res.json();
      const decoded = Buffer.from(json.content, "base64").toString();
      const data = JSON.parse(decoded);

      const panels = data.filter((v) => v.number === nomor);

      if (panels.length === 0) {
        return m.reply("Kamu belum memiliki panel.");
      }

      let teks = `📦 *Panel Milik Kamu*\n`;
      teks += `*⊹* Nomor: ${nomor}\n`;
      teks += `*⊹* Total Panel: ${panels.length}\n\n`;

      panels.forEach((v, i) => {
        teks +=
          `*${i + 1}. PANEL ${v.data?.ram}*\n` +
          `⊹ ID: ${v.id}\n` +
          `⊹ Username: ${v.data.nama}\n` +
          `⊹ Email: ${v.data.email}\n` +
          `⊹ Password: ${v.data.password}\n` +
          `⊹ Login: ${v.data.loginpanel}\n` +
          `⊹ Beli: ${v.date}\n` +
          `⊹ Expired: ${v.expired}\n\n`;
      });

      teks = teks.trim();

      if (m.isGroup) {
        await conn.sendMessage(m.sender, { text: teks });

        await m.reply("📩 Data panel kamu sudah dikirim ke private chat.");
      } else {
        await m.reply(teks);
      }
    } catch (err) {
      console.error(err);
      m.reply("❌ Terjadi error saat mengambil panel kamu.");
    }
  }
};
