# Syllabus Détaillé du Cours : Biostatistiques Appliquées
**Master 2 / Semestre 3 — Spécialité : Biochimie Appliquée**  
**Établissement :** Université M'Hamed Bougara de Boumerdès (UMBB)  
**Crédits :** 5 | **Coefficients :** 3  
**Prérequis recommandés :** Statistiques descriptives, probabilités de base, tests d'hypothèses univariés (Student, ANOVA à 1 facteur, Chi-carré).

---

## 🎯 Objectifs Pédagogiques Globaux
- Maîtriser l'analyse de plans d'expériences complexes en laboratoire biologique et biochimique.
- Savoir modéliser les relations linéaires et non-linéaires (cinétiques enzymatiques, pharmacologie, courbes de dosage).
- Explorer et réduire la dimensionnalité de grands jeux de données biologiques multivariés (spectrométrie, biomarqueurs, omiques).
- Classifier des profils biologiques (souches, patients, marqueurs) de manière non supervisée.
- Savoir interpréter, critiquer et restituer des résultats expérimentaux selon les standards scientifiques internationaux.

---

## 📚 Programme Détaillé Chapitre par Chapitre

### Chapitre 0 : Généralités sur les Statistiques, Probabilités & Démarche Expérimentale
*Focus : Socle fondamental pour non-informaticiens, variabilité du vivant, probabilités, distributions théoriques et logique décisionnelle.*

1. **La Démarche Biostatistique & la Variabilité du Vivant**
   - Rôle décisionnel des biostatistiques : extraire le signal biologique du bruit aléatoire.
   - L'équation fondamentale du laboratoire : $Y = \text{Signal vrai} + \text{Biais biologique} + \text{Erreur technique}$.
   - Réplicats biologiques ($N$) vs réplicats techniques ($k$) & lutte contre la pseudo-réplication.
   - Inférence statistique : estimer les paramètres de la population ($\mu, \sigma$) à partir de l'échantillon ($\bar{X}, s$).

2. **Typologie des Variables & Structuration des Données**
   - Les 4 échelles de mesure : Quantitative continue, quantitative discrète, qualitative nominale, qualitative ordinale.
   - Bonnes pratiques de structuration tabulaire (*Tidy Data* sous Excel/Python).

3. **Statistique Descriptive : Position & Dispersion**
   - Tendance centrale : Moyenne arithmétique ($\bar{X}$), Médiane ($Med$), Mode ($Mo$). Duel moyenne vs médiane face aux distributions asymétriques (cytokines, biomarqueurs).
   - Dispersion : Variance corrigée de Bessel ($s^2$ avec $n-1$), Écart-type ($SD$).
   - Écart-type ($SD$) vs Erreur Standard de la Moyenne ($SEM = SD/\sqrt{n}$) : rôles biologiques distincts.
   - Quartiles ($Q_1, Q_2, Q_3$), Écart Interquartile ($IQR$) et Coefficient de Variation ($CV = SD/\bar{X} \times 100\%$).
   - Visualisation graphique moderne : anatomie du Boxplot de Tukey (moustaches $1.5 \times IQR$ et détection d'outliers) vs Violin plots.

4. **Fondements des Probabilités en Biologie**
   - Notion d'expérience aléatoire, univers $\Omega$ et axiomes de probabilités ($0 \le P(A) \le 1$).
   - Probabilités conditionnelles $P(A|B)$ et indépendance statistique appliquée à la génétique mendélienne.
   - **Théorème de Bayes appliqué au diagnostic biologique** : Sensibilité ($Se$), Spécificité ($Sp$), VPP et VPN. Le paradoxe des tests rares en épidémiologie.

5. **Les Grandes Lois de Probabilité en Biologie**
   - Variables aléatoires discrètes vs continues (fonction de masse vs densité de probabilité).
   - **Loi Binomiale $\mathcal{B}(n, p)$** : modélisation oui/non, survie cellulaire, allèles.
   - **Loi de Poisson $\mathcal{P}(\lambda)$** : événements rares, comptage d'UFC bactériennes, mutations spontanées, sur-dispersion.
   - **Loi Normale de Gauss $\mathcal{N}(\mu, \sigma^2)$** : standardisation centrée réduite $Z = (X-\mu)/\sigma$ et règle empirique des $68\% - 95\% - 99.7\%$ pour les normes cliniques.
   - **Théorème Central Limite (TCL)** : convergence des moyennes d'échantillons vers la loi normale quelle que soit la population d'origine.
   - Lois dérivées d'échantillonnage : Chi-deux ($\chi^2$), Student ($t$), Fisher-Snedecor ($F$).

6. **Inférence, Tests d'Hypothèses & Prise de Décision**
   - Estimation ponctuelle vs par Intervalle de Confiance à 95\% ($IC_{95\%} = \bar{X} \pm t \cdot SEM$).
   - Raisonnement par l'absurde : formulation de $H_0$ (hypothèse nulle) vs $H_1$ (alternative).
   - Matrice décisionnelle : Risque $\alpha$ (Type I), Risque $\beta$ (Type II) et Puissance ($1-\beta$).
   - Démystification de la $p$-value : définition rigoureuse et démontage des idées fausses.
   - Significativité statistique vs pertinence biologique : taille d'effet ($d$ de Cohen).
   - Conditions d'application des tests paramétriques (Indépendance, Shapiro-Wilk, Levene) vs alternatives non paramétriques (Mann-Whitney, Kruskal-Wallis).
   - **Arbre décisionnel universel du choix du test statistique**.

---

### Chapitre I : Analyse de Variance (ANOVA) à Deux Facteurs (ou Plus) Croisés
*Focus : Étude simultanée de plusieurs variables explicatives et analyse des interactions.*

1. **Fondements Théoriques & Modélisation**
   - Modèle linéaire généralisé pour plan factoriel croisé ($Y_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \varepsilon_{ijk}$).
   - Distinction entre modèle à effets fixes, effets aléatoires et modèles mixtes.
   - Notion clé d'**Interaction** ($\text{Facteur } A \times \text{Facteur } B$) :
     - Synergie, antagonisme, additivité des effets.
     - Représentation graphique des profils d'interaction (courbes parallèles vs sécantes).
   - Décomposition de la variance (Somme des carrés : $SS_{\text{tot}} = SS_A + SS_B + SS_{AB} + SS_{\text{res}}$).
   - Conditions de validité : normalité des résidus (Shapiro-Wilk), homoscédasticité (test de Levene/Bartlett).
   - Tests post-hoc avec ajustement de multiplicité (Tukey HSD, Bonferroni, Dunnett pour comparaison au témoin).

2. **Applications en Biochimie & Biologie**
   - Effet combiné d'une molécule inhibitrice et de la température sur l'activité d'une enzyme.
   - Réponse immunitaire (titre d'anticorps) selon le génotype (sauvage vs muté) et le régime alimentaire.
   - Toxicologie cellulaire : viabilité cellulaire selon la dose de toxique et le temps d'exposition.

3. **Travaux Pratiques / Ateliers Logiciels (R / GraphPad Prism)**
   - Formule R : `aov(activite ~ traitement * genotype, data = df)`
   - Tracé des graphiques d'interaction (`interaction.plot`), diagnostic des résidus.

---

### Chapitre II : Analyse de Variance Hiérarchisée (Nested ANOVA)
*Focus : Plans emboîtés et partition de la variabilité biologique vs technique.*

1. **Fondements Théoriques & Modélisation**
   - Concept d'emboîtement : les niveaux du facteur $B$ n'ont de sens qu'à l'intérieur d'un niveau du facteur $A$ ($B \subset A$).
   - Écriture du modèle hiérarchique : $Y_{ijk} = \mu + \alpha_i + \beta_{j(i)} + \varepsilon_{k(ij)}$.
   - Différence fondamentale entre facteur croisé et facteur hiérarchisé.
   - Calcul des carrés moyens et choix du terme d'erreur approprié pour le test $F$ (pseudo-$F$).
   - Composantes de la variance (Variance Component Analysis) : quantifier la part respective de chaque niveau hiérarchique dans la variance totale.

2. **Applications en Biochimie & Biologie**
   - Contrôle qualité et variabilité : Lot de production $\to$ Flacons $\to$ Mesures spectrophotométriques répétées.
   - Expérimentation animale / cellulaire : 3 Traitements $\to$ 4 Animaux par traitement $\to$ 3 Échantillons tissulaires par animal $\to$ 2 Réplicats techniques d'ELISA.
   - Détection des "effets de lot" (batch effects) et estimation de la répétabilité analytique vs variabilité biologique inter-individuelle.

3. **Travaux Pratiques / Ateliers Logiciels**
   - Formule R : `aov(mesure ~ traitement / animal, data = df)` ou modèles mixtes `lme4::lmer(mesure ~ traitement + (1|animal), data = df)`.

---

### Chapitre III : Corrélation et Régression Linéaire
*Focus : Étude des associations quantitatives, modélisation prédictive et gammes d'étalonnage.*

1. **Fondements Théoriques**
   - **Corrélation :**
     - Coefficient de corrélation linéaire de Pearson ($r$) : conditions, calcul, test de significativité ($t$-test).
     - Corrélation non paramétrique de Spearman ($\rho$) et Kendall ($\tau$) pour variables ordinales ou non normales.
     - Pièges : corrélation vs causalité, corrélation fallacieuse (facteur confondant).
   - **Régression Linéaire Simple & Multiple :**
     - Méthode des Moindres Carrés Ordinaires (MCO / OLS) : estimation des paramètres $\beta_0$ (ordonnée à l'origine) et $\beta_1$ (pente).
     - Coefficient de détermination ($R^2$) et $R^2$ ajusté.
     - Diagnostic approfondi des résidus : linéarité, homoscédasticité, indépendance, normalité, points aberrants ou leviers (distance de Cook).
     - Intervalles de confiance de la pente et intervalles de prédiction d'une nouvelle observation.

2. **Applications en Biochimie & Biologie**
   - Gamme d'étalonnage pour dosage protéique (Bradford, BCA, Lowry) : $A = f(\text{Concentration})$.
   - Loi de Beer-Lambert et calcul du coefficient d'extinction molaire.
   - Relation entre niveau d'expression d'une protéine (Western Blot / qPCR) et concentration d'un métabolite plasmatique.

3. **Travaux Pratiques / Ateliers Logiciels**
   - Régression sous R : `lm(absorbance ~ concentration, data = gamme)`
   - Calcul de la limite de détection (LOD) et limite de quantification (LOQ).

---

### Chapitre IV : Régression Non Linéaire
*Focus : Ajustement de cinétiques biologiques, modèles de saturation et courbes dose-réponse.*

1. **Principes Mathématiques de l'Ajustement Non Linéaire**
   - Algorithmes d'optimisation itérative : Gauss-Newton, Levenberg-Marquardt.
   - Choix des valeurs initiales (starting parameters) et problèmes de convergence.
   - Critères de comparaison de modèles non emboîtés : Critère d'Information d'Akaike (AIC), BIC, test $F$ d'amélioration du modèle.
   - Pourquoi éviter les linéarisations trompeuses (ex : défauts de Lineweaver-Burk et Eadie-Hofstee face à la régression non linéaire directe).

2. **Modèles Biologiques Clés**
   - **Modèle Exponentiel :**
     - Croissance bactérienne / cellulaire non limitée : $N(t) = N_0 e^{\mu t}$ (temps de doublement).
     - Décroissance radioactive ou pharmacocinétique d'élimination : $C(t) = C_0 e^{-kt}$.
   - **Modèle de Monod & Michaelis-Menten :**
     - Cinétique enzymatique : $v = \frac{V_{\max} [S]}{K_m + [S]}$.
     - Allostérie et coopérativité : équation de Hill ($v = \frac{V_{\max} [S]^h}{K_{0.5}^h + [S]^h}$).
   - **Modèles Logistiques (Dose-Réponse) :**
     - Modèle sigmoïde à 4 paramètres (4PL) : $Y = \text{Bottom} + \frac{\text{Top} - \text{Bottom}}{1 + 10^{(\log IC_{50} - X) \cdot \text{HillSlope}}}$.
     - Détermination de l'$EC_{50}$ (immunologie/pharmacologie) ou de la $CL_{50}$ (toxicologie).
   - **Modèles Bêta et Gamma :**
     - Modélisation de distributions asymétriques en cinétique, temps de survie, temps de réponse cellulaire ou croissance asymétrique.

3. **Travaux Pratiques / Ateliers Logiciels**
   - Estimation sous R avec `nls()` ou package `drc` (Dose-Response Curves).

---

### Chapitre V : Analyses Multivariées — Analyse en Composantes Principales (ACP / PCA)
*Focus : Exploration non supervisée, réduction de dimension et profilage biologique.*

1. **Fondements Théoriques**
   - Notions matricielles : matrice des données ($n$ individus $\times p$ variables), matrice de variance-covariance vs matrice des corrélations (standardisation/centrage-réduction).
   - Projection géométrique et décomposition en valeurs propres / vecteurs propres (SVD).
   - Composantes principales et variance expliquée (inertie) :
     - Éboulis des valeurs propres (scree plot) et critère de Kaiser.
   - Représentation des variables :
     - Cercle des corrélations, qualité de représentation ($\cos^2$), contributions des variables aux axes.
   - Représentation des individus :
     - Plan factoriel, détection d'échantillons aberrants (outliers), projection de variables illustratives/supplémentaires.

2. **Applications en Biochimie & Biologie**
   - Étude de profil métabolique ou lipidomique : différencier des groupes de patients sains vs malades à partir de 50 métabolites.
   - Suivi physico-chimique de fermentations ou de bioréacteurs au cours du temps.
   - Analyse exploratoire de données d'expression de gènes ou de panels de cytokines.

3. **Travaux Pratiques / Ateliers Logiciels**
   - R : Packages `FactoMineR` et `factoextra`.
   - Visualisation : Biplot, graphiques d'individus colorés par facteur biologique.

---

### Chapitre VI : Classification Hiérarchique Ascendante (CHA / HAC)
*Focus : Regroupement automatique d'échantillons ou de marqueurs biologiques.*

1. **Fondements Théoriques**
   - Notions de distance et de dissimilarité :
     - Distance Euclidienne, distance de Manhattan, distance basée sur la corrélation (Pearson/Spearman).
   - Critères d'agrégation (Linkage methods) :
     - Lien simple (single linkage), lien complet (complete linkage), lien moyen (UPGMA), méthode de Ward (minimisation de la variance intra-classe).
   - Construction et lecture d'un **Dendrogramme** :
     - Hauteur des branches (distance de fusion).
     - Choix du seuil de coupure pour déterminer le nombre optimal de clusters ($k$).
   - Combinaison avec l'ACP : Classification sur composantes principales (HCPC).

2. **Applications en Biochimie & Biologie**
   - Classification moléculaire de souches bactériennes ou fongiques selon leurs profils enzymatiques/protéiques.
   - Typage de sous-groupes de tumeurs basé sur l'expression protéique ou génique.
   - Génération de **Heatmaps biclusterisées** (clustering simultané des gènes en lignes et des échantillons en colonnes).

3. **Travaux Pratiques / Ateliers Logiciels**
   - R : Fonctions `hclust()`, `cutree()`, packages `pheatmap` ou `ComplexHeatmap`.

---

### Chapitre VII : Interprétation d'une Analyse Expérimentale
*Focus : Synthèse, rigueur méthodologique, intégrité scientifique et communication.*

1. **Principes d'un Plan d'Expérience Rigoureux (Design of Experiments - DoE)**
   - Les 3 règles d'or : Randomisation, Réplication, Contrôle des blocs.
   - Taille d'échantillon et calcul de puissance statistique ($1 - \beta$, risque $\alpha = 0.05$, taille d'effet de Cohen).
   - Biais expérimentaux classiques en laboratoire (effet observateur, contamination croisée, dérive d'appareillage).

2. **Bonnes Pratiques d'Interprétation et Standards de Publication**
   - La crise de la reproductibilité en biologie : pièges du $p$-hacking, HARKing (Hypothesizing After Results are Known).
   - Représentation graphique adéquate : pourquoi abandonner les diagrammes en bâtons ("bar plots") au profit des scatter plots / box plots / violin plots avec points individuels visibles.
   - Standards internationaux de reporting (ex : directives ARRIVE, SAMPL).

3. **Étude de Cas Complète (Mini-Projet Intégrateur)**
   - Exploitation d'un jeu de données expérimental réel de biochimie (ex : cinétique + dosage de biomarqueurs + ANOVA multivariée + ACP).
   - Rédaction d'un rapport de résultats selon le format article scientifique : Matériel et Méthodes statistiques, Résultats (figures + tests), Discussion biologique.

---

## 🛠️ Modalités d'Évaluation & Outils Pédagogiques Proposés
- **Contrôle continu (40%) :**
  - Comptes-rendus de travaux pratiques sur ordinateur (R / RStudio ou GraphPad Prism).
  - Présentation critique d'un article de recherche en biochimie axée sur la validité des méthodes statistiques employées.
- **Examen final théorique et pratique (60%) :**
  - Exercices d'interprétation d'outputs logiciels, choix de modèles adaptés, lecture de dendrogrammes et de cercles de corrélation ACP.
