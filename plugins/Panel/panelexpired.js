import fetch from "node-fetch";

const parseTanggal = (str) => {
  if (!str) return null;
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m}-${d}T00:00:00+07:00`);
};

export default {
  name: "panelexpired",
  description: "Panel expired & menuju expired (≤ 3 hari)",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      const limit = Number(args[0]) || 10;

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

      if (!Array.isArray(data) || data.length === 0) return m.reply("Belum ada data panel.");

      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

      const threeDaysLater = new Date(now);
      threeDaysLater.setDate(now.getDate() + 3);

      const expired = [];
      const expo = [];

      data.forEach((v) => {
        const exp = parseTanggal(v.expired);
        if (!exp) return;

        if (exp < now) {
          expired.push(v);
        } else if (exp >= now && exp <= threeDaysLater) {
          expo.push(v);
        }
      });

      if (expired.length === 0 && expo.length === 0)
        return m.reply("Tidak ada panel expired atau menuju expired.");

      let teks = `⚠️ *Panel Peringatan*\n\n`;

      if (expired.length) {
        teks += `🔴 *SUDAH EXPIRED* (${expired.length})\n\n`;
        expired.slice(0, limit).forEach((v, i) => {
          teks +=
            `*${i + 1}. ${v.buyer_name}*\n` +
            `- ID: ${v.id}\n` +
            `- Nomor: ${v.number}\n` +
            `- RAM: ${v.data?.ram || "-"}\n` +
            `- Expired: ${v.expired}\n\n`;
        });
      }

      if (expo.length) {
        teks += `🟡 *MENUJU EXPIRED (≤3 HARI)* (${expo.length})\n\n`;
        expo.slice(0, limit).forEach((v, i) => {
          teks +=
            `*${i + 1}. ${v.buyer_name}*\n` +
            `- ID: ${v.id}\n` +
            `- Nomor: ${v.number}\n` +
            `- RAM: ${v.data?.ram || "-"}\n` +
            `- Expired: ${v.expired}\n\n`;
        });
      }

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❌ Terjadi error saat cek panel expired.");
    }
  }
};
