const fs = require('fs');
const path = require('path');

// Chemin du fichier de stockage
const storeFilePath = path.join(__dirname, 'store.json');
// Taille maximale du fichier en Mo
const MAX_STORE_SIZE_MB = 5;

/**
 * Vérifie la taille du fichier de stockage.
 * Si elle dépasse MAX_STORE_SIZE_MB, réinitialise le fichier.
 */
function checkAndResetStore() {
    try {
        if (fs.existsSync(storeFilePath)) {
            const stats = fs.statSync(storeFilePath);
            const sizeMB = stats.size / (1024 * 1024); // conversion en Mo
            if (sizeMB > MAX_STORE_SIZE_MB) {
                console.warn(`Le fichier de stockage dépasse ${MAX_STORE_SIZE_MB} Mo. Réinitialisation en cours...`);
                fs.writeFileSync(storeFilePath, JSON.stringify({}));
            }
        }
    } catch (err) {
        console.error('Erreur lors de la vérification du fichier de stockage:', err);
    }
}

/**
 * Récupère un message depuis le fichier de stockage
 * @param {string} key - Clé du message à récupérer
 * @returns {any|null} - Valeur du message ou null si non trouvé
 */
function getMessage(key) {
    try {
        if (!fs.existsSync(storeFilePath)) return null;
        const data = JSON.parse(fs.readFileSync(storeFilePath, 'utf-8'));
        return data[key] || null;
    } catch (err) {
        console.error('Impossible de lire le fichier de stockage:', err);
        return null;
    }
}

/**
 * Ajoute ou met à jour un message dans le fichier de stockage
 * @param {string} key - Clé du message
 * @param {any} value - Valeur du message
 */
function addMessage(key, value) {
    try {
        let data = {};
        if (fs.existsSync(storeFilePath)) {
            data = JSON.parse(fs.readFileSync(storeFilePath, 'utf-8'));
        }
        data[key] = value;
        fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2));
        checkAndResetStore();
    } catch (err) {
        console.error('Impossible d\'ajouter le message:', err);
    }
}

// Export des fonctions
module.exports = {
    getMessage,
    addMessage
};
