const { relcmd } = require('relcmd'); // Ajuste selon ton vrai chemin
const {
  modifierSolde,
  getInfosUtilisateur,
  resetEconomie,
  mettreAJourCapaciteBanque,
  ECONOMIE,
  TopBanque
} = require('economyModule'); // Ajuste selon ton vrai module
const crypto = require('crypto');

/**
 * Génère un ID utilisateur unique à partir d'un identifiant
 * @param {string} userId 
 * @returns {string}
 */
function generateUserId(userId) {
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  return 'USR_' + hash.slice(0, 6);
}

/**
 * Génère un ID de transaction aléatoire
 * @returns {string}
 */
function generateTransactionId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Commande pour afficher les informations économiques d'un utilisateur
 */
relcmd({
  nom_cmd: 'eco',
  desc: 'Voir votre portefeuille et banque',
  react: '💰',
  classe: 'économie'
}, async (msg, client, { ms, getJid, arg, auteur_Message, auteur_Msg_Repondu, repondre }) => {
  try {
    // Identification de l'utilisateur ciblé
    const targetJid = arg[0]?.includes('@') ? arg[0].split('@')[0] + '@lid' : auteur_Msg_Repondu || auteur_Message;

    const userId = await getJid(targetJid, msg, client);
    if (!userId) return repondre('Utilisateur introuvable.');

    // Récupération de l'image
    let imageUrl = 'https://postimg.cc/nXZz52Gb';
    try {
      imageUrl = await client.getProfilePicture(userId);
    } catch {}

    // Récupération des informations utilisateur
    const userInfo = await getInfosUtilisateur(userId);
    if (!userInfo) return repondre('Impossible de récupérer les informations.');

    const pseudo = userInfo.pseudo || 'Utilisateur';
    const wallet = userInfo.portefeuille ?? 0;
    const bank = userInfo.banque ?? 0;
    const capacity = userInfo.capacite ?? 10000;
    const userCode = generateUserId(userId);

    const message = `┃💼 *Portefeuille :* ${wallet}\n┃🏦 *Banque :* ${bank}\n┃💳 *Capacité :* ${capacity}\nID: ${userCode}`;

    await client.sendMessage(msg, { image: { url: imageUrl }, caption: message }, { quoted: ms });
  } catch (err) {
    console.error('Erreur eco:', err);
    await repondre('Une erreur est survenue.');
  }
});

/**
 * Commande pour transférer de l'argent entre utilisateurs
 */
relcmd({
  nom_cmd: 'transfer',
  desc: "Transférer de l'argent de votre banque vers un autre utilisateur",
  react: '💸',
  classe: 'économie'
}, async (msg, client, { arg, repondre }) => {
  try {
    const target = arg[0];
    const amount = parseInt(arg[1], 10);

    if (!target || isNaN(amount)) return repondre('Veuillez spécifier un utilisateur et un montant valide.');

    // Exemple simplifié : appeler la fonction qui effectue le transfert
    const result = await modifierSolde(target, amount);

    if (result.success) {
      repondre(`💸 Transfert de ${amount} effectué avec succès à ${target}.`);
    } else {
      repondre('Erreur lors du transfert.');
    }
  } catch (err) {
    console.error('Erreur transfer:', err);
    repondre('Une erreur est survenue.');
  }
});
