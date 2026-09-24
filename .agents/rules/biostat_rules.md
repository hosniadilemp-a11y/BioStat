# Règles Impératives de Développement & Rédaction Pédagogique
## Module : Biostatistiques Appliquées & Modélisation du Vivant (M2 Biochimie, UMBB)
### Enseignante : Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)

---

### 1. 📁 Règle d'Or : Emplacement Unique des PDFs Générés
Tous les documents PDF générés (compilation LaTeX Beamer ou fascicules A4) doivent être sauvegardés **strictement et exclusivement** dans l'arborescence :
```
website/downloads/
├── cours/          # Diapositives Beamer 16:9 de chaque chapitre (Chapitre_XX_....pdf)
├── td_enonces/     # Énoncés de Travaux Dirigés A4 pour les étudiants (TD_Chapitre_XX_....pdf)
└── guide/          # Guide d'installation et guides pratiques (PDF)
```
- **Interdiction absolue** de créer des dossiers redondants (ex : pas de dossier `courses_pdf/`).
- Les corrigés de TD réservés à l'enseignante restent isolés dans `travaux_diriges/td_pdf/` pour ne jamais être exposés sur le site public des étudiants.

---

### 2. 🖥️ Contraintes Géométriques Beamer : Zéro Débordement (Hauteur & Largeur)
Toute présentation Beamer doit respecter une mise en page chirurgicale garantissant **l'absence totale de débordement** de texte, d'équation ou de graphique :
- **Format standard obligatoire** : `\documentclass[aspectratio=169,10pt]{beamer}` avec le package `../common/beamer_theme_bio`.
- **Organisation en colonnes** : Toujours utiliser `\begin{columns}[onlytextwidth, T]`. Chaque colonne doit avoir une largeur définie avec précision (ex : `\begin{column}{0.48\linewidth}`).
- **Boîtes thématiques (`tcolorbox`)** : Utiliser exclusivement les environnements prévus :
  - `conceptbox{Titre}` : Définitions et concepts théoriques (Bleu Nuit `BioNavy`).
  - `biobox{Titre}` : Exemples concrets et cas pratiques de biochimie (Sarcelle `BioTeal`).
  - `warnbox{Titre}` : Pièges fréquents et alertes méthodologiques (Ambre `BioAmber`).
  - `takeawaybox{Titre}` : Messages clés à retenir (Vert `BioGreen`).
- **Tableaux** : Tout tableau doit être contenu dans `\resizebox{\linewidth}{!}{...}` ou comporter des colonnes de largeur fixe `p{...}` avec une police adaptée (`\small`, `\footnotesize`, `\scriptsize`).
- **Équations mathématiques** : Ne jamais écrire d'équations plus larges que la colonne. Utiliser `split`, `align*` ou des notations compactes.

---

### 3. 🎯 Découpage Pédagogique : Une Notion = Une Diapositive Dédiée
Le public est constitué d'étudiants en **Master 2 Biochimie / Biologie sans formation informatique ou mathématique poussée** :
- **Ne jamais surcharger une diapositive** avec plusieurs formules complexes.
- **Une notion par diapositive** : Chaque paramètre ou test statistique ($S^2$, $SD$, $SEM$, $SS_A$, $SS_B$, $SS_{AB}$, $SS_{\text{res}}$, $MS$, $F$, etc.) doit posséder sa propre diapositive dédiée.
- **Ancrage biologique systématique** : Chaque diapositive DOIT être accompagnée d'un exemple concret de laboratoire biochimique ou biomédical (ex : dosage spectrophotométrique, ELISA, cinétique enzymatique de Michaelis-Menten, qPCR, cytotoxicité, modèles animaux, glycémie, peroxydation lipidique MDA).
- **Sens biologique des paramètres** : Toujours expliciter ce que représente physiquement la formule (ex : $MS$ = variance, $F$ = rapport signal/bruit).

---

### 4. 🔄 Alignement Pédagogique (Cours ↔ TD) & Suspension Temporaire des TP
- **Instruction stricte (en vigueur) :** Pour le moment, **ignorer totalement les Travaux Pratiques (TP / notebooks Jupyter)**. Ne pas modifier, créer ni synchroniser de fichiers dans `travaux_pratiques/`.
- L'alignement et la synchronisation pédagogique portent pour l'instant exclusivement sur le binôme **Cours Beamer ↔ Fiches TD** (énoncés et corrigés dans `travaux_diriges/sources/`).
- **Continuité des données :** Les variables biologiques introduites dans le cours Beamer (ex: gamme Bradford, MDA hépatique, insuline, etc.) doivent être rigoureusement réinvesties dans les énoncés et corrigés de TD.

---

### 5. 🛠️ Robustesse du Serveur Local Enseignant (`admin/gestion_cours.py`)
- Fonctionner uniquement avec la **bibliothèque standard Python** (zéro dépendance externe).
- Utiliser impérativement `errors="replace"` sur tous les décodages de sortie subprocess (`pdflatex`, `git`) pour tolérer les caractères accentués Latin-1/T1.
- Utiliser `ThreadingHTTPServer` avec `allow_reuse_address = True`.
- Tout PDF recompilé depuis le tableau de bord doit être directement dirigé vers `website/downloads/`.
