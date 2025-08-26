const { getMention } = require("../../DataBase/mention");

/**
 * Gère l’anti-mention : si quelqu’un mentionne un utilisateur protégé,
 * une réponse peut être envoyée (texte, audio, image ou vidéo).
 *
 * @param {object} client - Instance du client WhatsApp (baileys)
 * @param {string} chatId - Identifiant du chat (ex: "22948778028s.whatsapp.net")
 * @param {object} message - Message reçu
 * @param {string} messageType - Type du message (ex: "conversation", "extendedTextMessage")
 * @param {boolean} isActive - Si le système d’anti-mention est activé
 * @param {string} protectedId - L’ID protégé (celui qu’on ne doit pas mentionner)
 * @param {function} reply - Fonction pour répondre par du texte
 */
async function mention(client, chatId, message, messageType, isActive, protectedId, reply) {
  try {
    // Récupère les JID mentionnés dans le message
    const mentionedJids = message.message?.[messageType]?.contextInfo?.mentionedJid;

    if (mentionedJids && mentionedJids.includes(protectedId)) {
      if (isActive) {
        const conf = await getMention();

        if (conf && conf.mode === "oui") {
          const { url, text } = conf;

          // Si aucune URL définie → envoyer texte
          if (!url || url === "" || url === "url") {
            if (text && text !== "text") {
              reply(text);
            } else {
              reply("Mention activée mais aucun contenu défini.");
            }
            return;
          }

          const lowerUrl = url.toLowerCase();

          const isAudio =
            lowerUrl.endsWith(".opus") ||
            lowerUrl.endsWith(".ogg") ||
            lowerUrl.endsWith(".mp3") ||
            lowerUrl.endsWith(".m4a") ||
            lowerUrl.endsWith(".aac") ||
            lowerUrl.endsWith(".wav");

          const isImage =
            lowerUrl.endsWith(".jpg") ||
            lowerUrl.endsWith(".jpeg") ||
            lowerUrl.endsWith(".png");

          const isVideo = lowerUrl.endsWith(".mp4");

          if (isAudio) {
            await client.sendMessage(
              chatId,
              {
                audio: { url },
                mimetype: "audio/mp4",
                ptt: true,
              },
              { quoted: message }
            );
          } else if (isImage) {
            await client.sendMessage(
              chatId,
              {
                image: { url },
                caption: text && text !== "text" ? text : undefined,
              },
              { quoted: message }
            );
          } else if (isVideo) {
            await client.sendMessage(
              chatId,
              {
                video: { url },
                caption: text && text !== "text" ? text : undefined,
              },
              { quoted: message }
            );
          } else {
            reply("Le type de média est inconnu ou non pris en charge.");
          }
        }
      }
    }
  } catch (err) {
    console.error("Erreur dans mention:", err);
    if (reply) {
      reply("Impossible d'exécuter la commande d'anti-mention.");
    }
  }
}

module.exports = mention;
