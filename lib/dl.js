const axios = require('axios');
const cheerio = require('cheerio');
const cookie = require('cookie');

async function ytdl(url, format = 'mp4', retries = 15) {
    const config = {
        pageUrl: 'https://www.clipto.com/fr/tool-downloader',
        accept: 'application/json, text/plain, */*',
        language: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        userAgent: 'GoogleBot',
        apiUrl: 'https://www.clipto.com/api/youtube'
    };

    let attempt = 0;
    while (attempt < retries) {
        try {
            attempt++;
            const page = await axios.get(config.pageUrl, {
                headers: {
                    'accept': config.accept,
                    'accept-language': config.language,
                    'user-agent': config.userAgent
                },
                maxRedirects: 5
            });

            const setCookies = page.headers['set-cookie'];
            const parsedCookies = setCookies.map(c => cookie.parse(c)).reduce((a, b) => ({ ...a, ...b }), {});
            const cookieHeader = Object.entries({ '__cfduid': parsedCookies['__cfduid'] || '', 'PHPSESSID': parsedCookies['PHPSESSID'] || '' })
                .map(([k, v]) => cookie.serialize(k, v)).join('; ');

            const res = await axios.post(config.apiUrl, { url }, { headers: { 'user-agent': 'GoogleBot', 'cookie': cookieHeader } });

            if (res.data?.success) {
                const files = res.data.formats?.filter(f => f.extension === format && f.available === true) || [];
                if (files.length <= 0) throw new Error(`Format ${format} non disponible`);
                return files[files.length - 1].url;
            } else {
                throw new Error('Réponse invalide : ' + (res.data?.message || ''));
            }
        } catch (err) {
            console.error('Erreur YTDL:', err.message);
            if (attempt >= retries) throw new Error(`Impossible de récupérer la vidéo après ${retries} tentatives`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function fbdl(id) {
    const config = {
        url: 'https://www.getfvid.com/downloader',
        contentType: 'application/x-www-form-urlencoded',
        userAgent: 'Mozilla/5.0',
        selector: '.results-list-item a',
        attr: 'href',
        defaultValue: 'Lien non trouvé'
    };
    try {
        const res = await axios.post(config.url, new URLSearchParams({ id, locale: 'en' }), {
            headers: { 'Content-Type': config.contentType, 'User-Agent': config.userAgent }
        });

        const $ = cheerio.load(res.data);
        const link = $(config.selector).attr(config.attr);
        return link ? link : config.defaultValue;
    } catch (err) {
        return 'Erreur : ' + err.message;
    }
}

async function ttdl(url, retries = 5) {
    const config = {
        pageUrl: 'https://snaptik.app',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        language: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        userAgent: 'Mozilla/5.0',
        apiUrl: 'https://snaptik.app/abc_ajax.php',
        videoSelector: '.download-button a',
        audioSelector: '.audio-button a',
        attr: 'href'
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const page = await axios.get(config.pageUrl, {
                headers: { 'accept': config.accept, 'accept-language': config.language, 'user-agent': config.userAgent },
                maxRedirects: 5
            });

            const setCookies = page.headers['set-cookie'];
            const parsedCookies = setCookies.map(c => cookie.parse(c)).reduce((a, b) => ({ ...a, ...b }), {});
            const $ = cheerio.load(page.data);
            const token = $('.token').attr('value');

            const cookieHeader = Object.entries({ '__cfduid': parsedCookies['__cfduid'] || '', 'PHPSESSID': parsedCookies['PHPSESSID'] || '' })
                .map(([k, v]) => cookie.serialize(k, v)).join('; ');

            const res = await axios.post(config.apiUrl, new URLSearchParams({ url, format: '', token }), {
                headers: {
                    'accept': config.accept,
                    'accept-language': config.language,
                    'content-type': 'application/x-www-form-urlencoded',
                    'user-agent': config.userAgent,
                    'cookie': cookieHeader
                }
            });

            const $res = cheerio.load(res.data);
            const result = {
                status: res.status,
                result: {
                    nowatermark: $res(config.videoSelector)?.attr(config.attr),
                    audio: $res(config.audioSelector)?.attr(config.attr)
                }
            };
            if (result.result.nowatermark || result.result.audio) return result;
            else throw new Error('Lien introuvable');
        } catch (err) {
            if (attempt >= retries) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function igdl(url, retries = 5) {
    const config = {
        pageUrl: 'https://www.igram.io',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        language: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        userAgent: 'GoogleBot',
        apiUrl: 'https://www.igram.io/downloader',
        selector: '.video-link',
        attr: 'href'
    };

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const page = await axios.get(config.pageUrl, {
                headers: { 'accept': config.accept, 'accept-language': config.language, 'user-agent': config.userAgent },
                maxRedirects: 5
            });

            const setCookies = page.headers['set-cookie'] || [];
            const parsedCookies = setCookies.map(c => cookie.parse(c)).reduce((a, b) => ({ ...a, ...b }), {});
            const $ = cheerio.load(page.data);
            const videoLink = $(config.selector).attr(config.attr);
            if (videoLink) return { status: page.status, result: { video: videoLink.replace(/^\"|\"$/g, '') } };
            else throw new Error('Lien de vidéo introuvable.');
        } catch (err) {
            if (attempt >= retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function twitterdl(url, retries = 5) {
    const config = {
        pageUrl: 'https://twdown.net/download.php?url=',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        userAgent: 'Mozilla/5.0',
        selector: '.video-download a',
        attr: 'href',
        errorMessage: 'Lien vidéo introuvable'
    };

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const page = await axios.get(config.pageUrl + url, {
                headers: { 'accept': config.accept, 'accept-language': 'fr-FR', 'user-agent': config.userAgent }
            });
            const $ = cheerio.load(page.data);
            const videoLink = $(config.selector).attr(config.attr);
            if (videoLink) return { status: page.status, result: { video: videoLink } };
            else throw new Error(config.errorMessage);
        } catch (err) {
            if (attempt >= retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

module.exports = { fbdl, ttdl, igdl, twitterdl, ytdl };
