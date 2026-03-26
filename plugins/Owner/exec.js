import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default {
  name: "exec",
  alias: ["$", "shell"],
  description: "Execute terminal command",
  run: async (m, { conn, args, isOwner }) => {
    if (!isOwner) return m.reply("❌ Hanya owner yang bisa pakai perintah ini.");

    const command = args.join(" ");
    if (!command) return m.reply("⚠️ Masukkan perintah terminal yang mau dijalankan.");

    try {
      await m.reply("_⏳ Executing..._");
      const { stdout, stderr } = await execAsync(command);

      if (stdout) {
        await m.reply(`📤 *Output:*\n\n${stdout}`);
      }
      if (stderr) {
        await m.reply(`❌ *Error:*\n\n${stderr}`);
      }
    } catch (err) {
      await m.reply(`🔥 *Exec Failed:*\n\n${err.message}`);
    }
  }
};
