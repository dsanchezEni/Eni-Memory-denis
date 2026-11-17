/**
 * ENI-Memory - Tests de js/card.js
 * - Tests unitaires des fonctions pures (extraites sans exécuter les effets DOM)
 * - Tests d'intégration : génération de grille, alerte de compatibilité,
 *   fin de partie, enregistrement et affichage des scores
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { PROJECT, createSandbox } = require('./helpers/dom');

const CODE_CARD = fs.readFileSync(path.join(PROJECT, 'js/card.js'), 'utf8').replace(/\r/g, '');

/** Extrait le tableau + les fonctions pures (sans le code DOM / effets de bord) */
function codeFonctionsPures() {
  const debut = CODE_CARD.indexOf('var tableauCorrespondanceMemoryImage');
  const fin = CODE_CARD.indexOf('// Variables globales');
  const formatTimeFn = CODE_CARD.slice(CODE_CARD.indexOf('function formatTime'), CODE_CARD.indexOf('/**
 * Démarre le timer'));
  return CODE_CARD.slice(debut, fin) + '
' + formatTimeFn;
}

/** Charge card.js entièrement dans une sandbox */
function chargerCard(sb) {
  sb.loadScript('js/card.js', `
    globalThis.__api = {
      getThemeMemory, formatTaillePourAffichage, nbPairesPourTaille,
      trouverTailleCompatible, tirerNumerosImages, afficheMessageDepuisTableau,
      formatTime, genererGrille, enregistrementPseudoScore, showTableauDernierScore
    };
    globalThis.__etat = () => ({
      cards: [...cards].map(c => c.getAttribute('data-attr')),
      innerCards,
    });
    globalThis.__cartes = cards;
  `);
}

module.exports = (t) => {
  // ============================ FONCTIONS PURES ============================
  t.section('card.js — fonctions pures');

  {
    const sb = createSandbox();
    sb.run(codeFonctionsPures() + `
      globalThis.__pur = {
        getThemeMemory, formatTaillePourAffichage, nbPairesPourTaille,
        trouverTailleCompatible, tirerNumerosImages, formatTime,
        afficheMessageDepuisTableau,
      };
      globalThis.__tab = tableauCorrespondanceMemoryImage;
    `);
    const pur = sb.run('__pur');
    const tab = sb.run('__tab');

    t.test('getThemeMemory retrouve un thème existant', () => {
      const theme = pur.getThemeMemory(tab, 'chiens');
      t.ok(theme, 'thème trouvé');
      t.eq(theme.nomAffiche, 'Chiens');
      t.eq(theme.nombreCartes, 23);
    });

    t.test('getThemeMemory renvoie null pour un thème inconnu ou un tableau invalide', () => {
      t.eq(pur.getThemeMemory(tab, 'inexistant'), null);
      t.eq(pur.getThemeMemory(null, 'chiens'), null);
      t.eq(pur.getThemeMemory('pas un tableau', 'chiens'), null);
    });

    t.test('chaque thème du tableau a un nombreCartes défini et cohérent', () => {
      t.ok(tab.length >= 8, 'au moins 8 thèmes');
      for (const theme of tab) {
        t.ok(typeof theme.nombreCartes === 'number' && theme.nombreCartes > 0, `${theme.nom}.nombreCartes défini`);
        t.ok(theme.chemin && theme.extension && theme.nomAffiche, `${theme.nom} complet`);
      }
    });

    t.test('formatTaillePourAffichage formate "XparY" en "X x Y"', () => {
      t.eq(pur.formatTaillePourAffichage('4par3'), '4 x 3');
      t.eq(pur.formatTaillePourAffichage('5par5'), '5 x 5');
    });

    t.test('nbPairesPourTaille calcule le bon nombre de paires (total impair inclus)', () => {
      t.eq(pur.nbPairesPourTaille('4par3'), 6);
      t.eq(pur.nbPairesPourTaille('4par4'), 8);
      t.eq(pur.nbPairesPourTaille('5par5'), 12);
      t.eq(pur.nbPairesPourTaille('3par3'), 4);
    });

    t.test('trouverTailleCompatible propose la plus grande taille jouable', () => {
      t.eq(pur.trouverTailleCompatible(12), '5par5');
      t.eq(pur.trouverTailleCompatible(8), '4par4');
      t.eq(pur.trouverTailleCompatible(6), '4par3');
      t.eq(pur.trouverTailleCompatible(4), '3par3');
    });

    t.test('tirerNumerosImages : nb numéros distincts dans [1, nbDisponibles]', () => {
      for (let i = 0; i < 50; i++) {
        const tirage = pur.tirerNumerosImages(6, 8);
        t.eq(tirage.length, 6);
        t.ok(new Set(tirage).size === 6, 'numéros distincts');
        t.ok(tirage.every(n => n >= 1 && n <= 8), 'numéros dans la plage');
      }
    });

    t.test('tirerNumerosImages plafonne au disponible (pas de boucle infinie avec Infinity)', () => {
      t.eq(pur.tirerNumerosImages(12, 12).length, 12);
      t.ok(pur.tirerNumerosImages(30, 10).length <= 10, 'jamais plus que disponible');
      t.eq(pur.tirerNumerosImages(5, Infinity).length, 5);
    });

    t.test('formatTime formate en m:ss', () => {
      t.eq(pur.formatTime(0), '0:00');
      t.eq(pur.formatTime(59), '0:59');
      t.eq(pur.formatTime(85), '1:25');
      t.eq(pur.formatTime(600), '10:00');
    });

    t.test('afficheMessageDepuisTableau renvoie le nomAffiche ou le nom brut', () => {
      t.eq(pur.afficheMessageDepuisTableau(tab, 'legumes'), 'Légumes');
      t.eq(pur.afficheMessageDepuisTableau(tab, 'inconnu'), 'inconnu');
    });
  }

  // ============================== INTÉGRATION ==============================
  t.section('card.js — génération de grille');

  t.test('grille 4par3 / Légumes : 12 cartes, 6 paires, 6 images distinctes', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '4par3' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 12, '12 cartes au total');
    const distinctes = new Set(etat.cards);
    t.eq(distinctes.size, 6, '6 valeurs distinctes');
    for (const v of distinctes) {
      t.eq(etat.cards.filter(c => c === v).length, 2, `paire complète pour ${v}`);
    }
    t.ok(Array.isArray(etat.innerCards), 'innerCards est un tableau (régression du bug NodeList.filter)');
    t.eq(etat.innerCards.length, 12);
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(3, 1fr)', 'colonnes adaptées à la grille');
    t.eq(sb.alerts.length, 0, 'aucune alerte : combinaison compatible');
  });

  t.test('grille 5par5 / Chiens : 24 cartes jouables (plateau impair)', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'chiens', utilisateurTailleMemory: '5par5' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 24, '25 cartes demandées, 24 jouables');
    t.eq(new Set(etat.cards).size, 12, '12 paires distinctes');
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(5, 1fr)');
    t.eq(sb.alerts.length, 0);
  });

  t.test('5par5 / Légumes : alerte de compatibilité puis repli sur 4par4', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '5par5' } });
    chargerCard(sb);
    t.eq(sb.alerts.length, 1, 'une alerte émise');
    t.includes(sb.alerts[0], 'ne compte que 8 cartes');
    t.includes(sb.alerts[0], '4 x 4', 'une taille jouable est suggérée');
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 16, 'repli automatique sur 4par4');
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(4, 1fr)');
  });

  t.test('thème absent du tableau : repli sur Légumes sans plantage', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'themeFantome', utilisateurTailleMemory: '4par3' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 12);
    t.eq(new Set(etat.cards).size, 6);
  });

  t.test('chaque paire partage la même image (src identiques par data-attr)', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '4par3' } });
    chargerCard(sb);
    const parImage = {};
    for (const el of sb.run('[...__cartes]')) {
      const src = el.children[0].children[0].src;
      // src = ".../memory-legume/N.svg" -> N
      const numero = src.match(/(\d+)\./)[1];
      (parImage[el.getAttribute('data-attr')] ||= new Set()).add(numero);
    }
    for (const [v, imgages] of Object.entries(parImage)) {
      t.eq(imgages.size, 1, `la paire ${v} n'utilise qu'une seule image`);
    }
  });

  t.section('card.js — fin de partie et scores');

  t.test('partie complète : compteur, victoire, temps enregistré', () => {
    const sb = createSandbox({
      localStorage: {
        utilisateurEmail: 'joueur@eni.fr',
        utilisateurChoixMemory: 'legumes',
        utilisateurTailleMemory: '4par3',
      },
    });
    chargerCard(sb);

    // regrouper les cartes réelles par paire
    const cartes = sb.run('[...__cartes]');
    const groupes = {};
    cartes.forEach(el => { (groupes[el.getAttribute('data-attr')] ||= []).push(el); });

    // jouer toutes les paires (1 paire = 1 coup gagnant)
    for (const duo of Object.values(groupes)) {
      duo[0].listeners['click'][0]({ target: duo[0] });
      duo[1].listeners['click'][0]({ target: duo[1] });
    }

    t.includes(sb.els.advice.textContent, 'Bravo');
    t.includes(sb.els.score.textContent, '6 coups', 'score final attendu : 6 paires');
    const sauvegarde = JSON.parse(sb.storage['tableauUtilisateurConnecte']);
    t.eq(sauvegarde.length, 1);
    t.eq(sauvegarde[0].nom, 'joueur@eni.fr');
    t.eq(sauvegarde[0].score, '6');
    t.ok(typeof sauvegarde[0].time === 'number', 'le temps de la partie est enregistré');
    t.eq(JSON.parse(sb.storage['tableau5DerniersScores']).length, 1);
  });

  t.test('enregistrementPseudoScore : le temps est stocké dans le localStorage', () => {
    const sb = createSandbox({
      localStorage: {
        utilisateurEmail: 'a@b.fr',
        utilisateurChoixMemory: 'chiens',
        utilisateurTailleMemory: '4par4',
      },
    });
    chargerCard(sb);
    sb.run('__api.enregistrementPseudoScore("a@b.fr", 9, 125)');
    const parties = JSON.parse(sb.storage['tableauUtilisateurConnecte']);
    t.eq(parties.length, 1);
    t.eq(parties[0].time, 125);
    t.eq(sb.storage['utilisateurConnecteDerniersScores'], '9');
  });

  t.test('showTableauDernierScore : tri par score, colonne temps, "-" sans temps', () => {
    const sb = createSandbox();
    sb.loadScript('js/card.js', `
      globalThis.__afficher = (tab) => showTableauDernierScore(tab, document.getElementById('tableScore'), 5);
    `);
    const lignes = [
      { nom: 'j1', score: '12', time: 95, tailleMemory: '4par3', choixMemory: 'chiens', dateScore: '10/05' },
      { nom: 'j2', score: '3', time: 40, tailleMemory: '4par3', choixMemory: 'legumes', dateScore: '11/05' },
      { nom: 'j3', score: '7', tailleMemory: '4par4', choixMemory: 'chiens', dateScore: '05/04' },
    ];
    sb.run('__afficher(' + JSON.stringify(lignes) + ')');
    const rows = sb.tableEl.dataRows();
    t.eq(rows.length, 3);
    t.eq(rows[0].cells[0].getText(), 'j2', 'tri croissant par score');
    t.eq(rows[1].cells[0].getText(), 'j3');
    t.eq(rows[2].cells[0].getText(), 'j1');
    t.eq(rows[0].cells[2].getText(), '0:40');
    t.eq(rows[1].cells[2].getText(), '-', 'ancien score sans temps');
    t.eq(rows[2].cells[2].getText(), '1:35');
    t.eq(sb.tableEl.rows.length, 4, 'en-tête conservé + 3 lignes');
  });

  t.test('showTableauDernierScore : au plus 5 lignes affichées', () => {
    const sb = createSandbox();
    sb.loadScript('js/card.js', `
      globalThis.__afficher = (tab) => showTableauDernierScore(tab, document.getElementById('tableScore'), 5);
    `);
    const lignes = [];
    for (let i = 1; i <= 8; i++) {
      lignes.push({ nom: 'j' + i, score: i, tailleMemory: '4par3', choixMemory: 'chiens', dateScore: 'x' });
    }
    sb.run('__afficher(' + JSON.stringify(lignes) + ')');
    t.eq(sb.tableEl.dataRows().length, 5, '5 meilleurs seulement');
  });

  t.test('affichage des scores sauvegardés dès le chargement de la page', () => {
    const sb = createSandbox({
      localStorage: {
        utilisateurEmail: 'j0@eni.fr',
        utilisateurChoixMemory: 'legumes',
        utilisateurTailleMemory: '4par3',
        tableau5DerniersScores: JSON.stringify([
          { nom: 'j0@eni.fr', score: '4', time: 60, tailleMemory: '4par3', choixMemory: 'legumes', dateScore: '01/01/2025' },
        ]),
      },
    });
    sb.loadScript('js/card.js', '');
    const rows = sb.tableEl.dataRows();
    t.eq(rows.length, 1, 'la ligne sauvegardée est affichée au chargement');
    t.eq(rows[0].cells[1].getText(), '4');
    t.eq(rows[0].cells[2].getText(), '1:00');
  });
};
