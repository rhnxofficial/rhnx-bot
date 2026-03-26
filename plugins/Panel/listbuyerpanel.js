import fetch from "node-fetch";

export default {
  name: "listbuyerpanel",
  description: "List pembeli panel (private repo)",
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

      if (!res.ok) return m.reply("❌ Gagal mengambil data buyer panel.");

      const json = await res.json();
      const decoded = Buffer.from(json.content, "base64").toString();
      const data = JSON.parse(decoded);

      if (!Array.isArray(data) || data.length === 0)
        return m.reply("Belum ada data pembelian panel.");

      const list = data.slice(-limit).reverse();

      let teks = `🧾 *List Buyer Panel*\n`;
      teks += `📦 Total: ${data.length}\n`;
      teks += `📄 Ditampilkan: ${list.length}\n\n`;

      list.forEach((v, i) => {
        teks +=
          `*${i + 1}. ${v.buyer_name}*\n` +
          `*-* ID: ${v.id}\n` +
          `*-* Nomor: ${v.number}\n` +
          `*-* RAM: ${v.data?.ram}\n` +
          `*-* Harga: ${v.data?.harga}\n` +
          `*-* Beli: ${v.date}\n` +
          `*-* Expired: ${v.expired}\n` +
          `*-* Payment: ${v.payment}\n\n`;
      });

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("❌ Error saat membaca buyer panel.");
    }
  }
};
