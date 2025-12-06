// Created by Raihan Fadillah
"use strict";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { generatePrompt, handleTikTokDownload } from "../../media/text/aiprompt.js";
import { uploadToGithub } from "../../lib/uploader.js";
import { textToVoice } from "../../lib/elevenlabs.js";
import axios from "axios";

const dataSimiPath = "./database/group/simi/text.json";
let dataSimi = fs.existsSync(dataSimiPath) ? JSON.parse(fs.readFileSync(dataSimiPath, "utf8")) : {};

const userSessions = new Map();
const characterId = "dDU5VfWXOm9eAwl9oqA1";

export default {
  name: "autosimiHook",
  description: "Hook reply AI / sticker / audio otomatis, khusus mentionByReply",
  type: "hook",

  before: async (m, { conn }) => {
    const isSimi = m.isGroup ? db.data.chats[m.chat]?.simi : false;
    if (!isSimi || !m.mentionByReply) return;
    const gameList = [
      "susunkata",
      "tekateki",
      "capatcha",
      "tictactoe",
      "cocokpasang",
      "tebakbendera",
      "ulartangga",
      "tebakkimia",
      "caklontong",
      "tebaklagu",
      "tebakbom",
      "tebakkata",
      "tebaklirik",
      "tebaklogo",
      "matematika",
      "siapakahaku",
      "tebakgambar",
      "family100"
    ];

    for (let game of gameList) {
      conn[game] = conn[game] ? conn[game] : {};
    }

    for (let game of gameList) {
      if (m.chat in conn[game] || !isSimi || m.key.fromMe) {
        return;
      }
    }
    if (conn.botReplying && conn.botReplying[m.chat]) return;

    const prefixes = [".", "!", "#"];
    if (prefixes.some((p) => m.text?.startsWith(p))) return;

    const botJid = conn.decodeJid(conn.user.id);
    if (m.mentionByReply.sender !== botJid) return;

    const quotedMsg = m.mentionByReply.message;
    const mType = Object.keys(m.message || {})[0];
    const isText = ["conversation", "extendedTextMessage"].includes(mType);
    const isSticker = mType === "stickerMessage";
    const isAudio = mType === "audioMessage";

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const ai = new GoogleGenAI({ apiKey: key.gemini, vertexai: false });

    const getOrCreateChatSession = async (senderId, chatId, systemInstruction) => {
      const sessionKey = `${senderId}_${chatId}`;
      if (userSessions.has(sessionKey)) return userSessions.get(sessionKey);
      const chat = ai.chats.create({ model: "gemini-2.5-flash", config: { systemInstruction } });
      userSessions.set(sessionKey, chat);
      return chat;
    };

    const kirimPesan = async (text) => {
      try {
        const systemPrompt = await generatePrompt(m, conn);
        const chat = await getOrCreateChatSession(m.sender, m.chat, systemPrompt);
        const response = await chat.sendMessage({ message: text });
        return response.text || null;
      } catch (e) {
        console.error("Gagal kirim pesan ke Gemini:", e);
        userSessions.delete(`${m.sender}_${m.chat}`);
        return null;
      }
    };

    const replyAI = async (text, useVN = false) => {
      const extractMentions = (msgText = "") => {
        if (!m.isGroup || !m.groupMembers) return [];
        const regex = /@([0-9]{5,16})/g;
        const matches = [...msgText.matchAll(regex)].map((v) => v[1]);
        return m.groupMembers
          .filter((member) => matches.includes(member.id.split("@")[0]))
          .map((member) => member.id);
      };

      const lowerText = text.toLowerCase();

      const tiktokUrlRegex = /(https?:\/\/vt\.tiktok\.com\/[a-zA-Z0-9]+)/i;
      const tiktokRequestRegex = /(unduh|download|dl|tolong unduh|downloadkan)/i;
      const urlMatch = text.match(tiktokUrlRegex);
      const requestMatch = text.match(tiktokRequestRegex);

      if (urlMatch && requestMatch) {
        const tiktokUrl = urlMatch[1];
        const aiReply = await kirimPesan(`User minta download TikTok: ${tiktokUrl}`);
        const mentions = extractMentions(aiReply || "");
        if (aiReply) await conn.sendMessage(m.chat, { text: aiReply, mentions }, { quoted: m });
        return handleTikTokDownload(conn, m, tiktokUrl);
      }

      if (dataSimi[lowerText]) {
        const simiReply = pickRandom(dataSimi[lowerText]);
        const mentions = extractMentions(simiReply || "");
        if (useVN) {
          const oggPath = await textToVoice(characterId, simiReply).catch(() => null);
          if (oggPath) {
            await conn.sendMessage(
              m.chat,
              { audio: { url: oggPath }, mimetype: "audio/ogg", ptt: true },
              { quoted: m }
            );
          } else {
            await conn.sendMessage(m.chat, { text: simiReply, mentions }, { quoted: m });
          }
        } else {
          await conn.sendMessage(m.chat, { text: simiReply, mentions }, { quoted: m });
        }
      } else {
        const getContextFromQuoted = (msg) => {
          try {
            const quoted = msg.quoted || msg.mentionByReply;
            if (!quoted) return null;

            const qType = Object.keys(quoted.message || {})[0];
            if (qType === "conversation") return quoted.message.conversation;

            if (qType === "extendedTextMessage") return quoted.message.extendedTextMessage.text;

            return null;
          } catch {
            return null;
          }
        };
        let context = getContextFromQuoted(m);

        let finalPrompt;

        if (context) {
          finalPrompt = `
Berikut percakapan sebelumnya yang sedang dibahas:
"${context}"

Ini pesan user sekarang:
"${text}"

Lanjutkan pembahasan sesuai konteks percakapan yang dikutip user.
`;
        } else {
          finalPrompt = text;
        }

        const aiReply = await kirimPesan(finalPrompt);
        const mentions = extractMentions(aiReply || "");

        if (!aiReply) {
          return await conn.sendMessage(
            m.chat,
            { text: "The model is overloaded. Please try again later" },
            { quoted: m }
          );
        }

        if (useVN) {
          const oggPath = await textToVoice(characterId, aiReply).catch(() => null);
          if (oggPath) {
            const mimeType = oggPath.endsWith(".opus") ? "audio/ogg; codecs=opus" : "audio/ogg";
            await conn.sendMessage(
              m.chat,
              { audio: { url: oggPath }, mimetype: mimeType, ptt: true },
              { quoted: m }
            );
          } else {
            await conn.sendMessage(m.chat, { text: styleSans(aiReply), mentions }, { quoted: m });
          }
        } else {
          await conn.sendMessage(m.chat, { text: aiReply, mentions }, { quoted: m });
        }
      }
    };

    const replySticker = async () => {
      const stickerPath = "./database/storage/sticker.json";
      if (!fs.existsSync(stickerPath)) return;
      const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
      const randomSticker = pickRandom(stickerData);
      if (randomSticker?.urlSticker)
        await conn.sendMessage(
          m.chat,
          { sticker: { url: randomSticker.urlSticker } },
          { quoted: m }
        );
    };

    const replyAudio = async () => {
      const audioPath = "./database/group/simi/vn.json";
      if (!fs.existsSync(audioPath)) return;
      const audioData = JSON.parse(fs.readFileSync(audioPath, "utf8"));
      const randomAudio = pickRandom(audioData);
      if (randomAudio?.urlAudio)
        await conn.sendMessage(
          m.chat,
          { audio: { url: randomAudio.urlAudio }, mimetype: "audio/ogg", ptt: true },
          { quoted: m }
        );
    };

    try {
      if (isSticker) {
        await sleep(500);
        await replySticker();
      } else if (isText) {
        const userText = m.text || quotedMsg?.extendedTextMessage?.text;
        conn.sendPresenceUpdate("composing", m.chat);
        await sleep(500);
        await replyAI(userText);
      } else if (isAudio) {
        await sleep(500);
        const audioBuffer = await m.download();
        const audioUrl = await uploadToGithub(audioBuffer);
        let whisperText = null;
        try {
          const res = await axios.get(
            `${api.rhnx}/api/whisper?audio=${encodeURIComponent(audioUrl)}&key=${key.rhnx}`
          );
          if (res.data?.status && res.data.data?.text) whisperText = res.data.data.text;
        } catch (err) {
          console.error("Whisper API error:", err);
        }

        if (whisperText) await replyAI(whisperText, true);
        else await replyAudio();
      }
    } catch (err) {
      console.error("Hook Error:", err);
    }
  }
};
