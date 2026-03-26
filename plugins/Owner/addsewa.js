import moment from "moment-timezone";

export default {
  name: "addsewa",
  description: "Tambah data sewa (bisa lewat grup langsung atau private dengan link)",
  access: { owner: true },

  async run(m, { conn, args }) {
    try {
      if (!args[0])
        return m.reply(
          "⚠️ Contoh penggunaan:\n\n• Di private:\n.addsewa <linkgc> <waktu>\n• Di grup:\n.addsewa <waktu>"
        );

      let groupId, groupName;

      // === Fungsi bantu parse durasi seperti 1d6h30m ===
      const parseDuration = (str) => {
        const regex = /(\d+d)?(\d+h)?(\d+m)?/;
        const match = str.match(regex);
        let days = match?.[1] ? parseInt(match[1]) : 0;
        let hours = match?.[2] ? parseInt(match[2]) : 0;
        let minutes = match?.[3] ? parseInt(match[3]) : 0;
        return moment.duration({ days, hours, minutes });
      };

      let durationStr, metadata;

      // === Jika dijalankan di PRIVATE CHAT ===
      if (!m.isGroup) {
        const link = args[0];
        const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
        if (!match) return m.reply("❌ Link grup tidak valid!");
        const code = match[1];
        durationStr = args[1];
        if (!durationStr) return m.reply("⚠️ Masukkan durasi, misal: 3d atau 6h30m");

        groupId = await conn.groupAcceptInvite(code).catch(() => null);
        if (!groupId) return m.reply("❌ Gagal join ke grup, link mungkin sudah kadaluarsa.");

        metadata = await conn.groupMetadata(groupId).catch(() => null);
        groupName = metadata?.subject || "Tanpa Nama";
      } else {
        // === Jika dijalankan DI GRUP ===
        groupId = m.chat;
        metadata = await conn.groupMetadata(groupId).catch(() => null);
        groupName = metadata?.subject || "Tanpa Nama";
        durationStr = args[0];
      }

      // === Validasi durasi ===
      const duration = parseDuration(durationStr);
      if (!duration || duration.asMilliseconds() <= 0)
        return m.reply(
          "⚠️ Durasi tidak valid!\nGunakan format: 1d (hari), 3h (jam), 30m (menit), atau gabungan seperti 1d6h30m"
        );

      // === Pastikan fungsi register tersedia ===
      if (typeof global.register !== "function") {
        const { register } = await import("../../middleware/register.js");
        global.register = register;
      }

      // === Pastikan grup terdaftar di database ===
      if (!global.db.data.chats[groupId]) {
        await global.register(
          {
            chat: groupId,
            isGroup: true,
            groupName,
            sender: conn.user.id,
            pushName: conn.user.name
          },
          conn
        );
        console.log(`[REGISTER AUTO] Grup terdaftar: ${groupName}`);
      }

      // === Hitung waktu sewa ===
      const now = moment().tz("Asia/Jakarta");
      const end = moment(now).add(duration);

      // === Simpan data sewa ke database ===
      const chats = global.db.data.chats[groupId];
      chats.sewa = true;
      chats.sewasince = now.format();
      chats.sewaends = end.format();

      // === Kirim info ke pengirim ===
      await m.reply(
        `✅ *Sewa berhasil ditambahkan!*\n\n` +
          `📛 Grup: ${groupName}\n` +
          `⏳ Durasi: ${duration.humanize()}\n` +
          `📅 Aktif sampai: ${end.format("DD MMMM YYYY, HH:mm:ss")}`
      );

      // === Kirim notifikasi ke grup ===
      const notifText =
        `📢 *Pemberitahuan Sewa Grup!*\n\n` +
        `Grup ini telah diperpanjang atau disewa bot.\n\n` +
        `⏳ Durasi: ${duration.humanize()}\n` +
        `🕒 Berlaku sampai: ${end.format("DD MMMM YYYY, HH:mm:ss")}\n\n` +
        `Terima kasih telah menggunakan layanan bot! 🤖`;

      await conn.sendMessage(groupId, { text: notifText });

      // === Kirim notifikasi ke semua admin grup ===
      const admins = metadata?.participants?.filter(
        (p) => p.admin === "admin" || p.admin === "superadmin"
      );

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          try {
            await conn.sendMessage(admin.jid, {
              text:
                `📬 *Notifikasi Sewa Grup*\n\n` +
                `Grup: ${groupName}\n` +
                `Durasi: ${duration.humanize()}\n` +
                `Akan berakhir: ${end.format("DD MMMM YYYY, HH:mm:ss")}\n\n` +
                `📎 ID Grup: ${groupId}\n` +
                `Pesan ini dikirim otomatis untuk admin.`
            });
          } catch {
            console.log(`Gagal kirim notifikasi ke admin ${admin.jid}`);
          }
        }
      }

      console.log(`[ADDSEWA] ${groupName} | ${duration.humanize()}`);
    } catch (e) {
      console.error("❌ Error addsewa:", e);
      m.reply("⚠️ Terjadi kesalahan saat menambahkan sewa.");
    }
  }
};
