const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
config: {
name: "media",
aliases: ["audio1", "audio2", "watch1", "watch2"],
version: "5.0.0",
author: "Milon",
countDown: 5,
role: 2,
category: "media",
usePrefix: false 
},

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
* 🤖 BOT NAME: MILON BOT
* 👤 OWNER: MILON HASAN 
* 📍 LOCATION: NARAYANGANJ, BANGLADESH
* 🛠️ PROJECT: MILON BOT PROJECT (2026)
* --------------------------------------- */

onChat: async function ({ api, event, message }) {
if (!event.body) return;
const body = event.body.toLowerCase().trim();

// ট্রিগার চেক
const isAudio = body.startsWith("audio1") || body.startsWith("audio2");
const isVideo = body.startsWith("watch1") || body.startsWith("watch2");

if (isAudio || isVideo) {
let query = "";
const args = event.body.split(/\s+/);
args.shift();
const inputQuery = args.join(" ");

// --- [ 🔄 REPLY LOGIC ] ---
// যদি মেসেজে রিপ্লাই দেওয়া হয়, তবে রিপ্লাই করা মেসেজের টেক্সট নিবে
if (event.messageReply && event.messageReply.body) {
query = event.messageReply.body;
} else {
query = inputQuery;
}

if (!query) {
return message.reply(`❌ মামা, গানের নাম দাও অথবা কোনো মেসেজে রিপ্লাই দিয়ে ${body.split(" ")[0]} লেখো!`);
}

const waitMsg = await message.reply(`🔍 Searching for "${query}"...\n⏳ Please wait...`);

try {
// --- [ 🌐 STEP 1: SEARCH ] ---
const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
const data = searchRes.data[0];

if (!data || !data.url) return api.editMessage("⚠️ No results found on YouTube.", waitMsg.messageID);

const ytUrl = data.url;
const title = data.title;
await api.editMessage(`🎬 Found: ${title}\n⬇️ Downloading ${isAudio ? 'Audio' : 'Video'}...`, waitMsg.messageID);

const cacheDir = path.join(process.cwd(), "cache");
if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
const filePath = path.join(cacheDir, `${isAudio ? 'audio' : 'video'}_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

let downloadUrl = null;

// --- [ 🎶 AUDIO/VIDEO FALLBACK ] ---
if (isAudio) {
try {
const res1 = await axios.get(`https://yt-mp3-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
downloadUrl = res1.data.downloadUrl;
} catch (e) {
const res2 = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp3v2?url=${encodeURIComponent(ytUrl)}`);
downloadUrl = res2.data.data.link;
}
} else {
try {
const res1 = await axios.get(`https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
downloadUrl = res1.data.downloadUrl;
} catch (e) {
const res2 = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(ytUrl)}`);
downloadUrl = res2.data.formats.find(f => f.quality === "360p")?.url || res2.data.formats[0].url;
}
}

if (!downloadUrl) throw new Error("APIs are down.");

// --- [ ⬇️ STEP 2: DOWNLOAD & SEND ] ---
const response = await axios({ method: "get", url: downloadUrl, responseType: "stream" });
const writer = fs.createWriteStream(filePath);
response.data.pipe(writer);

writer.on("finish", async () => {
await api.unsendMessage(waitMsg.messageID).catch(() => {});
await message.reply({
body: `⬇️ 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝙀 ⬇️\n📌 Title: ${title}\⚡ 𝙋𝙊𝙒𝙀𝙍 𝘽𝙔 ⚡
『 𝙈𝙄𝙇𝙊𝙉 𝙋𝙍𝙊 』`,
attachment: fs.createReadStream(filePath),
});
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

} catch (err) {
api.editMessage(`❌ Failed to process. APIs are down.`, waitMsg.messageID);
}
}
},

onStart: async function () {} 
};
