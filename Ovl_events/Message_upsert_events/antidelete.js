const { WA_CONF } = require("../../DataBase/wa_conf");

/**
 * Système Anti-Delete
 * Permet de récupérer un message supprimé et le renvoyer au propriétaire du bot
 * 
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @param {object} msg - Message complet reçu
 * @param {string} deleter - ID de la personne qui a supprimé le message
 * @param {string} type - Type d’événement (ex: "protocolMessage")
 * @param {function} getMessage - Fonction permettant de retrouver un message par ID
 */
async function antidelete(sock, msg, deleter, type, getMessage) {
  // Récupération de la config
  const conf = await WA_CONF.findOne({ where: { id: "1" } });
  if (!conf) return;

  try {
    // On agit seulement si c’est un protocole de suppression et que le mode est activé
    if (
      type === "protocolMessage" &&
      ["pm", "gc", "status", "all", "pm/gc", "pm/status", "gc/status"].includes(conf.antidelete)
    ) {
      const protocolMsg = msg.message.protocolMessage;
      const deletedMsg = getMessage(protocolMsg.key.id);

      if (!deletedMsg) return;

      const chatId = deletedMsg.key.remoteJid;
      const isGroup = chatId?.endsWith("@g.us");
      const sender = isGroup
        ? deletedMsg.key.participant || deletedMsg.participant
        : chatId;

      // Heure de suppression formatée
      const deletionTime = new Date().toISOString().substr(11, 8);

      if (!deletedMsg.key.fromMe) {
        // Contexte (groupe ou privé)
        const context = isGroup
          ? `👥 Groupe : ${(await sock.groupMetadata(chatId)).subject}`
          : `📩 Chat : @${chatId.split("@")[0]}`;

        // Message d’alerte
        const infoMsg =
          `✨ REL-MD ANTI-DELETE MSG ✨\n` +
          `👤 Envoyé par : @${sender.split("@")[0]}\n` +
          `❌ Supprimé par : @${deleter.split("@")[0]}\n` +
          `⏰ Heure de suppression : ${deletionTime}\n` +
          `${context}`;

        // Vérifie si la config autorise ce cas
        const allowed =
          (conf.antidelete === "gc" && chatId.endsWith("@g.us")) ||
          (conf.antidelete === "pm" && chatId.endsWith("@s.whatsapp.net")) ||
          (conf.antidelete === "status" && chatId.endsWith("status@broadcast")) ||
          conf.antidelete === "all" ||
          (conf.antidelete === "pm/gc" &&
            (chatId.endsWith("@g.us") || chatId.endsWith("@s.whatsapp.net"))) ||
          (conf.antidelete === "pm/status" &&
            (chatId.endsWith("status@broadcast") || chatId.endsWith("@s.whatsapp.net"))) ||
          (conf.antidelete === "gc/status" &&
            (chatId.endsWith("@g.us") || chatId.endsWith("status@broadcast")));

        if (allowed) {
          // Envoie au propriétaire du bot
          await sock.sendMessage(
            sock.user.id,
            {
              text: infoMsg.trim(),
              mentions: [sender, deleter],
            },
            { quoted: deletedMsg }
          );

          // Renvoie le message supprimé en forward
          await sock.sendMessage(
            sock.user.id,
            { forward: deletedMsg },
            { quoted: deletedMsg }
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ Une erreur est survenue dans antidelete :", err);
  }
}

module.exports = antidelete;
