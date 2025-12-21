import fetch from "node-fetch";

export default {
  name: "listadminpanel",
  description: "Menampilkan list admin panel (root admin)",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      const limit = Number(args[0]) || 10;

      const res = await fetch(`${panel.domain}/api/application/users?per_page=100`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${panel.apiPlta}`
        }
      });

      if (!res.ok) return m.reply("❗ Gagal mengambil data admin panel.");

      const json = await res.json();
      const users = json?.data || [];

      if (!users.length) return m.reply("❗ Tidak ada user panel.");

      const admins = users.filter((u) => u.attributes?.root_admin === true);

      if (!admins.length) return m.reply("❗ Tidak ada admin panel.");

      const list = admins.slice(0, limit);

      let teks = `乂 *LIST ADMIN PANEL*\n`;
      teks += `◦ Total Admin: ${admins.length}\n`;
      teks += `◦ Ditampilkan: ${list.length}\n\n`;

      list.forEach((u, i) => {
        const a = u.attributes;
        teks +=
          `*${i + 1}. ${a.username}*\n` +
          `- User ID: ${a.id}\n` +
          `- Email: ${a.email}\n` +
          `✅ Root Admin: ${a.root_admin ? "YES" : "NO"}\n\n`;
      });

      m.reply(teks.trim());
    } catch (err) {
      console.error(err);
      m.reply("! Terjadi error saat mengambil list admin panel.");
    }
  }
};
