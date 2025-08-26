// Liste des commandes enregistrées
let cmd = [];

/**
 * Enregistre une commande avec ses propriétés
 * @param {Object} options - Options de la commande
 * @param {Function} action - Fonction exécutée pour la commande
 * @returns {Object} - Commande enregistrée
 */
function relcmd(options, action) {
  if (!options.classe) {
    options.classe = "Autres"; // Catégorie par défaut
  }
  if (!options.react) {
    options.react = "🎐"; // Réaction par défaut
  }
  if (!options.desc) {
    options.desc = "Aucune description"; // Description par défaut
  }
  if (!options.alias) {
    options.alias = []; // Aucun alias par défaut
  }

  options.fonction = action; // Associer la fonction
  cmd.push(options); // Ajouter à la liste des commandes

  return options;
}

module.exports = {
  relcmd,
  Module: relcmd, // Alias pour compatibilité
  cmd,
};
