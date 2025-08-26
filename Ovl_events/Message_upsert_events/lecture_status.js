const { WA_CONF } = require("../../DataBase/wa_conf");

/**
 * Marque comme lu un status WhatsApp si l'option est activée en base.
 * 
 * @param {object} sock - L'instance du bot WhatsApp (Baileys).
 * @param {object} msg - Le message reçu.
 * @param {string} from - L'identifiant de l'expéditeur.
 */
async function lecture_status(sock, msg, from) {
  try {
    // Récupération de la configuration
    const config = await WA_CONF.findOne({ where: { id: "1" } });

    if (!config) return;

    // Vérifie que c'est un statut et que la lecture est activée
    if (from === "status@broadcast" && config.lecture_status === "oui") {
      await sock.readMessages([msg.key]);
    }
  } catch (error) {
    console.error("Erreur dans lecture_status:", error);
  }
}

module.exports = lecture_status;
