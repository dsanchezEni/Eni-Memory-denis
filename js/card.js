/**
 * ENI-Memory - Gestion des cartes et du jeu Memory
 * 
 * Ce fichier contient toute la logique liée aux cartes Memory :
 * - Génération dynamique de la grille
 * - Gestion du retournement des cartes
 * - Détection des paires
 * - Timer et scoring
 * - Affichage des scores
 */

// Tableau de correspondance des thèmes Memory avec leurs ressources
var tableauCorrespondanceMemoryImage = [
  {nom:"legumes",nomAffiche:"Légumes",img:"./ressources/memory-legume/memory_detail.png",chemin:"./ressources/memory-legume/",extension:"svg",nombreCartes:8},
  {nom:"animaux",nomAffiche:"Animaux",img:"./ressources/animaux/memory_detail_animaux.png",chemin:"./ressources/animaux/",extension:"webp",nombreCartes:28},
  {nom:"animauxAnimes",nomAffiche:"Animaux animés",img:"./ressources/animauxAnimes/memory_detail_animaux_animes.png",chemin:"./ressources/animauxAnimes/",extension:"webp",nombreCartes:8},
  {nom:"animauxDomestiques",nomAffiche:"Animaux Domestiques",img:"./ressources/animauxdomestiques/memory_detail_animaux_domestiques.png",chemin:"./ressources/animauxdomestiques/",extension:"jpg",nombreCartes:10},
  {nom:"chiens",nomAffiche:"Chiens",img:"./ressources/chiens/memory_details_chiens.png",chemin:"./ressources/chiens/",extension:"webp",nombreCartes:23},
  {nom:"dinosaures",nomAffiche:"Dinosaures",img:"./ressources/dinosaures/memory_detail_dinosaures.png",chemin:"./ressources/dinosaures/",extension:"jpg",nombreCartes:10},
  {nom:"dinosauresAvecNom",nomAffiche:"Dinosaures avec nom",img:"./ressources/dinosauresAvecNom/memory_details_dinosaures_avec_nom.png",chemin:"./ressources/dinosauresAvecNom/",extension:"jpg",nombreCartes:10},
  {nom:"alphabetScrabble",nomAffiche:"Lettre Scrablle",img:"./ressources/alphabet-scrabble/memory_detail_scrabble.png",chemin:"./ressources/alphabet-scrabble/",extension:"png",nombreCartes:26}
];

// Tailles de plateau disponibles dans le formulaire du profil
const taillesProposees = ["5par5", "4par4", "4par3", "3par3"];

/**
 * Retourne l'objet du tableau correspondant au choix du Memory
 * @param {Array} tableau - Tableau de correspondance
 * @param {string} choixMemory - Choix du Memory
 * @returns {object|null} - Objet du thème ou null
 */
function getThemeMemory(tableau, choixMemory) {
  if (Array.isArray(tableau) && choixMemory != null) {
    return tableau.find(val => val.nom == choixMemory) || null;
  }
  return null;
}

/**
 * Formate une taille "4par3" en "4 x 3"
 */
function formatTaillePourAffichage(taille) {
  const [l, c] = taille.split('par').map(Number);
  return `${l} x ${c}`;
}

/**
 * Calcule le nombre de paires nécessaires pour une taille (ex: "4par3" -> 6)
 * Les tailles impaires (ex: "5par5") laissent la carte en trop non jouable.
 */
function nbPairesPourTaille(taille) {
  const [lignes, colonnes] = taille.split('par').map(Number);
  return Math.floor((lignes * colonnes) / 2);
}

/**
 * Propose, parmi les tailles disponibles, la plus grande compatible
 * avec le nombre de cartes du thème choisi
 * @param {number} nbCartes - Nombre de cartes disponibles dans le thème
 * @returns {string} - Taille au format "XparY"
 */
function trouverTailleCompatible(nbCartes) {
  let meilleure = null;
  for (const taille of taillesProposees) {
    const nbPaires = nbPairesPourTaille(taille);
    if (nbPaires <= nbCartes && (meilleure === null || nbPaires > meilleure.nbPaires)) {
      meilleure = { taille, nbPaires };
    }
  }
  return meilleure ? meilleure.taille : "4par3";
}

/**
 * Tire au hasard nb numéros d'images distincts parmi 1 à nbDisponibles
 * @param {number} nb - Nombre d'images à tirer
 * @param {number} nbDisponibles - Nombre de cartes disponibles dans le thème
 * @returns {number[]}
 */
function tirerNumerosImages(nb, nbDisponibles) {
  const max = Number.isFinite(nbDisponibles) ? nbDisponibles : nb;
  const numeros = [];
  for (let i = 1; i <= max; i++) {
    numeros.push(i);
  }
  for (let i = numeros.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
  }
  return numeros.slice(0, nb);
}

function afficheMessageDepuisTableau(tableau,nom){
  if(tableau!=null && tableau.length>0 && nom!=null){
    for (const val of tableau)
    {
      if(val.nom==nom){
        return val.nomAffiche;
      }
    }
    return nom;
  }else{
    return nom;
  }
}

// Variables globales
let cards = [];
let innerCards = [];
//var pseudo = prompt("Veuillez saisir votre pseudo pour enregistrer les résultats !");
pseudo = localStorage.getItem("utilisateurEmail") || "";
let refTable = document.getElementById("tableScore");
let tableau5DerniersScoresLu =   localStorage.getItem("tableau5DerniersScores");
let tableau5DerniersScores =JSON.parse(tableau5DerniersScoresLu)|| [];
let timerElement = document.getElementById("timer");
let startTime = null;
let timerInterval = null;


const nbLigneAvantSuppression = 5;

/**
 * Vide un tableau HTML en conservant l'en-tête
 * @param {HTMLTableElement} elementAVider - Tableau à vider
 */
function vider(elementAVider) {
  const tailleTableau = elementAVider.rows.length;
  let cpt = 2;
  while (tailleTableau >= cpt) {
    refTable.deleteRow(1);
    cpt++;
  }
}

function showTableauDernierScore(tableau,refTable,nbLigneAvantSuppression){
  
  let totalNbLignesTableau = refTable.rows.length;
  if(tableau!=null){
     let index=1;
     vider(refTable);
    /*if(tableau.length>nbLigneAvantSuppression){
      index=tableau.length-nbLigneAvantSuppression;
    }*/
    for (const ligne of tableau.sort((a,b)=>a.score-b.score)) {
         
          if(ligne!=null && index <= nbLigneAvantSuppression){
              // Insère une ligne dans la table à l'indice de ligne 0
              let nouvelleLigne = refTable.insertRow(index);

              // Insère une cellule dans la ligne à l'indice 0
              let nouvelleCellulePseudo = nouvelleLigne.insertCell(0);
              let nouvelleCelluleScore = nouvelleLigne.insertCell(1);
              let nouvelleCelluleTemps = nouvelleLigne.insertCell(2);
              let nouvelleCelluleTaille = nouvelleLigne.insertCell(3);
              let nouvelleCelluleChoixMemory = nouvelleLigne.insertCell(4);
              let nouvelleCelluleDate = nouvelleLigne.insertCell(5);

              // Ajoute un nœud texte à la cellule
              let nouveauTexte = document.createTextNode(ligne.nom);
              nouvelleCellulePseudo.appendChild(nouveauTexte);
              nouveauTexte = document.createTextNode(ligne.score);
              nouvelleCelluleScore.appendChild((nouveauTexte));
              nouveauTexte = document.createTextNode(typeof ligne.time === "number" ? formatTime(ligne.time) : "-");
              nouvelleCelluleTemps.appendChild((nouveauTexte));
              nouveauTexte = document.createTextNode(ligne.tailleMemory);
              nouvelleCelluleTaille.appendChild((nouveauTexte));

              nouveauTexte = document.createTextNode(afficheMessageDepuisTableau(tableauCorrespondanceMemoryImage,ligne.choixMemory));
              nouvelleCelluleChoixMemory.appendChild(nouveauTexte);

              nouveauTexte = document.createTextNode(ligne.dateScore);
              nouvelleCelluleDate.appendChild((nouveauTexte));
              index++;
          }
      }
  }

}

function shuffleCards(){
  // Chaque carte reçoit une position unique, calculée d'après le nombre
  // réel de cartes du plateau (mélange Fisher-Yates)
  const cartesMelangees = Array.from(cards);
  for (let i = cartesMelangees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cartesMelangees[i], cartesMelangees[j]] = [cartesMelangees[j], cartesMelangees[i]];
  }
  cartesMelangees.forEach((carte, index) => {
    carte.style.order = index;
  })
}
shuffleCards()

cards.forEach(card => card.addEventListener("click", flipACard))

let lockedCards = false;
let cardsPicked = []
function flipACard(e) {
  if(lockedCards) return;
  
  // Démarrer le timer au premier clic
  if (startTime === null) {
    startTimer();
  }
  
  saveCard(e.target.children[0], e.target.getAttribute("data-attr"))
  
  // Jouer le son de clic sur carte
  if (typeof playSound === 'function') {
    playSound('cardFlip');
  }

  if(cardsPicked.length === 2) result()
}

function saveCard(el, value) {
  if(el === cardsPicked[0]?.el) return;

  el.classList.add("active");
  cardsPicked.push({el, value});
}

function result(){
  saveNumberOftries()

  if(cardsPicked[0].value === cardsPicked[1].value){
    cardsPicked[0].el.parentElement.removeEventListener("click", flipACard)
    cardsPicked[1].el.parentElement.removeEventListener("click", flipACard)
    
    // Jouer le son de paire trouvée
    if (typeof playSound === 'function') {
      playSound('match');
    }
    
    cardsPicked = [];
    return;
  }

  lockedCards = true;
  setTimeout(() => {
    cardsPicked[0].el.classList.remove("active");
    cardsPicked[1].el.classList.remove("active");
    cardsPicked = [];
    lockedCards = false;
  }, 1000)
}

// innerCards will be populated by genererGrille()
const advice = document.querySelector(".advice");
const score = document.querySelector(".score")


let numberOfTries = 0;
function saveNumberOftries() {
  numberOfTries++;
  const checkForEnd = innerCards.filter(card => !card.classList.contains("active"))

  if(!checkForEnd.length) {
    const elapsedTime = stopTimer();
    
    // Jouer le son de victoire
    if (typeof playSound === 'function') {
      playSound('victory');
    }
    
    advice.textContent = `Bravo ! Vous avez gagné en ${formatTime(elapsedTime)} !`;
    score.textContent = `Votre score final : ${numberOfTries} coups`;

    // Enregistrement du score avec le temps
    enregistrementPseudoScore(pseudo, numberOfTries, elapsedTime);
    return;
  }
  score.textContent = `Nombre de coups : ${numberOfTries}`;
}

window.addEventListener("keydown", handleRestart)

let shuffleLock = false;
function handleRestart(e) {
  e.preventDefault()
  if(e.keyCode === 32) {
    innerCards.forEach(card => card.classList.remove("active"))
    advice.textContent = `Tentez de gagner avec le moins d'essais possible.`
    score.textContent = `Nombre de coups : 0`
    numberOfTries = 0;
    
    // Réinitialiser le timer
    stopTimer();
    if (timerElement) timerElement.textContent = `Temps : 0:00`;
    
    cards.forEach(card => card.addEventListener("click", flipACard))

    if(shuffleLock) return;
    shuffleLock = true;
    setTimeout(() => {
      shuffleCards()
      shuffleLock = false;
    }, 600)
  }
}


function mettreAJourCartesDepuisTableau(tableau,choixMemory){
  if(tableau!=null && tableau.length>0){
    for (const val of tableau)
    {
      if(val.nom==choixMemory){
        let objetCarte= {"chemin":val.chemin,"extension":val.extension};
        return objetCarte;
        break;
      }
    }
  }
}

let objetCarte = mettreAJourCartesDepuisTableau(tableauCorrespondanceMemoryImage,localStorage.getItem("utilisateurChoixMemory"));

function afficherCartes(objetCarte) {
    if (!objetCarte || !objetCarte.chemin) {
        return;
    }

    const { chemin, extension } = objetCarte;
    const cartes = document.querySelectorAll('[id^="carte"]');

    cartes.forEach(carte => {
        const id = carte.id;
        const numero = id.replace('carte', '');
        carte.src = `${chemin}${numero}.${extension}`;
    });
}

function mettreAJourCartes() {
    const choix = localStorage.getItem("utilisateurChoixMemory") || "legumes";
    const objetCarte = mettreAJourCartesDepuisTableau(tableauCorrespondanceMemoryImage, choix);
    afficherCartes(objetCarte);
}

mettreAJourCartes();
chargerGrille();

// Afficher les 5 derniers scores enregistrés au chargement de la page
showTableauDernierScore(tableau5DerniersScores, refTable, nbLigneAvantSuppression);

/**
 * Génère dynamiquement la grille de Memory en fonction de la taille
 * @param {string} taille - Taille au format "XparY" (ex: "4par3")
 */
function genererGrille(taille) {
    const grid = document.getElementById('memoryGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Parser la taille (ex: "4par3" -> [4, 3])
    const dimensions = taille.split('par').map(Number);
    let lignes = dimensions[0] || 4;
    let colonnes = dimensions[1] || 3;
    
    // Récupérer le thème actuel
    const choix = localStorage.getItem("utilisateurChoixMemory") || "legumes";
    const theme = getThemeMemory(tableauCorrespondanceMemoryImage, choix);
    const themeUtilise = theme || getThemeMemory(tableauCorrespondanceMemoryImage, "legumes");
    const { chemin, extension } = themeUtilise;
    
    // Nombre de cartes réellement disponibles pour ce thème
    const nbCartesDisponibles = typeof themeUtilise.nombreCartes === "number"
        ? themeUtilise.nombreCartes
        : Infinity;
    
    // Nombre de paires nécessaires pour remplir le plateau
    let nbPaires = nbPairesPourTaille(`${lignes}par${colonnes}`);
    
    // Vérifier que le choix du Memory peut correspondre à la taille du plateau
    if (nbPaires > nbCartesDisponibles) {
        const tailleProposee = trouverTailleCompatible(nbCartesDisponibles);
        alert(
            `Le Memory "${themeUtilise.nomAffiche}" ne compte que ${nbCartesDisponibles} cartes.
`
            + `Une grille ${formatTaillePourAffichage(`${lignes}par${colonnes}`)} demande ${nbPaires} paires : ce choix n'est pas possible.
`
            + `Suggestion : passez la taille du plateau à ${formatTaillePourAffichage(tailleProposee)} (${nbPairesPourTaille(tailleProposee)} paires), `
            + `ou choisissez un Memory avec au moins ${nbPaires} cartes.`
        );
        
        // On applique la taille proposée pour que la partie reste jouable
        const dimsProposees = tailleProposee.split('par').map(Number);
        lignes = dimsProposees[0];
        colonnes = dimsProposees[1];
        nbPaires = nbPairesPourTaille(tailleProposee);
    }
    
    // Adapter le nombre de colonnes du plateau à la taille choisie
    grid.style.gridTemplateColumns = `repeat(${colonnes}, 1fr)`;
    
    // Par sécurité : jamais plus de paires que d'images disponibles
    nbPaires = Math.min(nbPaires, nbCartesDisponibles);
    
    // Tirer au hasard les images utilisées parmi celles du thème
    const numerosTires = tirerNumerosImages(nbPaires, nbCartesDisponibles);
    
    // Créer les paires (numero, numero, ...) : le bon nombre de cartes
    const paires = [];
    numerosTires.forEach(numero => {
        paires.push(numero, numero);
    });
    
    // Mélanger les paires
    paires.sort(() => Math.random() - 0.5);
    
    // Créer les cartes ; chaque paire affiche bien la même image
    paires.forEach((numero, index) => {
        const carte = document.createElement('div');
        carte.className = 'card';
        carte.setAttribute('data-attr', numero);
        carte.innerHTML = `
            <div class="double-face">
                <div class="face">
                    <img src="${chemin}${numero}.${extension}" id="carte${index + 1}" />
                </div>
                <div class="back"><img src="ressources/question.svg" /></div>
            </div>
        `;
        grid.appendChild(carte);
    });
    
    // Re-sélectionner toutes les cartes pour le jeu
    cards = document.querySelectorAll(".card");
    // Array.from : seuls les tableaux exposent .filter, utilisé pour détecter la fin de partie
    innerCards = Array.from(document.querySelectorAll(".double-face"));
    
    // Réattribuer les écouteurs d'événements
    cards.forEach(card => card.addEventListener("click", flipACard));
}

/**
 * Formate le temps en minutes:secondes
 * @param {number} seconds - Temps en secondes
 * @returns {string} - Temps formaté (ex: "1:25")
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Démarre le timer
 */
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Met à jour l'affichage du timer
 */
function updateTimer() {
    if (!timerElement) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Temps : ${formatTime(elapsed)}`;
}

/**
 * Arrête le timer et retourne le temps écoulé
 * @returns {number} - Temps écoulé en secondes
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
}

/**
 * Charger la grille avec la taille sélectionnée par l'utilisateur
 */
function chargerGrille() {
    const tailleMemory = localStorage.getItem('utilisateurTailleMemory') || '4par3';
    genererGrille(tailleMemory);
}


function enregistrementPseudoScore(pseudo, score, time = 0) {
  localStorage.setItem("utilisateurConnecteDerniersScores", `${score}`);
  
  const utilisateurTailleMemoryLu = localStorage.getItem("utilisateurTailleMemory");
  const utilisateurChoixMemoryLu = localStorage.getItem("utilisateurChoixMemory");
  const infoUtilisateurConnecte = {
    "nom": pseudo,
    "score": `${score}`,
    "tailleMemory": utilisateurTailleMemoryLu,
    "choixMemory": utilisateurChoixMemoryLu,
    "dateScore": new Date().toLocaleDateString("fr"),
    "time": time
  };

  let tableauUtilisateurConnecteLu = localStorage.getItem("tableauUtilisateurConnecte");
  let tableauUtilisateurConnecte = JSON.parse(tableauUtilisateurConnecteLu) || [];
  tableauUtilisateurConnecte.push(infoUtilisateurConnecte);

  // Récupération Des derniers scores
  let tableau5DerniersScoresLu = localStorage.getItem("tableau5DerniersScores");
  let tableau5DerniersScores = JSON.parse(tableau5DerniersScoresLu) || [];
  tableau5DerniersScores.push(infoUtilisateurConnecte);
  
  localStorage.setItem("tableau5DerniersScores", JSON.stringify(tableau5DerniersScores));
  localStorage.setItem("tableauUtilisateurConnecte", JSON.stringify(tableauUtilisateurConnecte));
  showTableauDernierScore(tableau5DerniersScores, refTable, nbLigneAvantSuppression);
}