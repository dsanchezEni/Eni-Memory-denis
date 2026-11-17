/**
 * ENI-Memory - Gestion des effets sonores et musique de fond
 * 
 * Ce fichier contient toute la logique liée à l'audio :
 * - Musique de fond (style Mario Bros)
 * - Effets sonores pour les interactions
 * - Gestion de l'activation/désactivation des sons
 */

// État du son
let audioEnabled = true;
let backgroundMusic = null;
let soundEffects = {
    cardFlip: null,
    match: null,
    victory: null
};

// Chemins locaux des fichiers audio pour utilisation hors ligne
// Pour activer les sons, téléchargez les fichiers depuis ressources/sounds/README.md
// et placez-les dans le dossier ressources/sounds/
const audioFiles = {
    // Musique de fond style Mario Bros (extrait)
    background: 'ressources/sounds/background.mp3',
    // Son de clic sur carte
    cardFlip: 'ressources/sounds/Choisir-Soleil.wav',
    // Son de paire trouvée
    match: 'ressources/sounds/Mamma-mia.wav',
    // Son de victoire (fanfare)
    victory: 'ressources/sounds/niveau-termine.wav'
};

/**
 * Vérifie si un fichier audio existe localement
 * @param {string} path - Chemin du fichier
 * @returns {Promise<boolean>} - True si le fichier existe
 */
async function checkAudioFileExists(path) {
    try {
        // Essaie de créer un objet Audio et de vérifier s'il peut être chargé
        const audio = new Audio(path);
        // On ne peut pas vérifier directement, mais on peut essayer de le pré-charger
        // Retourne true par défaut, la vérification se fera lors de la lecture
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Initialise les objets audio
 */
async function initAudio() {
    try {
        // Vérifier si les fichiers audio locaux existent
        // En mode hors ligne, si les fichiers n'existent pas, désactiver le son
        const hasAudioFiles = await Promise.all([
            checkAudioFileExists(audioFiles.background),
            checkAudioFileExists(audioFiles.cardFlip),
            checkAudioFileExists(audioFiles.match),
            checkAudioFileExists(audioFiles.victory)
        ]);
        
        // Si au moins un fichier est manquant, désactiver le son par défaut
        // et afficher un message
        if (hasAudioFiles.some(exists => !exists)) {
            //console.log('Certains fichiers audio sont manquants. Utilisation des URLs en ligne.');
            // On essaie avec les URLs en ligne en fallback
            // Mais pour une version purement hors ligne, on désactive
            audioEnabled = false;
            localStorage.setItem('audioEnabled', 'false');
        }
        
        // Charger la musique de fond
        backgroundMusic = new Audio(audioFiles.background);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        
        // Charger les effets sonores
        soundEffects.cardFlip = new Audio(audioFiles.cardFlip);
        soundEffects.cardFlip.volume = 0.5;
        
        soundEffects.match = new Audio(audioFiles.match);
        soundEffects.match.volume = 0.5;
        
        soundEffects.victory = new Audio(audioFiles.victory);
        soundEffects.victory.volume = 0.6;
        
        // Récupérer la préférence utilisateur
        const savedAudioState = localStorage.getItem('audioEnabled');
        if (savedAudioState !== null) {
            audioEnabled = savedAudioState === 'true';
        }
        
        // Démarrer la musique si activé
        if (audioEnabled) {
            playBackgroundMusic();
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation audio:', error);
        audioEnabled = false;
    }
}

/**
 * Joue la musique de fond
 */
function playBackgroundMusic() {
    if (backgroundMusic && audioEnabled) {
        backgroundMusic.play().catch(error => {
            //console.log('La lecture automatique est bloquée. L\'utilisateur doit interagir avec la page.');
        });
    }
}

/**
 * Arrête la musique de fond
 */
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

/**
 * Toggle l'état des sons
 */
function toggleAudio() {
    audioEnabled = !audioEnabled;
    localStorage.setItem('audioEnabled', audioEnabled);
    
    if (audioEnabled) {
        playBackgroundMusic();
        document.getElementById('audioIcon').src = 'ressources/sound-on.svg';
    } else {
        stopBackgroundMusic();
        document.getElementById('audioIcon').src = 'ressources/sound-off.svg';
    }
    
    return audioEnabled;
}

/**
 * Joue un effet sonore
 * @param {string} soundName - Nom de l'effet sonore ('cardFlip', 'match', 'victory')
 */
function playSound(soundName) {
    if (audioEnabled && soundEffects[soundName]) {
        // Réinitialiser pour permettre de jouer plusieurs fois
        soundEffects[soundName].currentTime = 0;
        soundEffects[soundName].play().catch(error => {
            //console.log('Erreur lors de la lecture du son:', error);
        });
    }
}

/**
 * Initialise l'icône de son dans l'interface
 */
function initAudioIcon() {
    const audioContainer = document.getElementById('audioContainer');
    if (!audioContainer) return;
    
    const icon = document.createElement('img');
    icon.id = 'audioIcon';
    icon.src = audioEnabled ? 'ressources/sound-on.svg' : 'ressources/sound-off.svg';
    icon.alt = audioEnabled ? 'Désactiver le son' : 'Activer le son';
    icon.style.cursor = 'pointer';
    icon.style.width = '30px';
    icon.style.height = '30px';
    icon.style.marginLeft = '10px';
    icon.title = audioEnabled ? 'Désactiver le son' : 'Activer le son';
    icon.addEventListener('click', toggleAudio);
    
    audioContainer.appendChild(icon);
}

// Initialiser automatiquement lors du chargement
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    initAudioIcon();
});
