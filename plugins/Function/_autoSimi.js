// Created By Raihan Fadillah
"use strict";

import fs from "fs";
import axios from "axios";
import { generatePrompt } from "../../media/text/aiprompt.js"; 
import { styleSans } from "../../media/text/styleText.js"; 

const dataSimiPath = "./database/group/simi/text.json";
let dataSimi = fs.existsSync(dataSimiPath)
  ? JSON.parse(fs.readFileSync(dataSimiPath, "utf8"))
  : {};

export default {
  name: "simiReplyHook",
  description: "Hook untuk reply AI / sticker / audio saat user reply ke bot",
  type: "hook",

  before: async (m, { conn, prefix }) => {
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
    if (!m.mentionByReply) return;

    const isCmd = m.body?.startsWith(prefix);
    if (isCmd) return;

    const botJid = conn.decodeJid(conn.user.id);
    const isReplyToBot = m.mentionByReply.sender === botJid;
    if (!isReplyToBot) return;

    const quotedMsg = m.mentionByReply.message;
    const mType = Object.keys(m.message || {})[0];

    const isText = mType === "conversation" || mType === "extendedTextMessage";
    const isSticker = mType === "stickerMessage";
    const isAudio = mType === "audioMessage";

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const systemPrompt = generatePrompt(m);

    const kirimPesan = async (teks) => {
      try {
        const res = await axios.post(
          "https://ai.siputzx.my.id/",
          { content: teks, user: m.sender, prompt: systemPrompt },
          { headers: { "Content-Type": "application/json" } }
        );
        return res.data?.result || res.data;
      } catch (e) {
        console.error("Gagal kirim pesan:", e.message);
        return null;
      }
    };

    const replyAI = async (text) => {
      const extractMentions = (msgText = "") => {
        if (!m.isGroup || !m.groupMembers) return [];
        const regex = /@([0-9]{5,16})/g;
        const matches = [...msgText.matchAll(regex)].map((v) => v[1]);
        return m.groupMembers
          .filter((member) => matches.includes(member.id.split("@")[0]))
          .map((member) => member.id);
      };
      const lowerText = text.toLowerCase();
      if (dataSimi[lowerText]) {
        await conn.sendMessage(m.chat, { text: pickRandom(dataSimi[lowerText]) }, { quoted: m });
      } else {
        
        const aiReply = await kirimPesan(text);
        const mentions = extractMentions(aiReply || "");
        if (aiReply) {
          await conn.sendMessage(m.chat, { text: styleSans(aiReply), mentions }, { quoted: m });
          
        } else {
          await conn.sendMessage(m.chat, { text: "Hmm, gw nggak ngerti maksud lu nih 😅" }, { quoted: m });
        }
      }
    };

    const replySticker = async () => {
      const stickerPath = "./database/storage/sticker.json";
      if (!fs.existsSync(stickerPath)) return;
      const stickerData = JSON.parse(fs.readFileSync(stickerPath, "utf8"));
      if (!stickerData.length) return;
      const randomSticker = pickRandom(stickerData);
      if (randomSticker?.urlSticker) {
        await conn.sendMessage(
          m.chat,
          { sticker: { url: randomSticker.urlSticker } },
          { quoted: m }
        );
      }
    };

    const replyAudio = async () => {
      const audioPath = "./database/group/simi/vn.json";
      if (!fs.existsSync(audioPath)) return;
      const audioData = JSON.parse(fs.readFileSync(audioPath, "utf8"));
      if (!audioData.length) return;
      const randomAudio = pickRandom(audioData);
      if (randomAudio?.urlAudio) {
        await conn.sendMessage(
          m.chat,
          { audio: { url: randomAudio.urlAudio }, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      }
    };

    try {
      if (isSticker) {
        await sleep(500);
        await replySticker();
      } else if (isText) {
        const userText = m.text || quotedMsg?.extendedTextMessage?.text;
        conn.sendPresenceUpdate("composing", m.chat);
        await sleep(800);
        await replyAI(userText);
      } else if (isAudio) {
        await sleep(500);
        await replyAudio();
      }
    } catch (err) {
      console.error("Hook Error:", err);
    }
  },
};
