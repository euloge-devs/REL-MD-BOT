// ================================
// Module de gestion de confidentialité WhatsApp
// ================================

const relcmd = require('../framework/command'); // Framework de commande
const { repondre } = require('../framework/utils');

// Valeurs possibles pour la confidentialité
const privacyValues = [
  "contacts",          // Seulement mes contacts
  "contact_blacklist", // Sauf certains contacts
  "none",              // Personne
  "all"                // Tout le monde
];

// ================================
// Commande: privacy
// ================================
relcmd({
  nom_cmd: "privacy",
  classe: "Confidentialité",
  react: "🕵️",
  desc: "Changer les paramètres de confidentialité"
}, async (message, arg, { prenium_id }) => {

  if (!arg[0]) {
    return repondre(message, 
      "❌ Veuillez préciser un paramètre de confidentialité.\n\n" +
      "Exemple : .privacy lastseen contacts"
    );
  }

  let setting = arg[0].toLowerCase(); // exemple: lastseen
  let value = arg[1] ? arg[1].toLowerCase() : "";

  if (!privacyValues.includes(value)) {
    return repondre(message,
      "❌ Valeur invalide.\n\n" +
      "Valeurs possibles : contacts | contact_blacklist | none | all"
    );
  }

  try {
    await message.client.updatePrivacySetting(setting, value);
    repondre(message, `✅ Confidentialité mise à jour : *${setting}* → *${value}*`);
  } catch (e) {
    repondre(message, "⚠️ Erreur lors de la mise à jour de la confidentialité.");
  }
});

// ================================
// Commande: setname
// ================================
relcmd({
  nom_cmd: "setname",
  classe: "Profil",
  react: "✏️",
  desc: "Changer le nom du profil"
}, async (message, arg) => {
  let newName = arg.join(" ");
  if (!newName) return repondre(message, "❌ Veuillez entrer un nom.");

  try {
    await message.client.updateProfileName(newName);
    repondre(message, `✅ Nom du profil changé en : *${newName}*`);
  } catch (e) {
    repondre(message, "⚠️ Erreur lors du changement du nom du profil.");
  }
});

// ================================
// Commande: setbio
// ================================
relcmd({
  nom_cmd: "setbio",
  classe: "Profil",
  react: "📃",
  desc: "Changer la bio du profil"
}, async (message, arg) => {
  let newBio = arg.join(" ");
  if (!newBio) return repondre(message, "❌ Veuillez entrer une bio.");

  try {
    await message.client.updateProfileStatus(newBio);
    repondre(message, `✅ Bio changée en : *${newBio}*`);
  } catch (e) {
    repondre(message, "⚠️ Erreur lors du changement de la bio.");
  }
});

// ================================
// Commande: block
// ================================
relcmd({
  nom_cmd: "block",
  classe: "Confidentialité",
  react: "⛔",
  desc: "Bloquer un utilisateur"
}, async (message, arg) => {
  let userId = arg[0];
  if (!userId) return repondre(message, "❌ Veuillez spécifier l'ID du contact à bloquer.");

  try {
    await message.client.updateBlockStatus(userId, "block");
    repondre(message, `✅ L’utilisateur *${userId}* a été bloqué.`);
  } catch (e) {
    repondre(message, "⚠️ Erreur lors du blocage de l’utilisateur.");
  }
});

// ================================
// Commande: unblock
// ================================
relcmd({
  nom_cmd: "unblock",
  classe: "Confidentialité",
  react: "✅",
  desc: "Débloquer un utilisateur"
}, async (message, arg) => {
  let userId = arg[0];
  if (!userId) return repondre(message, "❌ Veuillez spécifier l'ID du contact à débloquer.");

  try {
    await message.client.updateBlockStatus(userId, "unblock");
    repondre(message, `✅ L’utilisateur *${userId}* a été débloqué.`);
  } catch (e) {
    repondre(message, "⚠️ Erreur lors du déblocage de l’utilisateur.");
  }
});
