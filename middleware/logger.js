import chalk from "chalk";
import moment from "moment-timezone";

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

const timeNow = () => moment.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

const colorValue = (val) => {
  if (typeof val === "string") return chalk.green(`"${val}"`);
  if (typeof val === "number") return chalk.yellow(val);
  if (typeof val === "boolean") return chalk.magenta(val);
  return chalk.white(JSON.stringify(val));
};

const logJSON = (data, typeColor = chalk.white) => {
  console.log(typeColor("{"));
  Object.entries(data).forEach(([key, val], i) => {
    if (val === undefined) return;
    const comma = i === Object.keys(data).length - 1 ? "" : ",";
    console.log(`  ${chalk.cyan(`"${key}"`)}: ${colorValue(val)}${comma}`);
  });
  console.log(typeColor("}"));
};

export function Logmessage(conn, m) {
  const body = m?.budy || "";
  const isGroup = m?.isGroup;
  const isChannel = m.chat?.endsWith("@newsletter");
  const type = Object.keys(m?.message || {})[0] || "unknown";
  const mediaType = typeMediaApa(type);

  if (m?.key?.remoteJid === "status@broadcast") return;

  const data = {
    type: isGroup ? "GROUP_MESSAGE" : isChannel ? "CHANNEL_MESSAGE" : "PRIVATE_MESSAGE",
    media: mediaType,
    pesan: body || "",
    sender: isGroup || !isChannel ? m.pushName || "Tanpa Nama" : undefined,
    senderId: isGroup || !isChannel ? m.sender : undefined,
    groupName: isGroup ? m.groupName : undefined,
    groupId: isGroup ? m.chat : undefined,
    channelId: isChannel ? m.chat : undefined,
    time: timeNow()
  };

  if (isGroup) logJSON(data, chalk.magenta);
  else if (isChannel) logJSON(data, chalk.yellow);
  else logJSON(data, chalk.gray);
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

  if (isGroup) logJSON(data, chalk.cyan);
  else logJSON(data, chalk.magentaBright);
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

  if (isGroup) logJSON(data, chalk.redBright);
  else logJSON(data, chalk.red);
}
