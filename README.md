# Cours, Travaux Dirigés & Travaux Pratiques : Biostatistiques Appliquées
**Master 2 / Semestre 3 — Spécialité : Biochimie Appliquée**  
**Établissement :** Université M'Hamed Bougara de Boumerdès (UMBB)  
**Enseignante responsable :** **Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)**  
**Crédits :** 5 | **Coefficient :** 3  

---

## 🌐 Site Web Interactif du Cours & Déploiement en Ligne

Un portail web moderne et responsive est disponible dans le dossier [`website/`](file:///home/adel/Documents/03_Teaching_and_Courses/Cours_bio_state/website/index.html) :
* **Accès local immédiat :** Ouvrez simplement le fichier [**`website/index.html`**](file:///home/adel/Documents/03_Teaching_and_Courses/Cours_bio_state/website/index.html) ou le fichier racine [**`index.html`**](file:///home/adel/Documents/03_Teaching_and_Courses/Cours_bio_state/index.html) dans n'importe quel navigateur (Chrome, Firefox, Safari, Edge).
* **Déploiement en ligne gratuit (GitHub Pages) :** Suivez le guide complet [**`GUIDE_DEPLOIEMENT_GITHUB.md`**](file:///home/adel/Documents/03_Teaching_and_Courses/Cours_bio_state/GUIDE_DEPLOIEMENT_GITHUB.md) pour héberger le site en ligne accessible à tous vos étudiants en quelques clics via GitHub Actions (`.github/workflows/deploy.yml`).
* **Fonctionnalités Clés du Portail :**
  - **Thème Clair par Défaut & Décorations Biologiques :** Dégradés doux, filigranes vectoriels d'hélice d'ADN, bacilles bactériens, boîtes de Pétri et cellules vivantes.
  - **Rendu Mathématique Parfait (KaTeX) :** Affichage typographique des formules scientifiques (ANOVA, régression, critère de Ward $\Delta I(A, B) = \frac{n_A n_B}{n_A + n_B} d_E^2(g_A, g_B)$).
  - **100% Adapté aux Smartphones (Mobile-Ready) :** Menu de navigation tactile et grilles dynamiques fluides pour tous types d'écrans.
  - **Hub Central de Téléchargement Différencié :**
    - 📘 **Cours Magistraux (8 PDFs)** : Présentations Beamer 16:9 haute résolution.
    - 📝 **TD Énoncés (8 PDFs)** : Fascicules d'exercices d'application biomédicale A4.
    - 📗 **TD Corrigés (8 PDFs)** : Résolutions arithmétiques intégrales détaillées.
    - 💻 **Travaux Pratiques (7 Notebooks)** : Fichiers `.ipynb` interactifs sous Python.
    - 📊 **Jeux de Données (5 Datasets)** : Fichiers `.csv` réels de laboratoire.
    - 📖 **Guide d'Installation** : Fascicule PDF pas-à-pas pour Anaconda & Jupyter.
  - **Parcours Pédagogique Structuré en 3 Piliers :** Progression didactique avec accès direct aux ressources de chaque chapitre.
  - **Profil Académique de l'Enseignante :** Biographie, domaines d'expertise, philosophie d'enseignement et coordonnées du Dr. Sarra BENMOUMOU-HOSNI (Ph.D.).

---

## 🗂️ Organisation Générale du Répertoire

```text
Cours_bio_state/
├── index.html                                        # Redirection automatique vers le portail
├── GUIDE_DEPLOIEMENT_GITHUB.md                       # Guide pas-à-pas de publication GitHub Pages
├── Programme_Detaille_Biostatistiques_Master.md      # Syllabus officiel détaillé
├── README.md                                         # Présentation générale du cours
├── .gitignore                                        # Exclusion des fichiers de compilation
├── .github/workflows/deploy.yml                      # Déploiement automatique GitHub Pages
│
├── website/                                          # Application Web Moderne & Portail Interactif
│   ├── index.html                                    # Page d'accueil & Hub unifié
│   ├── style.css                                     # Feuille de style Glassmorphism responsive
│   ├── app.js                                        # Logique applicative, KaTeX, filtres & modale
│   ├── assets/figures/                               # 13 figures haute résolution (300 DPI)
│   └── downloads/                                    # Hub central de téléchargement autonome
│       ├── cours/                                    # 8 Diapositives Beamer (PDF)
│       ├── td_enonces/                               # 8 Énoncés de TD (PDF A4)
│       ├── td_corriges/                              # 8 Corrigés détaillés de TD (PDF A4)
│       ├── tp/                                       # 7 Notebooks Jupyter (.ipynb)
│       ├── datasets/                                 # 5 Fichiers CSV réels
│       └── guide/                                    # Manuel d'installation Python (PDF & MD)
│
├── scripts_generation_figures/                       # Scripts Python de génération des graphiques
│   └── generate_all_course_plots.py                  # Script modulaire complet (13 figures 300 DPI)
│
├── sources/                                          # Codes sources des présentations LaTeX Beamer
│   ├── common/beamer_theme_bio.sty                   # Thème Beamer personnalisé (Bleu Saphir / Émeraude)
│   ├── figures/                                      # Graphiques scientifiques intégrés aux diapos
│   └── chapitre_00_ à chapitre_07_
│
├── courses_pdf/                                      # Présentations Beamer compilées (PDF 16:9)
│   ├── Chapitre_00_Introduction_Biostatistiques.pdf
│   ├── Chapitre_01_ANOVA_Croisee.pdf
│   ├── Chapitre_02_ANOVA_Hierarchisee.pdf
│   ├── Chapitre_03_Regression_Lineaire.pdf
│   ├── Chapitre_04_Regression_Non_Lineaire.pdf
│   ├── Chapitre_05_ACP.pdf
│   ├── Chapitre_06_CAH.pdf
│   └── Chapitre_07_Interpretation_Analyse.pdf
│
├── travaux_diriges/                                  # Séries d'exercices & Corrigés détaillés
│   ├── common/td_style.sty                           # Style LaTeX polycopié universitaire A4
│   ├── sources/                                      # Sources LaTeX des 8 énoncés et 8 corrigés
│   └── td_pdf/                                       # 16 fichiers PDF finaux (8 Énoncés + 8 Corrigés)
│
└── travaux_pratiques/                                # Séances de Travaux Pratiques sous Python & Jupyter
    ├── 00_Guide_Installation_Anaconda_Jupyter/       # Guide complet pour biologistes débutants
    ├── datasets/                                     # Fichiers de données expérimentales réalistes (.csv)
    ├── generate_all_tps.py                           # Script de génération des notebooks
    └── TP01_ à TP06_                                 # Notebooks interactifs Jupyter
```

---

## 🔬 Les 8 Chapitres du Cours

| N° | Intitulé du Chapitre | Cas Concret & Application Biologique | TD & Exercices | TP Python & Données |
|:---|:---|:---|:---|:---|
| **00** | **Introduction & Rappels** | Variabilité de l'albumine, SD vs SEM, risques $\alpha$/$\beta$ | 5 exercices + Corrigé | Prise en main Python |
| **01** | **ANOVA à Deux Facteurs Croisés** | Peroxydation lipidique (MDA), statut $\times$ polyphénols | 5 exercices + Corrigé | `peroxydation_mda_diabete.csv` |
| **02** | **ANOVA Hiérarchisée (Nested)** | Bioproduction d'insuline, lutte contre la pseudoréplication | 5 exercices + Corrigé | `production_insuline_nested.csv` |
| **03** | **Régression Linéaire** | Gamme étalon Bradford (BSA), diagnostic résidus, LOD/LOQ | 5 exercices + Corrigé | `dosage_bradford.csv` |
| **04** | **Régression Non Linéaire** | Phosphatase alcaline, Michaelis-Menten, modèle 4PL ELISA | 5 exercices + Corrigé | `cinetique_enzyme_phosphatase.csv` |
| **05** | **Analyse Composantes Principales (ACP)** | Métabolomique sérique (45 patients), cercle corrélations | 5 exercices + Corrigé | `metabolomique_serum.csv` |
| **06** | **Classification Hiérarchique (CAH)** | Typage de souches de *Pseudomonas aeruginosa* (BMR) | 5 exercices + Corrigé | Dendrogramme & Clustermap |
| **07** | **Interprétation, DoE & Bonnes Pratiques** | Dimensionnement $n$ ($1-\beta$), directives SAMPL / ARRIVE 2.0 | 5 exercices + Corrigé | Audit & Rédaction de mémoire |

---

## 👩‍🏫 Responsable Pédagogique

* **Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)**
* Enseignante-Chercheuse en Biostatistiques & Bio-informatique Appliquée
* Faculté des Sciences • Département de Biologie
* Université M'Hamed Bougara de Boumerdès (UMBB), Boumerdès, Algérie
* Contact : `s.benmoumou@univ-boumerdes.dz`
