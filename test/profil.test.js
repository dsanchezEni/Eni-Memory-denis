/**
 * ENI-Memory - Tests de js/profil.js
 * - Helpers de compatibilité thème / taille de grille
 * - Formulaire de profil : acceptation et refus selon nombreCartes
 * - Affichage des dernières parties
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { PROJECT, createSandbox } = require('./helpers/dom');

const CODE_PROFIL = fs.readFileSync(path.join(PROJECT, 'js/profil.js'), 'utf8').replace(/\r/g, '');

function chargerProfil(sb) {
  sb.loadScript('js/profil.js', `
    globalThis.__api = {
      getInfosTheme, nbPairesPourTaille, formatTaillePourAffichage,
      nbPairesMaximumPourTheme, formatTemps, afficherDernieresParties,
      handleProfilSubmit,
    };
  `);
}

module.exports = (t) => {
  t.section('profil.js — fonctions pures');

  {
    const sb = createSandbox();
    chargerProfil(sb);
    const pur = sb.run('__api');

    t.test('nbPairesPourTaille : nombres de paires attendus', () => {
      t.eq(pur.nbPairesPourTaille('4par3'), 6);
      t.eq(pur.nbPairesPourTaille('4par4'), 8);
      t.eq(pur.nbPairesPourTaille('5par5'), 12);
      t.eq(pur.nbPairesPourTaille('3par3'), 4);
    });

    t.test('formatTemps formate en m:ss', () => {
      t.eq(pur.formatTemps(0), '0:00');
      t.eq(pur.formatTemps(59), '0:59');
      t.eq(pur.formatTemps(85), '1:25');
      t.eq(pur.formatTemps(600), '10:00');
    });

    t.test('formatTaillePourAffichage formate la taille', () => {
      t.eq(pur.formatTaillePourAffichage('4par3'), '4 x 3');
    });

    t.test('getInfosTheme retourne le thème ou null', () => {
      t.eq(pur.getInfosTheme('legumes').nombreCartes, 8);
      t.eq(pur.getInfosTheme('inconnu'), null);
      t.eq(pur.getInfosTheme(null), null);
    });

    t.test('nbPairesMaximumPourTheme : plus grande taille jouable', () => {
      t.eq(pur.nbPairesMaximumPourTheme(8), '4par4');
      t.eq(pur.nbPairesMaximumPourTheme(23), '5par5');
      t.eq(pur.nbPairesMaximumPourTheme(12), '5par5');
      t.eq(pur.nbPairesMaximumPourTheme(6), '4par3');
      t.eq(pur.nbPairesMaximumPourTheme(4), '3par3');
      t.eq(pur.nbPairesMaximumPourTheme(3), null, 'aucune taille jouable');
    });
  }

  t.section('profil.js — enregistrement des préférences');

  t.test('save refusé : thème trop petit pour la grille (alerte + rien enregistré)', () => {
    const sb = createSandbox({ localStorage: { utilisateurChoixMemory: 'initial', utilisateurTailleMemory: '4par3' } });
    chargerProfil(sb);
    sb.selectTaille.value = '5par5';
    sb.radioChoisi.value = 'legumes';
    sb.run('__api.handleProfilSubmit({ preventDefault() {} })');

    t.eq(sb.alerts.length, 1, 'une alerte est affichée');
    t.includes(sb.alerts[0], "Impossible d'enregistrer");
    t.includes(sb.alerts[0], 'ne contient que 8 cartes');
    t.includes(sb.alerts[0], '4par4', 'une taille proposée');
    t.eq(sb.storage['utilisateurChoixMemory'], 'initial', 'localStorage inchangé');
    t.eq(sb.storage['utilisateurTailleMemory'], '4par3');
    t.eq(sb.navigations.length, 0, 'pas de rechargement');
  });

  t.test('save accepté : thème compatible, préférences enregistrées + reload', () => {
    const sb = createSandbox();
    chargerProfil(sb);
    sb.selectTaille.value = '4par4';
    sb.radioChoisi.value = 'chiens';
    sb.run('__api.handleProfilSubmit({ preventDefault() {} })');

    t.eq(sb.alerts.length, 1);
    t.includes(sb.alerts[0], 'enregistrées');
    t.eq(sb.storage['utilisateurChoixMemory'], 'chiens');
    t.eq(sb.storage['utilisateurTailleMemory'], '4par4');
    t.includes(sb.navigations.join(','), 'reload', 'page rechargée après save');
  });

  t.test('save accepté : taille impaire 5par5 pour un thème assez grand', () => {
    const sb = createSandbox();
    chargerProfil(sb);
    sb.selectTaille.value = '5par5';
    sb.radioChoisi.value = 'chiens';
    sb.run('__api.handleProfilSubmit({ preventDefault() {} })');
    t.eq(sb.storage['utilisateurTailleMemory'], '5par5');
    t.eq(sb.alerts.length, 1);
    t.includes(sb.alerts[0], 'enregistrées');
  });

  t.section('profil.js — affichage des dernières parties');

  t.test('afficherDernieresParties : dernières parties de l\'utilisateur, temps inclus', () => {
    const sb = createSandbox({
      localStorage: {
        utilisateurEmail: 'moi@eni.fr',
        tableauUtilisateurConnecte: JSON.stringify([
          { nom: 'moi@eni.fr', score: '5', time: 85, tailleMemory: '4par3', choixMemory: 'chiens', dateScore: '12/05/2025' },
          { nom: 'moi@eni.fr', score: '9', tailleMemory: '4par4', choixMemory: 'legumes', dateScore: '01/01/2024' },
          { nom: 'autre@eni.fr', score: '1', time: 10, tailleMemory: '3par3', choixMemory: 'chiens', dateScore: '02/02/2025' },
        ]),
      },
    });
    chargerProfil(sb);
    sb.run('__api.afficherDernieresParties()');

    const rows = sb.tableEl.dataRows();
    t.eq(rows.length, 2, 'uniquement les parties de l\'utilisateur connecté');
    // plus récentes d'abord
    t.eq(rows[0].cells[4].getText(), 'legumes');
    t.eq(rows[0].cells[2].getText(), '-', 'ancien score sans temps');
    t.includes(rows[0].cells[5].getText(), '01/01/2024', 'la dernière partie enregistrée en premier');
    t.eq(rows[1].cells[2].getText(), '1:25');
  });

  t.test('afficherDernieresParties sans score : ligne "Pas encore de score enregistré"', () => {
    const sb = createSandbox({ localStorage: { utilisateurEmail: 'vide@eni.fr', tableauUtilisateurConnecte: '[]' } });
    chargerProfil(sb);
    sb.run('__api.afficherDernieresParties()');
    const rows = sb.tableEl.dataRows();
    t.eq(rows.length, 1);
    t.eq(rows[0].cells[0].getText(), 'Pas encore de score enregistré');
    t.eq(rows[0].cells[0].colSpan, 6, 'le placeholder couvre les 6 colonnes');
  });

  t.test('verifierConnexion redirige vers le formulaire de connexion', () => {
    const sb = createSandbox(); // pas d'utilisateurEmail
    chargerProfil(sb);
    sb.run('__api ? null : null');
    sb.loadScript('js/profil.js', 'globalThis.__verif = verifierConnexion;');
    sb.run('__verif()');
    t.includes(sb.navigations.join(','), 'formulaireConnecter.html');
  });
};
