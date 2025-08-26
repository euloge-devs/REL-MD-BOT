const axios = require("axios");
const { relcmd } = require("../lib/ovlcmd"); // Remplacé ovlcmd par relcmd
const config = require("../set");
const os = require('os');
const { exec } = require('child_process');
const simpleGit = require("simple-git");
const git = simpleGit();

// Configuration Render
const RENDER_API_KEY = config.RENDER_API_KEY;
const host = os.hostname();
const SERVICE_ID = host.split("-hibernate")[0];

const headers = {
  'Authorization': `Bearer ${RENDER_API_KEY}`,
  'Content-Type': 'application/json'
};

// Vérifie la config
function checkConfig() {
  if (!RENDER_API_KEY) return "*Erreur :* La variable `RENDER_API_KEY` doit être définie.";
  return null;
}

// Gestion des variables d'environnement
async function manageEnvVar(action, key, value = null) {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    const res = await axios.get(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, { headers });
    let vars = res.data.map(v => ({ key: v.envVar.key, value: v.envVar.value }));

    if (action === "setvar") {
      const existing = vars.find(v => v.key === key);
      if (existing) existing.value = value;
      else vars.push({ key, value });
      await axios.put(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, vars, { headers });
      return `✨ *Variable définie avec succès !*\n📌 *Clé :* \`${key}\`\n📥 *Valeur :* \`${value}\``;
    }

    if (action === "delvar") {
      vars = vars.filter(v => v.key !== key);
      await axios.put(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, vars, { headers });
      return `✅ *Variable supprimée avec succès !*\n📌 *Clé :* \`${key}\``;
    }

    if (action === "getvar") {
      if (key === 'all') {
        if (vars.length === 0) return "📭 *Aucune variable disponible.*";
        return "✨ *Liste des variables :*\n\n" + vars.map(v => `📌 *${v.key}* : \`${v.value}\``).join("\n");
      }
      const found = vars.find(v => v.key === key);
      return found ? `📌 *${key}* : \`${found.value}\`` : `*Variable introuvable :* \`${key}\``;
    }

  } catch (err) {
    console.error(err);
    return "*Erreur :* " + (err.response?.data?.message || err.message);
  }
}

// Redémarrage du service Render
async function restartRenderService() {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    await axios.post(`https://api.render.com/v1/services/${SERVICE_ID}/deploys`, {}, { headers });
    return "✅ Le service a été redémarré avec succès !";
  } catch (err) {
    console.error(err);
    return "*Erreur :* " + (err.response?.data?.message || err.message);
  }
}

// Commandes Render : setvar, getvar, delvar
relcmd({
  nom_cmd: 'setvar',
  classe: 'Render_config',
  desc: "Définit ou met à jour une variable d'environnement sur Render."
}, async (chatId, client, ctx) => {
  const { arg, ms, prenium_id } = ctx;
  if (!prenium_id) return client.sendMessage(chatId, { text: "Commande réservée aux utilisateurs premium" }, { quoted: ms });

  if (!arg[0] || !arg.join(" ").includes("=")) {
    return client.sendMessage(chatId, { text: "*Utilisation :* `setvar clé = valeur`" }, { quoted: ms });
  }

  const [key, ...rest] = arg.join(" ").split("=");
  const value = rest.join("=").trim();
  const msg = await manageEnvVar("setvar", key.trim(), value);
  await client.sendMessage(chatId, { text: msg }, { quoted: ms });

  const restartMsg = await restartRenderService();
  await client.sendMessage(chatId, { text: restartMsg }, { quoted: ms });
});

relcmd({
  nom_cmd: "getvar",
  classe: "Render_config",
  desc: "Récupère une variable d'environnement sur Render."
}, async (chatId, client, ctx) => {
  const { arg, ms, prenium_id } = ctx;
  if (!prenium_id) return client.sendMessage(chatId, { text: "Commande réservée aux utilisateurs premium" }, { quoted: ms });
  if (!arg[0]) return client.sendMessage(chatId, { text: "*Utilisation :* `getvar clé` ou `getvar all`" }, { quoted: ms });

  const msg = await manageEnvVar("getvar", arg[0]);
  await client.sendMessage(chatId, { text: msg }, { quoted: ms });
});

relcmd({
  nom_cmd: 'delvar',
  classe: "Render_config",
  desc: "Supprime une variable d'environnement sur Render."
}, async (chatId, client, ctx) => {
  const { arg, ms, prenium_id } = ctx;
  if (!prenium_id) return client.sendMessage(chatId, { text: "Commande réservée aux utilisateurs premium" }, { quoted: ms });
  if (!arg[0]) return client.sendMessage(chatId, { text: "*Utilisation :* `delvar clé`" }, { quoted: ms });

  const msg = await manageEnvVar("delvar", arg[0]);
  await client.sendMessage(chatId, { text: msg }, { quoted: ms });

  const restartMsg = await restartRenderService();
  await client.sendMessage(chatId, { text: restartMsg }, { quoted: ms });
});

// Formatage date GMT
function formatDateGMTFr(date) {
  return new Date(date).toLocaleString("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }) + " GMT";
}

// Vérification des mises à jour
relcmd({
  nom_cmd: "checkupdate",
  classe: "Système",
  react: '🔍',
  desc: "Vérifie les mises à jour disponibles du bot."
}, async (_chatId, _client, { repondre }) => {
  try {
    await git.init();
    const remotes = await git.getRemotes();
    if (!remotes.some(r => r.name === "origin")) {
      await git.addRemote("origin", "https://github.com/euloge-devs/REL-MD-BOT");
    }
    await git.fetch();
    const branches = await git.branch(['-r']);
    if (!branches.all.includes("origin/main")) return repondre("❌ Branche distante introuvable.");

    const logs = await git.log({ from: "main", to: "origin/main" });
    if (logs.total > 0) {
      const details = logs.all.map(l => `🔹 ${l.message} — _${formatDateGMTFr(l.date)}_`).join("\n");
      return repondre(`✨🚀 *MISE À JOUR DISPONIBLE !* 🚀✨\n\n📣 *Détails :*\n\n${details}\n\n🔧 Pour mettre à jour, tape : ${config.PREFIXE}update`);
    } else return repondre("✅ Le bot est déjà à jour.");
  } catch (err) {
    console.error(err);
    return repondre("❌ Erreur lors de la vérification des mises à jour.");
  }
});

// Mise à jour automatique
relcmd({
  nom_cmd: "update",
  classe: "Système",
  react: '♻️',
  desc: "Met à jour le bot automatiquement.",
  alias: ["maj"]
}, async (_chatId, _client, { repondre }) => {
  try {
    await git.init();
    const remotes = await git.getRemotes();
    if (!remotes.some(r => r.name === "origin")) await git.addRemote("origin", "https://github.com/euloge-devs/REL-MD-BOT");
    await git.fetch();

    const branches = await git.branch(['-r']);
    if (!branches.all.includes("origin/main")) return repondre("❌ Branche distante introuvable.");

    const logs = await git.log({ from: "main", to: "origin/main" });
    if (logs.total === 0) return repondre("✅ Le bot est déjà à jour.");

    await repondre("⏳ Téléchargement des dernières modifications...");
    await git.checkout("main");
    await git.pull("origin", "main");

    await repondre("✅ Mise à jour réussie ! Redémarrage...");
    exec("pm2 restart all", (err) => {
      if (err) console.error("❌ Erreur PM2 :", err);
      else console.log("Mise à jour terminée.");
    });
  } catch (err) {
    console.error("❌ Erreur de mise à jour :", err);
    await repondre("❌ Mise à jour échouée.");
  }
});
