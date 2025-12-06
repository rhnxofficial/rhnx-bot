import moment from "moment-timezone";
import { isNumber } from "../lib/myfunc.js";

const now = moment().tz("Asia/Jakarta");

function makeid(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function register(m, conn) {
  try {
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.chats) global.db.data.chats = {};
    if (!global.db.data.chanel) global.db.data.chanel = {};

    if (!m.sender.endsWith("@newsletter")) {
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {
          id: m.sender,
          name: m.pushName || "no name",
          email: "",
          date: `${week} ${calender}`,
          lastseen: Date.now(),
          hit: 0,
          exp: 0,
          level: 0,
          lastLevelNotify: 0,
          autolevelup: true,
          balance: 30,
          money: 30,
          lastclaim: 0,
          serial: makeid(4).toUpperCase(),
          registered: false,
          role: "Beginner",
          grade: "Newbie",
          premium: false,
          premiumsince: "",
          premiumend: "",
          limit: 30,
          limitgame: 30,
          limitResetTime: null,
          pasangan: [],
          putusPending: null,
          putusTime: 0,
          afk: -1,
          afkReason: "",
          sticker: {}
        };
      }
    }

    if (m.isGroup) {
      let chat = global.db.data.chats[m.chat];
      if (!chat) {
        global.db.data.chats[m.chat] = {
          id: m.chat,
          name: m.groupName || "",
          hit: 0,
          welcome: false,
          groupupdate: false,
          updategempa: false,
          antispam: true,
          autosholat: false,
          notifsholat: false,
          antimedia: {
            all: false,
            audio: false,
            image: false,
            video: false,
            sticker: false,
            link: false,
            linkgc: false,
            linkch: false,
            tagswgc: false
          },
          blacklist: "",
          banstik: {},
          banchat: false,
          simi: true,
          game: false,
          sewa: false,
          sewasince: "",
          sewaends: "",
          type: "group"
        };
      } else {
        if (!("name" in chat)) chat.name = m.groupName || "";
        if (!isNumber(chat.hit)) chat.hit = 0;
      }
    }

    if (m.chat && m.chat.includes("@newsletter")) {
      let chanel = global.db.data.chanel[m.chat];
      try {
        const metadata = await conn.newsletterMetadata("jid", m.chat).catch(() => ({}));

        if (!chanel) {
          global.db.data.chanel[m.chat] = {
            id: metadata?.id || m.chat,
            name: metadata?.name || m.chat,
            desc: metadata?.description || "",
            invite: metadata?.invite || "",
            picture: metadata?.picture || "",
            preview: metadata?.preview || "",
            subscribers: metadata?.subscribers || 0,
            verification: metadata?.verification || "",
            state: metadata?.state || "",
            created: metadata?.creation_time
              ? new Date(metadata.creation_time * 1000).toISOString()
              : "",
            hit: 0,
            type: "channel",
            savedAt: new Date().toISOString()
          };
          console.log(`[CHANNEL] Ditambahkan: ${metadata?.name || m.chat}`);
        } else {
          chanel.name = metadata?.name || chanel.name || "";
          chanel.desc = metadata?.description || chanel.desc || "";
          chanel.invite = metadata?.invite || chanel.invite || "";
          chanel.picture = metadata?.picture || chanel.picture || "";
          chanel.preview = metadata?.preview || chanel.preview || "";
          chanel.subscribers = metadata?.subscribers || chanel.subscribers || 0;
          chanel.verification = metadata?.verification || chanel.verification || "";
          chanel.state = metadata?.state || chanel.state || "";
          chanel.created = metadata?.creation_time
            ? new Date(metadata.creation_time * 1000).toISOString()
            : chanel.created || "";
        }
      } catch (e) {
        console.error("❌ Gagal ambil metadata channel:", e);
        if (!chanel) {
          global.db.data.chanel[m.chat] = {
            id: m.chat,
            name: m.chat,
            desc: "",
            hit: 0,
            subscribers: 0,
            type: "channel",
            savedAt: new Date().toISOString()
          };
        }
      }
    }
    await global.db.write();
  } catch (err) {
    console.error("❌ Gagal register:", err);
  }
}
