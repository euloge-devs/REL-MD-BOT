// Dépendances
const fs = require('fs');
const { exec } = require('child_process');
const { remcmd} = require('../lib/relcmd');

// Fonction pour ajouter une commande audio avec effet
function addAudioEffectCommand(commandName, audioEffect) {
  // On enregistre la commande auprès du bot
  relcmd({
    nom_cmd: commandName,
    classe: 'output.mp3',   // nom temporaire pour le fichier de sortie
    react: '🎶',
    desc: `Effet audio appliqué via la commande ${commandName}`
  }, async (client, message, { ms, msg_Repondu, repondre }) => {
    // Vérification si l'utilisateur a répondu avec un fichier audio
    if (!msg_Repondu?.audio) {
      return repondre('Veuillez répondre à un message audio pour appliquer l’effet.');
    }

    try {
      const inputFile = await client.downloadMedia(msg_Repondu.audio); // Télécharger le fichier audio
      const outputFile = 'output.mp3'; // Fichier temporaire de sortie

      // Exécution de ffmpeg pour appliquer l'effet audio
      exec(`ffmpeg -i ${inputFile} ${audioEffect} ${outputFile}`, async (error) => {
        fs.unlinkSync(inputFile); // Supprimer le fichier d'origine

        if (error) {
          return repondre(`Erreur lors de l'application de l'effet : ${error.message}`);
        }

        // Lire le fichier transformé et l'envoyer
        const modifiedAudio = fs.readFileSync(outputFile);
        await client.sendMessage(message, { audio: modifiedAudio, mimetype: 'audio/mpeg' }, { quoted: ms });

        // Supprimer le fichier temporaire
        fs.unlinkSync(outputFile);
      });
    } catch (err) {
      console.error('Erreur lors du traitement audio :', err);
      repondre('Impossible d’appliquer l’effet audio.');
    }
  });
}

// --- Commandes audio disponibles ---
// Format : addAudioEffectCommand('nomCommande', 'paramètres ffmpeg');

addAudioEffectCommand('bassboost', '-af "bass=g=10"');
addAudioEffectCommand('deep', '-af "atempo=4/4,asetrate=44500*2/3"');
addAudioEffectCommand('fast', '-af "atempo=1.5"');
addAudioEffectCommand('slow', '-af "atempo=0.7"');
addAudioEffectCommand('chipmunk', '-af "asetrate=44100*1.5"');
addAudioEffectCommand('vibrato', '-af "vibrato=f=5:d=0.8"');
addAudioEffectCommand('reverb', '-af "aecho=0.8:0.9:1000:0.3"');
addAudioEffectCommand('phaser', '-af "aphaser=in_gain=0.5"');
addAudioEffectCommand('flanger', '-af "flanger"');
addAudioEffectCommand('ghost', '-af "volume=0.1"');
addAudioEffectCommand('dizzy', '-af "chorus=0.7:0.9:50|0.4:0.8:40"');
addAudioEffectCommand('invert', '-af "aphaser=in_gain=-1"');
addAudioEffectCommand('haunting', '-af "highpass=f=1000"');
addAudioEffectCommand('surround', '-af "surround=7.1"');
