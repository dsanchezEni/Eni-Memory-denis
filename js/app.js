/**
 * ENI-Memory - Gestion de l'inscription et validation des formulaires
 * 
 * Ce fichier contient toute la logique liée à :
 * - La validation du formulaire d'inscription
 * - Le cryptage SHA-256 des mots de passe
 * - L'enregistrement des utilisateurs dans localStorage
 * - La gestion des préférences utilisateur
 */

const inputsValidity = {
  user: false,
  email: false,
  password: false, 
  passwordConfirmation: false,
  age: false
}

const form = document.querySelector("form");
const container = document.querySelector(".container");

/**
 * Crypte un mot de passe en utilisant SHA-256
 * @param {string} password - Le mot de passe à crypter
 * @returns {Promise<string>} - Le hash du mot de passe
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

form.addEventListener("submit", handleForm)

let isAnimating = false;
async function handleForm(e){
  e.preventDefault()

  const keys = Object.keys(inputsValidity)
  const failedInputs = keys.filter(key => !inputsValidity[key])
  
  if(failedInputs.length && !isAnimating) {
    isAnimating = true;
    container.classList.add("shake");

    setTimeout(() =>{
      container.classList.remove("shake")
      isAnimating = false;
    }, 400)

    failedInputs.forEach(input => {
      const index = keys.indexOf(input)
      showValidation({index: index, validation: false})
    })
  }
  else {
    alert("Données envoyées avec succès.")
    let nom = userInput.value;
    let email = mailInput.value;
    let motDePasse = pswInput.value;
    let age = ageInput.value;
    const success = await enregistrerUtilisateurLocalStorage(nom, email, motDePasse, age);
    if (success) {
      document.location.href="./formulaireConnecter.html";
    }
  }

}


async function enregistrerUtilisateurLocalStorage(nom, email, motDePasse, age) {
  // Récupération du localStorage
  let utilisateurs = localStorage.getItem("utilisateurs");
  utilisateurs = JSON.parse(utilisateurs) || [];
  
  let error = 0;
  if (utilisateurs != null && utilisateurs.length > 0) {
    for (const utilisateur of utilisateurs) {
      if (email === utilisateur.email) {
        alert("L'email " + email + " est déjà utilisé, Veuillez saisir un nouvel email!");
        error = 1;
        break;
      }
    }
  }
  
  if (error === 1) {
    return false;
  } else {
    // Crypter le mot de passe
    const motDePasseHash = await hashPassword(motDePasse);
    
    let utilisateur = {
      "nom": nom,
      "email": email,
      "motDePasse": motDePasseHash,
      "age": age
    };
    utilisateurs.push(utilisateur);
    localStorage.setItem("utilisateurEmail", utilisateur.email);
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    return true;
  }
}

function showValidation({index, validation}) {
  if(validation){
    validationIcons[index].style.display = "inline";
    validationIcons[index].src = "ressources/check.svg";
    if(validationTexts[index])  validationTexts[index].style.display = "none";
  } 
  else {
    validationIcons[index].style.display = "inline";
    validationIcons[index].src = "ressources/error.svg";
    if(validationTexts[index]) validationTexts[index].style.display = "block";
  }
}


const validationIcons = document.querySelectorAll(".icone-verif");
const validationTexts = document.querySelectorAll(".error-msg");

const userInput = document.querySelector(".input-group:nth-child(1) input")

userInput.addEventListener("blur", userValidation)
userInput.addEventListener("input", userValidation)

function userValidation(){
  if(userInput.value.length >= 3) {
    showValidation({index: 0, validation: true})
    inputsValidity.user = true;
  }
  else {
    showValidation({index: 0, validation: false})
    inputsValidity.user = false;
  }
}

const mailInput = document.querySelector(".input-group:nth-child(2) input")

mailInput.addEventListener("blur", mailValidation)
mailInput.addEventListener("input", mailValidation)

const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

function mailValidation(){
  if(regexEmail.test(mailInput.value)){
    showValidation({index: 1, validation: true})
    inputsValidity.email = true;

  }
  else {
    showValidation({index: 1, validation: false})
    inputsValidity.email = false;

  }
}

const pswInput = document.querySelector(".input-group:nth-child(3) input")

pswInput.addEventListener("blur", passwordValidation)
pswInput.addEventListener("input", passwordValidation)

const passwordVerification = {
  length: false,
  symbol: false,
  number: false
}

const regexList = {
  symbol: /[^a-zA-Z0-9\s]/,
  number: /[0-9]/
}

let passwordValue;

function passwordValidation(){
  passwordValue = pswInput.value;
  let validationResult = 0;

  for(const prop in passwordVerification){
    
    if(prop === "length") {
      if(passwordValue.length < 6) {
        passwordVerification.length = false;
      }
      else {
        passwordVerification.length = true;
        validationResult++;
      }
      continue;
    }

    if(regexList[prop].test(passwordValue)) {
      passwordVerification[prop] = true;
      validationResult++;
    } 
    else {
      passwordVerification[prop] = false;
    }
  }

  if(validationResult !== 3) {
    showValidation({index: 2, validation: false})
    inputsValidity.password = false;

  }
  else {
    showValidation({index: 2, validation: true})
    inputsValidity.password = true;

  }

  passwordStrength()
}

const lines = document.querySelectorAll(".lines div")

function passwordStrength(){
  const passwordLength = pswInput.value.length;
  
  if(!passwordLength) {
    addLines(0)
  }
  else if(passwordLength > 9 && passwordVerification.symbol && passwordVerification.number) {
    addLines(3)
  }
  else if(passwordLength > 6 && passwordVerification.symbol || passwordVerification.number) {
    addLines(2)
  }
  else {
    addLines(1)
  }

  function addLines(numberOfLines) {
    lines.forEach((el, index) => {
      if(index < numberOfLines) {
        el.style.display = "block"
      }
      else {
        el.style.display = "none"
      }
    })
  }

  if(validationIcons[3].style.display === "inline") {
    confirmPassword()
  }
}


const confirmInput = document.querySelector(".input-group:nth-child(4) input")

confirmInput.addEventListener("blur", confirmPassword)
confirmInput.addEventListener("input", confirmPassword)

function confirmPassword(){
  const confirmedValue = confirmInput.value;

  if(!confirmedValue && !passwordValue) {
    validationIcons[3].style.display = "none";
  }
  else if(confirmedValue !== passwordValue) {
    showValidation({index: 3, validation: false})
    inputsValidity.passwordConfirmation = false;
  }
  else {
    showValidation({index: 3, validation: true})
    inputsValidity.passwordConfirmation = true;
  }
}


const ageInput = document.querySelector(".input-group:nth-child(5) input");

ageInput.addEventListener("blur", ageValidation);
ageInput.addEventListener("input", ageValidation);

function ageValidation(){
  const ageValue = parseInt(ageInput.value);
  
  if(isNaN(ageValue) || ageValue < 13) {
    showValidation({index: 4, validation: false});
    inputsValidity.age = false;
  }
  else {
    showValidation({index: 4, validation: true});
    inputsValidity.age = true;
  }
}