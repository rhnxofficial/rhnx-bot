export default {
  name: "panel",
  alias: ["hargapanel"],
  description: "Daftar harga panel RHNX",

  run: async (m, { conn }) => {
    try {
      if (typeof waktuPanel !== "object") {
        return m.reply("Gagal: data harga panel belum tersedia.");
      }

      const namaPaket = {
        onegb: "1 GB",
        twogb: "2 GB",
        threegb: "3 GB",
        fourgb: "4 GB",
        fivegb: "5 GB",
        sixgb: "6 GB",
        sevengb: "7 GB",
        eightgb: "8 GB",
        ninegb: "9 GB",
        tengb: "10 GB",
        unli: "UNLIMITED"
      };

      let teks = 
`♡ ∩_∩ 
  („• ֊ •„)♡
|￣U U￣￣￣￣￣￣￣￣￣|
| ραкєт ραиєℓ ${panel.name}
￣￣￣￣￣￣￣￣￣￣￣￣

`;

      for (const [key, val] of Object.entries(waktuPanel)) {
        const nama = namaPaket[key] || key;

        teks += 
`${nama}
• Aktif : ${val.waktu} hari
• Harga : Rp${val.harga.toLocaleString("id-ID")}

`;
      }

      teks +=
`♯ кєυитυиgαи ♯
*⩽⩾* ɢᴀ ʙᴏʀᴏs ᴋᴜᴏᴛᴀ
*⩽⩾* sᴄʀɪᴘᴛ ᴀɴᴅᴀ ᴛᴇʀᴊᴀɢᴀ ᴀᴍᴀɴ
*⩽⩾* sᴇʀᴠᴇʀ ᴍᴀsɪʜ ᴀᴋᴛɪғ ᴍᴇsᴋɪ ᴀɴᴅᴀ ᴋᴇʟᴜᴀʀ ᴅᴀʀɪ sɪᴛᴜs
*⩽⩾* ᴊɪᴋᴀ sɪᴛᴜs ᴍᴀᴛɪ ᴛᴏᴛᴀʟ, sᴇʜɪɴɢɢᴀ ᴛɪᴅᴀᴋ sᴇᴍᴘᴀᴛ ᴅɪ ᴏᴘᴛɪᴍᴀʟᴋᴀɴ,
      ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴅᴇɴɢᴀɴ ᴊᴀᴍɪɴᴀɴ ᴜᴀɴɢ ᴀɴᴅᴀ ᴋᴀᴍɪ ᴋᴇᴍʙᴀʟɪᴋᴀɴ

ιиfσ ραиєℓ : ${bot.gcstore}`;

      const teksnya = teks.trim();

      await conn.sendInteractive(
        m.chat,
        {
          text: styleText(teksnya),
          footer: bot.name,
          image: { url: panel.image },
          interactiveButtons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "Kirim Pesan",
                url: `https://wa.me/${owner.contact}`
              })
            }
          ]
        },
        {
          quoted: fkontak
        }
      );

    } catch (err) {
      console.error(err);
      m.reply("Terjadi kesalahan saat menampilkan harga panel.");
    }
  }
};