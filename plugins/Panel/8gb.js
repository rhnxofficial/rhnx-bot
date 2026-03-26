import fetch from "node-fetch";
import { saveToGithub } from "../../lib/saveToGithub.js";

export default {
  name: "8gb",
  description: "Buat panel 8GB",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { conn, args }) => {
    try {
      if (!args[0]) {
        return m.reply("Format:\n.8gb <username> <nomor>\natau reply chat target");
      }
      await m.react("⏱️");
      const username = args[0];

      let number;
      if (m.quoted?.sender) {
        number = m.quoted.sender.split("@")[0];
      } else if (args[1]) {
        number = args[1].replace(/[^0-9]/g, "");
      } else {
        return m.reply("Nomor tidak ditemukan.\nReply chat target atau isi nomor.");
      }

      const jid = number + "@s.whatsapp.net";

      const cek = (await conn.onWhatsApp(number))[0];
      if (!cek?.exists) {
        return m.reply("Nomor tidak terdaftar di WhatsApp.");
      }

      const email = `${username}@gmail.com`;
      const password = `panel-${makeid(8)}`;
      const name = `${username}-8GB`;

      const memo = 8000;
      const cpu = 170;
      const disk = 0;

      const createUser = await fetch(panel.domain + "/api/application/users", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + panel.apiPlta
        },
        body: JSON.stringify({
          email,
          username,
          first_name: username,
          last_name: username,
          language: "en",
          password
        })
      });

      const userRes = await createUser.json();
      if (userRes.errors) {
        return m.reply(JSON.stringify(userRes.errors[0], null, 2));
      }

      const user = userRes.attributes;

      const eggReq = await fetch(`${panel.domain}/api/application/nests/5/eggs/${panel.eggs}`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + panel.apiPlta
        }
      });

      const eggData = await eggReq.json();
      const startup = eggData.attributes.startup;

      const serverReq = await fetch(panel.domain + "/api/application/servers", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + panel.apiPlta
        },
        body: JSON.stringify({
          name,
          user: user.id,
          egg: Number(panel.eggs),
          docker_image: panel.docker_image,
          startup,
          environment: { STARTUP_CMD: "bash" },
          limits: {
            memory: memo,
            swap: 0,
            disk,
            io: 500,
            cpu
          },
          feature_limits: {
            databases: 5,
            backups: 5,
            allocations: 1
          },
          deploy: {
            locations: [Number(panel.location)],
            dedicated_ip: false,
            port_range: []
          }
        })
      });

      const server = await serverReq.json();
      if (server.errors) {
        return m.reply(JSON.stringify(server.errors[0], null, 2));
      }

      const now = new Date();
      const expired = new Date();
      expired.setDate(now.getDate() + 30);

      const belipanel = {
        id: randomNumberId(10),
        server_id: server.attributes.id,
        panel_user_id: user.id,
        date: now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }),
        expired: expired.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }),
        extended_panel: 0,
        buyer_name: username,
        number,
        payment: "DANA",
        data: {
          nama: user.username,
          email,
          password,
          loginpanel: panel.domain,
          ram: "8GB",
          harga: waktuPanel.eightgb.harga,
          notification: false
        }
      };

      await saveToGithub({
        token: dataPanel.tokenGH,
        owner: dataPanel.owner,
        repo: dataPanel.repo,
        path: dataPanel.path,
        newData: belipanel,
        message: `add buyer panel 8GB ${username}`
      });

      const text = styleText(`Hai ${username} Selammat Anda Telah Terdaftar Di Panel ${panel.name}

𖥔 *Username* : ${username}
𖥔 *Email* : ${email}
𖥔 *Pasword* : ${password}
𖥔 *Login* : ${panel.domain}
𖥔 *Tanggal Pembelian* : ${belipanel.date}
𖥔 *Masa Berlaku Hingga* : ${belipanel.expired}

⚠️ *ɪɴғᴏʀᴍᴀsɪ ᴘᴇɴᴛɪɴɢ*
Ⓘ Harap Isi Pasword Secara Manual, Bukan Dengan Menyalin Pesan Ini
Ⓘ Data Akan Dikirimkan Hanya Sekali, Jika Anda Lupa Silahkan Ketik .*panelku* 
Ⓘ Dilarng Keras Menggunakan Panel Untuk Aktivitas Ilegal Seperti Ddos. Pelanggaran Akan Mengakibatkan Penghapusan Akun Dan Server Tanpa Pemberitahuan
Ⓘ Info Selengkapnya: ${bot.gcstore}

Terimakasih Telah Mempercayai *${panel.name}*`);

      await conn.sendThumbnail(jid, text, m, {
        title: "Panel Pterodactyl",
        body: "",
        thumbnailUrl: panel.image,
        mediaUrl: sosmed.youtube
      });

      m.reply(`✅ Panel 8GB dengan nama ${username} Berhasil Di Buat`);
    } catch (err) {
      console.error(err);
      m.reply("❌ Gagal membuat panel 8GB");
    }
  }
};
