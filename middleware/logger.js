import chalk from "chalk";
import moment from "moment-timezone";

const KEY = chalk.cyanBright.italic;
const STR = chalk.whiteBright.italic;
const NUM = chalk.blueBright.italic;
const BOOL = chalk.hex("#87b7ff").italic;
const ID = chalk.hex("#4da6ff").italic;
const CMD = chalk.hex("#99ccff").italic;
const TIME = chalk.gray.italic;

const BORDER = chalk.blueBright.italic;

const typeMediaApa = (type) => {
  const mediaTypes = {
    imageMessage: "🖼️ Gambar",
    videoMessage: "🎥 Video",
    stickerMessage: "🔖 Stiker",
    audioMessage: "🎵 Audio",
    contactMessage: "📞 Kontak",
    locationMessage: "📍 Lokasi",
    documentMessage: "📄 Dokumen"
  };
  return mediaTypes[type] || "💬 Teks";
};

const timeNow = () =>
  moment.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

const colorValue = (key, val) => {
  if (key === "senderId" || key === "groupId" || key === "channelId")
    return ID(val);

  if (key === "command") return CMD(`"${val}"`);
  if (key === "type") return chalk.bgBlueBright.white.bold(` ${val} `);
  if (key === "time") return TIME(val);

  if (typeof val === "string") return STR(`"${val}"`);
  if (typeof val === "number") return NUM(val);
  if (typeof val === "boolean") return BOOL(val);

  return STR(JSON.stringify(val));
};

const logJSON = (data) => {
  console.log(BORDER("{"));

  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

  entries.forEach(([key, val], i) => {
    const comma = i === entries.length - 1 ? "" : ",";
    console.log(`  ${KEY(`"${key}"`)}: ${colorValue(key, val)}${comma}`);
  });

  console.log(BORDER("}"));
};

export function Logmessage(conn, m) {
  const body = m?.budy || "";
  const isGroup = m?.isGroup;
  const isChannel = m.chat?.endsWith("@newsletter");
  const type = Object.keys(m?.message || {})[0] || "unknown";

  if (m?.key?.remoteJid === "status@broadcast") return;

  const data = {
    type: isGroup ? "GROUP_MESSAGE" : isChannel ? "CHANNEL_MESSAGE" : "PRIVATE_MESSAGE",
    media: typeMediaApa(type),
    pesan: body || "",
    sender: isGroup || !isChannel ? m.pushName || "Tanpa Nama" : undefined,
    senderId: isGroup || !isChannel ? m.sender : undefined,
    groupName: isGroup ? m.groupName : undefined,
    groupId: isGroup ? m.chat : undefined,
    channelId: isChannel ? m.chat : undefined,
    time: timeNow()
  };

  logJSON(data);
}

export function Logcommands(m, command) {
  const isGroup = m.isGroup;

  const data = {
    type: isGroup ? "GROUP_COMMAND" : "PRIVATE_COMMAND",
    command,
    sender: m.pushName || "Tanpa Nama",
    senderId: m.sender,
    groupName: isGroup ? m.groupName : undefined,
    groupId: isGroup ? m.chat : undefined,
    time: timeNow()
  };

  logJSON(data);
}

export function Logerror(m, error) {
  const isGroup = m?.isGroup;
  const errText = (error?.stack || error?.message || String(error)).slice(0, 500);

  const data = {
    type: isGroup ? "GROUP_ERROR" : "PRIVATE_ERROR",
    error: errText,
    sender: m?.pushName || "Tanpa Nama",
    senderId: isGroup ? m?.chat : m?.sender,
    groupName: isGroup ? m?.groupName : undefined,
    groupId: isGroup ? m?.chat : undefined,
    time: timeNow()
  };

  logJSON(data);
}
