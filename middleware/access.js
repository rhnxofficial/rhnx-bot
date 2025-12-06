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
      m.reply(
        "⚠️ Kamu Perlu Daftar.\n" +
          "Silakan Daftar Terlebih Dahulu Agar Bisa Menggunakan Bot dengan mengetik: *.register*"
      );
      return false;
    }
  }

  // LOADING
  if (access.loading && (args?.length > 0 || q?.length > 0)) {
    if (!user) {
      user = global.db.data.users[m.sender] = { limit: 30, limitgame: 30 };
    }

    if (access.limit && user.limit <= 0) return false;
    if (access.glimit && user.limitgame <= 0) return false;

    await sendResponse("loading");
  }

  // NO JADI BOT
  if (access.nojadibot && extras?.conn?.isJadiBot) {
    m.reply(
      "Maaf, fitur ini tidak bisa digunakan dari jadibot. Hanya bot utama yang dapat menjalankannya."
    );
    return false;
  }

  // OWNER + PRIVATE
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

  // OWNER
  if (access.owner && !isOwner) {
    await sendResponse("owner");
    return false;
  }

  // PREMIUM
  if (access.premium && !isPremium) {
    m.reply("⛔ Maaf, fitur ini khusus untuk pengguna Premium.");
    return false;
  }

  // GROUP ONLY
  if (access.group && !m.isGroup) {
    m.reply("⛔ Fitur ini hanya bisa digunakan di grup.");
    return false;
  }

  // NO CMD PRIVATE
  if (access.nocmdprivate && !m.isGroup) {
    return false;
  }

  // PRIVATE ONLY
  if (access.private && m.isGroup) {
    await sendResponse("private");
    return false;
  }

  // GROUP STORE
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

  // NO CMD STORE
  if (access.nocmdstore && m.isGroup && getGroupStoreIds().includes(m.chat)) {
    m.reply("⛔ Fitur ini tidak bisa digunakan di Group Store.");
    return false;
  }

  // ADMIN
  if (access.admin && !m.isAdmin) {
    m.reply("⛔ Hanya bisa diakses oleh Admin grup.");
    return false;
  }

  // BOT ADMIN
  if (access.botadmin && !m.isBotAdmin) {
    m.reply("⛔ Bot harus menjadi admin untuk menjalankan perintah ini.");
    return false;
  }

  // GAME MODE
  if (access.game) {
    let chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.game) {
      m.reply("🎮 Game belum aktif di grup ini!\nAktifkan dulu dengan perintah: *.game on*");
      return false;
    }
  }

  // LIMIT GAME
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

  // LIMIT
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
