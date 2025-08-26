const { relcmd } = require('../lib/relcmd');
const textmaker = require('../lib/textmaker');

/**
 * Fonction pour ajouter une commande Textpro
 * @param {string} commandName - Nom de la commande
 * @param {string} url - URL du modèle Textpro
 * @param {number} type - Type de génération (1 ou 2)
 */
function addTextproCommand(commandName, url, type) {
    relcmd({
        nom_cmd: commandName,
        classe: 'textpro', // Classe fixe
        react: '✨',
        desc: 'Génère un logo via Textpro'
    }, async (message, client, options) => {
        const { arg, ms } = options;
        const text = arg.join(' ');

        if (!text) {
            return await client.sendMessage(message, { text: 'Veuillez fournir un texte !' }, { quoted: ms });
        }

        try {
            let imageResult;

            switch (type) {
                case 1:
                    if (text.includes(';')) {
                        return await client.sendMessage(message, { text: 'Le texte ne doit pas contenir de ";"' }, { quoted: ms });
                    }
                    imageResult = await textmaker(url, text);
                    break;

                case 2:
                    const parts = text.split(';');
                    if (parts.length < 2) {
                        return await client.sendMessage(message, { text: 'Vous devez fournir deux textes séparés par ";"' }, { quoted: ms });
                    }
                    imageResult = await textmaker(url, text);
                    break;

                default:
                    throw new Error('Type non supporté : ' + type);
            }

            await client.sendMessage(message, {
                image: { url: imageResult.url },
                caption: 'Voici votre logo !'
            }, { quoted: ms });

        } catch (err) {
            console.error('Erreur avec la commande ' + commandName + ':', err.message || err);
            await client.sendMessage(message, {
                text: 'Une erreur est survenue lors de la génération du logo : ' + (err.message || err)
            }, { quoted: ms });
        }
    });
}

// Liste des commandes Textpro avec leurs URL et types
addTextproCommand('neon', 'https://en.ephoto360.com/neon-text-effect.html', 1);
addTextproCommand('3d', 'https://en.ephoto360.com/3d-text-effect.html', 2);
addTextproCommand('graffiti', 'https://en.ephoto360.com/graffiti-text-effect.html', 1);
addTextproCommand('football', 'https://en.ephoto360.com/paul-scholes-shirt-foot-ball-335.html', 2);
addTextproCommand('paint', 'https://en.ephoto360.com/paint-splatter-text-effect-72.html', 1);
addTextproCommand('thor', 'https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html', 1);
addTextproCommand('eraser', 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html', 1);
addTextproCommand('captain_america', 'https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html', 2);
addTextproCommand('watercolor', 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html', 1);
addTextproCommand('neon3', 'https://en.ephoto360.com/latest-space-3d-text-effect-online-559.html', 1);
// etc. pour toutes les autres commandes
