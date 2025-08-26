const { WA_CONF } = require("../../DataBase/wa_conf");

/**
 * Ajoute automatiquement une réaction ("like") aux statuts WhatsApp
 * si l’option est activée dans la configuration.
 *
 * @param {object} client - Instance du client WhatsApp (baileys)
 * @param {object} message - Message contenant le statut
 * @param {string} chatId - Identifiant du chat (ex: "status@broadcast")
 * @param {string} userId - ID de l’utilisateur qui a posté le statut
 */
async function like_status(client, message, chatId, userId) {
  try {
    const conf = await WA_CONF.findOne({ where: { id: "1" } });
    if (!conf) return;

    const reaction = conf.like_status;
    const shouldReact = reaction && reaction !== "non";

    if (chatId === "status@broadcast" && shouldReact) {
      await client.sendMessage(
        chatId,
        {
          react: {
            key: message.key,
            text: reaction,
          },
        },
        {
          statusJidList: [message.key.participant, userId],
          broadcast: true,
        }
      );
    }
  } catch (err) {
    console.error("Erreur dans like_status :", err);
  }
}

module.exports = like_status;
