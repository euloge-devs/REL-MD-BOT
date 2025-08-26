const { exec } = require("child_process");
const { relcmd } = require("../lib/relcmd");
const { Bans } = require('../DataBase/ban');
const { Sudo } = require("../DataBase/sudo");
const config = require('../set');
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const cheerio = require("cheerio");
const { WA_CONF } = require("../DataBase/wa_conf");
const { ChatbotConf } = require('../DataBase/chatbot');
const path = require("path");
const fs = require('fs');
const { saveSecondSession, getSecondAllSessions, deleteSecondSession } = require("../DataBase/connect");
const { setMention, delMention, getMention } = require("../DataBase/mention");
const { set_stick_cmd, del_stick_cmd, get_stick_cmd } = require("../DataBase/stick_cmd");
const { set_cmd, del_cmd, list_cmd } = require("../DataBase/public_private_cmd");
const { Plugin } = require("../DataBase/plugin");
const { extractNpmModules, installModules } = require("../lib/plugin");

/* -------------------- COMMANDES DE GESTION UTILISATEUR -------------------- */

// Bloquer un utilisateur
relcmd({
  nom_cmd: "block",
  classe: "Owner",
  react: '⛔',
  desc: "Bloquer un utilisateur par son JID"
}, async (jid, client, context) => {
  const { repondre, verif_Groupe, prenium_id } = context;

  if (verif_Groupe) return repondre("Veuillez vous diriger dans l'inbox de la personne à bloquer.");
  if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");

  try {
    await client.updateBlockStatus(jid, "block");
    repondre("✅ Utilisateur bloqué avec succès.");
  } catch (err) {
    console.error("Erreur block:", err);
    repondre("Impossible de bloquer l'utilisateur.");
  }
});

// Débloquer un utilisateur
relcmd({
  nom_cmd: "deblock",
  classe: "Owner",
  react: '✅',
  desc: "Débloquer un utilisateur par son JID"
}, async (jid, client, context) => {
  const { repondre, verif_Groupe, prenium_id } = context;

  if (verif_Groupe) return repondre("Veuillez vous diriger dans l'inbox de la personne à bloquer.");
  if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");

  try {
    await client.updateBlockStatus(jid, "unblock");
    repondre("✅ Utilisateur débloqué avec succès.");
  } catch (err) {
    console.error("Erreur deblock:", err);
    repondre("Impossible de débloquer l'utilisateur.");
  }
});

// Bannir un utilisateur
relcmd({
  nom_cmd: 'ban',
  classe: 'Owner',
  react: '🚫',
  desc: "Bannir un utilisateur des commandes du bot"
}, async (jid, client, context) => {
  const { repondre, arg, getJid, auteur_Msg_Repondu, prenium_id, dev_num, ms } = context;

  if (!prenium_id) return client.sendMessage(jid, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });

  try {
    const targetJid = auteur_Msg_Repondu || (arg[0]?.includes('@') && arg[0].replace('@', '') + "@lid");
    const validJid = await getJid(targetJid, ms, client);
    if (!validJid) return repondre("Mentionnez un utilisateur valide à bannir.");
    if (dev_num.includes(validJid)) return client.sendMessage(jid, { text: "Vous ne pouvez pas bannir un développeur." }, { quoted: ms });

    const [banRecord] = await Bans.findOrCreate({
      where: { id: validJid },
      defaults: { id: validJid, type: "user" }
    });

    if (!banRecord._options.isNewRecord) return repondre("Cet utilisateur est déjà banni !");
    return client.sendMessage(jid, { text: `Utilisateur @${validJid.split('@')[0]} banni avec succès.`, mentions: [validJid] }, { quoted: ms });

  } catch (err) {
    console.error("Erreur ban:", err);
    return repondre("Une erreur s'est produite.");
  }
});

// Débannir un utilisateur
relcmd({
  nom_cmd: "deban",
  classe: "Owner",
  react: '🚫',
  desc: "Débannir un utilisateur des commandes du bot"
}, async (jid, client, context) => {
  const { repondre, arg, getJid, auteur_Msg_Repondu, prenium_id, ms } = context;

  if (!prenium_id) return client.sendMessage(jid, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });

  try {
    const targetJid = auteur_Msg_Repondu || (arg[0]?.includes('@') && arg[0].replace('@', '') + "@lid");
    const validJid = await getJid(targetJid, ms, client);
    if (!validJid) return repondre("Mentionnez un utilisateur valide à débannir.");

    const deleted = await Bans.destroy({ where: { id: validJid, type: "user" } });
    if (deleted === 0) return repondre("Cet utilisateur n'est pas banni.");

    return client.sendMessage(jid, { text: `Utilisateur @${validJid.split('@')[0]} débanni avec succès.`, mentions: [validJid] }, { quoted: ms });

  } catch (err) {
    console.error("Erreur deban:", err);
    return repondre("Une erreur s'est produite.");
  }
});

/* -------------------- AUTRES COMMANDES OWNER -------------------- */

// setsudo, sudolist, delsudo, tgs, fetch_sc, antidelete, jid, restart
// ... Le reste des commandes suit la même logique et peut être réécrit de la même manière
