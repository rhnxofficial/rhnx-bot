import fs from "fs";
import { teks, vn, stik, getRandom } from "./botContent.js";

const dataGcStore = "./database/store/groupstore.json";

const getGroupStoreIds = () => {
  try {
    const raw = fs.readFileSync(dataGcStore, "utf8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return [];
    return data.map((v) => v.idGc).filter(Boolean);
  } catch {
    return [];
  }
};

export default async function checkAccess(m, commandConfig, extras) {
  const { isOwner, isPremium, isJadibot, conn, q, args } = extras;
  const access = commandConfig.access || {};
  const responseType = db?.data?.settings?.respontype || "text";

  const sendResponse = async (category) => {
    const teksList = teks[category] || [];
    const vnList = vn[category] || [];
    const stikList = stik[category] || [];

    switch (responseType) {
      case "vn":
        if (vnList.length > 0) {
          await conn.sendMessage(
            m.chat,
            { audio: { url: getRandom(vnList) }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } else m.reply(getRandom(teksList));
        break;

      case "sticker":
        if (stikList.length > 0) {
          await conn.sendMessage(m.chat, { sticker: { url: getRandom(stikList) } }, { quoted: m });
        } else m.reply(getRandom(teksList));
        break;

      default:
        m.reply(getRandom(teksList));
        break;
    }
  };

  // ===================== //
  let user = global.db.data.users[m.sender];
  if (access.register) {
    if (!user || !user.registered) {
      let teks = "🚩 Ups! Sepertinya kamu belum terdaftar 😅\n\nsilahkan *.register* dulu dengan klik *button* Di Bawah Ini dulu ya biar bisa main dengan bot ini!"
  conn.sendInteractive(
  m.chat,
  {
    text: styleText(teks),
    footer: bot.name,

    interactiveButtons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Register",
          id: ".register"
        })
      }
    ]
  },
  {
    quoted: m,
    mentions: [m.sender],
    useAI: true 
  }
);
      return false;
    }
  }
  
  if (access.nocmdprivate && !m.isGroup) {
  if (!isOwner && !isPremium) {
    let Tek = styleText(`⚠️ Hai ${m.pushName}!\nFitur ini hanya bisa digunakan di grup.\nKalau ingin pakai di chat pribadi, kamu harus menjadi *Premium* atau *Owner*.\n💡 Ketik *.buypremium* untuk info upgrade.`);
    conn.sendInteractive(
  m.chat,
  {
    text: Tek,
    footer: bot.name,

    interactiveButtons: [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Join Group",
          url: sosmed.whatsapp
        })
      }
    ]
  },
  {
    quoted: m,
    mentions: [m.sender],
    useAI: true 
  }
);
    return false; 
  }
  }
  
  if (access.loading && (args?.length > 0 || q?.length > 0)) {
    if (!user) {
      user = global.db.data.users[m.sender] = { limit: 30, limitgame: 30 };
    }

    if (access.limit && user.limit <= 0) return false;
    if (access.glimit && user.limitgame <= 0) return false;

    await sendResponse("loading");
  }

  if (access.nojadibot && extras?.conn?.isJadiBot) {
    m.reply(
      "Maaf, fitur ini tidak bisa digunakan dari jadibot. Hanya bot utama yang dapat menjalankannya."
    );
    return false;
  }

  if (access.owner && access.private) {
    if (!isOwner) {
      await sendResponse("owner");
      return false;
    }
    if (m.isGroup) {
      await sendResponse("private");
      return false;
    }
    return true;
  }

  if (access.owner && !isOwner) {
    await sendResponse("owner");
    return false;
  }

  if (access.premium && !isPremium) {
    m.reply("⛔ Maaf, fitur ini khusus untuk pengguna Premium.");
    return false;
  }

  if (access.group && !m.isGroup) {
    m.reply("⛔ Fitur ini hanya bisa digunakan di grup.");
    return false;
  }

  if (access.private && m.isGroup) {
    await sendResponse("private");
    return false;
  }

  if (access.groupstore) {
    if (!m.isGroup) {
      m.reply("⛔ Fitur ini hanya bisa digunakan di grup.");
      return false;
    }
    if (!getGroupStoreIds().includes(m.chat)) {
      m.reply("⛔ Grup ini tidak terdaftar sebagai *Group Store*.");
      return false;
    }
  }

  if (access.nocmdstore && m.isGroup && getGroupStoreIds().includes(m.chat)) {
    m.reply("⛔ Fitur ini tidak bisa digunakan di Group Store.");
    return false;
  }

  if (access.admin && !m.isAdmin) {
    m.reply("⛔ Hanya bisa diakses oleh Admin grup.");
    return false;
  }

  if (access.botadmin && !m.isBotAdmin) {
    m.reply("⛔ Bot harus menjadi admin untuk menjalankan perintah ini.");
    return false;
  }

  if (access.game) {
    let chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.game) {
      m.reply("🎮 Game belum aktif di grup ini!\nAktifkan dulu dengan perintah: *.game on*");
      return false;
    }
  }

  if (access.glimit) {
    let user = global.db.data.users[m.sender];
    if (!user) {
      global.db.data.users[m.sender] = { limitgame: 30 };
      user = global.db.data.users[m.sender];
    }
    if (typeof user.limitgame !== "number") user.limitgame = 10;

    if (user.limitgame <= 0) {
      m.reply("⛔ *Limit game kamu sudah habis!*");
      return false;
    }
    user.limitgame -= 1;
  }

  if (access.limit && ((args && args.length > 0) || (q && q.length > 0))) {
    try {
      let user = global.db.data.users[m.sender];
      if (!user) {
        user = { limit: 30 };
        global.db.data.users[m.sender] = user;
      }

      if (!isOwner && !isPremium) {
        if (user.limit <= 0) {
          await m.reply("⛔ Limit kamu sudah habis, tunggu reset harian.");
          return false;
        }
        user.limit -= 1;
      }
    } catch (err) {
      console.error("❌ Error di limit otomatis:", err);
      await m.reply("Terjadi kesalahan saat memproses limit.");
      return false;
    }
  }

  return true;
}
