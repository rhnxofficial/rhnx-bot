// Created by Raihan Fadillah
"use strict";

import fs from "fs";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { generatePrompt } from "../../media/text/aiPrivate.js";
import { uploadToGithub } from "../../lib/uploader.js";
import { textToVoice } from "../../lib/elevenlabs.js";

const dataSimiPath = "./database/group/simi/text.json";
let dataSimi = fs.existsSync(dataSimiPath) ? JSON.parse(fs.readFileSync(dataSimiPath, "utf8")) : {};

const characterId = "dDU5VfWXOm9eAwl9oqA1";

export default {
  name: "aiPrivate",
  description: "Auto-reply AI private, voice ready, flow autosimiHook tanpa TikTok",
  type: "hook",

  before: async (m, { conn }) => {
    if (m.isGroup) return;
    if (m.chat.endsWith("@newsletter")) return;

    const MENFES_FILE = "./database/private/menfes.json";

    function readMenfes() {
      if (!fs.existsSync(MENFES_FILE)) return {};
      return JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
    }

    const menfesDB = readMenfes();

    // status false = sedang dalam sesi menfes
    const sedangMenfes = Object.values(menfesDB).find((x) => {
      if (x.status === false) {
        // Cek pengirim (selalu @s.whatsapp.net)
        if (x.dari === m.sender) return true;

        // Cek penerima (selalu @lid)
        if (x.penerima === m.sender) return true;
      }
      return false;
    });

    // Jika salah satu (pengirim/penerima) sedang dalam sesi menfes → AI berhenti
    if (sedangMenfes) {
      return; // AI tidak merespon selama menfes berlangsung
    }
    const gameList = ["capatcha"];

    for (let game of gameList) {
      conn[game] = conn[game] ? conn[game] : {};
    }

    for (let game of gameList) {
      if (m.chat in conn[game] || m.key.fromMe) {
        return;
      }
    }
    if (conn.botReplying && conn.botReplying[m.chat]) return;

    const prefixes = [".", "!", "#"];
    if (prefixes.some((p) => m.text?.startsWith(p))) return;

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    // -------------------- SESSION HANDLER --------------------

    const systemPrompt = generatePrompt(m);
    // -------------------- SEND AI --------------------
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

    // -------------------- REPLY AI --------------------
    const replyAI = async (text, useVN = false) => {
      const getQuotedContext = (msg) => {
        try {
          const q = msg.quoted;
          if (!q) return null;

          const type = Object.keys(q.message || {})[0];
          if (type === "conversation") return q.message.conversation;
          if (type === "extendedTextMessage") return q.message.extendedTextMessage.text;

          return null;
        } catch {
          return null;
        }
      };

      const context = getQuotedContext(m);
      const finalPrompt = context
        ? `Berikut konteks sebelumnya:\n"${context}"\n\nPesan user:\n"${text}"\n\nLanjutkan sesuai konteks.`
        : text;

      const output = await kirimPesan(finalPrompt);

      if (!output) {
        return conn.sendMessage(
          m.chat,
          { text: "AI sedang penuh, coba lagi nanti." },
          { quoted: m }
        );
      }

      if (useVN) {
        const voice = await textToVoice(characterId, output).catch(() => null);
        if (voice) {
          const mimeType = voice.endsWith(".opus") ? "audio/ogg; codecs=opus" : "audio/ogg";
          return conn.sendMessage(
            m.chat,
            { audio: { url: voice }, mimetype: mimeType, ptt: true },
            { quoted: m }
          );
        }
      }

      return conn.sendAI(m.chat, styleText(output), m);
    };

    // -------------------- STICKER --------------------
    const replySticker = async () => {
      const file = "./database/storage/sticker.json";
      if (!fs.existsSync(file)) return;

      const data = JSON.parse(fs.readFileSync(file));
      const pick = pickRandom(data);

      if (pick?.urlSticker)
        await conn.sendMessage(m.chat, { sticker: { url: pick.urlSticker } }, { quoted: m });
    };

    // -------------------- RANDOM AUDIO --------------------
    const replyAudio = async () => {
      const file = "./database/group/simi/vn.json";
      if (!fs.existsSync(file)) return;

      const data = JSON.parse(fs.readFileSync(file));
      const pick = pickRandom(data);

      if (pick?.urlAudio)
        await conn.sendMessage(
          m.chat,
          { audio: { url: pick.urlAudio }, mimetype: "audio/ogg", ptt: true },
          { quoted: m }
        );
    };

    // -------------------- MAIN HANDLER --------------------
    try {
      const mType = Object.keys(m.message || {})[0];
      const isText = ["conversation", "extendedTextMessage"].includes(mType);
      const isSticker = mType === "stickerMessage";
      const isAudio = mType === "audioMessage";

      if (isSticker) {
        await sleep(500);
        return replySticker();
      }

      if (isText) {
        conn.sendPresenceUpdate("composing", m.chat);
        await sleep(300);
        return replyAI(m.text);
      }

      if (isAudio) {
        await sleep(500);
        const buffer = await m.download();
        const url = await uploadToGithub(buffer);

        let whisperText = null;
        try {
          const res = await axios.get(
            `${api.rhnx}/api/whisper?audio=${encodeURIComponent(url)}&key=${key.rhnx}`
          );
          whisperText = res.data?.data?.text ?? null;
        } catch (e) {
          console.error("Whisper error:", e);
        }

        conn.sendPresenceUpdate("recording", m.chat);

        if (whisperText) return replyAI(whisperText, true); // force VN
        return replyAudio();
      }
    } catch (e) {
      console.error("aiPrivate Hook Error:", e);
    }
  }
};
