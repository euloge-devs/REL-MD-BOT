const { WA_CONF } = require("../../DataBase/wa_conf");

/**
 * Met à jour la présence de l’utilisateur sur WhatsApp
 * en fonction de la configuration enregistrée dans WA_CONF.
 *
 * @param {object} client - Instance du client WhatsApp (baileys)
 * @param {string} jid - Identifiant du chat (ex: "22948778028@s.whatsapp.net")
 */
async function presence(client, jid) {
  const conf = await WA_CONF.findOne({ where: { id: "1" } });

  if (!conf) return;

  switch (conf.presence) {
    case "enligne":
      await client.sendPresenceUpdate("available", jid);
      break;

    case "ecrit":
      await client.sendPresenceUpdate("composing", jid);
      break;

    case "enregistre":
      await client.sendPresenceUpdate("recording", jid);
      break;

    default:
      // Si aucune correspondance, ne rien faire
      break;
  }
}

module.exports = presence;
