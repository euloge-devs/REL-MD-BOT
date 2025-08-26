const { GroupSettings, Events2 } = require('../DataBase/events');
const { jidDecode } = require("@whiskeysockets/baileys");
const { getJid } = require("./Message_upsert_events");

// Normalise un JID WhatsApp
const parseID = jid => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decoded = jidDecode(jid) || {};
    return decoded.user && decoded.server
      ? `${decoded.user}@${decoded.server}`
      : jid;
  }
  return jid;
};

// Envoie message de bienvenue ou au revoir
async function envoyerWelcomeGoodbye(groupId, userId, type, eventSettings, client) {
  const metadata = await client.groupMetadata(groupId);
  const groupName = metadata.subject || "Groupe";
  const memberCount = metadata.participants.length;
  const mentionUser = '@' + userId.split('@')[0];

  const messages = {
    welcome: eventSettings.welcome_msg || `🎉Bienvenue @user\n👥Groupe: #groupe\n🔆Membres: #membre\n📃Description: ${metadata.desc || "Aucune description"} #pp`,
    goodbye: eventSettings.goodbye_msg || `👋Au revoir @user #pp`
  };

  let messageText = messages[type];

  // Remplacement des placeholders
  messageText = messageText
    .replace(/@user/gi, mentionUser)
    .replace(/#groupe/gi, groupName)
    .replace(/#membre/gi, memberCount)
    .replace(/#desc/gi, metadata.desc || '');

  const includeProfilePic = messageText.includes("#pp");
  let mediaUrl = null;
  let mediaType = null;

  // Gestion des médias (photo profil ou url spécifique)
  if (includeProfilePic) {
    try {
      mediaUrl = await client.profilePictureUrl(userId, 'image');
    } catch {
      mediaUrl = "https://files.catbox.moe/ts7y8c.png";
    }
    mediaType = "image";
    messageText = messageText.replace(/#pp/gi, '');
  }

  if (mediaUrl && mediaType) {
    await client.sendMessage(groupId, {
      [mediaType]: { url: mediaUrl },
      caption: messageText.trim(),
      mentions: [userId]
    });
  } else {
    await client.sendMessage(groupId, {
      text: messageText.trim(),
      mentions: [userId]
    });
  }
}

// Gestion des mises à jour des participants
async function group_participants_update(update, client) {
  try {
    const groupId = update.id;
    const metadata = await client.groupMetadata(groupId);
    const groupSettings = await GroupSettings.findOne({ where: { id: groupId } });
    const eventSettings = await Events2.findOne({ where: { id: groupId } });

    if (!groupSettings) return;

    const { welcome, goodbye, antipromote, antidemote } = groupSettings;
    const promoteAlert = eventSettings?.promoteAlert || 'non';
    const demoteAlert = eventSettings?.demoteAlert || 'non';

    for (const participant of update.participants) {
      const author = update.author ? '@' + update.author.split('@')[0] : "quelqu’un";
      const mentionParticipant = '@' + participant.split('@')[0];
      const mentions = [participant, update.author];

      // Ajouter un membre → bienvenue
      if (update.action === 'add' && welcome === "oui" && eventSettings) {
        await envoyerWelcomeGoodbye(groupId, participant, "welcome", eventSettings, client);
      }

      // Retirer un membre → au revoir
      if (update.action === 'remove' && goodbye === "oui" && eventSettings) {
        await envoyerWelcomeGoodbye(groupId, participant, "goodbye", eventSettings, client);
      }

      // Promotion / Démotion
      if (update.action === 'promote' || update.action === 'demote') {
        const authorJid = await getJid(update.author, groupId, client);

        const protectedUsers = [
          await getJid(metadata.owner, groupId, client),
          await getJid(parseID(client.user.id), groupId, client),
          await getJid(process.env.NUMERO_OWNER + '@s.whatsapp.net', groupId, client),
          await getJid("22948778028@s.whatsapp.net", groupId, client),
          await getJid("22952222341@s.whatsapp.net", groupId, client),
          await getJid(participant, groupId, client)
        ];

        const isProtected = protectedUsers.includes(authorJid);

        if (update.action === 'promote') {
          if (antipromote === "oui" && !isProtected) {
            await client.groupParticipantsUpdate(groupId, [participant], "demote");
            await client.sendMessage(groupId, {
              text: `🚫 *Promotion refusée !*\n${author} n’a pas le droit de promouvoir ${mentionParticipant}.`,
              mentions
            });
          } else if (promoteAlert === "oui") {
            let profilePic = "https://files.catbox.moe/ts7y8c.png";
            try { profilePic = await client.profilePictureUrl(participant, "image"); } catch {}
            await client.sendMessage(groupId, {
              image: { url: profilePic },
              caption: `🆙 ${mentionParticipant} a été promu par ${author}.`,
              mentions
            });
          }
        }

        if (update.action === 'demote') {
          if (antidemote === "oui" && !isProtected) {
            await client.groupParticipantsUpdate(groupId, [participant], "promote");
            await client.sendMessage(groupId, {
              text: `🚫 *Rétrogradation refusée !*\n${author} ne peut pas rétrograder ${mentionParticipant}.`,
              mentions
            });
          } else if (demoteAlert === "oui") {
            let profilePic = "https://wallpapercave.com/uwp/uwp4820694.jpeg";
            try { profilePic = await client.profilePictureUrl(participant, "image"); } catch {}
            await client.sendMessage(groupId, {
              image: { url: profilePic },
              caption: `⬇️ ${mentionParticipant} a été rétrogradé par ${author}.`,
              mentions
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Erreur group_participants_update :", err);
  }
}

module.exports = group_participants_update;
