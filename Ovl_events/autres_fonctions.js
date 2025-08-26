const fs = require('fs');
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { getJid } = require("./Message_upsert_events");

/**
 * Télécharge et enregistre un média provenant d'un message WhatsApp.
 * @param {object} client - Instance Baileys
 * @param {object} message - Message contenant le média
 * @param {string} filename - Nom de fichier de sortie (sans extension si addExtension = true)
 * @param {boolean} addExtension - Ajouter automatiquement l'extension au fichier
 * @param {string} folder - Dossier de destination
 * @returns {Promise<string>} - Chemin absolu du fichier enregistré
 */
async function dl_save_media_ms(client, message, filename = '', addExtension = true, folder = './downloads') {
  try {
    const msgContent = message.msg || message;
    const mimeType = msgContent.mimetype || '';
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mimeType.split('/')[0];

    if (!mimeType) {
      throw new Error("Type MIME non spécifié ou non pris en charge.");
    }

    // Téléchargement du flux binaire
    const stream = await downloadContentFromMessage(msgContent, messageType);
    const bufferArray = [];
    for await (const chunk of stream) {
      bufferArray.push(chunk);
    }
    const buffer = Buffer.concat(bufferArray);

    // Détection du type de fichier
    const fileType = await FileType.fromBuffer(buffer);
    if (!fileType) {
      throw new Error("Type de fichier non reconnu.");
    }

    // Création du dossier cible si nécessaire
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const finalName = addExtension ? `${filename}.${fileType.ext}` : filename;
    const filePath = path.resolve(folder, finalName);

    await fs.promises.writeFile(filePath, buffer);
    return filePath;

  } catch (err) {
    console.error("❌ Erreur lors du téléchargement et de la sauvegarde du fichier:", err);
    throw err;
  }
}

/**
 * Attend et récupère un prochain message selon des critères.
 * @param {object} options
 * @param {object} options.ovl - Instance Baileys
 * @param {string} [options.auteur] - Auteur attendu
 * @param {string} [options.ms_org] - Groupe ou JID attendu
 * @param {number} [options.temps=30000] - Timeout en ms
 * @returns {Promise<object>} - Message reçu
 */
async function recup_msg({ rel, auteur, ms_org, temps = 30000 } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (auteur !== undefined && typeof auteur !== 'string') {
        return reject(new Error("L'auteur doit être une chaîne si défini."));
      }
      if (ms_org !== undefined && typeof ms_org !== 'string') {
        return reject(new Error("Le ms_org doit être une chaîne si défini."));
      }
      if (typeof temps !== 'number') {
        return reject(new Error("Le temps doit être un nombre."));
      }

      // Si on doit vérifier l'auteur dans un groupe
      const expectedJid = auteur && ms_org ? await getJid(auteur, ms_org, rel) : auteur;

      let timeoutId;

      const handler = async ({ type, messages }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          const remoteJid = msg.key.remoteJid;
          const senderJid = msg.key.fromMe
            ? rel.user.id
            : msg.key.participant
              ? await getJid(msg.key.participant, remoteJid, rel)
              : remoteJid;

          let match = false;

          if (expectedJid && ms_org) {
            match = (senderJid === expectedJid && remoteJid === ms_org);
          } else if (expectedJid && !ms_org) {
            match = (senderJid === expectedJid);
          } else if (!expectedJid && ms_org) {
            match = (remoteJid === ms_org);
          } else {
            match = true;
          }

          if (match) {
            rel.ev.off("messages.upsert", handler);
            if (timeoutId) clearTimeout(timeoutId);
            return resolve(msg);
          }
        }
      };

      rel.ev.on("messages.upsert", handler);

      // Timeout si aucun message reçu
      if (temps > 0) {
        timeoutId = setTimeout(() => {
          rel.ev.off("messages.upsert", handler);
          reject(new Error("Timeout"));
        }, temps);
      }

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  dl_save_media_ms,
  recup_msg
};
