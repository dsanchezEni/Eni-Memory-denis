/**
 * ENI-Memory - Tests de js/app.js (inscription)
 * - Validation du pseudo, email, mot de passe, âge
 * - Hash SHA-256 du mot de passe
 * - Enregistrement dans localStorage + refus d'un email déjà utilisé
 */

'use strict';

const path = require('path');
const { PROJECT, createSandbox, FakeNode } = require('./helpers/dom');

function creerInputs(sb) {
  const inputs = {
    user: new FakeNode('input'),
    mail: new FakeNode('input'),
    psw: new FakeNode('input'),
    confirm: new FakeNode('input'),
    age: new FakeNode('input'),
  };
  sb.selectors = {
    '.input-group:nth-child(1) input': inputs.user,
    '.input-group:nth-child(2) input': inputs.mail,
    '.input-group:nth-child(3) input': inputs.psw,
    '.input-group:nth-child(4) input': inputs.confirm,
    '.input-group:nth-child(5) input': inputs.age,
    '.container': new FakeNode('div'),
  };
  return inputs;
}

function chargerApp(sb) {
  sb.loadScript('js/app.js', `
    globalThis.__api = {
      hashPassword,
      enregistrerUtilisateurLocalStorage,
      userValidation, mailValidation, passwordValidation, confirmPassword, ageValidation,
      handleForm,
    };
    globalThis.__validite = inputsValidity;
  `);
}

module.exports = (t) => {
  t.section('app.js — validation des champs d\'inscription');

  let sb, inputs;
  const fresh = () => {
    sb = createSandbox();
    inputs = creerInputs(sb);
    // injecter les sélecteurs dans la sandbox AVANT le chargement du script
    const docQ = sb.sandbox.document.querySelector.bind(sb.sandbox.document);
    sb.sandbox.document.querySelector = (sel) => (sb.selectors && sel in sb.selectors) ? sb.selectors[sel] : docQ(sel);
    chargerApp(sb);
    return sb;
  };

  t.test('userValidation : pseudo à 3 caractères minimum', () => {
    fresh();
    inputs.user.value = 'ab';
    sb.run('__api.userValidation()');
    t.eq(sb.run('__validite.user'), false, '2 caractères : invalide');
    inputs.user.value = 'abc';
    sb.run('__api.userValidation()');
    t.eq(sb.run('__validite.user'), true, '3 caractères : valide');
  });

  t.test('mailValidation : format email', () => {
    fresh();
    inputs.mail.value = 'adresse-invalide';
    sb.run('__api.mailValidation()');
    t.eq(sb.run('__validite.email'), false, 'sans @ : invalide');
    inputs.mail.value = 'user@eni.fr';
    sb.run('__api.mailValidation()');
    t.eq(sb.run('__validite.email'), true, 'email correct : valide');
  });

  t.test('passwordValidation : longueur, chiffre et symbole requis', () => {
    fresh();
    inputs.psw.value = 'court';
    sb.run('__api.passwordValidation()');
    t.eq(sb.run('__validite.password'), false, 'mot de passe trop court');

    inputs.psw.value = 'longmaisfaible';
    sb.run('__api.passwordValidation()');
    t.eq(sb.run('__validite.password'), false, 'sans chiffre ni symbole : invalide');

    inputs.psw.value = 'LongEt1x!';
    sb.run('__api.passwordValidation()');
    t.eq(sb.run('__validite.password'), true, 'long + chiffre + symbole : valide');
  });

  t.test('ageValidation : 13 ans minimum', () => {
    fresh();
    inputs.age.value = '12';
    sb.run('__api.ageValidation()');
    t.eq(sb.run('__validite.age'), false, '12 ans : invalide');
    inputs.age.value = '13';
    sb.run('__api.ageValidation()');
    t.eq(sb.run('__validite.age'), true, '13 ans : valide');
  });

  t.test('confirmPassword : confirmation identique au mot de passe', () => {
    fresh();
    inputs.psw.value = 'LongEt1x!';
    inputs.psw.fire = () => {};
    sb.run('__api.passwordValidation()');
    inputs.confirm.value = 'different';
    sb.run('__api.confirmPassword()');
    t.eq(sb.run('__validite.passwordConfirmation'), false, 'différente : invalide');
    inputs.confirm.value = 'LongEt1x!';
    sb.run('__api.confirmPassword()');
    t.eq(sb.run('__validite.passwordConfirmation'), true, 'identique : valide');
  });

  t.section('app.js — enregistrement des utilisateurs');

  t.test('hashPassword produit un SHA-256 hexadécimal de 64 caractères', async () => {
    fresh();
    const hash = await sb.run('__api.hashPassword("动向Test123!")');
    t.eq(hash.length, 64, '64 caractères');
    t.ok(/^[0-9a-f]{64}$/.test(hash), 'hexadécimal minuscule');
  });

  t.test('enregistrerUtilisateurLocalStorage : première inscription acceptée', async () => {
    fresh();
    const ok1 = await sb.run('__api.enregistrerUtilisateurLocalStorage("Dupont", "dupont@eni.fr", "LongEt1x!", "25")');
    t.eq(ok1, true);
    const stockes = JSON.parse(sb.storage['utilisateurs']);
    t.eq(stockes.length, 1);
    t.eq(stockes[0].email, 'dupont@eni.fr');
    t.ok(/^[0-9a-f]{64}$/.test(stockes[0].motDePasse), 'mot de passe hashé (jamais en clair)');
    t.ok(!JSON.stringify(stockes).includes('LongEt1x!'), 'le mot de passe en clair n\'est stocké nulle part');
    t.eq(sb.storage['utilisateurEmail'], 'dupont@eni.fr');
  });

  t.test('enregistrerUtilisateurLocalStorage : email en double refusé', async () => {
    fresh();
    await sb.run('__api.enregistrerUtilisateurLocalStorage("Dupont", "dupont@eni.fr", "LongEt1x!", "25")');
    const ok2 = await sb.run('__api.enregistrerUtilisateurLocalStorage("Autre", "dupont@eni.fr", "Autre1x!", "30")');
    t.eq(ok2, false, 'inscription refusée');
    t.eq(JSON.parse(sb.storage['utilisateurs']).length, 1, 'aucun doublon stocké');
  });
};
