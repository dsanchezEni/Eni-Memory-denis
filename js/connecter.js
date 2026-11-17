/**
 * ENI-Memory - Gestion de la connexion utilisateur
 * 
 * Ce fichier contient toute la logique liée à l'authentification :
 * - Vérification des identifiants
 * - Cryptage SHA-256 des mots de passe
 * - Gestion de la session utilisateur
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} e - L'événement de soumission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Vérifier si les champs sont remplis
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Crypter le mot de passe saisi
    const passwordHash = await hashPassword(password);
    
    // Récupérer les utilisateurs
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs')) || [];
    
    // Trouver l'utilisateur
    const utilisateur = utilisateurs.find(u => u.email === email && u.motDePasse === passwordHash);
    
    if (utilisateur) {
        // Sauvegarder la session
        localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateur));
        localStorage.setItem('utilisateurEmail', email);
        
        // Rediriger vers le profil
        window.location.href = 'profil.html';
    } else {
        alert('Email ou mot de passe incorrect');
    }
}

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
