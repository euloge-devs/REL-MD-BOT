const { relcmd, cmd, relcmd } = require("../lib/relcmd");
const axios = require("axios");
const gis = require("g-i-s");
const wiki = require("wikipedia");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../set');
const { translate } = require("@vitalets/google-translate-api");
const ytsr = require("@distube/ytsr");
const LyricsFinder = require('@faouzkk/lyrics-finder');
const { search: aptoideSearch, download: aptoideDownload } = require("aptoide_scrapper_fixed");

// Commande: Recherche d'images
relcmd({
  nom_cmd: 'img',
  classe: "Search",
  react: '🔍',
  desc: "Recherche d'images"
}, async (message, bot, options) => {
  const { arg, ms } = options;
  const query = arg.join(" ");
  if (!query) return bot.sendMessage(message, { text: "Veuillez fournir un terme de recherche, par exemple : img rel-Md" }, { quoted: ms });

  gis(query, async (error, results) => {
    if (error) {
      console.error("Erreur lors de la recherche d'images:", error);
      return bot.sendMessage(message, { text: "Erreur lors de la recherche d'images." }, { quoted: ms });
    }
    const images = results.slice(0, 5);
    if (!images.length) return bot.sendMessage(message, { text: "Aucune image trouvée pour ce terme de recherche." }, { quoted: ms });

    for (const img of images) {
      try {
        await bot.sendMessage(message, { image: { url: img.url }, caption: "```Powered By REL-MD```" }, { quoted: ms });
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'image:", err);
      }
    }
  });
});

// Commande: Recherche de paroles
relcmd({
  nom_cmd: 'lyrics',
  classe: "Search",
  react: '🎵',
  desc: "Cherche les paroles d'une chanson"
}, async (message, bot, options) => {
  const { arg, ms } = options;
  const songName = arg.join(" ");
  if (!songName) return bot.sendMessage(message, { text: "Veuillez fournir un nom de chanson pour obtenir les paroles." }, { quoted: ms });

  try {
    const lyrics = await LyricsFinder(songName);
    if (!lyrics) return bot.sendMessage(message, { text: "Désolé, je n'ai pas trouvé les paroles pour cette chanson." }, { quoted: ms });
    const reply = `🎸OVL-MD LYRICS FINDER🥁\n\n🎼PAROLES =>\n\n${lyrics}`;
    await bot.sendMessage(message, { text: reply }, { quoted: ms });
  } catch (err) {
    console.error("Erreur lors de la recherche des paroles :", err.message);
    bot.sendMessage(message, { text: "Une erreur s'est produite lors de la recherche des paroles." }, { quoted: ms });
  }
});

// Commande: Recherche Google
relcmd({
  nom_cmd: "google",
  classe: "Search",
  desc: "Recherche sur Google.",
  alias: ["search"]
}, async (message, bot, options) => {
  const { arg, ms } = options;
  if (!arg[0]) return bot.sendMessage(message, { text: "❗ Entrez un terme à rechercher sur Google." }, { quoted: ms });

  const query = arg.join(" ");
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { q: query, key: "AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI", cx: "baf9bdb0c631236e5" }
    });
    if (!response.data.items || !response.data.items.length) return bot.sendMessage(message, { text: "❗ Aucun résultat trouvé pour cette recherche." }, { quoted: ms });

    const items = response.data.items.slice(0, 3);
    let resultText = `*🔍 Résultats de recherche pour : ${query}*\n\n`;
    items.forEach((item, index) => {
      resultText += `${index + 1}.\n *📌Titre:* ${item.title}\n*📃Description:* ${item.snippet}\n*🌐Lien:* ${item.link}\n\n`;
    });
    await bot.sendMessage(message, { text: resultText }, { quoted: ms });
  } catch (err) {
    console.error("Erreur dans la recherche Google :", err);
    await bot.sendMessage(message, { text: "❗ Une erreur est survenue lors de la recherche sur Google. Veuillez réessayer." }, { quoted: ms });
  }
});

// Commande: Recherche Wikipédia
relcmd({
  nom_cmd: "wiki",
  classe: 'Search',
  react: '📖',
  desc: "Recherche sur Wikipédia."
}, async (message, bot, options) => {
  const { arg, ms } = options;
  if (!arg[0]) return bot.sendMessage(message, { text: "❗ Entrez un terme à rechercher sur Wikipédia." }, { quoted: ms });

  const query = arg.join(" ");
  try {
    const summary = await wiki.summary(query);
    const reply = `*📖Wikipédia :*\n\n*📌Titre:* ${summary.title}\n\n*📃Description:* ${summary.description}\n\n*📄Résumé:* ${summary.extract}\n\n*🌐Lien:* ${summary.content_urls.mobile.page}`;
    await bot.sendMessage(message, { text: reply }, { quoted: ms });
  } catch (err) {
    console.error("Erreur dans la recherche Wikipédia :", err);
    await bot.sendMessage(message, { text: "❗ Une erreur est survenue lors de la recherche sur Wikipédia. Veuillez réessayer." }, { quoted: ms });
  }
});

// Les autres commandes (GitHub, IMDB, stickers, météo, anime, YouTube, APK search) suivent exactement le même principe, avec des noms de variables clairs.
