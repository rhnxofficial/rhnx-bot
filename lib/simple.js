import {
  proto,
  jidDecode,
  isJidNewsletter,
  areJidsSameUser,
  getContentType,
  generateMessageID,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateWAMessageFromContent
} from "baileys";
import util from "util";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { getBuffer } from "./myfunc.js";
import { stickerify } from "./exif.js";
import { sendInteractiveMessage, sendInteractiveButtonsBasic } from "./button.js";

export function Func(sock) {
  const conn = sock;
  
conn.sendAI = async (jid, text, quotedOrOpts = {}) => {
  try {
    const messageContent = {
      extendedTextMessage: { text }
    };

    const opts = typeof quotedOrOpts === "object" && quotedOrOpts.key ? { quoted: quotedOrOpts } : quotedOrOpts;

    const fullMsg = generateWAMessageFromContent(jid, messageContent, {
      userJid: conn.user.id,
      messageId: generateMessageID(),
      ...opts
    });

    const additionalNodes = [{ tag: "bot", attrs: { biz_bot: "1" } }];

    await conn.relayMessage(jid, fullMsg.message, {
      messageId: fullMsg.key.id,
      additionalNodes
    });

    return fullMsg;
  } catch (e) {
    console.error("[sendAI ERROR]", e);
  }
};

  conn.sendButtons = async (jid, data = {}, options = {}) => {
    return await sendInteractiveButtonsBasic(conn, jid, data, options);
  };

  conn.sendInteractive = async (jid, data = {}, options = {}) => {
    return await sendInteractiveMessage(conn, jid, data, options);
  };

conn.sendCarousel = async (
  jid,
  cards = [],
  openingText = "",
  buttonOpt = {}
) => {
  try {
const { button_text = "Url" } = buttonOpt;
    const createCard = async (item) => {
      const media = await prepareWAMessageMedia(
        { image: { url: item.image } },
        { upload: conn.waUploadToServer }
      );

      return {
        header: proto.Message.InteractiveMessage.Header.create({
          ...media,
          gifPlayback: false,
          hasMediaAttachment: false
        }),

        body: { text: item.text },

        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: button_text,
                url: item.url || "https://wa.me",
                merchant_url: item.merchant || "https://whatsapp.com"
              })
            }
          ]
        }
      };
    };

    const finalCards = [];
    for (const item of cards) {
      finalCards.push(await createCard(item));
    }

    const msg = generateWAMessageFromContent(
      jid,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: openingText },
              carouselMessage: {
                cards: finalCards,
                messageVersion: 1
              }
            }
          }
        }
      },
      {
        userJid: conn.user.id || conn.user.jid,
        quoted: null
      }
    );

    await conn.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    });

  } catch (err) {
    console.error("🔻sendCarousel ERROR:", err);
  }
};
  
  conn.sendMusic = (jid, teks, options) => {
    let contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        renderLargerThumbnail: false,
        title: `⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ↻`,
        body: `   ━━━━⬤──────────    `,
        description: "Now Playing ....",
        mediaType: 2,
        thumbnailUrl: "https://files.catbox.moe/phkybd.jpg",
        mediaUrl: "https://www.youtube.com/@rangelbot"
      }
    };

    conn.sendMessage(jid, { contextInfo, mimetype: "audio/mp4", audio: teks }, { quoted: options });
  };

  conn.sendSticker = async (jid, input, quoted, options = {}) => {
    try {
      const buffer = await stickerify(input, options);
      return await conn.sendMessage(jid, { sticker: buffer }, { quoted, ...options });
    } catch (e) {
      console.error("sendSticker error:", e);
      return null;
    }
  };

  conn.sendvn = (id, teks, m) => {
    conn.sendMessage(
      id,
      {
        audio: { url: teks },
        ptt: true,
        waveform: [0, 0, 50, 0, 0, 0, 10, 80, 10, 60, 10, 99, 60, 30, 10, 0, 0, 0],
        mimetype: "audio/mpeg"
      },
      { quoted: m }
    );
  };

  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(
      jid,
      {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net")
        },
        ...options
      },
      { quoted }
    );

  conn.sendThumbnail = (id, teks, m, opts = {}) => {
    if (!teks) teks = "";
    const {
      title = "Judul",
      body = "Deskripsi",
      thumbnailUrl = "",
      mediaUrl = "",
      sourceUrl = "",
      quoted = null
    } = opts;

    let contextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      containsAutoReply: true,
      mentionedJid: m ? [m.sender] : [],
      externalAdReply: {
        title,
        body,
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnailUrl,
        sourceUrl,
        mediaUrl
      }
    };

    return conn.sendMessage(id, { text: styleText(String(teks)), contextInfo }, { quoted });
  };

  conn.sendMessageModify = async (jid, text = "", quoted = null, opts = {}) => {
    const {
      title = "",
      body = "",
      thumbnail = null,
      url = "https://google.com",
      largeThumb = false,
      ads = false,
      forwardingScore = 100,
      isForwarded = true,
      containsAutoReply = true,
      mentions = [],
      businessOwnerJid = null
    } = opts;

    let thumbBuffer = null;
    try {
      if (Buffer.isBuffer(thumbnail)) {
        thumbBuffer = thumbnail;
      } else if (typeof thumbnail === "string" && thumbnail.startsWith("http")) {
        const res = await axios.get(thumbnail, { responseType: "arraybuffer" });
        thumbBuffer = Buffer.from(res.data, "binary");
      }
    } catch (e) {
      console.error("Thumbnail error:", e);
      thumbBuffer = null;
    }

    const msg = {
      text: styleText(String(text)),
      contextInfo: {
        forwardingScore,
        isForwarded,
        containsAutoReply,
        mentionedJid: mentions,
        ...(businessOwnerJid ? { businessMessageForwardInfo: { businessOwnerJid } } : {}),
        externalAdReply: {
          title,
          body,
          mediaType: 1,
          renderLargerThumbnail: !!largeThumb,
          showAdAttribution: !!ads,
          sourceUrl: url,
          thumbnail: thumbBuffer
        }
      }
    };

    return conn.sendMessage(jid, msg, { quoted });
  };

  conn.sendContactArray = async (jid, data, quoted, options) => {
    let contacts = [];

    for (let list of data) {
      let [
        number,
        name,
        org,
        title,
        email = "example@gmail.com",
        region = "Indonesia",
        website = "https://example.com",
        note = "Contact Bot"
      ] = list;
      number = number.replace(/[^0-9]/g, "");
      let intl = number.startsWith("0")
        ? "+62" + number.slice(1)
        : number.startsWith("62")
          ? "+" + number
          : "+" + number;

      let vcard = `
BEGIN:VCARD
VERSION:3.0
N:${name};;;;
FN:${name}
ORG:${org}
TITLE:${title}
TEL;type=CELL;type=VOICE;waid=${number}:${intl}
EMAIL;type=INTERNET:${email}
ADR:;;${region};;;;
URL:${website}
NOTE:${note}
END:VCARD`.trim();

      contacts.push({
        displayName: name,
        vcard
      });
    }

    return await conn.sendMessage(
      jid,
      {
        contacts: {
          displayName: contacts.length > 1 ? `${contacts.length} kontak` : contacts[0].displayName,
          contacts
        }
      },
      { quoted, ...options }
    );
  };

  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim();
    } else return jid.trim();
  };

  conn.getName = async (jid) => {
    try {
      if (!jid) return "Tanpa Nama";
      jid = conn.decodeJid(jid);
      if (jid.endsWith("@g.us")) {
        try {
          const meta = await conn.groupMetadata(jid);
          return meta.subject || "Grup";
        } catch {
          return "Grup";
        }
      }
      if (jid.endsWith("@newsletter")) {
        return "Channel";
      }
      const info = await conn.onWhatsApp(jid);
      if (info && info[0] && info[0].notify) {
        return info[0].notify;
      }
      return jid.split("@")[0];
    } catch {
      return jid.split("@")[0];
    }
  };

  conn.downloadMediaMessage = async (msg, returnType = "buffer") => {
    try {
      const mtype = Object.keys(msg.message)[0];
      const stream = await downloadContentFromMessage(
        msg.message[mtype],
        mtype.replace(/Message/gi, "")
      );
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (returnType === "buffer") return buffer;
      if (returnType === "base64") return buffer.toString("base64");
      if (returnType === "stream") return stream;
      return buffer;
    } catch (err) {
      console.error("downloadMediaMessage error:", err);
      return null;
    }
  };

  conn.isBotInGroup = async (groupId) => {
    try {
      const meta = await conn.groupMetadata(groupId).catch(() => null);
      if (!meta || !meta.participants) {
        return { inGroup: false, isAdmin: false };
      }
      const botJid = conn.decodeJid(conn.user?.id);
      const botData = meta.participants.find((p) => {
        const jid = conn.decodeJid(p.jid);
        return jid === botJid;
      });

      if (!botData) {
        return {
          inGroup: false,
          isAdmin: false
        };
      }

      const isAdmin = botData.admin === "admin" || botData.admin === "superadmin";

      return {
        inGroup: true,
        isAdmin
      };
    } catch (err) {
      console.error("❌ Error conn.isBotInGroup:", err?.message || err);
      return { inGroup: false, isAdmin: false };
    }
  };
  return conn;
}

export async function smsg(conn, m) {
  if (!m) return m;
  m = proto.WebMessageInfo.create(m);

  if (m.key) {
    m.id = m.key.id;
    m.isBaileys =
      (m.id && m.id.length === 22) || (m.id.startsWith("3EB0") && m.id.length === 22) || false;

    m.chat = conn.decodeJid(
      m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || ""
    );

    m.now = m.messageTimestamp;
    m.isGroup = m.chat.endsWith("@g.us");
    //m.isChannel = isJidNewsletter(m.chat);
    m.sender = conn.decodeJid(
      (m.key.fromMe && conn.user.id) || m.participant || m.key.participant || m.chat || ""
    );

    m.fromMe = m.key?.fromMe || areJidsSameUser(m.sender, conn.user?.id);
    m.from = m.key?.remoteJid || "";
  }

  if (m.isGroup) {
    try {
      m.groupMetadata = (await conn.groupMetadata(m.chat).catch(() => ({}))) || {};

      m.groupId = m.groupMetadata.id || "";
      m.groupName = m.groupMetadata.subject || "";
      m.groupDesc = m.groupMetadata.desc || "";
      m.groupOwner = m.groupMetadata.owner || m.groupMetadata.subjectOwner || "";
      m.isGroup = m.groupId.endsWith("@g.us") && !m.groupMetadata.parent;
      m.isCommunity = m.groupId.endsWith("@g.us") && m.groupMetadata.isCommunity;
      m.groupParticipants = m.groupMetadata.participants || [];

      if (
        m.groupMetadata.addressingMode &&
        ["lid", "lid-update"].includes(m.groupMetadata.addressingMode)
      ) {
        m.groupMembers =
          m.groupMetadata.addressingMode === "lid"
            ? m.groupMetadata.participants.map((p) => ({
                lid: p.id,
                id: p?.jid || p?.phone || p?.phoneNumber,
                admin: p.admin
              }))
            : m.groupMetadata.participants;

        if (m.sender.endsWith("@lid")) {
          m.sender = m.groupMembers.find((p) => p.lid === m.sender)?.id || m.sender;
        }
      } else {
        m.groupMembers = m.groupParticipants;
      }

      m.user = m.groupMembers.find((u) => conn.decodeJid(u.id) === m.sender) || {};
      m.bot =
        m.groupMembers.find((u) => conn.decodeJid(u.id) === conn.decodeJid(conn.user.id)) || {};

      m.botNumber = conn.user.id ? conn.user.id.split(":")[0] + "@s.whatsapp.net" : conn.user.jid;

      m.isRAdmin = (m.user && m.user.admin === "superadmin") || false;
      m.isAdmin = m.isRAdmin || (m.user && m.user.admin === "admin") || false;
      m.isBotAdmin = m.bot ? ["admin", "superadmin"].includes(m.bot.admin) : false;

      m.isBotInGroup = async (groupId) => {
        try {
          const meta = await conn.groupMetadata(groupId).catch(() => null);
          if (!meta || !meta.participants) return { inGroup: false, isAdmin: false };
          const botJid = conn.decodeJid(conn.user.id);
          const botData = meta.participants.find((p) => conn.decodeJid(p.jid) === botJid);
          if (!botData) {
            return {
              inGroup: false,
              isAdmin: false
            };
          }
          const isAdmin = botData.admin === "admin" || botData.admin === "superadmin";

          return {
            inGroup: true,
            isAdmin
          };
        } catch (err) {
          console.error("❌ Error isBotInGroup:", err?.message || err);
          return { inGroup: false, isAdmin: false };
        }
      };
    } catch (err) {
      console.error("Error fetching group metadata:", err);
    }
  }

  if (m.isChannel || (m.chat && m.chat.includes("newsletter"))) {
    try {
      const jid = m.chat.endsWith("@newsletter") ? m.chat : `${m.chat}@newsletter`;
      const metadata = (await conn.newsletterMetadata("jid", jid).catch(() => ({}))) || {};

      m.channelMetadata = metadata;
      m.channelName = metadata?.thread_metadata?.name?.text || "";
      m.channelDesc = metadata?.thread_metadata?.description?.text || "";
      m.channelSubscribers = metadata?.thread_metadata?.subscribers_count || 0;
      m.channelInvite = metadata?.thread_metadata?.invite || "";
      m.channelVerified = metadata?.thread_metadata?.verification || "none";
      m.channelCreatedAt = metadata?.thread_metadata?.creation_time
        ? new Date(metadata.thread_metadata.creation_time * 1000).toLocaleString()
        : "";
    } catch {
      m.channelMetadata = {};
      m.channelName = "";
      m.channelDesc = "";
      m.channelSubscribers = 0;
      m.channelInvite = "";
      m.channelVerified = "none";
      m.channelCreatedAt = "";
    }
  }

  if (m.message) {
    if (m?.message?.messageContextInfo) delete m.message.messageContextInfo;
    if (m?.message?.senderKeyDistributionMessage) delete m.message.senderKeyDistributionMessage;

    m.message =
      m.message.viewOnceMessageV2?.message ||
      m.message.documentWithCaptionMessage?.message ||
      m.message.editedMessage?.message?.protocolMessage?.editedMessage ||
      m.message;

    const mtype = Object.keys(m.message);
    m.mtype =
      (!["senderKeyDistributionMessage", "messageContextInfo"].includes(mtype[0]) && mtype[0]) ||
      (mtype.length >= 3 && mtype[1] !== "messageContextInfo" && mtype[1]) ||
      mtype[mtype.length - 1];

    m.type = getContentType(m.message);

    let User = global.db.data.users[m.sender];
    if (User && !User.sticker) User.sticker = {};

    let cmdStik = "";
    if (m.type === "stickerMessage") {
      const sha = m.message?.stickerMessage?.fileSha256?.toString("base64");
      if (sha && User?.sticker?.[sha]) {
        cmdStik = User.sticker[sha];
      }
    }
    m.budy =
      m.type === "conversation"
        ? m.message.conversation
        : m.type === "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : m.type === "imageMessage"
            ? m.message.imageMessage.caption || "<Gambar>"
            : m.type === "viewOnceMessageV2"
              ? m.message.viewOnceMessageV2.message?.imageMessage?.caption ||
                m.message.viewOnceMessageV2.message?.videoMessage?.caption ||
                "<View Once>"
              : m.type === "videoMessage"
                ? m.message.videoMessage.caption || "<Video>"
                : m.type === "audioMessage"
                  ? "<Audio>"
                  : m.type === "stickerMessage"
                    ? cmdStik?.text || "<Sticker>"
                    : m.type === "documentMessage"
                      ? m.message.documentMessage.caption || "<Dokumen>"
                      : m.type === "contactMessage"
                        ? "<Kontak>"
                        : m.type === "locationMessage"
                          ? "<Lokasi>"
                          : m.type === "interactiveResponseMessage"
                            ? (() => {
                                try {
                                  const data = JSON.parse(
                                    m.message.interactiveResponseMessage?.nativeFlowResponseMessage
                                      ?.paramsJson || "{}"
                                  );
                                  return data.id || data.display_text || "<Tombol>";
                                } catch {
                                  return "<Tombol>";
                                }
                              })()
                            : m.type === "buttonsResponseMessage"
                              ? m.message.buttonsResponseMessage?.selectedButtonId ||
                                m.message.buttonsResponseMessage?.selectedDisplayText ||
                                "<Button>"
                              : m.type === "templateButtonReplyMessage"
                                ? m.message.templateButtonReplyMessage?.selectedId ||
                                  m.message.templateButtonReplyMessage?.selectedDisplayText ||
                                  "<Template Button>"
                                : m.type === "listResponseMessage"
                                  ? m.message.listResponseMessage?.singleSelectReply
                                      ?.selectedRowId ||
                                    m.message.listResponseMessage?.title ||
                                    "<List>"
                                  : m.type === "groupStatusMentionMessage"
                                    ? "<Status Grup>"
                                    : "";

    m.text = m.budy || "";
    m.body = m.text;
    m.args = (typeof m.body === "string" ? m.body.trim() : "").split(/ +/).slice(1);

    m.mentionedJid =
      (m.msg?.contextInfo?.mentionedJid?.length && m.msg.contextInfo.mentionedJid) || [];

    m.download = async () => {
      if (
        [
          "imageMessage",
          "videoMessage",
          "audioMessage",
          "documentMessage",
          "stickerMessage"
        ].includes(m.type)
      ) {
        return await conn.downloadMediaMessage(m, "buffer");
      }
      return null;
    };

    m.downloadAndSave = async (filename) => {
      try {
        const buffer = await m.download();
        if (!buffer) return null;
        const type = (await fileTypeFromBuffer(buffer)) || { ext: "bin" };
        const tempDir = "./temp";
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const trueFileName = path.join(tempDir, filename || `${Date.now()}.${type.ext}`);
        fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
      } catch (e) {
        console.error("m.downloadAndSave error:", e);
        return null;
      }
    };
    const contextInfo = m.message[m.type]?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;

    if (quotedMsg) {
      m.quoted = {
        message: quotedMsg,
        type: getContentType(quotedMsg),
        id: contextInfo.stanzaId,
        sender: conn.decodeJid(contextInfo.participant),
        fromMe: contextInfo.participant === conn.user.id,
        text: (() => {
          const msg = quotedMsg;
          if (msg.conversation) return msg.conversation;
          if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
          if (msg.imageMessage?.caption) return msg.imageMessage.caption;
          if (msg.videoMessage?.caption) return msg.videoMessage.caption;
          if (msg.audioMessage?.caption) return msg.audioMessage.caption;
          if (msg.documentMessage?.caption) return msg.documentMessage.caption;
          return "<Media>";
        })(),
        delete: async () =>
          conn.sendMessage(m.chat, {
            delete: { id: contextInfo.stanzaId, remoteJid: m.chat }
          }),
        get url() {
          try {
            const txt =
              quotedMsg?.conversation ||
              quotedMsg?.extendedTextMessage?.text ||
              quotedMsg?.imageMessage?.caption ||
              quotedMsg?.videoMessage?.caption ||
              quotedMsg?.documentMessage?.caption ||
              quotedMsg?.viewOnceMessageV2?.message?.imageMessage?.caption ||
              quotedMsg?.viewOnceMessageV2?.message?.videoMessage?.caption ||
              "";

            // regex cari link
            const match = txt.match(/https?:\/\/[^\s]+/);
            return match ? match[0] : null;
          } catch {
            return null;
          }
        },
        copy: async () =>
          exports.smsg(conn, {
            key: { remoteJid: m.chat, id: contextInfo.stanzaId },
            message: quotedMsg
          }),
        download: async () => {
          const type = getContentType(quotedMsg);
          if (
            [
              "imageMessage",
              "videoMessage",
              "audioMessage",
              "documentMessage",
              "stickerMessage"
            ].includes(type)
          ) {
            return await conn.downloadMediaMessage(
              { key: { remoteJid: m.chat, id: contextInfo.stanzaId }, message: quotedMsg },
              "buffer"
            );
          }
          return null;
        },

        downloadAndSave: async (filename) => {
          try {
            const buffer = await m.quoted.download();
            if (!buffer) return null;
            const type = (await fileTypeFromBuffer(buffer)) || { ext: "bin" };
            const tempDir = "./temp";
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const trueFileName = path.join(tempDir, filename || `${Date.now()}.${type.ext}`);
            fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
          } catch (e) {
            console.error("m.quoted.downloadAndSave error:", e);
            return null;
          }
        },
        getFileContent: async () => {
          try {
            const doc =
              quotedMsg.documentMessage ||
              quotedMsg?.viewOnceMessageV2?.message?.documentMessage ||
              quotedMsg?.documentWithCaptionMessage?.message?.documentMessage;

            if (!doc) return null; // ga ada dokumen

            const mime = doc.mimetype || "";
            const isText = /text|json|javascript|html|xml|csv|plain/.test(mime);

            const buffer = await conn.downloadMediaMessage(
              { key: { remoteJid: m.chat, id: contextInfo.stanzaId }, message: quotedMsg },
              "buffer"
            );

            if (!buffer) return null;

            if (!isText) return `[❌] File bukan teks, mimetype: ${mime || "unknown"}`;

            return buffer.toString("utf-8");
          } catch (e) {
            console.error("m.quoted.getFileContent error:", e);
            return null;
          }
        },
        reply: (text, options = {}) => {
          const mentions = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
            (v) => v[1] + "@s.whatsapp.net"
          );

          return conn.sendMessage(
            m.chat,
            {
              text,
              mentions,
              ...options
            },
            { quoted: m }
          );
        }
      };

      if (m.quoted?.message?.stickerMessage?.fileSha256) {
        m.quoted.fileSha256 = m.quoted.message.stickerMessage.fileSha256;
      }

      if (m.isGroup && m.quoted.sender?.endsWith("@lid")) {
        let member = m.groupMembers.find((p) => p.lid === contextInfo.participant);
        if (member?.id) m.quoted.sender = conn.decodeJid(member.id);
      }
      m.mentionByReply = {
        sender: contextInfo.participant.endsWith("@lid")
          ? m.groupMembers?.find((x) => x.lid === contextInfo.participant)?.id ||
            contextInfo.participant
          : contextInfo.participant,
        type: Object.keys(quotedMsg)[0],
        isText: ["conversation", "extendedTextMessage"].includes(Object.keys(quotedMsg)[0]),
        isSticker: Object.keys(quotedMsg)[0] === "stickerMessage",
        isAudio: Object.keys(quotedMsg)[0] === "audioMessage",
        message: quotedMsg
      };
    } else {
      m.mentionByReply = null;
    }

    m.mentionByTag = () => {
      let mentions = [];

      const ctxMentions =
        m.type === "extendedTextMessage" && m.message.extendedTextMessage?.contextInfo?.mentionedJid
          ? m.message.extendedTextMessage.contextInfo.mentionedJid
          : [];

      if (ctxMentions.length) {
        mentions.push(
          ...ctxMentions.map((jid) => {
            // convert @lid ke @s.whatsapp.net
            if (jid.endsWith("@lid") && m.groupMembers) {
              const member = m.groupMembers.find((p) => p.lid === jid);
              if (member?.id) return conn.decodeJid(member.id);
            }
            return conn.decodeJid(jid);
          })
        );
      }

      if (m.quoted?.mentionByReply) {
        mentions.push(conn.decodeJid(m.quoted.mentionByReply.sender));
      }

      mentions = [...new Set(mentions)];
      return mentions;
    };

    m.reply = (text, chatId, options = {}) => {
      const mentionMatches = [...String(text).matchAll(/@([0-9]{5,16}|0)/g)];
      const mentions = mentionMatches.map((v) => v[1] + "@s.whatsapp.net");

      return conn.sendMessage(
        chatId || m.chat,
        {
          text: styleText(String(text)),
          mentions,
          ...options
        },
        { quoted: m }
      );
    };

    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  }

  return m;
}

export function decodeJid(jid) {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    let decode = jidDecode(jid) || {};
    return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
  } else return jid;
}

export function protoType() {
  Buffer.prototype.toArrayBuffer = function () {
    return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
  };

  ArrayBuffer.prototype.toBuffer = function () {
    return Buffer.from(new Uint8Array(this));
  };

  String.prototype.isNumber = function () {
    const int = parseInt(this);
    return typeof int === "number" && !isNaN(int);
  };

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
}
