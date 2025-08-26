const { Antibot, AntibotWarnings } = require("../../DataBase/antibot");

/**
 * Système Anti-Bot
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @param {string} groupId - ID du groupe
 * @param {object} msg - Message reçu
 * @param {boolean} isGroup - True si le message vient d’un groupe
 * @param {boolean} isAdmin - True si l’auteur est admin
 * @param {boolean} isBot - True si l’auteur est le bot
 * @param {string} sender - ID de l’auteur (ex: "123456@s.whatsapp.net")
 */
async function antibot(sock, groupId, msg, isGroup, isAdmin, isBot, sender) {
  try {
    // Détection d’un bot via l’ID du message
    const isBotMessage =
      (msg.key?.id?.startsWith("BAES") && msg.key?.id?.length === 16) ||
      (msg.key?.id?.startsWith("BAE5") && msg.key?.id?.length === 16) ||
      (msg.key?.id?.startsWith("3EB0") && msg.key?.id?.length >= 12);

    if (!isBotMessage) return;

    // Vérifie si l’Anti-Bot est activé dans ce groupe
    const antibotConfig = await Antibot.findOne({ where: { id: groupId } });
    if (!isGroup || !antibotConfig || antibotConfig.mode !== "oui") return;

    // Ignore si l’auteur est admin ou le bot lui-même
    if (isAdmin || !isBot) return;

    const fakeMessage = {
      remoteJid: groupId,
      fromMe: false,
      id: msg.key.id,
      participant: sender,
    };

    switch (antibotConfig.type) {
      case "supp": {
        // Suppression simple du message
        await sock.sendMessage(groupId, {
          text: `@${sender.split("@")[0]}, les bots ne sont pas autorisés ici.`,
          mentions: [sender],
        });
        await sock.sendMessage(groupId, { delete: fakeMessage });
        break;
      }

      case "kick": {
        // Kick + suppression
        await sock.sendMessage(groupId, {
          text: `@${sender.split("@")[0]} a été retiré pour avoir utilisé un bot.`,
          mentions: [sender],
        });
        await sock.sendMessage(groupId, { delete: fakeMessage });
        await sock.groupParticipantsUpdate(groupId, [sender], "remove");
        break;
      }

      case "warn": {
        // Système d’avertissements
        let warning = await AntibotWarnings.findOne({
          where: { groupId, userId: sender },
        });

        if (!warning) {
          // Premier avertissement
          await AntibotWarnings.create({ groupId, userId: sender, count: 1 });
          await sock.sendMessage(groupId, {
            text: `@${sender.split("@")[0]}, avertissement 1/3 pour utilisation de bot.`,
            mentions: [sender],
          });
        } else {
          // Incrémentation des avertissements
          warning.count += 1;
          await warning.save();

          if (warning.count >= 3) {
            // Exclusion après 3 avertissements
            await sock.sendMessage(groupId, {
              text: `@${sender.split("@")[0]} a été retiré après 3 avertissements.`,
              mentions: [sender],
            });
            await sock.sendMessage(groupId, { delete: fakeMessage });
            await sock.groupParticipantsUpdate(groupId, [sender], "remove");
            await warning.destroy();
          } else {
            await sock.sendMessage(groupId, {
              text: `@${sender.split("@")[0]}, avertissement ${warning.count}/3 pour utilisation de bot.`,
              mentions: [sender],
            });
          }
        }
        break;
      }

      default:
        console.error("⚠️ Type d’action AntiBot inconnu :", antibotConfig.type);
    }
  } catch (err) {
    console.error("❌ Erreur dans le système Anti-Bot :", err);
  }
}

module.exports = antibot;
