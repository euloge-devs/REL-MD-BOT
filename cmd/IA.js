const { relcmd } = require("../lib/relcmd");
const axios = require("axios");

// 🧠 Commande GPT
relcmd({
  nom_cmd: "gpt",
  classe: "IA",
  react: "🤖",
  desc: "Utilise l'API GPT pour générer des réponses."
}, async (msg, client, { arg, ms, repondre }) => {
  if (!arg.length) return repondre("⚠️ Veuillez fournir une question ou un prompt.");
  const query = arg.join(" ");
  const url = "https://api.shizo.top/ai/gpt?apikey=shizo&query=" + encodeURIComponent(query);

  try {
    const res = await axios.get(url);
    const answer = res.data?.msg || "❌ Pas de réponse reçue.";
    return repondre(answer);
  } catch (err) {
    console.error("Erreur GPT:", err);
    return repondre("⚠️ Erreur lors de la génération de la réponse.");
  }
});

// 🎨 Commande DALL-E (génération d’images)
relcmd({
  nom_cmd: "dalle",
  classe: "IA",
  react: "🎨",
  desc: "Génère des images avec DALL·E."
}, async (msg, client, { arg, ms, repondre }) => {
  if (!arg.length) return repondre("⚠️ Fournissez une description d’image.");
  try {
    const prompt = encodeURIComponent(arg.join(" "));
    const res = await axios.get("https://api.shizo.top/ai/dalle?apikey=shizo&query=" + prompt, {
      responseType: "arraybuffer"
    });
    const imageBuffer = Buffer.from(res.data);
    return client.sendMessage(msg, { image: imageBuffer, caption: "```Powered By OVL-MD```" }, { quoted: ms });
  } catch (err) {
    console.error("Erreur DALL-E:", err);
    return repondre("⚠️ Erreur lors de la génération de l'image.");
  }
});

// 🖤 Commande Blackbox (IA alternative)
relcmd({
  nom_cmd: "blackbox",
  classe: "IA",
  react: "🖤",
  desc: "Interroge l’IA Blackbox."
}, async (msg, client, { arg, ms, repondre }) => {
  if (!arg.length) return repondre("⚠️ Fournissez une question.");
  const query = arg.join(" ");

  try {
    // On lance la requête
    const res = await axios.post("https://api.blackbox.ai/api/chat", {
      messages: [{ role: "user", content: query }],
      prompt: "blackbox",
      websearch: false,
      stream: false,
      markdown: false,
      model: "blackbox"
    }, { headers: { "Content-Type": "application/json" } });

    const id = res.data.id;

    // On attend la réponse finale en polling
    let finished = false;
    while (!finished) {
      const status = await axios.get("https://api.blackbox.ai/api/chat/" + encodeURIComponent(id));
      switch (status.data.status) {
        case "pending":
          finished = false;
          break;
        case "completed":
          finished = true;
          return repondre(status.data.output || "✅ Terminé (mais aucune sortie trouvée).");
        case "error":
          finished = true;
          return repondre("❌ Une erreur est survenue.");
        default:
          finished = true;
          return repondre("⚠️ Statut inconnu.");
      }
    }
  } catch (err) {
    console.error("Erreur Blackbox:", err);
    return repondre("⚠️ Erreur lors de l'appel à Blackbox.");
  }
});

// 🤖 Commande Bard (IA de Google)
relcmd({
  nom_cmd: "bard",
  classe: "IA",
  react: "🤖",
  desc: "Utilise Bard (Google AI) pour générer des réponses."
}, async (msg, client, { arg, ms, repondre }) => {
  if (!arg.length) return repondre("⚠️ Fournissez une question.");
  const query = arg.join(" ");
  const url = "https://api.shizo.top/ai/bard?apikey=shizo&query=" + encodeURIComponent(query);

  try {
    const res = await axios.get(url);
    const answer = res.data?.answer || "❌ Pas de réponse de Bard.";
    return repondre(answer);
  } catch (err) {
    console.error("Erreur Bard:", err);
    return repondre("⚠️ Erreur lors de la génération avec Bard.");
  }
});

// 🤖 Commande Copilot (alternative GPT)
relcmd({
  nom_cmd: "copilot",
  classe: "IA",
  react: "🤖",
  desc: "Utilise l’IA Copilot pour assister avec du code ou du texte."
}, async (msg, client, { arg, ms, repondre }) => {
  if (!arg.length) return repondre("⚠️ Fournissez un prompt.");
  const query = arg.join(" ");
  const url = "https://api.shizo.top/ai/copilot?apikey=shizo&query=" + encodeURIComponent(query);

  try {
    const res = await axios.get(url);
    const answer = res.data?.msg || "❌ Pas de réponse de Copilot.";
    return repondre(answer);
  } catch (err) {
    console.error("Erreur Copilot:", err);
    return repondre("⚠️ Erreur lors de la génération avec Copilot.");
  }
});
