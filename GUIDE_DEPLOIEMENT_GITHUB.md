# Guide Complet : Publier le Cours sur GitHub & Héberger le Site en Ligne via GitHub Pages

Ce guide vous accompagne pas-à-pas pour publier l'intégralité du cours sur **GitHub** et rendre le portail web interactif accessible à vos étudiants et collègues du monde entier gratuitement via **GitHub Pages** (ex : `https://<votre-nom-utilisateur>.github.io/<nom-du-depot>/`).

---

## 🚀 Étape 1 : Créer un nouveau dépôt sur GitHub

1. Connectez-vous sur votre compte GitHub : [https://github.com](https://github.com).
2. Cliquez sur le bouton vert **« New »** (ou rendez-vous directement sur [https://github.com/new](https://github.com/new)).
3. Remplissez les informations du dépôt :
   - **Repository name** : par exemple `cours-biostatistiques-master` ou `Cours_bio_state`.
   - **Description** : `Portail officiel du cours de Biostatistiques Appliquées et Modélisation du Vivant (M2 Biochimie, UMBB) - Dr. Sarra BENMOUMOU-HOSNI`.
   - **Public / Private** : Sélectionnez **Public** (nécessaire pour que le site GitHub Pages soit accessible librement aux étudiants).
   - **Important** : Ne cochez *PAS* "Add a README file", ni ".gitignore", ni "license" (car nous avons déjà préparé ces fichiers localement).
4. Cliquez sur le bouton vert **« Create repository »**.

---

## 💻 Étape 2 : Initialiser Git et Envoyer vos Fichiers (Terminal)

Ouvrez un terminal dans le dossier du cours (`/home/adel/Documents/03_Teaching_and_Courses/Cours_bio_state`) et exécutez les commandes suivantes dans l'ordre :

```bash
# 1. Initialiser le dépôt Git local
git init

# 2. Configurer la branche principale en 'main'
git branch -M main

# 3. Ajouter l'ensemble des fichiers (PDFs, codes, site web, figures, datasets)
git add .

# 4. Enregistrer le premier commit
git commit -m "Initial commit: Cours complet Biostatistiques M2, TD, TP, Datasets et Portail Web"

# 5. Lier votre dossier local au dépôt GitHub (Remplacez avec votre URL GitHub)
git remote add origin https://github.com/<VOTRE_NOM_UTILISATEUR>/<NOM_DU_DEPOT>.git

# 6. Pousser tout le projet vers GitHub
git push -u origin main
```

*(Remplacez `<VOTRE_NOM_UTILISATEUR>` par votre identifiant GitHub et `<NOM_DU_DEPOT>` par le nom choisi à l'étape 1).*

---

## 🌐 Étape 3 : Activer l'Hébergement Gratuit GitHub Pages

Grâce au fichier d'automatisation préconfiguré (`.github/workflows/deploy.yml`), l'hébergement se configure en 2 clics :

1. Sur votre page de dépôt GitHub, cliquez sur l'onglet **« Settings »** (en haut à droite).
2. Dans le menu de gauche, descendez jusqu'à la section **« Pages »** (sous *Code and automation*).
3. Sous la section **« Build and deployment »** :
   - Dans le menu déroulant **« Source »**, sélectionnez **« GitHub Actions »** (au lieu de *Deploy from a branch*).
4. C'est tout ! GitHub va automatiquement déclencher le workflow qui publie le dossier `website/` en direct.
5. Après environ 60 secondes, rafraîchissez la page : GitHub affichera un bandeau vert avec le lien officiel de votre site :
   ```
   https://<VOTRE_NOM_UTILISATEUR>.github.io/<NOM_DU_DEPOT>/
   ```

---

## 📱 Que contient le site déployé ?

- **Thème Clair Moderne & Décorations Biologiques** : Dégradés doux avec filigranes d'ADN, bacilles bactériens, boîtes de Pétri et cellules vivantes.
- **Affichage Mathématique Parfait (KaTeX)** : Rendu typographique des formules (ex: critère de Ward $\Delta I(A, B) = \frac{n_A n_B}{n_A + n_B} d_E^2(g_A, g_B)$).
- **Hub de Téléchargement Différencié & 100% Fonctionnel** :
  - 8 Diapositives Beamer (PDF 16:9).
  - 8 Énoncés de TD (Fascicules A4).
  - 8 Corrigés de TD détaillés (Solutions complètes A4).
  - 7 Notebooks interactifs Jupyter (.ipynb).
  - 5 Jeux de données biologiques réels (.csv).
  - Manuel d'installation Python & Anaconda (PDF & MD).
- **Adaptation Téléphone & Tablette (100% Mobile Ready)** : Menu hamburger tactile et grilles fluides pour écrans de smartphone (360px–480px).
- **Profil Enseignante Détaillé** : Biographie académique, compétences et permanence du **Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)**.

---

## 🔄 Comment mettre à jour le site à l'avenir ?

Dès que vous modifiez un document ou ajoutez un fichier, il vous suffit de taper :

```bash
git add .
git commit -m "Mise à jour du contenu du cours"
git push origin main
```

GitHub mettra automatiquement à jour le site en ligne en moins d'une minute !
