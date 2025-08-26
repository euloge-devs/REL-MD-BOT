const { WA_CONF } = require("../../DataBase/wa_conf");

/**
 * Télécharge et sauvegarde un status (texte, image ou vidéo) 
 * si l'option dl_status est activée.
 */
async function dl_status(sock, from, msg) {
  const config = await WA_CONF.findOne({ where: { id: "1" } });

  if (!config) return;

  // Vérifie que c'est bien un status et que le téléchargement est activé
  if (from === "status@broadcast" && config.dl_status === "oui") {
    try {
      // Texte
      if (msg.message.extendedTextMessage) {
        await sock.sendMessage(
          sock.user.id,
          { text: msg.message.extendedTextMessage.text },
          { quoted: msg }
        );
      }

      // Image
      else if (msg.message.imageMessage) {
        const mediaPath = await sock.dl_save_media_ms(msg.message.imageMessage);
        await sock.sendMessage(
          sock.user.id,
          {
            image: { url: mediaPath },
            caption: msg.message.imageMessage.caption,
          },
          { quoted: msg }
        );
      }

      // Vidéo
      else if (msg.message.videoMessage) {
        const mediaPath = await sock.dl_save_media_ms(msg.message.videoMessage);
        await sock.sendMessage(
          sock.user.id,
          {
            video: { url: mediaPath },
            caption: msg.message.videoMessage.caption,
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error("Erreur lors du traitement du message status:", err);
    }
  }
}

module.exports = dl_status;
