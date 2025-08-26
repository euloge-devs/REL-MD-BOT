const { relcmd } = require('relcmd'); // changement ici
const { fbdl, ttdl, igdl, twitterdl, ytdl } = require('some-dl-lib');
const ytsr = require('ytsr');
const axios = require('axios');
const { search, download } = require('aptoide_scrapper_fixed');
const fs = require('fs');
const path = require('path');

async function sendMedia(jid, client, url, type, mediaType, quoted) {
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {
            const response = await axios.get(`https://api.example.com/download?url=${url}&type=${type}`);
            
            if (!response.data || !response.data.link) 
                throw new Error('Lien non trouvé');

            const downloadLink = type === 'audio' ? response.data.link[0] : response.data.link.main;
            if (!downloadLink) throw new Error('Téléchargement impossible');

            const mediaData = await axios.get(downloadLink, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(mediaData.data);

            const message = {
                [mediaType]: buffer,
                mimetype: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
                caption: 'Voici votre média'
            };

            await client.sendMessage(jid, message, { quoted });
            break;
        } catch (error) {
            attempt++;
            console.error(`Erreur tentative ${attempt}:`, error.message);
            if (attempt >= maxAttempts) {
                await client.sendMessage(jid, { text: 'Impossible de télécharger le média.' }, { quoted });
                break;
            }
            await new Promise(res => setTimeout(res, 1000));
        }
    }
}

relcmd({ // changement ici
    nom_cmd: 'song',
    classe: 'media',
    react: '🎵',
    desc: 'Télécharge une chanson depuis YouTube',
    alias: ['ytmp3']
}, async (jid, client, { arg, ms }) => {
    if (!arg) return await client.sendMessage(jid, { text: 'Veuillez spécifier un titre ou lien YouTube.' }, { quoted: ms });
    const query = arg.join(' ');

    try {
        const results = await ytsr(query, { limit: 1 });
        if (results.items.length === 0) 
            return await client.sendMessage(jid, { text: 'Aucun résultat trouvé.' }, { quoted: ms });

        const song = results.items[0];
        const caption = `🎵 Titre: ${song.title}\nLien: ${song.url}\nVues: ${song.views}\nDurée: ${song.duration}`;

        await client.sendMessage(jid, { image: { url: song.thumbnail }, caption }, { quoted: ms });
        await sendMedia(jid, client, song.url, 'audio', 'audio', ms);
    } catch (error) {
        console.error('Erreur téléchargement chanson:', error.message);
        await client.sendMessage(jid, { text: 'Erreur lors du téléchargement.' }, { quoted: ms });
    }
});

relcmd({ // changement ici
    nom_cmd: 'video',
    classe: 'media',
    react: '🎥',
    desc: 'Télécharge une vidéo depuis YouTube'
}, async (jid, client, { repondre, arg, ms }) => {
    if (!arg.length) return await client.sendMessage(jid, { text: 'Veuillez spécifier un terme de recherche.' }, { quoted: ms });
    const query = arg.join(' ');

    try {
        const results = await ytsr(query, { limit: 1 });
        if (results.items.length === 0)
            return await client.sendMessage(jid, { text: 'Aucune vidéo trouvée.' }, { quoted: ms });

        const video = results.items[0];
        const caption = `🎥 Titre: ${video.title}\nLien: ${video.url}\nVues: ${video.views}\nDurée: ${video.duration}`;

        await client.sendMessage(jid, { image: { url: video.thumbnail }, caption }, { quoted: ms });
        await sendMedia(jid, client, video.url, 'video', 'video', ms);
    } catch (error) {
        await client.sendMessage(jid, { text: 'Erreur lors du téléchargement de la vidéo.' }, { quoted: ms });
    }
});
