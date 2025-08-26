const groupCache = new Map();

/**
 * Récupère le JID complet d'un utilisateur dans un groupe
 * @param {string} userId - Identifiant du membre (numéro ou JID partiel)
 * @param {string} groupId - ID du groupe
 * @param {object} sock - Instance WhatsApp (Baileys)
 * @returns {Promise<string|null>} JID complet ou null si non trouvé
 */
async function getJid(userId, groupId, sock) {
  try {
    if (!userId || typeof userId !== "string") {
      return null;
    }

    // Si c'est déjà un JID complet
    if (userId.endsWith("@s.whatsapp.net")) {
      return userId;
    }

    // Vérifie dans le cache
    if (groupCache.has(userId)) {
      return groupCache.get(userId);
    }

    // Récupère les infos du groupe
    const metadata = await sock.groupMetadata(groupId);
    if (!metadata || !Array.isArray(metadata.participants)) {
      return null;
    }

    // Cherche l'utilisateur dans la liste des participants
    const participant = metadata.participants.find(p => p.id === userId);
    if (!participant) {
      return null;
    }

    const jid = participant.id;
    groupCache.set(userId, jid);

    return jid;
  } catch (err) {
    console.error("❌ Erreur dans getJid:", err.message);
    return null;
  }
}

module.exports = getJid;
