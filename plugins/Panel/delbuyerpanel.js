import fetch from "node-fetch";

export default {
  name: "delbuyerpanel",
  description: "Hapus panel (server + user + data) via ID buyer",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      if (!args[0]) {
        return m.reply("Format:\n.delbuyerpanel <ID_BUYER>");
      }

      const buyerId = args[0].trim();

      const owner = dataPanel.owner;
      const repo = dataPanel.repo;
      const path = dataPanel.path;

      const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

      const get = await fetch(ghUrl, {
        headers: {
          Authorization: `Bearer ${dataPanel.tokenGH}`,
          Accept: "application/vnd.github+json"
        }
      });

      if (!get.ok) return m.reply("❌ Gagal ambil data GitHub.");

      const file = await get.json();
      const sha = file.sha;
      const data = JSON.parse(Buffer.from(file.content, "base64").toString());

      const target = data.find((v) => String(v.id) === buyerId);

      if (!target) {
        return m.reply("❗ ID buyer tidak ditemukan.");
      }

      let delServer = false;
      let delUser = false;

      if (target.server_id) {
        const ds = await fetch(`${panel.domain}/api/application/servers/${target.server_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${panel.apiPlta}`,
            Accept: "application/json"
          }
        });

        if (ds.ok) delServer = true;
      }

      if (target.panel_user_id) {
        const du = await fetch(`${panel.domain}/api/application/users/${target.panel_user_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${panel.apiPlta}`,
            Accept: "application/json"
          }
        });

        if (du.ok) delUser = true;
      }

      const newData = data.filter((v) => String(v.id) !== buyerId);

      const content = Buffer.from(JSON.stringify(newData, null, 2)).toString("base64");

      await fetch(ghUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${dataPanel.tokenGH}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `delete panel by id ${buyerId}`,
          content,
          sha
        })
      });

      let teks = `🧨 *Hapus Panel Berhasil*\n\n`;
      teks += `▸ ID Buyer : ${target.id}\n`;
      teks += `▸ Nama : ${target.buyer_name}\n`;
      teks += `▸ Nomor : ${target.number}\n`;
      teks += `▸ Server : ${delServer ? "✅" : "❌"} (${target.server_id || "N/A"})\n`;
      teks += `▸ User Panel : ${delUser ? "✅" : "❌"} (${target.panel_user_id || "N/A"})`;

      m.reply(teks);
    } catch (err) {
      console.error(err);
      m.reply("❗ Error saat menghapus panel.");
    }
  }
};
