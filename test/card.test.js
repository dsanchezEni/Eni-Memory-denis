/**
 * ENI-Memory - Tests de js/card.js
 * - Fonctions pures : helpers de grille, tirage, formats
 * - Intégration : génération de grille, compatibilité, fin de partie, scores
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { PROJECT, createSandbox } = require('./helpers/dom');

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
  t.section('card.js — fonctions pures');

  const sbP = createSandbox({ localStorage: { utilisateurEmail: 'x@y.fr', utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '4par3' } });
  chargerCard(sbP);
  const pur = sbP.run('__api');
  const tab = sbP.run('tableauCorrespondanceMemoryImage');

  t.test('getThemeMemory : thème trouvé / inconnu / arguments invalides', () => {
    t.eq(pur.getThemeMemory(tab, 'chiens').nombreCartes, 23);
    t.eq(pur.getThemeMemory(tab, 'inexistant'), null);
    t.eq(pur.getThemeMemory(null, 'chiens'), null);
    t.eq(pur.getThemeMemory('pas un tableau', 'chiens'), null);
  });

  t.test('tous les thèmes ont un nombreCartes défini et une fiche complète', () => {
    t.ok(tab.length >= 8, 'au moins 8 thèmes');
    for (const theme of tab) {
      t.ok(typeof theme.nombreCartes === 'number' && theme.nombreCartes > 0, theme.nom + '.nombreCartes défini');
      t.ok(theme.chemin && theme.extension && theme.nomAffiche && theme.img, theme.nom + ' complet');
    }
  });

  t.test('formatTaillePourAffichage : "XparY" -> "X x Y"', () => {
    t.eq(pur.formatTaillePourAffichage('4par3'), '4 x 3');
    t.eq(pur.formatTaillePourAffichage('5par5'), '5 x 5');
  });

  t.test('nbPairesPourTaille : bons nombres de paires (total impair inclus)', () => {
    t.eq(pur.nbPairesPourTaille('4par3'), 6);
    t.eq(pur.nbPairesPourTaille('4par4'), 8);
    t.eq(pur.nbPairesPourTaille('5par5'), 12);
    t.eq(pur.nbPairesPourTaille('3par3'), 4);
  });

  t.test('trouverTailleCompatible : la plus grande taille jouable', () => {
    t.eq(pur.trouverTailleCompatible(12), '5par5');
    t.eq(pur.trouverTailleCompatible(8), '4par4');
    t.eq(pur.trouverTailleCompatible(6), '4par3');
    t.eq(pur.trouverTailleCompatible(4), '3par3');
  });

  t.test('tirerNumerosImages : numéros distincts dans la plage du thème', () => {
    for (let i = 0; i < 50; i++) {
      const tirage = pur.tirerNumerosImages(6, 8);
      t.eq(tirage.length, 6);
      t.ok(new Set(tirage).size === 6, 'distinction des numéros');
      t.ok(tirage.every(n => n >= 1 && n <= 8), 'plage [1..8]');
    }
  });

  t.test('tirerNumerosImages : pas de boucle infinie avec Infinity', () => {
    t.eq(pur.tirerNumerosImages(12, 12).length, 12);
    t.ok(pur.tirerNumerosImages(30, 10).length <= 10);
    t.eq(pur.tirerNumerosImages(5, Infinity).length, 5);
  });

  t.test('formatTime : format m:ss', () => {
    t.eq(pur.formatTime(0), '0:00');
    t.eq(pur.formatTime(59), '0:59');
    t.eq(pur.formatTime(85), '1:25');
    t.eq(pur.formatTime(600), '10:00');
  });

  t.test('afficheMessageDepuisTableau : nomAffiche ou nom brut', () => {
    t.eq(pur.afficheMessageDepuisTableau(tab, 'legumes'), 'Légumes');
    t.eq(pur.afficheMessageDepuisTableau(tab, 'inconnu'), 'inconnu');
  });

  t.section('card.js — génération de grille');

  t.test('grille 4par3 / Légumes : 12 cartes, 6 paires, 6 images distinctes', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '4par3', utilisateurEmail: 'x@y.fr' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 12, '12 cartes au total');
    const distinctes = new Set(etat.cards);
    t.eq(distinctes.size, 6, '6 valeurs distinctes');
    for (const v of distinctes) {
      t.eq(etat.cards.filter(c => c === v).length, 2, 'paire complète pour ' + v);
    }
    t.ok(Array.isArray(etat.innerCards), 'innerCards est un tableau (régression NodeList.filter)');
    t.eq(etat.innerCards.length, 12);
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(3, 1fr)', 'colonnes adaptées');
    t.eq(sb.alerts.length, 0, 'aucune alerte');
  });

  t.test('grille 5par5 / Chiens : 24 cartes jouables (plateau impair)', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'chiens', utilisateurTailleMemory: '5par5', utilisateurEmail: 'x@y.fr' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 24, '25 demandées, 24 jouables');
    t.eq(new Set(etat.cards).size, 12, '12 paires distinctes');
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(5, 1fr)');
    t.eq(sb.alerts.length, 0);
  });

  t.test('5par5 / Légumes : alerte de compatibilité puis repli sur 4par4', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '5par5', utilisateurEmail: 'x@y.fr' } });
    chargerCard(sb);
    t.eq(sb.alerts.length, 1, 'une alerte émise');
    t.includes(sb.alerts[0], 'ne compte que 8 cartes');
    t.includes(sb.alerts[0], '4 x 4', 'taille jouable suggérée');
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 16, 'repli automatique sur 4par4');
    t.eq(sb.grid.style.gridTemplateColumns, 'repeat(4, 1fr)');
  });

  t.test('thème absent du tableau : repli sur Légumes sans plantage', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'themeFantome', utilisateurTailleMemory: '4par3', utilisateurEmail: 'x@y.fr' } });
    chargerCard(sb);
    const etat = sb.run('__etat()');
    t.eq(etat.cards.length, 12);
    t.eq(new Set(etat.cards).size, 6);
  });

  t.test('chaque paire partage la même image', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'legumes', utilisateurTailleMemory: '4par3', utilisateurEmail: 'x@y.fr' } });
    chargerCard(sb);
    const parPaire = {};
    for (const el of sb.run('[...__cartes]')) {
      const src = el.children[0].children[0].src;
      const numero = src.match(/(\d+)\./)[1];
      (parPaire[el.getAttribute('data-attr')] ||= new Set()).add(numero);
    }
    for (const [v, images] of Object.entries(parPaire)) {
      t.eq(images.size, 1, 'paire ' + v + ' : une seule image');
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
    const cartes = sb.run('[...__cartes]');
    const groupes = {};
    cartes.forEach(el => { (groupes[el.getAttribute('data-attr')] ||= []).push(el); });
    for (const duo of Object.values(groupes)) {
      duo[0].listeners['click'][0]({ target: duo[0] });
      duo[1].listeners['click'][0]({ target: duo[1] });
    }
    t.includes(sb.els.advice.textContent, 'Bravo');
    t.includes(sb.els.score.textContent, '6 coups');
    const sauvegarde = JSON.parse(sb.storage['tableauUtilisateurConnecte']);
    t.eq(sauvegarde.length, 1);
    t.eq(sauvegarde[0].nom, 'joueur@eni.fr');
    t.eq(sauvegarde[0].score, '6');
    t.ok(typeof sauvegarde[0].time === 'number', 'temps de partie enregistré');
    t.eq(JSON.parse(sb.storage['tableau5DerniersScores']).length, 1);
  });

  t.test('enregistrementPseudoScore : temps stocké dans le localStorage', () => {
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

  t.test('showTableauDernierScore : tri par score, temps formaté, "-" sans temps', () => {
    const sb = createSandbox();
    sb.loadScript('js/card.js', `
      globalThis.__afficher = (la) => showTableauDernierScore(la, document.getElementById('tableScore'), 5);
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
    t.eq(sb.tableEl.rows.length, 4, 'en-tête conservé');
  });

  t.test('showTableauDernierScore : au plus 5 lignes', () => {
    const sb = createSandbox();
    sb.loadScript('js/card.js', `
      globalThis.__afficher = (la) => showTableauDernierScore(la, document.getElementById('tableScore'), 5);
    `);
    const lignes = [];
    for (let i = 1; i <= 8; i++) {
      lignes.push({ nom: 'j' + i, score: i, tailleMemory: '4par3', choixMemory: 'chiens', dateScore: 'x' });
    }
    sb.run('__afficher(' + JSON.stringify(lignes) + ')');
    t.eq(sb.tableEl.dataRows().length, 5);
  });

  t.test('scores sauvegardés affichés dès le chargement de la page', () => {
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
    t.eq(rows.length, 1, 'ligne affichée au chargement');
    t.eq(rows[0].cells[1].getText(), '4');
    t.eq(rows[0].cells[2].getText(), '1:00');
  });
};
