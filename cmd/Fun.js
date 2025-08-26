const { relcmd } = require('../lib/relcmd');
const fancy = require('../lib/style');
const config = require('../config');
const fs = require('fs');
const axios = require('axios');
const { levels } = require('../lib/levels');
const { Ranks } = require('../lib/ranks');

// Commande pour renverser le texte
relcmd({
    nom_cmd: 'rev',
    classe: 'Fun',
    desc: 'Renverse le texte fourni'
}, async (message, client, { arg, ms }) => {
    if (!arg) return client.sendMessage(message, { text: 'Veuillez fournir un texte.' }, { quoted: ms });
    const reversed = arg.split('').reverse().join('');
    await client.sendMessage(message, { text: reversed }, { quoted: ms });
});

// Commande fancy
relcmd({
    nom_cmd: 'fancy',
    classe: 'Fun',
    react: '✍️',
    desc: 'Stylise le texte de manière fancy'
}, async (message, client, { arg, repondre }) => {
    const index = parseInt(arg[0], 10);
    const text = arg.slice(1).join(' ');

    if (isNaN(index) || !text) {
        return repondre(`Exemple : ${config.prefix}fancy 1 OVL-MD-V2`);
    }

    try {
        const style = fancy[index - 1];
        if (style) {
            await repondre(fancy.apply(style, text));
        } else {
            await repondre(`Style inexistant : ${index}`);
        }
    } catch (err) {
        console.error('Erreur fancy :', err);
        await repondre('Une erreur est survenue.');
    }
});

// Commande pour blague
relcmd({
    nom_cmd: 'blague',
    classe: 'Fun',
    react: '😂',
    desc: 'Récupère une blague aléatoire'
}, async (message, client, { ms }) => {
    try {
        const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any');
        if (data.type === 'single') {
            await client.sendMessage(message, { text: data.joke }, { quoted: ms });
        } else if (data.type === 'twopart') {
            await client.sendMessage(message, { text: `${data.setup}\n\nRéponse: ${data.delivery}` }, { quoted: ms });
        }
    } catch (err) {
        await client.sendMessage(message, { text: 'Désolé, je n\'ai pas trouvé de blague.' }, { quoted: ms });
    }
});

// Commande citation
relcmd({
    nom_cmd: 'citation',
    classe: 'Fun',
    react: '💬',
    desc: 'Citation du jour'
}, async (message, client) => {
    try {
        const { data } = await axios.get('https://api.citation.com/today');
        if (data.success) {
            const citation = `Citation du jour :\n"${data.citation.text}"\n- ${data.citation.auteur}`;
            await client.sendMessage(message, { text: citation });
        } else {
            await client.sendMessage(message, { text: 'Aucune citation trouvée.' });
        }
    } catch (err) {
        await client.sendMessage(message, { text: 'Erreur lors de la récupération de la citation.' });
    }
});

// Commande ship
relcmd({
    nom_cmd: 'ship',
    classe: 'Fun',
    desc: 'Calcul compatibilité entre deux personnes',
    alias: ['love']
}, async (message, client, { auteur_Msg_Repondu, auteur_Message, arg, ms, getJid }) => {
    const user1 = auteur_Msg_Repondu || arg[0];
    const user2 = auteur_Message;
    
    if (!user1) return client.sendMessage(message, { text: 'Mentionne une personne' }, { quoted: ms });

    const compat = Math.floor(Math.random() * 101);
    let texteCompat;
    if (compat <= 30) texteCompat = '💔 Pas vraiment compatibles... 😢';
    else if (compat <= 70) texteCompat = '❤️ Moyen compatible 😐';
    else texteCompat = '💖 Très compatibles 😍';

    await client.sendMessage(message, {
        text: `💘 Ship\n\n@${user1} + @${user2} = ${texteCompat}\n💖 Compatibilité: *${compat}%*`,
        mentions: [user1, user2]
    }, { quoted: ms });
});
