/**
 * ENI-Memory - Gestion du profil utilisateur
 * 
 * Ce fichier contient toute la logique liée au profil utilisateur :
 * - Affichage des informations utilisateur
 * - Gestion des préférences (thème, taille de grille)
 * - Affichage des scores et historique
 * - Déconnexion
 */

// Tableau de correspondance des thèmes (dupliqué depuis card.js pour éviter les dépendances)

const tableauCorrespondanceMemoryImage = [
  {nom:"legumes",nomAffiche:"Légumes",img:"./ressources/memory-legume/memory_detail.png",chemin:"./ressources/memory-legume/",extension:"svg",nombreCartes:8},
  {nom:"animaux",nomAffiche:"Animaux",img:"./ressources/animaux/memory_detail_animaux.png",chemin:"./ressources/animaux/",extension:"webp",nombreCartes:28},
  {nom:"animauxAnimes",nomAffiche:"Animaux animés",img:"./ressources/animauxAnimes/memory_detail_animaux_animes.png",chemin:"./ressources/animauxAnimes/",extension:"webp",nombreCartes:8},
  {nom:"animauxDomestiques",nomAffiche:"Animaux Domestiques",img:"./ressources/animauxdomestiques/memory_detail_animaux_domestiques.png",chemin:"./ressources/animauxdomestiques/",extension:"jpg",nombreCartes:10},
  {nom:"chiens",nomAffiche:"Chiens",img:"./ressources/chiens/memory_details_chiens.png",chemin:"./ressources/chiens/",extension:"webp",nombreCartes:23},
  {nom:"dinosaures",nomAffiche:"Dinosaures",img:"./ressources/dinosaures/memory_detail_dinosaures.png",chemin:"./ressources/dinosaures/",extension:"jpg",nombreCartes:10},
  {nom:"dinosauresAvecNom",nomAffiche:"Dinosaures avec nom",img:"./ressources/dinosauresAvecNom/memory_details_dinosaures_avec_nom.png",chemin:"./ressources/dinosauresAvecNom/",extension:"jpg",nombreCartes:10},
  {nom:"alphabetScrabble",nomAffiche:"Lettre Scrablle",img:"./ressources/alphabet-scrabble/memory_detail_scrabble.png",chemin:"./ressources/alphabet-scrabble/",extension:"png",nombreCartes:26}
];

/**
 * Affiche un message depuis le tableau de correspondance
 * @param {Array} tableau - Tableau de correspondance
 * @param {string} nom - Nom à rechercher
 * @returns {string} - Nom affichable
 */
function afficheMessageDepuisTableau(tableau, nom) {
  if (tableau != null && tableau.length > 0 && nom != null) {
    for (const val of tableau) {
      if (val.nom == nom) {
        return val.nomAffiche;
      }
    }
  }
  return nom;
}

/**
 * Affiche les dernières parties de l'utilisateur
 */
function afficherDernieresParties() {
    const table = document.getElementById('tableScore');
    const email = localStorage.getItem('utilisateurEmail');
    const parties = JSON.parse(localStorage.getItem('tableauUtilisateurConnecte')) || [];
    
    // Vider le tableau (garder l'en-tête)
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    // Récupérer les parties de l'utilisateur connecté
    const partiesUtilisateur = parties
        .filter(p => p.nom === email)
        .slice()
        .reverse()
        .slice(0, 5);
    
    if (partiesUtilisateur.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'Pas encore de score enregistré';
        return;
    }
    
    partiesUtilisateur.forEach(partie => {
        const row = table.insertRow();
        row.insertCell(0).textContent = partie.nom;
        row.insertCell(1).textContent = partie.score;
        row.insertCell(2).textContent = typeof partie.time === 'number' ? formatTemps(partie.time) : '-';
        row.insertCell(3).textContent = partie.tailleMemory || 'N/A';
        row.insertCell(4).textContent = afficheMessageDepuisTableau(
            tableauCorrespondanceMemoryImage, 
            partie.choixMemory
        ) || 'N/A';
        row.insertCell(5).textContent = partie.dateScore;
    });
}

/**
 * Remplit le formulaire avec les données de l'utilisateur
 */
function remplirFormulaireUtilisateur() {
    const utilisateur = JSON.parse(localStorage.getItem('utilisateurConnecte'));
    if (utilisateur) {
        const nomInput = document.getElementById('user');
        const emailInput = document.getElementById('email');
        
        if (nomInput) nomInput.value = utilisateur.nom;
        if (emailInput) emailInput.value = utilisateur.email;
        
        // Sélectionner le thème
        const choixMemory = localStorage.getItem('utilisateurChoixMemory') || 'legumes';
        const themeRadio = document.querySelector(`input[value="${choixMemory}"]`);
        if (themeRadio) themeRadio.checked = true;
        
        // Sélectionner la taille
        const tailleMemory = localStorage.getItem('utilisateurTailleMemory') || '4par3';
        const tailleSelect = document.getElementById('tailleMemory');
        if (tailleSelect) tailleSelect.value = tailleMemory;
        
        // Afficher l'image du thème sélectionné
        afficherImageTheme(choixMemory);
    }
}

/**
 * Affiche l'image du thème sélectionné
 * @param {string} choixMemory - Nom du thème
 */
function afficherImageTheme(choixMemory) {
    const zoneImage = document.getElementById('zoneImage');
    if (!zoneImage) return;
    
    zoneImage.innerHTML = '';
    
    const theme = tableauCorrespondanceMemoryImage.find(t => t.nom === choixMemory);
    if (theme) {
        const img = document.createElement('img');
        img.src = theme.img;
        img.alt = theme.nomAffiche;
        img.style.maxWidth = '200px';
        zoneImage.appendChild(img);
    }
}

/**
 * Gère la soumission du formulaire de profil
 * @param {Event} e - Événement de soumission
 */
function handleProfilSubmit(e) {
    e.preventDefault();
    
    // Récupérer les valeurs
    const theme = document.querySelector('input[name="choixMemory"]:checked')?.value || 'legumes';
    const taille = document.getElementById('tailleMemory').value;
    
    // Vérifier que le thème contient assez de cartes pour la taille de la grille
    const infosTheme = getInfosTheme(theme);
    if (infosTheme) {
        const nbPairesDemandees = nbPairesPourTaille(taille);
        if (infosTheme.nombreCartes < nbPairesDemandees) {
            alert(
                `Impossible d'enregistrer : le Memory "${infosTheme.nomAffiche}" ne contient que ${infosTheme.nombreCartes} cartes, `
                + `or la grille ${formatTaillePourAffichage(taille)} demande ${nbPairesDemandees} paires.
`
                + `Choisissez un Memory avec au moins ${nbPairesDemandees} cartes, ou une taille plus petite (au maximum ${nbPairesMaximumPourTheme(infosTheme.nombreCartes)}).`
            );
            return;
        }
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('utilisateurChoixMemory', theme);
    localStorage.setItem('utilisateurTailleMemory', taille);
    
    // Afficher un message de confirmation
    alert('Vos préférences ont été enregistrées !');
    
    // Recharger pour appliquer les changements
    window.location.reload();
}

/**
 * Gère la déconnexion
 */
function handleDeconnexion() {
    localStorage.removeItem('utilisateurEmail');
    localStorage.removeItem('utilisateurConnecte');
    window.location.href = 'index.html';
}

/**
 * Vérifie si l'utilisateur est connecté et redirige si nécessaire
 */
function verifierConnexion() {
    if (!localStorage.getItem('utilisateurEmail')) {
        window.location.href = 'formulaireConnecter.html';
    }
}

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier la connexion
    verifierConnexion();
    
    // Remplir le formulaire
    remplirFormulaireUtilisateur();
    
    // Afficher les dernières parties
    afficherDernieresParties();
    
    // Gérer la soumission du formulaire
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleProfilSubmit);
    }
    
    // Gérer la déconnexion
    const deconnexionBtn = document.getElementById('deconnexion');
    if (deconnexionBtn) {
        deconnexionBtn.addEventListener('click', handleDeconnexion);
    }
    
    // Gérer le changement de thème (pour l'aperçu)
    const themeRadios = document.querySelectorAll('input[name="choixMemory"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            afficherImageTheme(this.value);
        });
    });
});

/**
 * Retourne les infos du thème choisi (nom, images disponibles) ou null
 */
function getInfosTheme(choixMemory) {
    if (choixMemory == null) return null;
    return tableauCorrespondanceMemoryImage.find(t => t.nom == choixMemory) || null;
}

/**
 * Calcule le nombre de paires nécessaires pour une taille "XparY"
 */
function nbPairesPourTaille(taille) {
    const [lignes, colonnes] = taille.split('par').map(Number);
    return Math.floor((lignes * colonnes) / 2);
}

/**
 * Formate une taille "4par3" en "4 x 3"
 */
function formatTaillePourAffichage(taille) {
    const [l, c] = taille.split('par').map(Number);
    return `${l} x ${c}`;
}

/**
 * Retourne la plus grande taille de grille jouable pour un thème
 * ayant nbCartes images, ou null si aucune ne convient
 */
function nbPairesMaximumPourTheme(nbCartes) {
    let meilleure = null;
    for (const taille of ['5par5', '4par4', '4par3', '3par3']) {
        if (nbPairesPourTaille(taille) <= nbCartes
            && (meilleure === null || nbPairesPourTaille(taille) > nbPairesPourTaille(meilleure))) {
            meilleure = taille;
        }
    }
    return meilleure;
}

/**
 * Formate un temps en secondes en minutes:secondes
 * @param {number} seconds - Temps en secondes
 * @returns {string} - Temps formaté (ex: "1:25")
 */
function formatTemps(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
