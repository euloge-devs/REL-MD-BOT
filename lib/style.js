// Table de conversion des caractères (exemple pour quelques styles)
const alphabets = {
    0: { a: 'ค', b: '๖', c: '¢', d: '໓', e: 'ē', f: 'f', g: 'ງ', h: 'h', i: 'i', j: 'ว' },
    1: { a: 'ą', b: 'ც', c: 'ƈ', d: 'ɖ', e: 'ɛ', f: 'ʄ', g: 'ɠ', h: 'ɧ', i: 'ı', j: 'ʝ' }
    // etc. pour les autres styles...
};

// Fonction pour appliquer un alphabet sur une chaîne
function apply(style, text) {
    let result = '';
    for (let char of text.split('')) {
        if (style[char] !== undefined) result += style[char];
        else if (style[char.toLowerCase()] !== undefined) result += style[char.toLowerCase()];
        else result += char;
    }
    return result;
}

// Fonction pour générer une liste formatée avec un style
function list(style, obj) {
    let keys = Object.keys(obj).filter(k => k.length < 3);
    let result = '';
    keys.forEach((key, index) => {
        result += (index + 1) + '. ' + apply(style, obj[key]) + '\n';
    });
    return result;
}

// Export pour Node.js
module.exports = { alphabets, apply, list };
