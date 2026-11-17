# Dossier des Sons - ENI-Memory

Ce dossier doit contenir les fichiers audio pour une utilisation **hors ligne** du jeu.

## 📁 Fichiers Nécessaires

| Fichier | Description | Source (Téléchargement) |
|---------|-------------|------------------------|
| `background.mp3` | Musique de fond (style Mario Bros) | [Télécharger](https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3) |
| `cardFlip.mp3` | Son de clic sur carte | [Télécharger](https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3) |
| `match.mp3` | Son de paire trouvée | [Télécharger](https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3) |
| `victory.mp3` | Son de victoire | [Télécharger](https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3) |

## 📥 Instructions de Téléchargement

### Méthode 1 : Téléchargement Manuel
1. Cliquez sur chaque lien ci-dessus
2. Faites un clic droit sur le bouton de lecture/lecteur audio
3. Sélectionnez "Enregistrer le son sous..." ou "Save audio as..."
4. Enregistrez chaque fichier dans ce dossier (`ressources/sounds/`)
5. Renommez les fichiers comme indiqué dans le tableau ci-dessus

### Méthode 2 : Utilisation de wget (Linux/Mac/WSL)
```bash
cd ressources/sounds/
wget -O background.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3"
wget -O cardFlip.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3"
wget -O match.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
wget -O victory.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3"
```

### Méthode 3 : Utilisation de curl (Mac/Linux)
```bash
cd ressources/sounds/
curl -L -o background.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jingle-216.mp3"
curl -L -o cardFlip.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3"
curl -L -o match.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
curl -L -o victory.mp3 "https://assets.mixkit.co/sfx/preview/mixkit-level-up-or-happy-announcement-2058.mp3"
```

## ⚠️ Important

- **Format** : Les fichiers doivent être en MP3
- **Nom** : Respectez exactement les noms de fichiers (respectez la casse)
- **Emplacement** : Les fichiers doivent être dans `ressources/sounds/`
- **Licence** : Tous ces sons proviennent de [Mixkit](https://mixkit.co/) et sont **libres de droits** pour usage commercial et personnel

## ✅ Vérification

Une fois les fichiers téléchargés, vérifiez que vous avez bien :
```
ressources/
  sounds/
    ├── background.mp3
    ├── cardFlip.mp3
    ├── match.mp3
    └── victory.mp3
```

## 🎵 Sons Alternatifs

Si vous préférez utiliser d'autres sons, vous pouvez :
1. Trouver des sons gratuits sur :
   - [Mixkit](https://mixkit.co/free-sound-effects/)
   - [Freesound](https://freesound.org/)
   - [Zapsplat](https://www.zapsplat.com/)
   - [MyNoise](https://mynoise.net/NoiseMachines/8bitRetroGameSoundsGenerator.php)

2. Renommez vos fichiers pour correspondre aux noms attendus

## 📝 Notes Techniques

Le fichier `js/audio.js` est configuré pour utiliser les chemins locaux :
```javascript
const audioFiles = {
    background: 'ressources/sounds/background.mp3',
    cardFlip: 'ressources/sounds/cardFlip.mp3',
    match: 'ressources/sounds/match.mp3',
    victory: 'ressources/sounds/victory.mp3'
};
```

Si vous changez les noms ou l'emplacement des fichiers, vous devez aussi mettre à jour `audio.js`.
