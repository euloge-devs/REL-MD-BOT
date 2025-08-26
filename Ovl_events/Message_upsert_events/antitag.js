const { Antitag, Antitag_warnings } = require("../../DataBase/antitag");

/**
 * Système Anti-Tag (bloque les messages qui mentionnent trop de personnes)
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @param {object} msg - Message complet reçu
 * @param {string} chatId - ID du groupe
 * @param {string} messageType - Type de message (conversation, extendedTextMessage, etc.)
 * @param {boolean} isGroup - Vrai si c’est un groupe
 * @param {boolean} senderExists - True si l’expéditeur est valide
 * @param {boolean} isAdmin - Vrai si l’expéditeur est admin
 * @param {string} sender - ID de l’expéditeur
 */
async function antitag(sock, msg, chatId, messageType, isGroup, senderExists, isAdmin, sender) {
  try {
    // Vérifie si plus de 30 personnes sont mentionnées
    const mentioned = msg.message?.[messageType]?.contextInfo?.mentionedJid || [];
    if (mentioned.length <= 30) return;

    // Vérifie la config Antitag
    const config = await Antitag.findOne({ where: { id: chatId } });
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
      case "supp": // Suppression simple
        await sock.sendMessage(chatId, {
          text: `@${senderNumber}, l'envoi de tags multiples est interdit dans ce groupe.`,
          mentions: [sender],
        }, { quoted: msg });
        await sock.sendMessage(chatId, { delete: messageKey });
        break;

      case "kick": // Expulsion directe
        await sock.sendMessage(chatId, {
          text: `@${senderNumber} a été retiré du groupe pour avoir mentionné plus de 30 membres.`,
          mentions: [sender],
        });
        await sock.sendMessage(chatId, { delete: messageKey });
        await sock.groupParticipantsUpdate(chatId, [sender], "remove");
        break;

      case "warn": // Avertissement progressif
        let warning = await Antitag_warnings.findOne({
          where: { groupId: chatId, userId: sender },
        });

        if (!warning) {
          await Antitag_warnings.create({ groupId: chatId, userId: sender });
          await sock.sendMessage(chatId, {
            text: `@${senderNumber}, avertissement 1/3 pour avoir mentionné plus de 30 membres.`,
            mentions: [sender],
          });
          await sock.sendMessage(chatId, { delete: messageKey });
        } else {
          warning.count += 1;
          await warning.save();

          if (warning.count >= 3) {
            await sock.sendMessage(chatId, {
              text: `@${senderNumber} a été retiré du groupe après 3 avertissements.`,
              mentions: [sender],
            });
            await sock.sendMessage(chatId, { delete: messageKey });
            await sock.groupParticipantsUpdate(chatId, [sender], "remove");
            await warning.destroy();
          } else {
            await sock.sendMessage(chatId, {
              text: `@${senderNumber}, avertissement ${warning.count}/3 pour avoir mentionné plus de 30 membres.`,
              mentions: [sender],
            });
            await sock.sendMessage(chatId, { delete: messageKey });
          }
        }
        break;

      default:
        console.error("⚠️ Action inconnue :", config.type);
    }
  } catch (err) {
    console.error("❌ Erreur dans le système Antitag :", err);
  }
}

module.exports = antitag;
