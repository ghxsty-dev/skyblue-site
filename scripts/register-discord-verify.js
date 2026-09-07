const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID || "1366027066293620957";
const token = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !token) {
  console.error("DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required.");
  process.exit(1);
}

fetch(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`, {
  method: "POST",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "verify",
    description: "SkyBlue site hesabını Discord ile doğrula",
    options: [{
      type: 3,
      name: "kod",
      description: "SkyBlue hesap sayfasındaki doğrulama kodu",
      required: true,
    }],
  }),
}).then(async (response) => {
  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status}: ${body}`);
  console.log("/verify command registered:", body);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
