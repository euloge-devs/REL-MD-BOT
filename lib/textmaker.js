const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const FormData = require('form-data');
const cookie = require('cookie');

/**
 * Fonction principale pour interagir avec un formulaire web et récupérer du texte
 * @param {string} url - L'URL de la page cible
 * @param {string} cookiesString - Les cookies à envoyer
 * @param {string} selectedOption - Option radio à sélectionner (facultatif)
 * @returns {Promise<{status: boolean, url?: string}>}
 */
async function textmaker(url, cookiesString, selectedOption = '') {
    // Parse cookies
    const cookiesArray = cookiesString.split(';').map(cookie.parse);
    const cookies = Object.assign({}, ...cookiesArray);
    const cookieHeader = Object.keys(cookies)
        .map(key => cookie.serialize(key, cookies[key]))
        .join('; ');

    // Récupération de la page initiale
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'GoogleBot' }
    });
    const html = await response.text();

    const $ = cheerio.load(html);

    // Récupération des tokens et champs du formulaire
    const token = $('input[name="token"]').val();
    const buildServer = $('input[name="build_server"]').val();
    const buildServerId = $('input[name="build_server_id"]').val();
    const radioOptions = $('input[type="radio"]').map((i, el) => $(el).val()).get();

    // Choix aléatoire si aucune option n’est fournie
    if (radioOptions.length > 0 && !selectedOption) {
        const randomIndex = Math.floor(Math.random() * radioOptions.length);
        selectedOption = radioOptions[randomIndex];
        console.log('Option radio sélectionnée aléatoirement : ' + selectedOption);
    }

    // Préparer les données du formulaire
    const formData = new FormData();
    Object.values(cookies).forEach(value => formData.append('cookie', value.trim()));
    formData.append('submit', 'Go');
    if (selectedOption) formData.append('build_option', selectedOption);
    formData.append('token', token);
    formData.append('build_server', buildServer);
    formData.append('build_server_id', buildServerId);

    // Envoyer le formulaire
    const submitResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0',
            'Cookie': cookieHeader
        },
        body: formData
    });

    const submitHtml = await submitResponse.text();
    const $$ = cheerio.load(submitHtml);

    // Récupérer le résultat
    const resultJson = $$('selector_for_result').text(); // à remplacer par le vrai sélecteur
    if (!resultJson) return { status: false };

    const result = JSON.parse(resultJson);

    const finalFormData = new FormData();
    finalFormData.append('id', result.id);
    result.text.forEach(line => finalFormData.append('text', line));
    finalFormData.append('build_server', result.build_server);
    finalFormData.append('build_server_id', result.build_server_id);

    // Envoi final pour générer l'image ou le contenu final
    const finalResponse = await fetch(url.split('/').slice(0, 3).join('/') + '/ajax-endpoint', {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0',
            'Cookie': cookieHeader
        },
        body: finalFormData
    });

    const finalResult = await finalResponse.json();
    if (!finalResult.status) throw new Error('Erreur lors de la génération');

    return { status: finalResult.status, url: '' + buildServer + finalResult.image };
}

module.exports = textmaker;
