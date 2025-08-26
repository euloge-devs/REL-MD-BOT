const { Antimention, Antimention_warnings } = require("../../DataBase/antimention");

/**
 * Système Anti-Mention (empêche @everyone / mention de tout le groupe)
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @param {string} chatId - ID du groupe
 * @param {object} msg - Message complet reçu
 * @param {boolean} isGroup - Vrai si le message est dans un groupe
 * @param {boolean} isAdmin - Vrai si l’expéditeur est admin
 * @param {boolean} senderExists - True si l’expéditeur est valide
 * @param {string} sender - ID de l’expéditeur
 */
async function antimention(sock, chatId, msg, isGroup, isAdmin, senderExists, sender) {
  try {
    const groupMention = msg.message?.groupStatusMentionMessage;
    if (!groupMention) return;

    // Vérifie si l'antimention est activé pour ce groupe
    const config = await Antimention.findOne({ where: { id: chatId } });
    if (!isGroup || !config || config.mode !== "oui") return;
    if (isAdmin || !senderExists) return;

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
          text: `@${senderNumber}, la mention du groupe est interdite.`,
          mentions: [sender],
        });
        await sock.sendMessage(chatId, { delete: messageKey });
        break;

      case "kick": // Expulser
        await sock.sendMessage(chatId, {
          text: `@${senderNumber} a été retiré pour avoir mentionné tout le groupe.`,
          mentions: [sender],
        });
        await sock.sendMessage(chatId, { delete: messageKey });
        await sock.groupParticipantsUpdate(chatId, [sender], "remove");
        break;

      case "warn": // Avertissement (3 strikes → kick)
        let warning = await Antimention_warnings.findOne({
          where: { groupId: chatId, userId: sender },
        });

        if (!warning) {
          await Antimention_warnings.create({ groupId: chatId, userId: sender });
          await sock.sendMessage(chatId, {
            text: `@${senderNumber}, avertissement 1/3 pour mention abusive.`,
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
              text: `@${senderNumber}, avertissement ${warning.count}/3 pour mention abusive.`,
              mentions: [sender],
            });
          }
        }
        break;

      default:
        console.error("⚠️ Action inconnue :", config.type);
    }
  } catch (err) {
    console.error("❌ Erreur dans le système Antimention :", err);
  }
}

module.exports = antimention;
