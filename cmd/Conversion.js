const { ovlcmd } = require('../lib/ovlcmd');
const fs = require('fs');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { execSync, exec } = require('child_process');
const path = require('path');
const config = require('../config');
const gTTS = require('gtts.js');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { Ranks } = require('../DataBase/rank');
const os = require('os');

/**
 * Upload a file to Catbox
 * @param {string} filePath 
 * @returns {Promise<string>} URL du fichier
 */
async function uploadToCatbox(filePath) {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.readFileSync(filePath));

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        return response.data;
    } catch (err) {
        console.error("Erreur Catbox :", err);
        throw new Error("Erreur lors de la création du lien Catbox.");
    }
}

/**
 * Génère un identifiant aléatoire
 * @param {string} suffix 
 * @returns {string}
 */
const alea = (suffix = '') => '' + Math.floor(Math.random() * 10000) + suffix;

/**
 * Vérifie si le fichier est supporté
 * @param {string} filename 
 * @returns {boolean}
 */
const isSupportedFile = (filename) => {
    const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webp'];
    return supportedExtensions.some(ext => filename.endsWith(ext));
};

/**
 * Commande pour uploader un fichier sur Catbox
 */
ovlcmd({
    nom_cmd: 'upload',
    classe: 'Utilitaire',
    react: '📤',
    desc: 'Upload un fichier vers Catbox'
}, async (chatId, bot, { msg_Repondu, ms }) => {
    if (!msg_Repondu) return bot.sendMessage(chatId, { text: 'Veuillez répondre à un message.' }, { quoted: ms });

    const media = msg_Repondu.imageMessage || msg_Repondu.videoMessage || msg_Repondu.documentMessage || msg_Repondu.audioMessage;
    if (!media) return bot.sendMessage(chatId, { text: 'Aucun fichier trouvé à uploader.' }, { quoted: ms });

    try {
        const filePath = await bot.dl_save_media_ms(media);
        const url = await uploadToCatbox(filePath);
        await bot.sendMessage(chatId, { text: url }, { quoted: ms });
    } catch (err) {
        console.error("Erreur upload:", err);
        await bot.sendMessage(chatId, { text: "Erreur lors de la création du lien Catbox." }, { quoted: ms });
    }
});

/**
 * Commande pour créer un sticker
 */
ovlcmd({
    nom_cmd: 'sticker',
    classe: 'Sticker',
    react: '✍️',
    desc: 'Crée un sticker à partir d\'une image, vidéo ou GIF',
    alias: ['s', 'stk']
}, async (chatId, bot, { msg_Repondu, arg, ms }) => {
    if (!msg_Repondu) return bot.sendMessage(chatId, { text: 'Répondez à une image ou vidéo.' }, { quoted: ms });

    try {
        const media = msg_Repondu.imageMessage || msg_Repondu.videoMessage;
        if (!media) throw new Error('Aucun média trouvé.');

        const filePath = await bot.dl_save_media_ms(media);
        const data = fs.readFileSync(filePath);

        const sticker = new Sticker(data, {
            pack: config.STICKER_PACK_NAME,
            author: config.STICKER_AUTHOR_NAME,
            type: StickerTypes.FULL,
            quality: msg_Repondu.imageMessage ? 100 : 40
        });

        const outputFile = alea('.webp');
        await sticker.toFile(outputFile);

        await bot.sendMessage(chatId, { sticker: fs.readFileSync(outputFile) }, { quoted: ms });
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputFile);
    } catch (err) {
        console.error("Erreur sticker:", err);
        await bot.sendMessage(chatId, { text: 'Erreur lors de la création du sticker: ' + err.message }, { quoted: ms });
    }
});

/**
 * Commande pour convertir un sticker en image
 */
ovlcmd({
    nom_cmd: 'toimage',
    classe: 'Conversion',
    react: '✍️',
    desc: 'Convertit un sticker en image',
    alias: ['img']
}, async (chatId, bot, { msg_Repondu, ms }) => {
    if (!msg_Repondu || !msg_Repondu.stickerMessage) return bot.sendMessage(chatId, { text: 'Répondez à un sticker.' }, { quoted: ms });

    try {
        const stickerData = await bot.dl_save_media_ms(msg_Repondu.stickerMessage);
        const outputFile = path.join(os.tmpdir(), Date.now() + '.png');

        await sharp(stickerData).toFile(outputFile);
        await bot.sendMessage(chatId, { image: fs.readFileSync(outputFile) }, { quoted: ms });
        fs.unlinkSync(outputFile);
    } catch (err) {
        console.error("Erreur conversion sticker:", err);
        await bot.sendMessage(chatId, { text: 'Erreur lors de la conversion du sticker en image: ' + err.message }, { quoted: ms });
    }
});
