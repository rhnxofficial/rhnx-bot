import fs from "fs-extra";
import pkg from "baileys/package.json" with { type: "json" };
import stringSimilarity from "string-similarity";
import { styleText, styleSans, styleSmallCaps } from "./media/text/styleText.js";
import { readJson } from "./lib/myfunc.js";
import chalk from "chalk";

// FUNCTION CODE
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

function randomNumberId(length = 10) {
  let res = "";
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10);
  }
  return res;
}

// GLOBAL
global.system = {
  sessionName: "session",
  pairingCode: true,
  pairingNumber: "628××××", // nomor bot didie
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
  contact: "628×××",
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
  name: "Ʀԋɴx-Bσƚ",
  number: "6285795718659",
  email: "rhnxofficial@gmail.com",
  gcbot: "https://chat.whatsapp.com/EcaZKuqXYGk8DL35OUCetp",
  gcstore: "https://chat.whatsapp.com/GO32l98cXunKjTSg4IVxFd",
  idch: "120363185390263663@newsletter"
};

global.api = {
  rhnx: "https://api.rhnx.xyz",
  elevenlabs: "https://api.elevenlabs.io",
  github: "https://api.github.com"
};

global.key = {
  rhnx: "rhnx-530297",
  gemini: "", // ai.studio.com
  elevenlabs: "sk_94381c9bc31183e549836b49c9f4afa711db76089be5182d",
  tokenGithub: "" , // buat sendiri 
};

global.panel = {
  name: "RHNX",
  domain: "https://panel.rhnx.xyz",
  apiPlta: "", // Apikey Plta
  apiPltc: "", // Apikey Pltc
  eggs: "15", // ID Eggs
  location: "1",
  docker_image: "docker.io/bionicc/nodejs-wabot:latest", // sesuaikan dengan eeg panel kalian docker nya
  image: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-rYg4.jpg"
};

// bagian dataPanel Kalian Buat Repo Kek gini namanya 
global.dataPanel = {
  tokenGH: key.tokenGithub,
  owner: "rhnxofficial",
  repo: "data",
  path: "panel/buyerpanel.json"
};

global.waktuPanel = {
  onegb: { waktu: 30, harga: 1000 },
  twogb: { waktu: 30, harga: 2000 },
  threegb: { waktu: 30, harga: 3000 },
  fourgb: { waktu: 30, harga: 4000 },
  fivegb: { waktu: 30, harga: 5000 },
  sixgb: { waktu: 30, harga: 6000 },
  sevengb: { waktu: 30, harga: 7000 },
  eightgb: { waktu: 30, harga: 8000 },
  ninegb: { waktu: 30, harga: 9000 },
  tengb: { waktu: 30, harga: 10000 },
  unli: { waktu: 30, harga: 13000 }
};

global.sticker = {
  packname: "Sticker By",
  author: "© rhnx-bot"
};

global.image = {
  default: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-3QBi.jpg",
  logoTech: "https://c.top4top.io/p_3523cv0wt1.jpg",
  banner: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-EILk.jpg",
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
global.randomNumberId = randomNumberId;
global.styleSans = styleSans;
global.styleSmallCaps = styleSmallCaps;
global.readJson = readJson;

const file = new URL(import.meta.url).pathname;
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.bgRed(`UPDATE ${file}`));
  import(`${import.meta.url}?update=${Date.now()}`);
});
