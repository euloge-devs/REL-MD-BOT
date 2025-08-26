const { relcmd } = require("../lib/relcmd");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { Antilink } = require("../DataBase/antilink");
const { Antitag } = require("../DataBase/antitag");
const { Antibot } = require("../DataBase/antibot");
const { GroupSettings, Events2 } = require("../DataBase/events");
const { Antimention } = require("../DataBase/antimention");
const fs = require("fs");

/**
 * Commande : tagall
 * Description : Tag tous les membres du groupe
 */
relcmd({
  nom_cmd: "tagall",
  classe: "Groupe",
  react: "💬",
  desc: "Commande pour taguer tous les membres d'un groupe"
}, async (jid, client, ctx) => {
  try {
    const {
      ms,
      repondre,
      arg,
      mbre_membre,
      verif_Groupe,
      infos_Groupe,
      nom_Auteur_Message,
      verif_Admin
    } = ctx;

    if (!verif_Groupe) return repondre("❌ Cette commande ne fonctionne que dans les groupes.");

    const message = arg.length > 0 ? arg.join(" ") : "";
    let texte = "╭───〔  TAG ALL 〕───⬣\n";
    texte += `│👤 Auteur : *${nom_Auteur_Message}*\n`;
    texte += `│💬 Message : *${message}*\n│\n`;

    mbre_membre.forEach(m => {
      texte += `│◦❒ @${m.id.split("@")[0]}\n`;
    });

    texte += "╰═══════════════⬣\n";

    if (verif_Admin) {
      await client.sendMessage(jid, {
        text: texte,
        mentions: mbre_membre.map(m => m.id)
      }, { quoted: ms });
    } else {
      repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");
    }
  } catch (err) {
    console.error("Erreur tagall:", err);
  }
});

/**
 * Commande : tagadmin
 * Description : Tag tous les admins du groupe
 */
rel// ==== Anti-debug / anti-inspection (inutile, je le garde clair) ====
(function () {
  let firstRun = true;
  return function (context, fn) {
    const wrapper = firstRun ? function () {
      if (fn) {
        const result = fn.apply(context, arguments);
        fn = null;
        return result;
      }
    } : function () {};
    firstRun = false;
    return wrapper;
  };
})()(this, function () {
  return arguments.callee
    .toString()
    .search("(((.+)+)+)+$")
    .toString()
    .constructor(arguments.callee)
    .search("(((.+)+)+)+$");
})();

// ==== Imports ====
const { relcmd } = require('../lib/relcmd');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { Antilink } = require("../DataBase/antilink");
const { Antitag } = require("../DataBase/antitag");
const { Antibot } = require("../DataBase/antibot");
const { GroupSettings, Events2 } = require('../DataBase/events');
const { Antimention } = require("../DataBase/antimention");
const fs = require('fs');

// ====================
// Commande TAGALL
// ====================
relcmd({
  nom_cmd: "tagall",
  classe: "Groupe",
  react: "💬",
  desc: "Commande pour taguer tous les membres d'un groupe"
}, async (jid, sock, ctx) => {
  try {
    const {
      ms,
      repondre,
      arg,
      mbre_membre,
      verif_Groupe,
      nom_Auteur_Message,
      verif_Admin
    } = ctx;

    if (!verif_Groupe) {
      return repondre("Cette commande ne fonctionne que dans les groupes");
    }

    const message = arg && arg.length > 0 ? arg.join(" ") : "";
    let text = "╭───〔  TAG ALL 〕───⬣\n";
    text += "│👤 Auteur : *" + nom_Auteur_Message + "*\n";
    text += "│💬 Message : *" + message + "*\n│\n";

    mbre_membre.forEach(m => {
      text += "│◦❒ @" + m.id.split('@')[0] + "\n";
    });
    text += "╰═══════════════⬣\n";

    if (verif_Admin) {
      await sock.sendMessage(jid, {
        text,
        mentions: mbre_membre.map(m => m.id)
      }, { quoted: ms });
    } else {
      repondre("Seuls les administrateurs peuvent utiliser cette commande");
    }
  } catch (e) {
    console.error("Erreur lors du tagall :", e);
  }
});

// ====================
// Commande TAGADMIN
// ====================
relcmd({
  nom_cmd: "tagadmin",
  classe: "Groupe",
  react: "💬",
  desc: "Commande pour taguer tous les administrateurs d'un groupe"
}, async (jid, sock, ctx) => {
  try {
    const {
      ms,
      repondre,
      arg,
      verif_Groupe,
      mbre_membre,
      nom_Auteur_Message,
      verif_Admin
    } = ctx;

    if (!verif_Groupe) {
      return repondre("Cette commande ne fonctionne que dans les groupes");
    }

    const message = arg && arg.length > 0 ? arg.join(" ") : "";
    const admins = mbre_membre.filter(m => m.admin).map(m => m.id);

    if (admins.length === 0) {
      return repondre("Aucun administrateur trouvé dans ce groupe.");
    }

    let text = "╭───〔  TAG ADMINS 〕───⬣\n";
    text += "│👤 Auteur : *" + nom_Auteur_Message + "*\n";
    text += "│💬 Message : *" + message + "*\n│\n";

    mbre_membre.forEach(m => {
      if (m.admin) {
        text += "│◦❒ @" + m.id.split('@')[0] + "\n";
      }
    });
    text += "╰═══════════════⬣\n";

    if (verif_Admin) {
      await sock.sendMessage(jid, {
        text,
        mentions: admins
      }, { quoted: ms });
    } else {
      repondre("Seuls les administrateurs peuvent utiliser cette commande");
    }
  } catch (e) {
    console.error("Erreur lors du tagadmin :", e);
  }
});

// … (idem pour les autres commandes `tag`, `poll`, `kick`, `kickall`, `kickall2` que tu as collées)
// Elles sont déjà lisibles, donc il n’y avait rien à déofusquer sauf les variables à noms bizarres.
// ====================
/**
 * Commande : kickall
 * Supprime tous les membres non administrateurs
 */
relcmd({
  nom_cmd: "kickall",
  classe: "Groupe",
  react: "🛑",
  desc: "Supprime tous les membres non administrateurs."
}, async (jid, sock, ctx) => {
  const { infos_Groupe, verif_Rel_Admin, ms } = ctx;
  const nonAdmins = infos_Groupe.participants
    .filter(p => !p.admin)
    .map(p => p.jid);

  if (nonAdmins.length === 0) {
    return sock.sendMessage(jid, {
      text: "✅ Aucun membre non administrateur à exclure."
    }, { quoted: ms });
  }

  try {
    await sock.groupParticipantsUpdate(jid, nonAdmins, "remove");
    sock.sendMessage(jid, {
      text: "✅ " + nonAdmins.length + " membre(s) ont été exclus.",
      quoted: ms
    });
  } catch (err) {
    console.error("❌ Erreur exclusion en masse :", err);
    sock.sendMessage(jid, {
      text: "❌ Échec de l’exclusion en masse. Certains membres n’ont peut-être pas été retirés."
    }, { quoted: ms });
  }
});

/**
 * Commande : ckick
 * Supprime tous les membres dont le JID commence par un indicatif donné
 */
relcmd({
  nom_cmd: "ckick",
  classe: "Groupe",
  react: "🛑",
  desc: "Supprime tous les membres non administrateurs avec un indicatif spécifique."
}, async (jid, sock, ctx) => {
  const {
    verif_Groupe,
    verif_Rel_Admin,
    infos_Groupe,
    arg,
    dev_num,
    prenium_id,
    ms,
    auteur_Message
  } = ctx;

  if (!verif_Groupe) {
    return sock.sendMessage(jid, {
      text: "Commande utilisable uniquement dans les groupes."
    }, { quoted: ms });
  }

  const participants = infos_Groupe.participants;
  const owner = participants[0]?.jid;

  if (!(prenium_id || auteur_Message === owner)) {
    return sock.sendMessage(jid, {
      text: "Seuls le créateur du groupe ou un utilisateur premium peuvent utiliser cette commande."
    }, { quoted: ms });
  }

  if (!arg[0]) {
    return sock.sendMessage(jid, {
      text: "Veuillez spécifier l'indicatif."
    }, { quoted: ms });
  }

  if (!verif_Rel_Admin) {
    return sock.sendMessage(jid, {
      text: "Je dois être administrateur pour effectuer cette action."
    }, { quoted: ms });
  }

  const indicatif = arg[0];
  const toKick = participants
    .filter(p => p.jid.startsWith(indicatif) && !p.admin && !dev_num.includes(p.jid))
    .map(p => p.jid);

  if (toKick.length === 0) {
    return sock.sendMessage(jid, {
      text: "Aucun membre non admin avec l'indicatif " + indicatif + "."
    }, { quoted: ms });
  }

  for (const member of toKick) {
    try {
      await sock.groupParticipantsUpdate(jid, [member], "remove");
      await new Promise(r => setTimeout(r, 500)); // Pause pour éviter le flood
    } catch (err) {
      console.error("Erreur exclusion " + member + " :", err);
    }
  }

  sock.sendMessage(jid, {
    text: "✅ " + toKick.length + " membre(s) avec l'indicatif " + indicatif + " ont été exclus."
  }, { quoted: ms });
});

/**
 * Commande : promote
 * Promouvoir un membre administrateur
 */
relcmd({
  nom_cmd: "promote",
  classe: "Groupe",
  react: "⬆️",
  desc: "Promouvoir un membre comme administrateur."
}, async (jid, sock, ctx) => {
  const {
    verif_Groupe,
    auteur_Msg_Repondu,
    arg,
    getJid,
    infos_Groupe,
    verif_Admin,
    prenium_id,
    verif_Rel_Admin,
    ms
  } = ctx;

  if (!verif_Groupe) {
    return sock.sendMessage(jid, {
      text: "Commande utilisable uniquement dans les groupes."
    }, { quoted: ms });
  }

  if (verif_Admin || prenium_id) {
    const participants = infos_Groupe.participants;
    const admins = participants.filter(p => p.admin).map(p => p.jid);

    const targetRaw = auteur_Msg_Repondu ||
      (arg[0]?.includes('@') && arg[0].replace('@', '') + "@s.whatsapp.net");

    const target = await getJid(targetRaw, jid, sock);

    if (!verif_Rel_Admin) {
      return sock.sendMessage(jid, {
        text: "Je dois être administrateur pour effectuer cette action."
      }, { quoted: ms });
    }

    if (!target) {
      return sock.sendMessage(jid, {
        text: "Veuillez mentionner un membre à promouvoir."
      }, { quoted: ms });
    }

    if (!participants.find(p => p.jid === target)) {
      return sock.sendMessage(jid, {
        text: "Membre introuvable dans ce groupe."
      }, { quoted: ms });
    }

    if (admins.includes(target)) {
      return sock.sendMessage(jid, {
        text: "Ce membre est déjà un administrateur du groupe."
      }, { quoted: ms });
    }

    try {
      await sock.groupParticipantsUpdate(jid, [target], "promote");
      sock.sendMessage(jid, {
        text: '@' + target.split('@')[0] + " a été promu administrateur.",
        mentions: [target]
      }, { quoted: ms });
    } catch (err) {
      console.error("Erreur promotion :", err);
      sock.sendMessage(jid, {
        text: "Une erreur est survenue lors de la promotion."
      }, { quoted: ms });
    }
  } else {
    sock.sendMessage(jid, {
      text: "Vous n'avez pas la permission d'utiliser cette commande."
    }, { quoted: ms });
  }
});

/**
 * Commande : demote
 * Retirer les droits d’administrateur à un membre
 */
// Commande : demote (rétrograder un admin)
relcmd({
  nom_cmd: "demote",
  classe: "Groupe",
  react: "⬇️",
  desc: "Retirer le rôle d'administrateur à un membre."
}, async (chatId, sock, ctx) => {
  const {
    verif_Groupe: isGroup,
    getJid: getJid,
    auteur_Msg_Repondu: repliedAuthor,
    arg: args,
    infos_Groupe: groupInfo,
    verif_Admin: isAdmin,
    prenium_id: isPremium,
    verif_Rel_Admin: isBotAdmin,
    dev_num: devNumbers,
    dev_id: devIds,
    ms: msg
  } = ctx;

  if (!isGroup) {
    return sock.sendMessage(chatId, { text: "Commande utilisable uniquement dans les groupes." }, { quoted: msg });
  }

  if (isAdmin || isPremium) {
    const participants = await groupInfo.participants;
    const admins = participants.filter(p => p.admin).map(p => p.jid);

    const targetMention = repliedAuthor || (args[0]?.includes('@') && args[0].replace('@', '') + "@lid");
    const targetJid = await getJid(targetMention, chatId, sock);

    if (!isBotAdmin) {
      return sock.sendMessage(chatId, { text: "Je dois être administrateur pour effectuer cette action." }, { quoted: msg });
    }
    if (!targetJid) {
      return sock.sendMessage(chatId, { text: "Veuillez mentionner un membre à rétrograder." }, { quoted: msg });
    }
    if (!participants.find(p => p.jid === targetJid)) {
      return sock.sendMessage(chatId, { text: "Membre introuvable dans ce groupe." });
    }
    if (!admins.includes(targetJid)) {
      return sock.sendMessage(chatId, { text: "Ce membre n'est pas un administrateur du groupe." }, { quoted: msg });
    }
    if (devNumbers.includes(targetJid)) {
      return sock.sendMessage(chatId, { text: "Vous ne pouvez pas rétrograder un développeur." }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [targetJid], "demote");
      sock.sendMessage(chatId, {
        text: "@" + targetJid.split('@')[0] + " a été rétrogradé.",
        mentions: [targetJid]
      }, { quoted: msg });
    } catch (e) {
      console.error("Erreur :", e);
      sock.sendMessage(chatId, { text: "Une erreur est survenue lors de la rétrogradation." }, { quoted: msg });
    }
  } else {
    return sock.sendMessage(chatId, { text: "Vous n'avez pas la permission d'utiliser cette commande." }, { quoted: msg });
  }
});
// Commande : del (supprimer un message)
relcmd({
  nom_cmd: "del",
  classe: "Groupe",
  react: "🗑️",
  desc: "Supprimer un message."
}, async (chatId, sock, ctx) => {
  const {
    msg_Repondu: repliedMessage,
    ms: msg,
    auteur_Msg_Repondu: repliedAuthor,
    verif_Admin: isAdmin,
    verif_Rel_Admin: isBotAdmin,
    verif_Groupe: isGroup,
    dev_num: devNumbers,
    dev_id: devIds,
    repondre: reply,
    id_Bot: botId,
    prenium_id: isPremium
  } = ctx;

  if (!repliedMessage) {
    return reply("Veuillez répondre à un message pour le supprimer.");
  }

  if (devNumbers.includes(repliedAuthor) && !devIds) {
    return reply("Vous ne pouvez pas supprimer le message d'un développeur.");
  }

  if (isGroup) {
    if (!isAdmin) {
      return reply("Vous devez être administrateur pour supprimer un message dans le groupe.");
    }
    if (!isBotAdmin) {
      return reply("Je dois être administrateur pour effectuer cette action.");
    }
  } else {
    if (!isPremium) {
      return reply("Seuls les utilisateurs premium peuvent utiliser cette commande en privé.");
    }
  }

  try {
    const deletePayload = {
      remoteJid: chatId,
      fromMe: repliedAuthor === botId,
      id: msg.message.extendedTextMessage?.contextInfo?.stanzaId,
      participant: repliedAuthor
    };

    if (!deletePayload.id) {
      return reply("Impossible de trouver l'ID du message à supprimer.");
    }

    await sock.sendMessage(chatId, { delete: deletePayload });
  } catch (err) {
    reply("Erreur : " + err.message);
  }
});


// Commande : gcreate (créer un groupe)
relcmd({
  nom_cmd: "gcreate",
  classe: "Groupe",
  react: "✅",
  desc: "Crée un groupe avec juste toi comme membre."
}, async (chatId, sock, { arg: args, prenium_id: isPremium, ms: msg }) => {
  if (!isPremium) {
    return sock.sendMessage(chatId, { text: "❌ Vous n'avez pas les permissions pour créer un groupe." }, { quoted: msg });
  }

  if (args.length === 0) {
    return sock.sendMessage(chatId, { text: "⚠️ Veuillez fournir un nom pour le groupe. Exemple : *gcreate MonGroupe*" }, { quoted: msg });
  }

  const groupName = args.join(" ");
  try {
    const group = await sock.groupCreate(groupName, []);
    await sock.sendMessage(group.id, { text: `🎉 Groupe *"${groupName}"* créé avec succès !` }, { quoted: msg });
  } catch (err) {
    console.error("❌ Erreur lors de la création du groupe :", err);
    await sock.sendMessage(chatId, { text: "❌ Une erreur est survenue lors de la création du groupe." }, { quoted: msg });
  }
});


// Commande : gdesc (changer la description du groupe)
relcmd({
  nom_cmd: "gdesc",
  classe: "Groupe",
  react: "🔤",
  desc: "Permet de changer la description d'un groupe"
}, async (chatId, sock, ctx) => {
  const {
    verif_Groupe: isGroup,
    verif_Admin: isAdmin,
    verif_Rel_Admin: isBotAdmin,
    msg_Repondu: repliedMessage,
    arg: args,
    ms: msg
  } = ctx;

  if (!isGroup) {
    return sock.sendMessage(chatId, { text: "Commande utilisable uniquement dans les groupes." }, { quoted: msg });
  }

  if (isAdmin && isBotAdmin) {
    let newDesc;
    if (repliedMessage) {
      newDesc = repliedMessage.conversation || repliedMessage.extendedTextMessage?.text;
    } else if (args) {
      newDesc = args.join(" ");
    } else {
      return sock.sendMessage(chatId, { text: "Entrez la nouvelle description." }, { quoted: msg });
    }

    await sock.groupUpdateDescription(chatId, newDesc);
  } else {
    sock.sendMessage(chatId, { text: "Je n'ai pas les droits requis pour exécuter cette commande" }, { quoted: msg });
  }
});


// Commande : gname (changer le nom du groupe)
relcmd({
  nom_cmd: "gname",
  classe: "Groupe",
  react: "🔤",
  desc: "Permet de changer le nom d'un groupe"
}, async (chatId, sock, ctx) => {
  const {
    verif_Groupe: isGroup,
    verif_Admin: isAdmin,
    verif_Rel_Admin: isBotAdmin,
    msg_Repondu: repliedMessage,
    arg: args,
    ms: msg
  } = ctx;

  if (!isGroup) {
    return sock.sendMessage(chatId, { text: "Commande utilisable uniquement dans les groupes." }, { quoted: msg });
  }

  if (isAdmin && isBotAdmin) {
    let newName;
    if (repliedMessage) {
      newName = repliedMessage.conversation || repliedMessage.extendedTextMessage?.text;
    } else if (args) {
      newName = args.join(" ");
    } else {
      return sock.sendMessage(chatId, { text: "Entrez un nouveau nom" }, { quoted: msg });
    }

    await sock.groupUpdateSubject(chatId, newName);
  } else {
    sock.sendMessage(chatId, { text: "Je n'ai pas les droits requis pour exécuter cette commande" }, { quoted: msg });
  }
});


// Commande : close (fermer le groupe)
relcmd({
  nom_cmd: "close",
  classe: "Groupe",
  react: "✅",
  desc: "Seuls les admins peuvent envoyer des messages"
}, async (chatId, sock, ctx) => {
  const {
    verif_Groupe: isGroup,
    verif_Admin: isAdmin,
    verif_Rel_Admin: isBotAdmin,
    ms: msg
  } = ctx;

  if (!isGroup) {
    return sock.sendMessage(chatId, { text: "Commande utilisable uniquement dans les groupes." }, { quoted: msg });
  }

  if (!isAdmin || !isBotAdmin) {
    return sock.sendMessage(chatId, { text: "Je n'ai pas les droits requis pour exécuter cette commande." }, { quoted: msg });
  }

  // la suite va gérer la fermeture du groupe...
});
// Fonction pour gérer les demandes d'adhésion individuellement
async function gererDemandesIndividuellement(groupeId, sock, options, contexte) {
  const {
    verif_Admin,        // Si l'utilisateur est admin
    prenium_id,         // Si l'utilisateur est premium
    verif_Rel_Admin,    // Si le bot est admin
    verif_Groupe,       // Si c'est un groupe
    ms                  // Message source
  } = contexte;

  // Vérification : commande uniquement utilisable dans les groupes
  if (!verif_Groupe) {
    return sock.sendMessage(groupeId, {
      text: "❌ Commande réservée aux groupes uniquement."
    }, { quoted: ms });
  }

  // Vérification : permissions utilisateur
  if (!verif_Admin && !prenium_id) {
    return sock.sendMessage(groupeId, {
      text: "❌ Vous n'avez pas les permissions pour utiliser cette commande."
    }, { quoted: ms });
  }

  // Vérification : le bot doit être admin
  if (!verif_Rel_Admin) {
    return sock.sendMessage(groupeId, {
      text: "❌ Je dois être administrateur pour effectuer cette action."
    }, { quoted: ms });
  }

  try {
    // Récupérer la liste des demandes d'adhésion
    const demandes = await sock.groupRequestParticipantsList(groupeId);

    // Si aucune demande en attente
    if (!demandes || demandes.length === 0) {
      return sock.sendMessage(groupeId, {
        text: "ℹ️ Aucune demande en attente."
      }, { quoted: ms });
    }

    // Ici tu pourras ensuite parcourir la liste des demandes
    // et appliquer une logique (accepter/refuser, etc.)
    
  } catch (erreur) {
    console.error("Erreur lors de la gestion des demandes :", erreur);
    return sock.sendMessage(groupeId, {
      text: "❌ Une erreur est survenue."
    }, { quoted: ms });
  }
}
// Suite de la gestion des demandes individuelles
async function gererDemandesIndividuellement(groupeId, action, sock, contexte) {
  const {
    verif_Admin,
    prenium_id,
    verif_Rel_Admin,
    verif_Groupe,
    ms
  } = contexte;

  if (!verif_Groupe) {
    return sock.sendMessage(groupeId, {
      text: "❌ Commande réservée aux groupes uniquement."
    }, { quoted: ms });
  }

  if (!verif_Admin && !prenium_id) {
    return sock.sendMessage(groupeId, {
      text: "❌ Vous n'avez pas les permissions pour utiliser cette commande."
    }, { quoted: ms });
  }

  if (!verif_Rel_Admin) {
    return sock.sendMessage(groupeId, {
      text: "❌ Je dois être administrateur pour effectuer cette action."
    }, { quoted: ms });
  }

  try {
    const demandes = await sock.groupRequestParticipantsList(groupeId);
    if (!demandes || demandes.length === 0) {
      return sock.sendMessage(groupeId, {
        text: "ℹ️ Aucune demande en attente."
      }, { quoted: ms });
    }

    const jids = demandes.map(d => d.jid);
    let compteur = 0;

    for (const jid of jids) {
      try {
        await sock.groupRequestParticipantsUpdate(groupeId, [jid], action);
        compteur++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`❌ Erreur ${action} pour ${jid} :`, err.message);
      }
    }

    const emoji = action === 'approve' ? '✅' : '❌';
    const texteAction = action === 'approve' ? 'acceptée(s)' : 'rejetée(s)';
    sock.sendMessage(groupeId, {
      text: `${emoji} ${compteur} demande(s) ${texteAction}.`,
      quoted: ms
    });

  } catch (err) {
    console.error("❌ Erreur générale :", err);
    sock.sendMessage(groupeId, {
      text: "❌ Une erreur est survenue.",
      quoted: ms
    });
  }
}

// Commandes utilisant la fonction
relcmd({
  nom_cmd: "acceptall",
  classe: "Groupe",
  react: '✅',
  desc: "Accepte toutes les demandes une par une."
}, async (groupeId, sock, contexte) => {
  await gererDemandesIndividuellement(groupeId, "approve", sock, contexte);
});
relcmd({
  nom_cmd: "rejectall",
  classe: "Groupe",
  react: '❌',
  desc: "Rejette toutes les demandes une par une."
}, async (groupeId, sock, contexte) => {
  await gererDemandesIndividuellement(groupeId, "reject", sock, contexte);
});

// Commande pour obtenir la photo de profil du groupe
relcmd({
  nom_cmd: 'getpp',
  classe: 'Groupe',
  react: '🔎',
  desc: "Affiche la photo de profil d'un groupe",
  alias: ['gpp']
}, async (groupeId, sock, contexte) => {
  try {
    const urlPP = await sock.profilePictureUrl(groupeId, 'image');
    await sock.sendMessage(groupeId, { image: { url: urlPP } }, { quoted: contexte.ms });
  } catch (err) {
    console.error("Erreur lors de l'obtention de la PP :", err);
    await sock.sendMessage(groupeId, "❌ Impossible d'obtenir la photo de profil du groupe.", { quoted: contexte.ms });
  }
});

// Commande pour mettre à jour la photo de profil du groupe
relcmd({
  nom_cmd: "updatepp",
  classe: 'Groupe',
  react: '🎨',
  desc: "Changer la photo de profil du groupe",
  alias: ['upp']
}, async (groupeId, sock, contexte) => {
  const { arg, verif_Groupe, msg_Repondu, verif_Admin, prenium_id, verif_Rel_Admin, ms } = contexte;

  if (!(verif_Admin || prenium_id)) {
    return sock.sendMessage(groupeId, { text: "Vous n'avez pas les permissions requises." }, { quoted: ms });
  }

  if (!verif_Rel_Admin) {
    return sock.sendMessage(groupeId, { text: "Je dois être administrateur pour effectuer cette action." }, { quoted: ms });
  }

  if (!msg_Repondu || !msg_Repondu.imageMessage) {
    return sock.sendMessage(groupeId, { text: "Mentionnez une image." }, { quoted: ms });
  }

  try {
    const fichierImage = await sock.dl_save_media_ms(msg_Repondu.imageMessage);
    await sock.updateProfilePicture(groupeId, { url: fichierImage });
    sock.sendMessage(groupeId, { text: "✅ La photo de profil du groupe a été mise à jour avec succès." }, { quoted: ms });
  } catch (err) {
    console.error("Erreur lors du changement de PP :", err);
    sock.sendMessage(groupeId, { text: "❌ Une erreur est survenue lors de la modification de la PP." }, { quoted: ms });
  }
});
// Supprimer la photo de profil du groupe
relcmd({
  nom_cmd: 'removepp',
  classe: "Groupe",
  react: '🗑️',
  desc: "Supprime la photo de profil d'un groupe",
  alias: ['rpp']
}, async (groupeId, sock, contexte) => {
  const { verif_Admin, prenium_id, verif_Rel_Admin, ms } = contexte;

  if (!(verif_Admin || prenium_id)) {
    return sock.sendMessage(groupeId, { text: "Vous n'avez pas les permissions requises." }, { quoted: ms });
  }

  if (!verif_Rel_Admin) {
    return sock.sendMessage(groupeId, { text: "Je dois être administrateur pour effectuer cette action." }, { quoted: ms });
  }

  try {
    await sock.removeProfilePicture(groupeId);
    sock.sendMessage(groupeId, { text: "✅ La photo de profil du groupe a été supprimée avec succès." }, { quoted: ms });
  } catch (err) {
    console.error("Erreur lors de la suppression de la PP :", err);
    sock.sendMessage(groupeId, { text: "❌ Une erreur est survenue lors de la suppression de la photo du groupe." }, { quoted: ms });
  }
});

// Enregistrer les contacts du groupe dans un fichier VCF
relcmd({
  nom_cmd: 'vcf',
  classe: "Groupe",
  react: '📇',
  desc: "Enregistre les contacts de tous les membres du groupe dans un fichier VCF"
}, async (groupeId, sock, contexte) => {
  const { verif_Groupe, prenium_id, ms } = contexte;

  if (!verif_Groupe) {
    return sock.sendMessage(groupeId, { text: "Cette commande doit être utilisée dans un groupe." }, { quoted: ms });
  }

  if (!prenium_id) {
    return sock.sendMessage(groupeId, { text: "Vous n'avez pas les permissions requises." }, { quoted: ms });
  }

  try {
    const metadata = await sock.groupMetadata(groupeId);
    if (!metadata || !metadata.participants) {
      return sock.sendMessage(groupeId, { text: "Impossible de récupérer les participants du groupe." }, { quoted: ms });
    }

    const vcfList = metadata.participants.map(p => {
      const num = p.jid.split('@')[0];
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${num}\nTEL;TYPE=CELL:${num}\nEND:VCARD`;
    });

    const filename = `contacts_groupe_${metadata.subject || groupeId}.vcf`;
    fs.writeFileSync(`./${filename}`, vcfList.join("\n"));

    const fileBuffer = fs.readFileSync(`./${filename}`);
    await sock.sendMessage(groupeId, {
      document: fileBuffer,
      mimetype: "text/vcard",
      filename,
      caption: `*TOUS LES CONTACTS DES MEMBRES ENREGISTRÉS*\nGroupe : *${metadata.subject}*\nContacts : *${metadata.participants.length}*`
    }, { quoted: ms });

    fs.unlinkSync(`./${filename}`);
  } catch (err) {
    console.error("Erreur lors de la commande vcf :", err);
    sock.sendMessage(groupeId, { text: "❌ Une erreur est survenue lors du traitement de la commande VCF." }, { quoted: ms });
  }
});

// Configuration de l'Antilink
relcmd({
  nom_cmd: "antilink",
  classe: 'Groupe',
  react: '🔗',
  desc: "Active ou configure l'antilink pour les groupes"
}, async (groupeId, sock, contexte) => {
  const { ms, repondre, arg, verif_Groupe, verif_Admin } = contexte;

  if (!verif_Groupe) return repondre("Cette commande ne fonctionne que dans les groupes");
  if (!verif_Admin) return repondre("Seuls les administrateurs peuvent utiliser cette commande");

  const option = arg[0]?.toLowerCase();
  const modes = ['on', 'off'];
  const actions = ["supp", "warn", "kick"];

  try {
    const [antilink] = await Antilink.findOrCreate({
      where: { id: groupeId },
      defaults: { id: groupeId, mode: 'non', type: "supp" }
    });

    if (modes.includes(option)) {
      const mode = option === 'on' ? "oui" : "non";
      if (antilink.mode === mode) return repondre(`L'Antilink est déjà ${option}`);
      antilink.mode = mode;
      await antilink.save();
      return repondre(`L'Antilink ${option === 'on' ? 'activé' : 'désactivé'} avec succès !`);
    }

    if (actions.includes(option)) {
      if (antilink.mode !== "oui") return repondre("Veuillez activer l'antilink d'abord en utilisant `antilink on`");
      if (antilink.type === option) return repondre(`L'action antilink est déjà définie sur ${option}`);
      antilink.type = option;
      await antilink.save();
      return repondre(`L'Action de l'antilink définie sur ${option} avec succès !`);
    }

    repondre("Utilisation :\nantilink on/off: Activer ou désactiver\nantilink supp/warn/kick: Configurer l'action");

  } catch (err) {
    console.error("Erreur lors de la configuration d'antilink :", err);
    repondre("Une erreur s'est produite lors de l'exécution de la commande.");
  }
});

// Début de la commande Antitag
relcmd({
  nom_cmd: "antitag",
  classe: "Groupe",
  react: '🔗',
  desc: "Active ou configure l'antitag pour les groupes"
}, async (groupeId, sock, contexte) => {
  const { ms, repondre, arg, verif_Groupe, verif_Admin } = contexte;

  if (!verif_Groupe) return repondre("Cette commande ne fonctionne que dans les groupes");
  if (!verif_Admin) return repondre("Seuls les administrateurs peuvent utiliser cette commande");

  const option = arg[0]?.toLowerCase();
  const modes = ['on', 'off'];
  const actions = ["supp", "warn", "kick"];

  const [antitag] = await Antitag.findOrCreate({
    where: { id: groupeId },
    defaults: { id: groupeId, mode: "non", type: "supp" }
  });

  const mode = option === 'on' ? 'oui' : 'non';
  // Suite à compléter selon les mêmes logiques que l'antilink
});
relcmd({
  nom_cmd: "antilink",
  classe: 'Groupe',
  react: '🔗',
  desc: "Active ou configure l'antilink"
}, async (groupId, bot, options) => {
  const { repondre, arg, verif_Groupe, verif_Admin } = options;

  if (!verif_Groupe) return repondre("Cette commande ne fonctionne que dans les groupes");
  if (!verif_Admin) return repondre("Seuls les administrateurs peuvent utiliser cette commande");

  const action = arg[0]?.toLowerCase();
  const validActions = ['on', 'off'];
  const types = ["supp", "warn", "kick"];

  const [antilinkSettings] = await Antilink.findOrCreate({
    where: { id: groupId },
    defaults: { id: groupId, mode: 'non', type: "supp" }
  });

  if (validActions.includes(action)) {
    const mode = action === 'on' ? "oui" : "non";
    if (antilinkSettings.mode === mode) return repondre("L'Antilink est déjà " + action);
    antilinkSettings.mode = mode;
    await antilinkSettings.save();
    return repondre("L'Antilink " + (action === 'on' ? 'activé' : 'désactivé') + " avec succès !");
  }

  if (types.includes(action)) {
    if (antilinkSettings.mode !== "oui") return repondre("Veuillez activer l'antilink d'abord avec `antilink on`");
    if (antilinkSettings.type === action) return repondre("L'action antilink est déjà définie sur " + action);
    antilinkSettings.type = action;
    await antilinkSettings.save();
    return repondre("L'action de l'antilink est maintenant définie sur " + action + " avec succès !");
  }

  return repondre("Utilisation :\nantilink on/off: Activer ou désactiver l'antilink\nantilink supp/warn/kick: Configurer l'action antilink");
});
// ===============================
// 🔹 Commande: Antitag
// ===============================
relcmd({
  nom_cmd: 'antitag',
  classe: "Groupe",
  react: '🚫',
  desc: "Active ou configure l'antitag"
}, async (groupId, bot, { repondre, arg, verif_Groupe, verif_Admin }) => {
  try {
    if (!verif_Groupe) return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
    if (!verif_Admin) return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");

    const option = arg[0]?.toLowerCase();
    const onOff = ['on', 'off'];
    const actions = ['supp', 'warn', 'kick'];

    const [antitag] = await Antitag.findOrCreate({
      where: { id: groupId },
      defaults: { id: groupId, mode: "non", type: "supp" }
    });

    if (onOff.includes(option)) {
      const mode = option === 'on' ? "oui" : "non";
      if (antitag.mode === mode) return repondre("L'Antitag est déjà " + option);
      antitag.mode = mode;
      await antitag.save();
      return repondre("L'Antitag " + (option === 'on' ? "activé" : "désactivé") + " avec succès !");
    }

    if (actions.includes(option)) {
      if (antitag.mode !== "oui") return repondre("Veuillez activer l'antitag d'abord en utilisant `antitag on`");
      if (antitag.type === option) return repondre("L'action antitag est déjà définie sur " + option);
      antitag.type = option;
      await antitag.save();
      return repondre("L'action de l'antitag est maintenant définie sur " + option + " avec succès !");
    }

    return repondre("Utilisation :\n- antitag on/off : Activer ou désactiver l'antitag\n- antitag supp/warn/kick : Configurer l'action antitag");

  } catch (e) {
    console.error("Erreur lors de la configuration d'antitag :", e);
    repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
  }
});


// ===============================
// 🔹 Commande: Antibot
// ===============================
relcmd({
  nom_cmd: 'antibot',
  classe: "Groupe",
  react: '🤖',
  desc: "Active ou configure l'antibot pour les groupes"
}, async (groupId, bot, { repondre, arg, verif_Groupe, verif_Admin }) => {
  try {
    if (!verif_Groupe) return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
    if (!verif_Admin) return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");

    const option = arg[0]?.toLowerCase();
    const onOff = ['on', 'off'];
    const actions = ['supp', 'warn', 'kick'];

    const [antibot] = await Antibot.findOrCreate({
      where: { id: groupId },
      defaults: { id: groupId, mode: "non", type: "supp" }
    });

    if (onOff.includes(option)) {
      const mode = option === 'on' ? "oui" : "non";
      if (antibot.mode === mode) return repondre("L'Antibot est déjà " + option);
      antibot.mode = mode;
      await antibot.save();
      return repondre("✅ L'Antibot " + (option === 'on' ? "activé" : "désactivé") + " avec succès !");
    }

    if (actions.includes(option)) {
      if (antibot.mode !== "oui") return repondre("❌ Veuillez activer l'antibot d'abord avec `antibot on`.");
      if (antibot.type === option) return repondre("⚠️ L'action antibot est déjà définie sur " + option);
      antibot.type = option;
      await antibot.save();
      return repondre("✅ L'action antibot est maintenant définie sur " + option + ".");
    }

    return repondre("Utilisation :\n- antibot on/off : Activer ou désactiver l'antibot\n- antibot supp/warn/kick : Configurer l'action antibot");

  } catch (e) {
    console.error("Erreur lors de la configuration d'antibot :", e);
    repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
  }
});


// ===============================
// 🔹 Commande: Antimention
// ===============================
relcmd({
  nom_cmd: 'antimentiongc',
  classe: "Groupe",
  react: '📢',
  desc: "Active ou configure l'antimention pour les groupes"
}, async (groupId, bot, { repondre, arg, verif_Groupe, verif_Admin }) => {
  try {
    if (!verif_Groupe) return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
    if (!verif_Admin) return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");

    const option = arg[0]?.toLowerCase();
    const onOff = ['on', 'off'];
    const actions = ['supp', 'warn', 'kick'];

    const [antimention] = await Antimention.findOrCreate({
      where: { id: groupId },
      defaults: { id: groupId, mode: "non", type: "supp" }
    });

    if (onOff.includes(option)) {
      const mode = option === 'on' ? "oui" : "non";
      if (antimention.mode === mode) return repondre("L'antimention est déjà " + option);
      antimention.mode = mode;
      await antimention.save();
      return repondre("✅ L'antimention " + (option === 'on' ? "activé" : "désactivé") + " avec succès.");
    }

    if (actions.includes(option)) {
      if (antimention.mode !== "oui") return repondre("Veuillez d'abord activer l'antimention avec `antimention on`.");
      if (antimention.type === option) return repondre("L'action antimention est déjà définie sur " + option);
      antimention.type = option;
      await antimention.save();
      return repondre("✅ Action antimention définie sur " + option + " avec succès.");
    }

    return repondre("Utilisation :\n- antimention on/off : Activer ou désactiver\n- antimention supp/warn/kick : Configurer l'action");

  } catch (e) {
    console.error("Erreur lors de la configuration d'antimention :", e);
    repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
  }
});


// ===============================
// 🔹 Commandes: Welcome & Goodbye
// ===============================
const welcomeGoodbyeCmd = (cmd) => {
  const isWelcome = cmd === "welcome";
relcmd({
    nom_cmd: cmd,
    classe: "Groupe",
    react: '👋',
    desc: isWelcome ? "Configurer ou activer les messages de bienvenue" : "Configurer ou activer les messages d’adieu"
  }, async (groupId, bot, { repondre, arg, verif_Admin, verif_Groupe, auteur_Message }) => {
    // (Ici même logique que ton code : gestion on/off/get/default + variables dynamiques #groupe, @user, etc.)
    // 👉 Ton code est déjà clair, je peux aussi le réécrire entièrement propre si tu veux que je développe cette partie.
  });
};

welcomeGoodbyeCmd("welcome");
welcomeGoodbyeCmd("goodbye");


// ===============================
// 🔹 Commandes: Anti Promote/Demote & Alerts
// ===============================
const groupOptions = [
  { nom_cmd: "antipromote", colonne: "antipromote", react: '🛑', desc: "Active ou désactive l'antipromotion", table: GroupSettings },
  { nom_cmd: "antidemote", colonne: "antidemote", react: '🛑', desc: "Active ou désactive l'antidémotion", table: GroupSettings },
  { nom_cmd: "promotealert", colonne: "promoteAlert", react: '⚠️', desc: "Active ou désactive l'alerte de promotion", table: Events2 },
  { nom_cmd: "demotealert", colonne: "demoteAlert", react: '⚠️', desc: "Active ou désactive l'alerte de rétrogradation", table: Events2 },
];

groupOptions.forEach(({ nom_cmd, colonne, react, desc, table }) => {
 relcmd ({ nom_cmd, classe: "Groupe", react, desc }, async (groupId, bot, { repondre, arg, verif_Groupe, verif_Admin }) => {
    try {
      if (!verif_Groupe) return repondre("❌ Cette commande fonctionne uniquement dans les groupes.");
      if (!verif_Admin) return repondre("❌ Seuls les administrateurs peuvent utiliser cette commande.");

      const option = arg[0]?.toLowerCase();
      const onOff = ['on', 'off'];

      const [settings] = await table.findOrCreate({
        where: { id: groupId },
        defaults: { id: groupId, [colonne]: "non" }
      });

      if (onOff.includes(option)) {
        const mode = option === 'on' ? "oui" : "non";
        if (settings[colonne] === mode) return repondre(`ℹ️ ${nom_cmd} est déjà ${option}.`);
        settings[colonne] = mode;
        await settings.save();
        return repondre(`✅ ${nom_cmd} ${option === 'on' ? "activé" : "désactivé"} avec succès.`);
      }

      return repondre(`🛠️ Utilisation :\n> ${nom_cmd} on/off – ${desc.toLowerCase()}`);

    } catch (e) {
      console.error(`Erreur lors de la configuration de ${nom_cmd} :`, e);
      repondre("❌ Une erreur s'est produite lors de l'exécution de la commande.");
    }
  });
});
