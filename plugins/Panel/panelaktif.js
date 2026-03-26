import fetch from "node-fetch";

const parseTanggal = (str) => {
  if (!str) return null;

  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y) return null;

  return new Date(y, m - 1, d, 23, 59, 59);
};

export default {
  name: "panelaktif",
  description: "Menampilkan list panel yang masih aktif",
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

      if (!res.ok) return m.reply("❗ Gagal mengambil data panel.");

      const json = await res.json();
      const decoded = Buffer.from(json.content, "base64").toString("utf-8");
      const data = JSON.parse(decoded);

      if (!Array.isArray(data) || data.length === 0) return m.reply("Belum ada data panel.");

      const now = new Date();

      const aktif = data.filter((v) => {
        const exp = parseTanggal(v.expired);
        return exp && exp >= now;
      });

      if (aktif.length === 0) return m.reply("❗ Tidak ada panel yang aktif.");

      const list = aktif.slice(-limit).reverse();

      let teks = `🟢 *PANEL AKTIF*\n`;
      teks += `📦 Total Aktif: ${aktif.length}\n`;
      teks += `📄 Ditampilkan: ${list.length}\n\n`;

      list.forEach((v, i) => {
        teks +=
          `*${i + 1}. ${v.buyer_name}*\n` +
          `- ID: ${v.id}\n` +
          `- Nomor: ${v.number}\n` +
          `- RAM: ${v.data?.ram || "-"}\n` +
          `- Expired: ${v.expired}\n\n`;
      });

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat cek panel aktif.");
    }
  }
};
