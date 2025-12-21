import fetch from "node-fetch";

export default {
  name: "detailpanel",
  description: "Detail pembelian panel via ID buyer",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) {
        return m.reply("Format:\n.detailpanel <ID_BUYER>");
      }

      const buyerId = args[0].trim();

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
      const decoded = Buffer.from(json.content, "base64").toString();
      const data = JSON.parse(decoded);

      const panel = data.find((v) => String(v.id) === buyerId);

      if (!panel) {
        return m.reply("❗ Data panel dengan ID tersebut tidak ditemukan.");
      }

      const teks =
        `*ㄨ* *Detail Panel*\n\n` +
        `*⊹* ID Buyer : ${panel.id}\n` +
        `*⊹* Buyer : ${panel.buyer_name}\n` +
        `*⊹* Nomor : ${panel.number}\n` +
        `*⊹* Payment : ${panel.payment}\n\n` +
        `*ㄨ* *Data Panel*\n` +
        `*⊹* Username : ${panel.data.nama}\n` +
        `*⊹* Email : ${panel.data.email}\n` +
        `*⊹* Password : ${panel.data.password}\n` +
        `*⊹* RAM : ${panel.data.ram}\n` +
        `*⊹* Harga : ${panel.data.harga}\n` +
        `*⊹* Login : ${panel.data.loginpanel}\n\n` +
        `*⊹* Tanggal Beli : ${panel.date}\n` +
        `*⊹* Expired : ${panel.expired}\n` +
        `*⊹* Notifikasi : ${panel.data.notification ? "Aktif" : "Mati"}`;

      m.reply(teks);
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat mengambil detail panel.");
    }
  }
};
