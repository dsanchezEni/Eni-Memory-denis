# ENI-Memory - Jeu Memory avec Gestion Utilisateurs

## 📋 Description

**ENI-Memory** est un jeu Memory (ou *jeu des paires*) développé dans le cadre du projet **DEV23_0050B** du cours HTML/CSS/JS de l'ENI. Ce projet implique la création d'une application web complète avec gestion des utilisateurs, système de scores, thèmes personnalisables et générations dynamiques de grilles.

---

## ✨ Fonctionnalités Implémentées

### 🎮 **Fonctionnalités de base du jeu**
- ✅ **Jeu Memory complet** : Retournez les cartes pour trouver les paires correspondantes
- ✅ **Grille dynamique** : Génération automatique de la grille selon la taille sélectionnée (4x4, 6x6, 8x8)
- ✅ **Système de scoring** : Calcul des scores basés sur le nombre de coups et le temps
- ✅ **Timer** : Chronomètre pour mesurer le temps de jeu
- ✅ **Animation 3D** : Effets de retournement de carte fluides et réalistes
- ✅ **Détection de victoire** : Message de félicitations avec animation

### 👤 **Gestion des utilisateurs**
- ✅ **Inscription** : Formulaire d'inscription complet avec validation
  - Vérification des champs obligatoires
  - Validation du format de l'email
  - Confirmation du mot de passe
  - Vérification de l'âge minimum (13 ans)
- ✅ **Connexion** : Authentification sécurisée
  - Vérification des identifiants
  - Messages d'erreur clairs
- ✅ **Profil utilisateur** : Page de profil personnalisée
  - Affichage des informations personnelles
  - Historique des scores (meilleurs scores et derniers scores)
  - Préférences de thème et de taille de grille
  - Déconnexion
- ✅ **Sécurité des mots de passe** : Cryptage SHA-256 avant stockage

### 🎨 **Personnalisation**
- ✅ **Thèmes** : Choix entre plusieurs thèmes (Animaux, Drapeaux, Sports)
- ✅ **Taille de grille** : Sélection de la difficulté (4x4, 6x6, 8x8)
- ✅ **Design responsive** : Adapté aux écrans desktop, tablette et mobile

### 💾 **Stockage des données**
- ✅ **localStorage** : Persistance des données utilisateurs et scores
- ✅ **Gestion des sessions** : Maintien de la connexion pendant la navigation

---

## 🚀 Installation et Exécution

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Aucun serveur nécessaire (fonctionne en local)

### Lancement
1. **Cloner ou télécharger** le dépôt
2. **Ouvrir** le fichier `index.html` dans votre navigateur
3. **Créer un compte** via le formulaire d'inscription
4. **Se connecter** et commencer à jouer !

---

## 🔊 **Configuration des Sons (Version Hors Ligne)**

Le jeu inclut un système audio complet avec :
- 🎵 **Musique de fond** (style Mario Bros)
- 🔊 **Son de clic** sur les cartes
- ✅ **Son de réussite** quand une paire est trouvée
- 🏆 **Son de victoire** à la fin de la partie

### Activation/Désactivation
- Une icône 🔊/🔇 est présente dans le titre de chaque page
- Cliquez dessus pour activer ou désactiver tous les sons
- L'état est sauvegardé et persiste entre les sessions

### Pour une utilisation **hors ligne** :

**Méthode 1 : Script de téléchargement automatique**
- **Windows** : Exécutez `download-sounds.bat` (double-clic)
- **Linux/Mac** : Exécutez `chmod +x download-sounds.sh` puis `./download-sounds.sh`

**Méthode 2 : Téléchargement manuel**
1. **Télécharger les fichiers audio** depuis [ressources/sounds/README.md](ressources/sounds/README.md)
2. **Placer les fichiers** dans le dossier `ressources/sounds/` :
   ```
   eni-memory/
   └── ressources/
       └── sounds/
           ├── background.mp3  # Musique de fond
           ├── cardFlip.mp3    # Son de clic
           ├── match.mp3       # Son de paire trouvée
           └── victory.mp3     # Son de victoire
   ```

3. **Les sons seront automatiquement chargés** depuis les fichiers locaux

> ⚠️ **Note** : Sans les fichiers audio, le système son sera désactivé par défaut. Vous pouvez toujours utiliser les URLs en ligne si vous avez une connexion internet.

---

## 📁 Structure du Projet

```
eni-memory/
├── index.html                  # Page d'accueil principale
├── jouer.html                  # Page de jeu Memory
├── formulaireInscrire.html     # Formulaire d'inscription
├── formulaireConnecter.html    # Formulaire de connexion
├── profil.html                 # Page de profil utilisateur
├── download-sounds.bat       # Script Windows pour télécharger les sons
├── download-sounds.sh        # Script Linux/Mac pour télécharger les sons
├── 
├── css/
│   └── style.css              # Styles CSS complets
│
├── js/
│   ├── app.js                 # Logique principale de l'application
│   ├── audio.js               # Gestion des sons et musique de fond
│   ├── card.js                # Gestion des cartes et du jeu Memory
│   ├── connecter.js           # Logique de connexion
│   ├── profil.js              # Gestion du profil utilisateur
│   └── utils.js               # Fonctions utilitaires
│
├── images/                    # Images des cartes Memory
│   ├── dosCarte.png           # Dos de carte
│   ├── animaux/               # Images thème Animaux
│   ├── drapeaux/              # Images thème Drapeaux
│   └── sports/                # Images thème Sports
│
├── ressources/                # Ressources diverses
│   ├── sounds/                # Fichiers audio pour version hors ligne
│   │   ├── background.mp3      # Musique de fond
│   │   ├── cardFlip.mp3        # Son de clic sur carte
│   │   ├── match.mp3           # Son de paire trouvée
│   │   └── victory.mp3         # Son de victoire
│   ├── sound-on.svg           # Icône son activé
│   ├── sound-off.svg          # Icône son désactivé
│   └── ...                    # Autres ressources
│
├── documents/
│   ├── recommandations.md     # Recommandations d'amélioration
│   └── (autres documents projet)
└── README.md                  # Ce fichier
```

---

## 🎯 Comment Jouer

1. **Créer un compte** (ou se connecter si déjà inscrit)
2. **Choisir un thème** et une **taille de grille** dans le profil
3. **Cliquer sur "Jouer"** dans le menu
4. **Retourner les cartes** en cliquant dessus
5. **Trouver les paires** correspondantes
6. **Gagner** en trouvant toutes les paires le plus rapidement possible !

---

## 🏆 Système de Scores

Le score est calculé selon la formule :
```
Score = (Temps écoulé en secondes) + (Nombre de coups × 2)
```

Plus le score est **bas**, mieux c'est !

Les scores sont enregistrés dans le profil utilisateur et affichés sous forme de :
- **Meilleurs scores** : Top 5 des meilleurs scores de l'utilisateur
- **Derniers scores** : Historique des 10 derniers jeux

---

## 🛠️ Technologies Utilisées

| Technologie | Utilisation |
|------------|-------------|
| **HTML5** | Structure des pages |
| **CSS3** | Styles, animations, responsive design |
| **JavaScript (ES6+)** | Logique applicative, manipulation du DOM |
| **localStorage** | Stockage des utilisateurs et scores |
| **SHA-256** | Cryptage des mots de passe |

---

## 🎨 Thèmes Disponibles

| Thème | Description | Nombre de cartes |
|-------|-------------|------------------|
| **Animaux** | Photos de différents animaux | 24 paires |
| **Drapeaux** | Drapeaux de différents pays | 24 paires |
| **Sports** | Icônes de différents sports | 24 paires |

---

## 📱 Responsive Design

Le jeu s'adapte automatiquement à différents types d'écrans :

- **Desktop** : Grille complète, navigation optimale
- **Tablette** : Grille adaptée, menu réorganisé
- **Mobile** : Grille réduite (3x3 maximum), interface tactile

---

## 🔒 Sécurité

- **Cryptage des mots de passe** : Utilisation de l'algorithme SHA-256 avant stockage
- **Validation côté client** : Vérification des données avant envoi
- **Protection des données** : Toutes les données sont stockées localement dans le navigateur

---

## 📊 Statistiques et Métriques

- **Nombre total de cartes** : Variable selon la taille (16, 36 ou 64 cartes)
- **Nombre de paires** : 8, 18 ou 32 paires
- **Temps moyen** : Variable selon la difficulté et l'utilisateur
- **Meilleur score possible** : Théoriquement égal au nombre minimal de coups × 2

---

## 🎓 Exigences du Projet ENI

### Itération 1 : Structure de base
- ✅ Page HTML valide
- ✅ Structure CSS de base
- ✅ JavaScript de base fonctionnel

### Itération 2 : Jeu Memory complet
- ✅ Génération dynamique de la grille
- ✅ Système de retour de cartes
- ✅ Détection des paires
- ✅ Système de scoring

### Itération 3 : Gestion des utilisateurs
- ✅ Formulaire d'inscription
- ✅ Formulaire de connexion
- ✅ Page de profil
- ✅ Stockage local des utilisateurs

### Itération 4 : Sécurité et améliorations
- ✅ Cryptage SHA-256 des mots de passe
- ✅ Validation des formulaires
- ✅ Gestion des sessions
- ✅ Thèmes personnalisables
- ✅ Timer
- ✅ Responsive design

### Itération 5 : Finalisation
- ✅ Code nettoyé (pas de console.log)
- ✅ Commentaires dans le code
- ✅ Documentation complète (README.md)
- ✅ Recommandations d'amélioration

---

## 📝 Historique des Versions

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2024-XX-XX | Version initiale |
| 1.1 | 2024-XX-XX | Ajout de la gestion des utilisateurs |
| 1.2 | 2024-XX-XX | Ajout du système de scoring et timer |
| 1.3 | 2024-XX-XX | Ajout des thèmes et responsive design |
| 1.4 | 2026-11-17 | Cryptage SHA-256 et nettoyage du code |

---

## 🤝 Contributeurs

- **Denis Sanchez** (Développeur principal)

---

## 📄 Documentation Complémentaire

- [Recommandations d'amélioration](documents/recommandations.md) - Liste complète des améliorations possibles
- [Documentation technique](documents/) - Détails d'implémentation

---

## 🎁 Remerciements

- **ENI** pour le cadre pédagogique
- **Mistral Vibe** pour l'assistance au développement

---

## 📜 Licence

Ce projet est développé dans un cadre éducatif et ne doit pas être diffusé sans autorisation.

---

*Dernière mise à jour : 17/11/2026*
