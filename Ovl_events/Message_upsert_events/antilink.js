const { Antilink, Antilink_warnings } = require("../../DataBase/antilink");

/**
 * Vérifie si un message contient un lien
 * @param {string} text
 * @returns {boolean}
 */
function containsLink(text) {
  const regex = /(?:https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})(\/\S*)?/i;
  return regex.test(text);
}

/**
 * Système Antilink
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @param {string} chatId - ID du groupe
 * @param {object} msg - Message complet reçu
 * @param {string} content - Contenu texte du message
 * @param {boolean} isGroup - Vrai si c’est dans un groupe
 * @param {boolean} isAdmin - Vrai si l’expéditeur est admin
 * @param {string} sender - ID de l’expéditeur
 */
async function antilink(sock, chatId, msg, content, isGroup, isAdmin, sender) {
  try {
    if (!containsLink(content)) return;

    // Vérifie si l’antilink est activé pour ce groupe
    const config = await Antilink.findOne({ where: { id: chatId } });
    if (!isGroup || !config || config.mode !== "oui") return;
    if (isAdmin) return; // Les admins ne sont pas sanctionnés

    const senderNumber = sender.split("@")[0];
    const messageKey = {
      remoteJid: chatId,
      fromMe: false,
      id: msg.key.id,
      participant: sender,
    };

    switch (config.type) {
      case "supp": // Supprimer le message
        await sock.sendMessage(chatId, {
          text: `@${senderNumber}, les liens ne sont pas autorisés ici.`,
          mentions: [sender],
        });
        await sock.sendMessage(chatId, { delete: messageKey });
        break;

      case "kick": // Expulser
        await sock.sendMessage(chatId, {
          text: `@${senderNumber} a été retiré pour avoir envoyé un lien.`,
          mentions: [sender],
        });
        await sock.sendMessage(chatId, { delete: messageKey });
        await sock.groupParticipantsUpdate(chatId, [sender], "remove");
        break;

      case "warn": // Avertissement (3 strikes → kick)
        let warning = await Antilink_warnings.findOne({
          where: { groupId: chatId, userId: sender },
        });

        if (!warning) {
          await Antilink_warnings.create({ groupId: chatId, userId: sender });
          await sock.sendMessage(chatId, {
            text: `@${senderNumber}, avertissement 1/3 pour avoir envoyé un lien.`,
            mentions: [sender],
          });
        } else {
          warning.count += 1;
          await warning.save();

          if (warning.count >= 3) {
            await sock.sendMessage(chatId, {
              text: `@${senderNumber} a été retiré après 3 avertissements.`,
              mentions: [sender],
            });
            await sock.sendMessage(chatId, { delete: messageKey });
            await sock.groupParticipantsUpdate(chatId, [sender], "remove");
            await warning.destroy();
          } else {
            await sock.sendMessage(chatId, {
              text: `@${senderNumber}, avertissement ${warning.count}/3 pour avoir envoyé un lien.`,
              mentions: [sender],
            });
          }
        }
        break;

      default:
        console.error("⚠️ Action inconnue :", config.type);
    }
  } catch (err) {
    console.error("❌ Erreur dans le système Antilink :", err);
  }
}

module.exports = antilink;
