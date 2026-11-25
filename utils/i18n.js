const fs = require('fs');
const path = require('path');

const locales = {};
const DEFAULT_LANG = 'fr';

// Charge tous les fichiers de locales/
for (const file of fs.readdirSync(path.join(__dirname, '../locales'))) {
  if (!file.endsWith('.json')) continue;
  const lang = file.replace('.json', '');
  locales[lang] = require(path.join(__dirname, '../locales', file));
}

/**
 * Traduit une clé pour une langue donnée.
 * @param {string} lang - 'fr' | 'en'
 * @param {string} key - 'rank.title', 'common.error'…
 * @param {object} vars - { username: 'Alex', xp: 100 }
 */
function t(lang, key, vars = {}) {
  const dict = locales[lang] ?? locales[DEFAULT_LANG];
  const parts = key.split('.');

  let value = dict;
  for (const p of parts) {
    value = value?.[p];
    if (value === undefined) break;
  }

  // Fallback sur le français
  if (value === undefined) {
    value = locales[DEFAULT_LANG];
    for (const p of parts) {
      value = value?.[p];
      if (value === undefined) break;
    }
  }

  if (typeof value !== 'string') return key; // clé manquante → affiche la clé

  // Remplace {var} par sa valeur
  return value.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
}

/** Récupère la langue d'un user (avec fallback). */
async function getUserLang(userId, prisma) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  return u?.language ?? DEFAULT_LANG;
}

module.exports = { t, getUserLang, locales, DEFAULT_LANG };