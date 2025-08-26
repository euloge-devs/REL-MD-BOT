const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const { Plugin } = require('../DataBase/plugin');

/**
 * Extrait tous les modules npm utilisés dans un fichier JS
 * @param {string} code - Contenu JS à analyser
 * @returns {string[]} - Liste des modules npm non installés ou non déclarés
 */
function extractNpmModules(code) {
    const requireRegex = /require\s*\(\s*['"]([^\.\/][^'"]*)['"]\s*\)/g;
    const modulesFound = new Set();
    let match;

    while ((match = requireRegex.exec(code)) !== null) {
        modulesFound.add(match[1]);
    }

    // Lire package.json pour voir les dépendances existantes
    const packageJsonPath = path.join(__dirname, '../package.json');
    let packageData = {};
    try {
        packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch {}

    const dependencies = packageData.dependencies || {};
    const devDependencies = packageData.devDependencies || {};

    // Retourner les modules qui ne sont pas encore installés
    return Array.from(modulesFound).filter(mod => !dependencies[mod] && !devDependencies[mod]);
}

/**
 * Installe un ou plusieurs modules npm
 * @param {string[]} modules - Modules à installer
 * @returns {Promise<string>} - Résultat de l'installation
 */
async function installModules(modules) {
    if (modules.length === 0) return;

    return new Promise((resolve, reject) => {
        const cmd = `npm install ${modules.join(' ')}`;
        exec(cmd, { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
            if (err) return reject(stderr || err.message);
            resolve(stdout);
        });
    });
}

/**
 * Télécharge et installe tous les plugins depuis la base de données
 */
async function installPlugins() {
    try {
        const plugins = await Plugin.findAll(); // Supposé retourner [{name, url}]
        for (const { name, url } of plugins) {
            const pluginPath = path.join(__dirname, '../plugins', `${name}.js`);
            if (!fs.existsSync(pluginPath)) {
                const response = await axios.get(url);
                fs.writeFileSync(pluginPath, response.data);
                console.log(`Plugin installé: ${name}`);
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'installation des plugins:', err.message);
    }
}

module.exports = {
    extractNpmModules,
    installModules,
    installPlugins
};
