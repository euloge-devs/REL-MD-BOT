const fs = require('fs');
const path = require("path");
const pino = require("pino");
const axios = require("axios");
const NodeCache = require("node-cache");

const msgRetryCounterCache = new NodeCache();

const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  delay
} = require("@whiskeysockets/baileys");

const { getMessage } = require("./lib/store");
const getSession = require('./DataBase/session');
const config = require("./set");

const {
  message_upsert,
  group_participants_update,
  connection_update,
  dl_save_media_ms,
  recup_msg
} = require('./Rel_events');

const {
  getSecondAllSessions,
  getSecondSession
} = require('./DataBase/connect');

const sessionsActives = new Set();
const instancesSessions = new Map();

/**
 * Lance une session WhatsApp (principale ou secondaire)
 */
async function startGenericSession({ numero, isPrincipale = false, sessionId = null }) {
  const sessionName = isPrincipale ? "principale" : numero;
  const sessionDir = path.join(__dirname, "auth", sessionName);
  const credsPath = path.join(sessionDir, "creds.json");

  // Charger les credentials depuis DB si absents en local
  if (!fs.existsSync(credsPath)) {
    try {
      const creds = isPrincipale
        ? await getSession(sessionId)
        : await getSecondSession(numero);

      if (!creds) return null;

      fs.mkdirSync(sessionDir, { recursive: true });
      fs.writeFileSync(credsPath, creds, "utf8");
    } catch (err) {
      console.log("❌ Erreur récupération creds pour " + sessionName + " :", err.message);
      return null;
    }
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      logger: pino({ level: "silent" }),
      keepAliveIntervalMs: 10000,
      browser: Browsers.ubuntu('Chrome'),
      msgRetryCounterCache,
      syncFullHistory: false,
      getMessage: async key => {
        const storedMsg = getMessage(key.id);
        return storedMsg?.message || undefined;
      }
    });

    // Événements
    sock.ev.on("messages.upsert", async data => message_upsert(data, sock));
    sock.ev.on("group-participants.update", async data => group_participants_update(data, sock));
    sock.ev.on("connection.update", async update => {
      connection_update(
        update,
        sock,
        () => startGenericSession({ numero, isPrincipale, sessionId }),
        isPrincipale ? async () => await startSecondarySessions() : undefined
      );
    });
    sock.ev.on("creds.update", saveCreds);

    // Fonctions custom attachées
    sock.dl_save_media_ms = (msg, filename = '', autoSave = true, folder = './downloads') =>
      dl_save_media_ms(sock, msg, filename, autoSave, folder);

    sock.recup_msg = (options = {}) => recup_msg({ ovl: sock, ...options });

    console.log("✅ Session " + (isPrincipale ? "principale" : "secondaire " + numero) + " démarrée");

    return sock;
  } catch (err) {
    console.error("❌ Erreur session " + sessionName + " :", err.message);
    return null;
  }
}

/**
 * Arrêter une session
 */
async function stopSession(sessionName) {
  if (instancesSessions.has(sessionName)) {
    const sock = instancesSessions.get(sessionName);
    try {
      await sock.logout();
      sock.ev.removeAllListeners();
      console.log("🛑 Session " + sessionName + " arrêtée.");
    } catch (err) {
      console.error("❌ Erreur lors de l'arrêt de la session " + sessionName + " :", err.message);
    }
    instancesSessions.delete(sessionName);
    sessionsActives.delete(sessionName);
  }
}

/**
 * Lance la session principale
 */
async function startPrincipalSession() {
  await delay(45000);

  const sessionId = config.SESSION_ID || '';
  if (!(sessionId && sessionId.startsWith("Ovl-MD_") && sessionId.endsWith("_SESSION-ID"))) {
    console.log("❌ SESSION_ID invalide ou manquant.");
    return;
  }

  const sock = await startGenericSession({
    numero: "principale",
    isPrincipale: true,
    sessionId
  });

  if (sock) {
    instancesSessions.set("principale", sock);
  }

  await startSecondarySessions();
  console.log("🤖 Session principale + secondaires démarrées : " + sessionsActives.size + "/100");

  surveillerNouvellesSessions();
}

/**
 * Lancer toutes les sessions secondaires
 */
async function startSecondarySessions() {
  const allSessions = await getSecondAllSessions();
  const sessionsEnDB = new Set(allSessions.map(s => s.numero));

  // Supprimer celles qui n’existent plus
  for (const numero of sessionsActives) {
    if (!sessionsEnDB.has(numero)) {
      console.log("⚠️ Session supprimée détectée : " + numero + " - arrêt en cours.");
      await stopSession(numero);
    }
  }

  let count = 0;
  for (const { numero } of allSessions) {
    if (sessionsActives.size >= 100) {
      console.log("❌ Limite de sessions atteinte (" + sessionsActives.size + "/100).");
      break;
    }
    if (!sessionsActives.has(numero)) {
      const sock = await startGenericSession({ numero });
      if (sock) {
        sessionsActives.add(numero);
        instancesSessions.set(numero, sock);
        count++;
        console.log("✅ Démarrage terminé — Sessions actives : " + sessionsActives.size + "/100");
      }
    }
  }
}

/**
 * Vérifie en boucle les nouvelles sessions secondaires
 */
function surveillerNouvellesSessions() {
  setInterval(async () => {
    try {
      await startSecondarySessions();
    } catch (err) {
      console.error("❌ Erreur lors de la vérification des sessions secondaires :", err.message);
    }
  }, 10000);
}

// Lancer le bot
startPrincipalSession().catch(err => {
  console.error("❌ Erreur inattendue :", err.message || err);
});


// --- Serveur Web ---
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

let dernierPingRecu = Date.now();

app.get('/', (req, res) => {
  dernierPingRecu = Date.now();
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>OVL-Bot Web Page</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          display: flex; justify-content: center; align-items: center;
          height: 100vh; background-color: #121212;
          font-family: Arial, sans-serif; color: #fff;
          overflow: hidden;
        }
        .content {
          text-align: center; padding: 30px;
          background-color: #1e1e1e;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(255,255,255,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .content:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(255,255,255,0.15);
        }
        h1 { font-size: 2em; color: #f0f0f0; margin-bottom: 15px; letter-spacing: 1px; }
        p { font-size: 1.1em; color: #d3d3d3; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="content">
        <h1>Bienvenue sur OVL-MD-V2</h1>
        <p>Votre assistant WhatsApp</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log("Listening on port: " + port);
  setupAutoPing("http://localhost:" + port + '/');
});

/**
 * Auto ping pour éviter le sleep (Railway/Koyeb/Render)
 */
function setupAutoPing(url) {
  setInterval(async () => {
    try {
      const response = await axios.get(url);
      if (response.data) {
        console.log("Ping: OVL-MD-V2✅");
      }
    } catch (err) {
      console.error("Erreur lors du ping", err.message);
    }
  }, 30000);
}
