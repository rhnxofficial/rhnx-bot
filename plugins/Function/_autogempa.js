import fetch from "node-fetch";

const API_GEMPA = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";

async function cekGempa(conn) {
  try {
    if (!db.data.others) db.data.others = {};
    if (!db.data.others.notifGempa) db.data.others.notifGempa = {};

    let lastGempa = db.data.others.notifGempa.lastDateTime || null;

    const res = await fetch(API_GEMPA, { timeout: 15000 });
    const data = await res.json();

    const g = data?.Infogempa?.gempa;
    if (!g) return;

    if (lastGempa === g.DateTime) return;
    db.data.others.notifGempa.lastDateTime = g.DateTime;

    const text = styleSans(`
 *UPDATE GEMPA BMKG*\n\n
◦ *Tanggal:* ${g.Tanggal}
◦ *Jam:* ${g.Jam}
◦ *Wilayah:* ${g.Wilayah}
◦ *Magnitudo:* ${g.Magnitude}
◦ *Kedalaman:* ${g.Kedalaman}
◦ *Potensi:* ${g.Potensi}
◦ *Dirasakan:* ${g.Dirasakan}

🔍 Sumber: BMKG (https://bmkg.go.id)
    `).trim();

    const chats = db.data.chats || {};
    for (const jid in chats) {
      if (chats[jid].updategempa === true) {
        await conn
          .sendMessage(jid, {
            image: { url: `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` },
            caption: text
          })
          .catch(() => {});
      }
    }
  } catch (e) {
    console.error("Error cek gempa:", e);
  }
}

export default {
  name: "notifGempa",
  type: "hook",

  async before(m, { conn }) {
    if (!global.gempaLoop) {
      console.log("🌍 Monitor gempa aktif...");
      global.gempaLoop = setInterval(() => {
        cekGempa(conn);
      }, 60 * 1000);
    }
  }
};
