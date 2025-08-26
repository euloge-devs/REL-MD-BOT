const { relcmd } = require("../lib/relcmd"); // ou renommer le fichier si nécessaire
const { WA_CONF } = require("../DataBase/wa_conf");
const config = require('../set');

// -------------------------
// Commande : save
// Télécharge un statut WhatsApp
// -------------------------
relcmd({
  nom_cmd: "save",
  classe: "Status",
  react: "💾",
  desc: "Télécharge un statut WhatsApp"
}, async (sender, client, ctx) => {
  const { ms, msg_Repondu, repondre } = ctx;
  try {
    let mediaUrl;
    const options = { quoted: ms };

    if (!msg_Repondu) return repondre("❌ Réponds à un statut à sauvegarder.");

    if (msg_Repondu.extendedTextMessage) {
      await client.sendMessage(client.user.id, { text: msg_Repondu.extendedTextMessage.text }, options);
    } else if (msg_Repondu.imageMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.imageMessage);
      await client.sendMessage(client.user.id, { image: { url: mediaUrl }, caption: msg_Repondu.imageMessage.caption || '' }, options);
    } else if (msg_Repondu.videoMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.videoMessage);
      await client.sendMessage(client.user.id, { video: { url: mediaUrl }, caption: msg_Repondu.videoMessage.caption || '' }, options);
    } else if (msg_Repondu.audioMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.audioMessage);
      await client.sendMessage(client.user.id, { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ptt: false }, options);
    } else {
      return repondre("Ce type de statut n'est pas pris en charge.");
    }

  } catch (err) {
    console.error("Erreur lors du téléchargement du statut :", err.message || err);
  }
});

// -------------------------
// Commande : sendme
// Renvoie un statut mentionné par l'utilisateur
// -------------------------
relcmd({
  nom_cmd: "sendme",
  classe: "Status",
  react: "📤",
  desc: "Renvoie un statut mentionné par l'utilisateur"
}, async (sender, client, ctx) => {
  const { ms, msg_Repondu, repondre } = ctx;
  try {
    let mediaUrl;
    const options = { quoted: ms };

    if (!msg_Repondu) return repondre("❌ Réponds à un statut pour l'envoyer ici.");

    if (msg_Repondu.extendedTextMessage) {
      await client.sendMessage(sender, { text: msg_Repondu.extendedTextMessage.text }, options);
    } else if (msg_Repondu.imageMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.imageMessage);
      await client.sendMessage(sender, { image: { url: mediaUrl }, caption: msg_Repondu.imageMessage.caption || '' }, options);
    } else if (msg_Repondu.videoMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.videoMessage);
      await client.sendMessage(sender, { video: { url: mediaUrl }, caption: msg_Repondu.videoMessage.caption || '' }, options);
    } else if (msg_Repondu.audioMessage) {
      mediaUrl = await client.dl_save_media_ms(msg_Repondu.audioMessage);
      await client.sendMessage(sender, { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ptt: false }, options);
    } else {
      return repondre("❌ Ce type de statut n'est pas pris en charge.");
    }

  } catch (err) {
    console.error("Erreur lors du renvoi du statut :", err.message || err);
    return repondre("❌ Une erreur est survenue pendant le traitement.");
  }
});

// -------------------------
// Commande : lecture_status
// Active ou désactive la lecture auto des statuts
// -------------------------
relcmd({
  nom_cmd: "lecture_status",
  classe: "Status",
  react: "📖",
  desc: "Active ou désactive la lecture auto des statuts"
}, async (sender, client, ctx) => {
  const { arg, repondre, prenium_id } = ctx;

  if (!prenium_id) return repondre("Seuls les utilisateurs premium peuvent utiliser cette commande");

  try {
    const mode = arg[0]?.toLowerCase();
    const [conf] = await WA_CONF.findOrCreate({
      where: { id: '1' },
      defaults: { id: '1', lecture_status: "non" }
    });

    if (mode === "off") {
      conf.lecture_status = "non";
      await conf.save();
      return repondre("La lecture du statut est maintenant désactivée.");
    }

    if (mode === "on") {
      conf.lecture_status = "oui";
      await conf.save();
      return repondre("La lecture du statut est maintenant activée.");
    }

    return repondre("Utilisation :\nlecture_status on: Activer la lecture du statut\nlecture_status off: Désactiver la lecture du statut");

  } catch (err) {
    console.error("Erreur lecture_status :", err);
    return repondre("Une erreur s'est produite lors de l'exécution de la commande.");
  }
});

// -------------------------
// Commande : dl_status
// Active ou désactive le téléchargement auto des statuts
// -------------------------
relcmd({
  nom_cmd: "dl_status",
  classe: "Status",
  react: "📥",
  desc: "Active ou désactive le téléchargement auto des statuts"
}, async (sender, client, ctx) => {
  const { arg, repondre, prenium_id } = ctx;

  if (!prenium_id) return repondre("Seuls les utilisateurs premium peuvent utiliser cette commande");

  try {
    const mode = arg[0]?.toLowerCase();
    const [conf] = await WA_CONF.findOrCreate({
      where: { id: '1' },
      defaults: { id: '1', dl_status: "non" }
    });

    if (mode === "off") {
      conf.dl_status = "non";
      await conf.save();
      return repondre("Le téléchargement du statut est maintenant désactivé.");
    }

    if (mode === "on") {
      conf.dl_status = "oui";
      await conf.save();
      return repondre("Le téléchargement du statut est maintenant activé.");
    }

    return repondre("Utilisation :\ndl_status on: Activer le téléchargement du statut\ndl_status off: Désactiver le téléchargement du statut");

  } catch (err) {
    console.error("Erreur dl_status :", err);
    return repondre("Une erreur s'est produite lors de l'exécution de la commande.");
  }
});

// -------------------------
// Commande : likestatus
// Active ou désactive les likes automatiques sur les statuts
// -------------------------
relcmd({
  nom_cmd: "likestatus",
  classe: "Status",
  react: "👍",
  desc: "Active ou désactive les likes automatiques sur les statuts"
}, async (sender, client, ctx) => {
  const { arg, repondre, prenium_id } = ctx;

  if (!prenium_id) return repondre("❌ Seuls les utilisateurs premium peuvent utiliser cette commande.");

  try {
    const mode = arg[0]?.toLowerCase();
    const [conf] = await WA_CONF.findOrCreate({
      where: { id: '1' },
      defaults: { id: '1', like_status: "non" }
    });

    if (!mode || mode === "") {
      return repondre(
        `🔧 Paramètres des Likes Auto sur Statuts :\n\n` +
        `• ${config.PREFIXE}likestatus <emoji> : Active avec <emoji>\n` +
        `• ${config.PREFIXE}likestatus off : Désactive les likes automatiques\n\n` +
        `📌 Exemple : ${config.PREFIXE}likestatus 🤣\n` +
        `📊 Statut actuel : ${conf.like_status === "non" ? "Désactivé" : "Activé (" + conf.like_status + ")"}`) 
    }

    if (mode === "off") {
      conf.like_status = "non";
      await conf.save();
      return repondre("👍 Les likes automatiques ont été désactivés.");
    }

    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
    if (!emojiRegex.test(mode)) {
      return repondre("❌ Emoji invalide. Utilisation : " + config.PREFIXE + "likestatus <emoji>");
    }

    conf.like_status = mode;
    await conf.save();
    return repondre(`✅ Les likes automatiques sont maintenant activés avec l'emoji ${mode}`);

  } catch (err) {
    console.error("Erreur likestatus :", err);
    return repondre("❌ Une erreur s'est produite lors de la configuration.");
  }
});
