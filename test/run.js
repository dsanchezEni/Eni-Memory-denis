/**
 * ENI-Memory - Runner de tests minimal (sans dépendance)
 *
 * Usage : node test/run.js
 * Convention : chaque fichier test/*.test.js exporte une fonction (t) => { ... }
 * avec t.section(nom), t.test(nom, fn), t.ok(cond, msg), t.eq(a, b, msg), t.includes(str, sub, msg)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const t = {
  _section: 'général',
  section(nom) { this._section = nom; },
  test(nom, fn) { tests.push({ fichier: fichierCourant, section: this._section, nom, fn }); },
  ok(cond, msg) { if (!cond) throw new Error(msg || 'condition attendue vraie'); },
  eq(actuel, attendu, msg) {
    if (actuel !== attendu) {
      throw new Error((msg || 'égalité')
        + ` — attendu ${JSON.stringify(attendu)}, obtenu ${JSON.stringify(actuel)}`);
    }
  },
  includes(chaine, sousChaine, msg) {
    if (!String(chaine).includes(sousChaine)) {
      throw new Error((msg || 'contient') + ` — "${sousChaine}" absent de "${String(chaine).slice(0, 120)}"`);
    }
  },
};

let fichierCourant = '';
const tests = [];

(async () => {
  const fichiers = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
  for (const f of fichiers) {
    fichierCourant = f;
    console.log('\n=== ' + f + ' ===');
    const definir = require(path.join(__dirname, f));
    if (typeof definir === 'function') definir(t);
  }

  let passes = 0, echecs = 0;
  const details = [];
  for (const test of tests) {
    try {
      await test.fn();
      passes++;
      console.log(`  PASS  [${test.section}] ${test.nom}`);
    } catch (e) {
      echecs++;
      details.push(test);
      console.error(`  FAIL  [${test.section}] ${test.nom}`);
      console.error(`        ${String(e.message || e).split('\n')[0]}`);
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log(`${passes} test(s) OK, ${echecs} échec(s), ${tests.length} au total`);
  process.exit(echecs ? 1 : 0);
})();
