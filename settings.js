import fs from "fs-extra";
import pkg from "baileys/package.json" with { type: "json" };
import stringSimilarity from "string-similarity";
import { styleText, styleSans, styleSmallCaps } from "./media/text/styleText.js";
import { readJson } from "./lib/myfunc.js";
import chalk from "chalk";

let d = new Date();
let locale = "id";
let currentYear = d.getFullYear();
let gmt = new Date(0).getTime() - new Date(`1 Januari ${currentYear}`).getTime();
let week = d.toLocaleDateString(locale, { weekday: "long" });
const calender = d.toLocaleDateString(locale, {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

async function similarity(one, two) {
  const treshold = stringSimilarity.compareTwoStrings(one, two);
  return treshold.toFixed(2);
}

function makeid(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// GLOBAL
global.system = {
  sessionName: "session",
  pairingCode: true,
  pairingNumber: "628×××××", // nomor bot didie
  runWith: "pterodactyl",
  prettier: false, // untuk rapihin code
  Intervalmsg: 1000
};

global.baileys = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description || "Virtual assistant for WhatsApp",
  author: pkg.author || "Raihan Fadillah",
  license: pkg.license || "MIT"
};

global.owner = {
  lid: "158467297935424@lid",
  contact: "6285795718659",
  name: "Raihan Fadillah",
  email: "rhanfadillah@gmail.com"
};

global.sosmed = {
  youtube: "https://www.youtube.com/@rhnxofficial",
  whatsapp: "https://chat.whatsapp.com/EcaZKuqXYGk8DL35OUCetp",
  instagram: "https://www.instagram.com/rhnxofficial",
  tiktok: "https://www.tiktok.com/@rhnxofficial",
  github: "https://github.com/rhnxofficial",
  website: "https://rhnx.xyz"
};

global.bot = {
  name: "Rԋɴx-Bσƚ",
  number: "6285795718659",
  email: "rhnxofficial@gmail.com",
  script: "https://script.rhnx.xyz",
  idch: "120363185390263663@newsletter"
};

global.api = {
  rhnx: "https://api.rhnx.xyz",
  elevenlabs: "https://api.elevenlabs.io",
  github: "https://api.github.com"
};

global.key = {
  rhnx: "rhnx-530297",
  gemini: "AIzaSyAQ_P5U9JSvjZk2MGO8DQayHe1Z1yftQZI",
  elevenlabs: "sk_30d7114a2da7ef8237e2ab21c3d25a08275823eecbb8c616",
  tokenGithub: "" //buat sendiri sementara
};

global.sticker = {
  packname: "Sticker By",
  author: "© rhnx-bot"
};

global.image = {
  default: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-3QBi.jpg",
  logoTech: "https://c.top4top.io/p_3523cv0wt1.jpg",
  banner: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-3QBi.jpg",
  store: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-TEMC.jpg"
};

// style global
global.styleText = (text) => styleText(text, db.data.settings.style || "normal");
global.similarity = (one, two) => similarity(one, two);
global.sleep = sleep;
global.readmore = readmore;
global.week = week;
global.calender = calender;
global.makeid = makeid;
global.styleSans = styleSans;
global.styleSmallCaps = styleSmallCaps;
global.readJson = readJson;

const file = new URL(import.meta.url).pathname;
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.bgRed(`UPDATE ${file}`));
  import(`${import.meta.url}?update=${Date.now()}`);
});
