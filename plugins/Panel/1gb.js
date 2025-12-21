import fetch from "node-fetch";
import { saveToGithub } from "../../lib/saveToGithub.js";

export default {
  name: "1gb",
  description: "Buat panel 1GB + simpan buyer ke GitHub",
  access: { storewithprivate: true, resellerpanel: true },

  run: async (m, { conn, args }) => {
    try {
      if (!args[0] || !args[1]) return m.reply("Format:\n.buat1gb <username> <nomor>");

      await m.react("⏱️");

      const username = args[0];
      const number = args[1];
      const jid = number + "@s.whatsapp.net";

      const cek = (await conn.onWhatsApp(number))[0];
      if (!cek?.exists) return m.reply("Nomor tidak terdaftar di WhatsApp.");

      const email = `${username}@gmail.com`;
      const password = `panel-${makeid(8)}`;
      const name = `${username}-1GB`;

      const memo = 1024;
      const cpu = 50;
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
      if (userRes.errors) return m.reply(JSON.stringify(userRes.errors[0], null, 2));

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
      if (server.errors) return m.reply(JSON.stringify(server.errors[0], null, 2));

      const now = new Date();
      const expired = new Date();
      expired.setDate(now.getDate() + 30);

      const panelUserId = user.id;
      const serverId = server.attributes.id;

      const belipanel = {
        id: makeid(10),
        server_id: serverId,
        panel_user_id: panelUserId,
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
          ram: "1GB",
          harga: waktuPanel.onegb.harga,
          notification: false
        }
      };

      await saveToGithub({
        token: dataPanel.tokenGH,
        owner: dataPanel.owner,
        repo: dataPanel.repo,
        path: dataPanel.path,
        newData: belipanel,
        message: `add buyer panel 1GB ${username}`
      });

      let text = `ʜᴀɪ ${username} sᴇʟᴀᴍᴀᴛ ᴀɴᴅᴀ ᴛᴇʟᴀʜ ᴛᴇʀᴅᴀғᴛᴀʀ ᴅɪ ᴘᴀɴᴇʟ RHNX

⟢ *ᴜsᴇʀɴᴀᴍᴇ* : ${username}
⟢ *ᴇᴍᴀɪʟ* : ${email}
⟢ *ᴘᴀssᴡᴏʀᴅ* : ${password}
⟢ *ʟᴏɢɪɴ ᴘᴀɴᴇʟ* ${panel.domain}
⟢ *ᴛᴀɴɢɢᴀʟ ᴘᴇᴍʙᴇʟɪᴀɴ* : ${belipanel.date}
⟢ *ᴍᴀsᴀ ʙᴇʀʟᴀᴋᴜ ʜɪɴɢɢᴀ* : ${belipanel.expired}

⚠️ *ɪɴғᴏʀᴍᴀsɪ ᴘᴇɴᴛɪɴɢ*
Ⓘ ᴅᴀᴛᴀ ᴀᴋᴀɴ ᴅɪᴋɪʀɪᴍ ᴋᴀɴ ʜᴀɴʏᴀ sᴇᴋᴀʟɪ,ᴊɪᴋᴀ ᴀɴᴅᴀ ʟᴜᴘᴀ sɪʟᴀʜᴋᴀɴ ᴋᴇᴛɪᴋ *.ᴘᴀɴᴇʟᴋᴜ*
Ⓘ ᴅɪʟᴀʀᴀɴɢ ᴋᴇʀᴀs ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ᴘᴀɴᴇʟ ᴜɴᴛᴜᴋ ᴀᴋᴛɪᴠɪᴛᴀs ɪʟᴇɢᴀʟ sᴇᴘᴇʀᴛɪ ᴅᴅᴏs. ᴘᴇʟᴀɴɢɢᴀʀᴀɴ ᴀᴋᴀɴ ᴍᴇɴɢᴀᴋɪʙᴀᴛᴋᴀɴ ᴘᴇɴɢʜᴀᴘᴜsᴀɴ ᴀᴋᴜɴ ᴅᴀɴ sᴇʀᴠᴇʀ ᴛᴀɴᴘᴀ ᴘᴇᴍʙᴇʀɪᴛᴀʜᴜᴀɴ
Ⓘ ɪɴғᴏ sᴇʟᴇɴɢᴋᴀᴘɴʏᴀ:  ${bot.gcstore}

*ᴛᴇʀɪᴍᴀᴋᴀsɪʜ ᴛᴇʟᴀʜ ᴍᴇᴍᴘᴇʀᴄᴀʏᴀɪ RHNX*`;

      await conn.sendThumbnail(jid, text, m, {
        title: `Panel Petrrodactyle`,
        body: ``,
        thumbnailUrl: panel.image,
        mediaUrl: sosmed.youtube,
        sourceUrl: "",
        quoted: null
      });

      m.reply("✅ Panel 1GB berhasil dibuat & disimpan ke GitHub");
    } catch (e) {
      console.error(e);
      m.reply("❌ Gagal membuat panel 1GB");
    }
  }
};
