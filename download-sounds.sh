#!/bin/bash

# ============================================
# Script de téléchargement des sons pour ENI-Memory
# Version hors ligne
# ============================================

 echo "============================================"
 echo "Téléchargement des fichiers audio pour ENI-Memory"
 echo "============================================"
 echo

# Créer le dossier s'il n'existe pas
mkdir -p "ressources/sounds"
 echo "Dossier ressources/sounds créé."
 echo

# Vérifier si wget est disponible
if command -v wget &> /dev/null; then
    echo "wget est disponible, téléchargement en cours..."
    echo
    
    wget -O "ressources/sounds/background.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3"
    wget -O "ressources/sounds/cardFlip.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3"
    wget -O "ressources/sounds/match.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
    wget -O "ressources/sounds/victory.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3"
    
# Sinon essayer avec curl
elif command -v curl &> /dev/null; then
    echo "curl est disponible, téléchargement en cours..."
    echo
    
    curl -L -o "ressources/sounds/background.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3"
    curl -L -o "ressources/sounds/cardFlip.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3"
    curl -L -o "ressources/sounds/match.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
    curl -L -o "ressources/sounds/victory.mp3" "https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3"
else
    echo "Ni wget ni curl n'est disponible."
    echo "Veuillez télécharger manuellement les fichiers depuis:"
    echo "  ressources/sounds/README.md"
    echo
    exit 1
fi

 echo
 echo "============================================"
 echo "Téléchargement terminé !"
 echo "============================================"
 echo
 echo "Vous pouvez maintenant utiliser le jeu en mode hors ligne."
 echo

# Afficher la liste des fichiers téléchargés
if [ -f "ressources/sounds/background.mp3" ]; then
    echo "Fichiers téléchargés:"
    ls -lh "ressources/sounds/*.mp3"
else
    echo
    echo "Avertissement: Certains fichiers n'ont pas été téléchargés."
    echo "Veuillez consulter ressources/sounds/README.md pour des instructions manuelles."
fi

echo