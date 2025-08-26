const _0xc973c1 = function () {
  let _0x3d438d = true;
  return function (_0x3f1b39, _0x1a5cbc) {
    const _0x3091c1 = _0x3d438d ? function () {
      if (_0x1a5cbc) {
        const _0x222a02 = _0x1a5cbc.apply(_0x3f1b39, arguments);
        _0x1a5cbc = null;
        return _0x222a02;
      }
    } : function () {};
    _0x3d438d = false;
    return _0x3091c1;
  };
}();
const _0x3c343a = _0xc973c1(this, function () {
  return _0x3c343a.toString().search("(((.+)+)+)+$").toString().constructor(_0x3c343a).search("(((.+)+)+)+$");
});
_0x3c343a();
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  'PREFIXE': process.env.PREFIXE || '',
  'NOM_OWNER': process.env.NOM_OWNER || "Euloge",
  'NUMERO_OWNER': process.env.NUMERO_OWNER || '',
  'MODE': process.env.MODE || "public",
  'SESSION_ID': process.env.SESSION_ID || "rel",
  'LEVEL_UP': process.env.LEVEL_UP || "non",
  'STICKER_PACK_NAME': process.env.STICKER_PACK_NAME || "Wa-sticker",
  'STICKER_AUTHOR_NAME': process.env.STICKER_AUTHOR_NAME || "REL-MD",
  'DATABASE': process.env.DATABASE,
  'RENDER_API_KEY': process.env.RENDER_API_KEY,
  'REL_LANGUE': process.env.REL_LANGUE || 'fr',
  'THEME': '1'
};