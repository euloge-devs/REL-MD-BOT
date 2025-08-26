const axios = require("axios");
const { ChatbotConf } = require('../../DataBase/chatbot');

/**
 * Chatbot basé sur l'API Google Gemini
 * @param {string} chatId - Identifiant du chat (groupe ou privé)
 * @param {boolean} isGroup - True si c'est un groupe
 * @param {string} message - Message utilisateur
 * @param {function} reply - Fonction de réponse (ex: sock.sendMessage)
 */
async function chatbot(chatId, isGroup, message, reply) {
  try {
    if (!message) return;

    // Récupération de la configuration en BDD
    const config = await ChatbotConf.findByPk('1');
    if (!config) return;

    // IDs activés manuellement
    let enabledIds = [];
    try {
      enabledIds = JSON.parse(config.enabled_ids || '[]');
    } catch {
      enabledIds = [];
    }

    const isEnabledForChat = enabledIds.includes(chatId);
    const isEnabledGlobally = isGroup
      ? config.chatbot_gc === 'oui'
      : config.chatbot_pm === 'oui';

    if (isEnabledForChat || isEnabledGlobally) {
      // Appel à l'API Gemini
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAk9Mtmnk8SuuCf7T9z8Hkw5dPxiAMVc8U',
        {
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        },
        {
          headers: { 'Content-Type': "application/json" }
        }
      );

      const data = response.data;

      if (data.candidates && data.candidates.length > 0) {
        let botReply = data.candidates[0]?.content?.parts?.[0]?.text || '';

        // Customisation des réponses
        botReply = botReply
          .replace(/Google/gi, "Euloge")
          .replace(/un grand modèle linguistique/gi, "REL-MD-CHAT-BOT");

        if (botReply) {
          reply(botReply);
        }
      } else {
        reply("Aucune réponse adaptée de l'API.");
      }
    }
  } catch (err) {
    console.error("❌ Erreur dans chatbot :", err);
  }
}

module.exports = chatbot;
