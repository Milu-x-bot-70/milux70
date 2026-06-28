const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    aliases: ["filecmd", "viewcode"],
    version: "1.7.0",
    author: "nexo_here (Fixed by Milon)",
    countDown: 5,
    role: 2, // বটের নিয়ম অনুযায়ী ২ বা ৩ নম্বর রোল সাধারণত অ্যাডমিন/ওনারদের জন্য বরাদ্দ থাকে
    shortDescription: "View the source code (No Prefix)",
    category: "system",
    guide: { en: "file [commandName]" }
  },

  // Handles no prefix functionality
  onChat: async function ({ api, event }) {
    const { body, senderID, threadID, messageID } = event;

    if (!body) return;

    const args = body.split(/\s+/);
    const trigger = args[0].toLowerCase();

    // Check if the command is triggered without a prefix
    if (trigger === "file") {
      
      // --- [ 🔐 BOT ADMIN PERMISSION CHECK ] ---
      // GoatBot এর গ্লোবাল কনফিগ থেকে অ্যাডমিনদের আইডি লিস্ট চেক করা হচ্ছে
      const adminIDs = global.GoatBot?.config?.adminBot || [];
      const isBotAdmin = adminIDs.includes(senderID);

      if (!isBotAdmin) {
        return api.sendMessage("❌ | Access Denied: This command is restricted to Bot Admins only.", threadID, messageID);
      }

      const cmdName = args[1];
      if (!cmdName) {
        return api.sendMessage("⚠️ | Please provide a command name.\nExample: file media", threadID, messageID);
      }

      const cmdPath = path.join(__dirname, `${cmdName}.js`);

      if (!fs.existsSync(cmdPath)) {
        return api.sendMessage(`❌ | Error: Command "${cmdName}.js" not found.`, threadID, messageID);
      }

      try {
        const code = fs.readFileSync(cmdPath, "utf8");

        if (code.length > 19000) {
          return api.sendMessage("⚠️ | File Limit: This code is too large to display.", threadID, messageID);
        }

        return api.sendMessage({
          body: `📄 | Source code of "${cmdName}.js":\n\n${code}`
        }, threadID, messageID);
        
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ | Error: Unable to read the file.", threadID, messageID);
      }
    }
  },

  // Keeps onStart for prefix usage
  onStart: async function ({ api, args, event }) {
    const { senderID, threadID, messageID } = event;
    
    // --- [ 🔐 BOT ADMIN PERMISSION CHECK ] ---
    const adminIDs = global.GoatBot?.config?.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);

    if (!isBotAdmin) {
      return api.sendMessage("❌ | Access Denied: Restricted to Bot Admins only.", threadID, messageID);
    }

    const cmdName = args[0];
    if (!cmdName) return api.sendMessage("⚠️ | Usage: file [commandName]", threadID, messageID);

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return api.sendMessage(`❌ | Command "${cmdName}.js" not found.`, threadID, messageID);

    try {
      const code = fs.readFileSync(cmdPath, "utf8");
      return api.sendMessage(`📄 | Source code of "${cmdName}.js":\n\n${code}`, threadID, messageID);
    } catch (err) {
      return api.sendMessage("❌ | Error reading the file.", threadID, messageID);
    }
  }
};
