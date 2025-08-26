// Importations nécessaires
const { relcmd, cmd } = require('./relcmd'); // Chemin à adapter
const config = require('./config');
const { translate } = require('@vitalets/google-translate-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { TempMail } = require('tempmail'); // Exemple
const JavaScriptObfuscator = require('javascript-obfuscator');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');
const os = require('os');

// Fonction pour styliser du texte avec des caractères spéciaux
function stylize(text) {
    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const fancy = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
    
    return text.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? fancy[index] : char;
    }).join('');
}

// Commande principale
ovlcmd({
    nom_cmd: "theme",
    classe: "utilitaire",
    react: "🌟",
    desc: "Modifier le thème de votre bot"
}, async (message, args, client) => {
    try {
        // Lecture du fichier de thèmes
        const filePath = './themes.json';
        const data = fs.readFileSync(filePath, 'utf8');
        const themes = JSON.parse(data);

        let themeSelected;

        if (config.THEME.startsWith('http://') || config.THEME.startsWith('https://')) {
            themeSelected = config.THEME;
        } else {
            const themeObj = themes.find(t => t.id === config.THEME);
            if (!themeObj) throw new Error("Thème introuvable");
            themeSelected = themeObj.theme[Math.floor(Math.random() * themeObj.theme.length)];
        }

        // Ici, tu peux ajouter le code pour appliquer le thème
        message.reply(`Le thème sélectionné est : ${themeSelected}`);
        
    } catch (err) {
        console.error(err);
        message.reply("Une erreur est survenue lors du chargement du thème.");
    }
});
