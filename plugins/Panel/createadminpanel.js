import fetch from "node-fetch";

export default {
  name: "createadminpanel",
  description: "Membuat admin panel otomatis (username|nomor)",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { args, conn }) => {
    try {
      if (!args[0]) return m.reply("❌ Contoh: .createadminpanel user|628xxxx");

      const [username, nomor] = args.join(" ").split("|");
      if (!username || !nomor) return m.reply("❌ Format salah. Gunakan: username|nomor");

      let password = `paneladmin-${makeid(9)}`;
      let nomornya = nomor.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

      const email = `${username}@gmail.com`;

      const response = await fetch(`${panel.domain}/api/application/users`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${panel.apiPlta}`
        },
        body: JSON.stringify({
          email,
          username,
          first_name: "Admin",
          last_name: username,
          password,
          root_admin: true,
          language: "en"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return m.reply(
          `❗ Gagal membuat admin panel.\n` + `${result?.errors?.[0]?.detail || "Unknown error"}`
        );
      }

      let teks = `✅ *Admin Panel Berhasil Di Buat*\n\n`;
      teks += `▸ Username: ${username}\n`;
      teks += `▸ Email: ${email}\n`;
      teks += `▸ Password: ${password}\n`;
      teks += `▸ Panel: ${panel.domain}\n`;

      m.reply(teks.trim());

      await conn.sendMessage(nomornya, {
        text:
          `🎉 *Admin Panel Anda*\n\n` +
          `▸ Panel: ${panel.domain}\n` +
          `▸ Username: ${username}\n` +
          `▸ Email: ${email}\n` +
          `▸ Password: ${password}\n\n` +
          `⚠️ Harap simpan data ini dengan aman.`
      });
    } catch (err) {
      console.error(err);
      m.reply("❗ Terjadi error saat membuat admin panel.");
    }
  }
};
