import fetch from "node-fetch";

function parseIDDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split(/[\/-]/).map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d, 23, 59, 59);
}

function formatIDDate(date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  });
}

export default {
  name: "perpanjangpanel",
  description: "Perpanjang masa aktif panel (berdasarkan ID)",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args, conn }) => {
    try {
      if (!args[0] || !args[1]) {
        return m.reply(
          "Format:\n.perpanjangpanel <id> <hari>\n\n" + "Contoh:\n.perpanjangpanel 7380455910 30"
        );
      }

      const panelId = args[0];
      const addDays = parseInt(args[1]);

      if (!/^\d+$/.test(panelId)) return m.reply("❌ ID panel harus angka.");

      if (isNaN(addDays) || addDays <= 0) return m.reply("❌ Jumlah hari tidak valid.");

      const OWNER = dataPanel.owner;
      const REPO = dataPanel.repo;
      const PATH = dataPanel.path;
      const GH_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

      const res = await fetch(GH_URL, {
        headers: {
          Authorization: `Bearer ${dataPanel.tokenGH}`,
          Accept: "application/vnd.github+json"
        }
      });

      if (!res.ok) return m.reply("❌ Gagal mengambil data panel.");

      const file = await res.json();
      const sha = file.sha;
      const data = JSON.parse(Buffer.from(file.content, "base64").toString());

      const panel = data.find((v) => v.id === panelId);

      if (!panel) return m.reply("❌ Panel dengan ID tersebut tidak ditemukan.");

      const now = new Date();
      const oldExpired = parseIDDate(panel.expired);
      const baseDate = oldExpired && oldExpired > now ? oldExpired : now;

      baseDate.setDate(baseDate.getDate() + addDays);

      panel.expired = formatIDDate(baseDate);
      panel.extended_panel = (panel.extended_panel || 0) + addDays;

      if (panel.data) panel.data.notification = false;

      const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

      const put = await fetch(GH_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${key.tokenGithub}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `extend panel ${panelId} +${addDays} hari`,
          content,
          sha
        })
      });

      if (!put.ok) return m.reply("❌ Gagal menyimpan perubahan ke GitHub.");

      if (conn?.ws?.readyState === 1) {
        await conn.sendMessage(panel.number + "@s.whatsapp.net", {
          text:
            `🎉 *Panel Di Perpanjang*\n\n` +
            `Halo *${panel.buyer_name}*,\n` +
            `Panel kamu berhasil diperpanjang.\n\n` +
            `📅 Expired baru : ${panel.expired}\n` +
            `➕ Durasi : ${addDays} hari\n\n` +
            `Terima kasih 🙏`
        });
      }

      m.reply(
        `✅ *Panel Berhasil Di Perpanjang*\n\n` +
          `ID : ${panel.id}\n` +
          `User : ${panel.buyer_name}\n` +
          `Nomor : ${panel.number}\n` +
          `Expired Baru : ${panel.expired}\n` +
          `Ditambah : ${addDays} hari`
      );
    } catch (err) {
      console.error(err);
      m.reply("❌ Error saat memperpanjang panel.");
    }
  }
};
