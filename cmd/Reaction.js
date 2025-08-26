const { relcmd, relcmd } = require('../lib/relcmd');
const axios = require("axios");
const fs = require('fs');
const child_process = require('child_process');

const reactions = {
  'embeter': "https://api.waifu.pics/sfw/bully",
  'caliner': "https://api.waifu.pics/sfw/cuddle",
  'pleurer': 'https://api.waifu.pics/sfw/cry',
  'enlacer': 'https://api.waifu.pics/sfw/hug',
  'awoo': "https://api.waifu.pics/sfw/awoo",
  'embrasser': "https://api.waifu.pics/sfw/kiss",
  'lecher': 'https://api.waifu.pics/sfw/lick',
  'tapoter': "https://api.waifu.pics/sfw/pat",
  'sourire_fier': "https://api.waifu.pics/sfw/smug",
  'assommer': "https://api.waifu.pics/sfw/bonk",
  'lancer': "https://api.waifu.pics/sfw/yeet",
  'rougir': "https://api.waifu.pics/sfw/blush",
  'sourire': "https://api.waifu.pics/sfw/smile",
  'saluer': "https://api.waifu.pics/sfw/wave",
  'highfive': "https://api.waifu.pics/sfw/highfive",
  'tenir_main': "https://api.waifu.pics/sfw/handhold",
  'croquer': "https://api.waifu.pics/sfw/nom",
  'mordre': "https://api.waifu.pics/sfw/bite",
  'sauter': "https://api.waifu.pics/sfw/glomp",
  'gifler': "https://api.waifu.pics/sfw/slap",
  'tuer': 'https://api.waifu.pics/sfw/kill',
  'coup_de_pied': "https://api.waifu.pics/sfw/kick",
  'heureux': "https://api.waifu.pics/sfw/happy",
  'clin_doeil': "https://api.waifu.pics/sfw/wink",
  'pousser': "https://api.waifu.pics/sfw/poke",
  'danser': 'https://api.waifu.pics/sfw/dance',
  'gene': "https://api.waifu.pics/sfw/cringe"
};

// Génère la légende pour la vidéo
function generateCaption(action, author, target) {
  const captions = {
    'embeter': {
      withTarget: `@${author} embête @${target} !`,
      withoutTarget: `@${author} embête tout le monde !`
    },
    'caliner': {
      withTarget: `@${author} câline @${target} !`,
      withoutTarget: `@${author} veut câliner tout le monde !`
    },
    // ... rajoute toutes les autres réactions de la même manière
  };
  if (!captions[action]) return `@${author} a exécuté ${action} !`;
  return target ? captions[action].withTarget : captions[action].withoutTarget;
}

// Convertit un GIF en MP4 compatible WhatsApp
async function gifToMp4(buffer) {
  const gifFile = `temp_${Date.now()}.gif`;
  const mp4File = `temp_${Date.now()}.mp4`;
  fs.writeFileSync(gifFile, buffer);
  await new Promise((resolve, reject) => {
    child_process.exec(`ffmpeg -i ${gifFile} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4File}`, (err) => {
      if (err) reject(err); else resolve();
    });
  });
  const mp4Buffer = fs.readFileSync(mp4File);
  fs.unlinkSync(gifFile);
  fs.unlinkSync(mp4File);
  return mp4Buffer;
}

// Crée la commande de réaction
function addReactionCommand(name, url) {
  relcmd({
    nom_cmd: name,
    classe: 'Réaction',
    react: '💬',
    desc: `Réaction de type ${name}`
  }, async (chatId, bot, message) => {
    const { arg, auteur_Message, getJid, auteur_Msg_Repondu, repondre } = message;
    const targetJid = auteur_Msg_Repondu || (arg[0]?.includes('@') ? arg[0].replace('@', '') + "@lid" : null);
    const target = targetJid ? await getJid(targetJid, chatId, bot) : null;

    try {
      const res = await axios.get(url);
      const gifUrl = res.data.url;
      const gifBuffer = (await axios.get(gifUrl, { responseType: "arraybuffer" })).data;
      const mp4Buffer = await gifToMp4(gifBuffer);
      const caption = generateCaption(name, auteur_Message.split('@')[0], target?.split('@')[0]);
      await bot.sendMessage(chatId, {
        video: mp4Buffer,
        gifPlayback: true,
        caption: caption,
        mentions: target ? [auteur_Message, target] : [auteur_Message]
      }, { quoted: message.ms });
    } catch (err) {
      console.error(`Erreur avec la commande ${name}:`, err);
      await repondre({ text: "Désolé, une erreur est survenue lors du traitement de la commande." });
    }
  });
}

// Ajoute toutes les réactions automatiquement
for (const [name, url] of Object.entries(reactions)) {
  addReactionCommand(name, url);
}
