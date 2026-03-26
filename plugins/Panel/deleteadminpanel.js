import fetch from "node-fetch";

export default {
  name: "deladminpanel",
  description: "Menghapus admin panel berdasarkan User ID",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args }) => {
    try {
      if (!args[0])
        return m.reply(
          "❗ Contoh: .deladminpanel 12\n\nHarap Masukann Nomor ID nya untuk mengetahui ID silahkan *.listadminpanel* terlebih dahulu"
        );

      const userId = args[0];

      const response = await fetch(`${panel.domain}/api/application/users/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${panel.apiPlta}`
        }
      });

      if (response.status !== 204) {
        const text = await response.text();
        return m.reply(
          `❗ Gagal menghapus admin panel.\n` +
            `Status: ${response.status}\n` +
            `${text || "Unknown error"}`
        );
      }

      m.reply(`🧹 *Admin Panel Berhasil Di Hapus*\n\n` + `🆔 User ID: ${userId}`);
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat menghapus admin panel.");
    }
  }
};
