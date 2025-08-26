const fs = require('fs');
const path = require("path");
const { delay, DisconnectReason } = require('@whiskeysockets/baileys');
const evt = require("../lib/ovlcmd");
const config = require("../set");
const { installpg } = require("../lib/plugin");

async function connection_update(update, client, reconnect, onOpenCallback = null) {
  const { connection, lastDisconnect } = update;

  switch (connection) {
    case "connecting":
      console.log("🌍 Connexion en cours...");
      break;

    case "open":
      console.log(`
╭────────────────────────────╮
│                            │
│            🚀  REL-MD-EST ACTIVÉ  ✅   │
│                            │
╰────────────────────────────╯

      `);

      // Chargement des commandes
      const commandFiles = fs.readdirSync(path.join(__dirname, "../cmd"))
        .filter(file => path.extname(file).toLowerCase() === ".js");

      console.log("📂 Chargement des commandes :");
      for (const file of commandFiles) {
        try {
          require(path.join(__dirname, "../cmd", file));
          console.log("  ✓ " + file);
        } catch (err) {
          console.log(`  ✗ ${file} — erreur : ${err.message}`);
        }
      }

      // Installer les plugins
      installpg();

      const botStatus = `
╭───╭───〔 🤖 REL-MD-BOT 〕───⬣
│ 🟢 *Statut*     ➜ Connecté ✅
│ ⚙️ *Préfixe*    ➜ ${config.PREFIXE}
│ 🧩 *Mode actuel*➜ ${config.MODE}
│ 📦 *Commandes*  ➜ ${evt.cmd.length}
│ 🧪 *Version*    ➜ 1.0.0
│ 🧑‍💻 *Développeur*➜ Euloge-devs 
╰────────────────────────────────────⬣
╰──────────────⬣
      `;

      console.log(botStatus + "\n");

      // Envoi message au propriétaire du bot
      if (client.user?.id) {
        await client.sendMessage(client.user.id, { text: botStatus });
      }

      await delay(10000); // pause 10 secondes

      // Appel callback si défini
      if (onOpenCallback) {
        await onOpenCallback();
      }
      break;

    case "close":
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log("⛔ Déconnecté : Session terminée.");
      } else {
        console.log("⚠️ Connexion perdue, tentative de reconnexion...");
        await delay(5000); // pause 5 secondes
        reconnect();
      }
      break;

    default:
      break;
  }
}

module.exports = connection_update;
