import axios from "axios";

export default {
  name: "aiTagHook",
  description: "Hook AI otomatis ketika bot di tag di grup",
  type: "hook",

  before: async (m, { conn }) => {
    if (!m.isGroup || !m.text) return;

    const mentions = m.mentionByTag ? m.mentionByTag() : [];
    const botJid = conn.decodeJid(conn.user.id);

    if (!mentions.includes(botJid)) return;

    let cleanText = m.text.replace(/@\d{5,}/g, "").trim();

    if (!cleanText) cleanText = "halo";

    const testai = {
      key: {
        fromMe: false,
        participant: `13135550002@s.whatsapp.net`,
        remoteJid: `${m.chat}`
      },
      message: {
        contactMessage: {
          displayName: `@Meta AI ${cleanText}`,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:Meta AI;;;;
FN:Meta AI
item1.TEL;waid=13135550002:13135550002
item1.X-ABLabel:Ponsel
END:VCARD`
        }
      }
    };

    const systemPrompt = `
Kamu adalah "rhnx", AI yang jago roasting dengan gaya lucu, santai, dan pedes tapi tetap sopan.
Jika user menyuruhmu roasting seseorang, kamu boleh roasting target tersebut dengan humor cerdas,
sarkas ringan, dan punchline yang kena.

Jangan menyerang hal sensitif seperti fisik ekstrem, penyakit, ras, agama, atau hal berbahaya.
Fokus pada tingkah laku, omongan, atau kelakuan lucu.

Jika targetnya toxic, kamu boleh roasting balik sedikit lebih pedes, tapi tetap aman.

Gaya roastingmu:
- pedes tapi elegan
- punchline singkat tapi nusuk
- satir dan playful
- percaya diri, tidak baper
- selalu jawab dalam gaya rhnx

Contoh:
- "Bro ngomong kayak paket data numpang hotspot, putus nyambung."
- "Sok jago, tapi password Wifi aja minjem tetangga."
- "Ngomong gede, mental kecil, mirip speaker bluetooth 20 ribuan."
`;
    const kirimPesan = async (teks) => {
      try {
        const url = `${api.rhnx}/api/ai?text=${encodeURIComponent(
          teks
        )}&prompt=${encodeURIComponent(systemPrompt)}&key=${key.rhnx}`;

        const res = await axios.get(url);
        return res.data?.data?.result || null;
      } catch (e) {
        console.error("Gagal kirim pesan:", e.message);
        return null;
      }
    };

    const hasil = await kirimPesan(cleanText);

    if (hasil) {
      conn.sendPresenceUpdate("composing", m.chat);

      await conn.sendMessage(
        m.chat,
        {
          text: hasil,
          mentions: [m.sender]
        },
        { quoted: testai }
      );
    } else {
      await m.reply("⚠️ *Gagal mendapatkan respon AI.*");
    }
  }
};
