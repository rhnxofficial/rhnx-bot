import fs from "fs";
const MENFES_FILE = "./database/private/menfes.json";

function readDB() {
  if (!fs.existsSync(MENFES_FILE)) return {};
  return JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(MENFES_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: "menfesHook",
  type: "hook",

  async before(m, { conn }) {
    if (m.fromMe) return;
    const prefixes = [".", "!", "#"];
    if (prefixes.some((p) => m.text?.startsWith(p))) return;

    const menfesDB = readDB();
    if (!Object.keys(menfesDB).length) return;

    const thread = Object.values(menfesDB).find(
      (x) => x.dari === m.sender || x.penerima === m.sender
    );
    if (!thread) return;

    const { id, dari, penerima, nama, status } = thread;

    if (status === true) {
      return;
    }

    let tujuan = m.sender === dari ? penerima : dari;

    let caption = "";
    if (m.text) {
      caption =
        m.sender === penerima
          ? `📩 *Balasan dari penerima (${nama})*:\n${m.text}`
          : `💌 *Balasan dari pengirim anonim*:\n${m.text}`;
    }

    const mediaMsg = m.quoted || m;
    const isImg = mediaMsg.mtype?.includes("image");
    const isVid = mediaMsg.mtype?.includes("video");

    let content = {};
    if (isImg || isVid) {
      try {
        const buffer = await mediaMsg.download();
        content = isImg ? { image: buffer, caption } : { video: buffer, caption };
      } catch {
        if (!caption) return;
        content = { text: caption };
      }
    } else if (caption) {
      content = { text: caption };
    } else return;

    await conn.sendMessage(tujuan, content);

    thread.balasan.push({
      dari: m.sender,
      pesan: m.text || "[media]",
      waktu: new Date().toISOString()
    });

    thread.lastChat = m.sender;
    saveDB(menfesDB);

    if (m.sender === dari) {
      m.reply("✔️ Pesan kamu sudah aku kirim ke penerima!");
    } else if (m.sender === penerima) {
      m.reply("📨 Oke! Pesan kamu sudah aku teruskan ke pengirim anonim 😉");
    }
  }
};
