# Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `migrations/202609070001_accounts.sql`.
3. Add the values from `.env.example` to Vercel Production and Preview environments.
4. Keep `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SECRET`, `PREMIUM_CODE_SECRET`, and `DISCORD_VERIFY_SECRET` server-only.
5. Redeploy after adding the environment variables.
6. Set the Discord Interactions Endpoint URL to `https://skyblue.tr/api/discord/interactions` in the Discord Developer Portal.
7. Run `npm run discord:register-verify` once with `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN` loaded to register `/verify` in the guild.

Generate long independent secrets, for example:

```bash
openssl rand -hex 32
```

The migration creates the account/profile tables, immutable usernames, one-account-per-HMAC-IP enforcement, tool-specific license redemption, daily download usage, Discord verification records, and the public `avatars` storage bucket.
