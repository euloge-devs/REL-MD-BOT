const fs = require('fs');
const { relcmd } = require('../lib/relcmd');
const canvacord = require('canvacord');
const axios = require('axios');

// Fonction pour télécharger une image depuis une URL
async function telechargerImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (err) {
        console.error('Erreur lors du téléchargement de l\'image :', err);
        throw new Error('Impossible de télécharger l\'image.');
    }
}

// Fonction pour générer une commande Canvacord
function genererCommandeCanvacord(nomCommande, effetFonction) {
    relcmd({
        nom_cmd: nomCommande,
        classe: 'image',
        react: '🎨',
        desc: 'Applique un effet Canvacord à une image'
    }, async (client, message, options) => {
        const { arg, ms, getJid, auteur_Msg_Repondu, msg_Repondu, auteur_Message } = options;

        try {
            let imageBuffer;

            // Déterminer la source de l'image
            const mention = auteur_Msg_Repondu || (arg[0]?.includes('@') ? arg[0].replace('@', '') + '@s.whatsapp.net' : auteur_Message);
            const profilJid = await getJid(mention, client, message);

            if (msg_Repondu?.message) {
                // Si un message contenant une image a été répondu
                const mediaPath = await client.downloadMedia(msg_Repondu.message);
                imageBuffer = fs.readFileSync(mediaPath);
            } else if (profilJid) {
                // Si l'utilisateur a un profil
                imageBuffer = await telechargerImage(await client.getProfilePicture(profilJid, 'image'));
            } else {
                // Image par défaut
                imageBuffer = await telechargerImage('https://i.postimg.cc/9Fs5GVty/Copilot-20250826-173107.png');
            }

            // Appliquer l'effet Canvacord
            const resultat = await effetFonction(imageBuffer);

            // Envoyer l'image transformée
            await client.sendMessage(client, { image: resultat }, { quoted: ms });
        } catch (err) {
            console.error(`Erreur avec la commande "${nomCommande}":`, err);
        }
    });
}

// Liste des effets Canvacord
const effetsCanvacord = {
    shit: img => canvacord.canvacord.shit(img),
    wasted: img => canvacord.canvacord.wasted(img),
    wanted: img => canvacord.canvacord.wanted(img),
    trigger: img => canvacord.canvacord.trigger(img),
    trash: img => canvacord.canvacord.trash(img),
    rip: img => canvacord.canvacord.rip(img),
    sepia: img => canvacord.canvacord.sepia(img),
    rainbow: img => canvacord.canvacord.rainbow(img),
    hitler: img => canvacord.canvacord.hitler(img),
    invert1: img => canvacord.canvacord.invert(img),
    jail: img => canvacord.canvacord.jail(img),
    affect: img => canvacord.canvacord.affect(img),
    beautiful: img => canvacord.canvacord.beautiful(img),
    blur: img => canvacord.canvacord.blur(img),
    circle1: img => canvacord.canvacord.circle(img),
    facepalm: img => canvacord.canvacord.facepalm(img),
    greyscale: img => canvacord.canvacord.greyscale(img),
    jokeoverhead: img => canvacord.canvacord.jokeoverhead(img),
    delete: img => canvacord.canvacord.delete(img),
    distracted: img => canvacord.canvacord.distracted(img),
    colorfy: img => canvacord.canvacord.colorfy(img),
    filters: img => canvacord.canvacord.filters(img),
    fuse: img => canvacord.canvacord.fuse(img)
};

// Générer toutes les commandes automatiquement
Object.entries(effetsCanvacord).forEach(([nom, effet]) => genererCommandeCanvacord(nom, effet));
