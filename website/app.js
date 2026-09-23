/* ==========================================================================
   Cours de Biostatistiques Appliquées - Master 2 Biochimie (UMBB)
   Logique Applicative & Interactions (Dr. Sarra BENMOUMOU-HOSNI)
   ========================================================================== */

// Base de Données des 13 Figures Scientifiques HD (300 DPI) avec Formules KaTeX
const figuresData = [
  {
    id: "fig00_distributions_sd_sem",
    img: "assets/figures/fig00_distributions_sd_sem.png",
    chapter: "Chapitre 00 : Introduction & Rappels",
    title: "Écart-Type (SD) versus Erreur Standard (SEM)",
    formula: "SD = \\sqrt{\\frac{\\sum_{i=1}^N (x_i - \\bar{x})^2}{N-1}}, \\qquad SEM = \\frac{SD}{\\sqrt{N}}",
    method: "Distribution de Gauss & Théorème Central Limite",
    context: "Dosage de l'albumine sérique chez le rat sain (N = 25 vs N = 100).",
    interpretation: "L'écart-type (SD) mesure la dispersion biologique réelle et intrinsèque des individus. Il ne rétrécit pas avec la taille de l'échantillon. L'erreur standard (SEM) quantifie l'incertitude sur l'estimation de la moyenne et diminue en 1/√N. L'utiliser indûment pour minimiser artificiellement les barres d'erreur est trompeur."
  },
  {
    id: "fig00_hypothesis_testing_alpha_beta",
    img: "assets/figures/fig00_hypothesis_testing_alpha_beta.png",
    chapter: "Chapitre 00 : Introduction & Rappels",
    title: "Zones de Rejet, Risque α et Puissance (1-β)",
    formula: "P(\\text{Rejet } H_0 \\mid H_0 \\text{ vraie}) = \\alpha, \\qquad P(\\text{Rejet } H_0 \\mid H_1 \\text{ vraie}) = 1 - \\beta",
    method: "Test d'hypothèse bilatéral de Neyman-Pearson",
    context: "Évaluation de l'effet hypoglycémiant d'un extrait aqueux de plante médicinale.",
    interpretation: "Le risque α (5%) correspond au taux de faux positifs (rejeter H0 à tort). La puissance statistique (1-β ≥ 80%) représente la capacité de l'essai à détecter une différence thérapeutique réelle. Une étude sous-dimensionnée conduit inévitablement à un faux négatif (erreur β)."
  },
  {
    id: "fig01_interaction_profiles",
    img: "assets/figures/fig01_interaction_profiles.png",
    chapter: "Chapitre 01 : ANOVA à Deux Facteurs Croisés",
    title: "Profils d'Interaction : Additivité versus Synergie",
    formula: "y_{ijk} = \\mu + \\alpha_i + \\beta_j + (\\alpha\\beta)_{ij} + \\epsilon_{ijk}",
    method: "Analyse des profils de réponse factoriels",
    context: "Sécrétion d'insuline en réponse au Glucose (Bas vs Haut) et aux Incrétines (GLP-1).",
    interpretation: "Des courbes parallèles indiquent une absence d'interaction (effet purement additif). Des courbes divergentes ou croisées révèlent une interaction statistique significative : l'effet d'un facteur dépend de l'autre. Ici, l'incretine n'agit puissamment qu'en présence de glycémie élevée (synergie thérapeutique)."
  },
  {
    id: "fig01_mda_two_way_anova",
    img: "assets/figures/fig01_mda_two_way_anova.png",
    chapter: "Chapitre 01 : ANOVA à Deux Facteurs Croisés",
    title: "Peroxydation Lipidique (MDA) sous Traitement Polyphénols",
    formula: "F_{\\text{obs}} = \\frac{CM_{\\text{Effet}}}{CM_{\\text{Résiduel}}}, \\qquad HSD = q_{\\alpha, k, \\nu} \\sqrt{\\frac{CM_R}{n}}",
    method: "ANOVA 2x3 équilibrée suivie du test post-hoc de Tukey HSD",
    context: "Rats Sauvages (WT) vs Diabétiques (db/db) recevant 0, 50 ou 200 mg/kg de curcumine.",
    interpretation: "Le MDA est massivement élevé chez les rats diabétiques non traités (stress oxydatif intense). La curcumine réduit le MDA de manière dose-dépendante, avec une protection plus spectaculaire chez les animaux diabétiques que chez les témoins (interaction Statut x Traitement, p < 0.01)."
  },
  {
    id: "fig02_nested_design_tree",
    img: "assets/figures/fig02_nested_design_tree.png",
    chapter: "Chapitre 02 : ANOVA Hiérarchisée (Nested)",
    title: "Arbre Hiérarchique & Prévention de la Pseudoréplication",
    formula: "F(A) = \\frac{CM_A}{CM_{B(A)}}, \\qquad F(B(A)) = \\frac{CM_{B(A)}}{CM_{\\text{Résiduel}}}",
    method: "Modèle mixte à facteurs emboîtés (B ⊂ A)",
    context: "Production biotechnologique d'insuline : 2 Procédés → 3 Bioréacteurs → 4 Flacons dosés.",
    interpretation: "Chaque bioréacteur n'existe qu'au sein d'un seul procédé. Les 4 flacons prélevés dans la même cuve ne sont que des réplicats techniques. L'effet procédé A doit impérativement être testé contre la variabilité inter-cuves CM_B(A) et non contre l'erreur de mesure intra-flacon."
  },
  {
    id: "fig03_bradford_calibration",
    img: "assets/figures/fig03_bradford_calibration.png",
    chapter: "Chapitre 03 : Régression Linéaire",
    title: "Gamme Étalon Bradford (BSA), Intervalles & Limites LOD/LOQ",
    formula: "y = a x + b, \\qquad LOD = \\frac{3.3 \\cdot s_{y/x}}{a}, \\qquad LOQ = \\frac{10 \\cdot s_{y/x}}{a}",
    method: "Moindres Carrés Ordinaires (MCO) selon normes ICH Q2(R1)",
    context: "Dosage spectrophotométrique de la BSA à 595 nm (gamme 0 à 10 µg/mL).",
    interpretation: "La droite présente une linéarité exemplaire (R² = 0.9992). Les bandes d'intervalles de confiance et de prédiction à 95% s'évasent naturellement aux extrémités. La LOD (0.46 µg/mL) et la LOQ (1.41 µg/mL) définissent rigoureusement la zone de travail analytique valide."
  },
  {
    id: "fig03_residuals_diagnostics",
    img: "assets/figures/fig03_residuals_diagnostics.png",
    chapter: "Chapitre 03 : Régression Linéaire",
    title: "Diagnostic Quadruple des Résidus (Gauss-Markov)",
    formula: "e_i = y_i - \\hat{y}_i, \\qquad \\sum_{i=1}^n e_i = 0, \\qquad \\mathbb{E}(e_i) = 0",
    method: "Résidus vs Fitted, QQ-Plot Normal, Scale-Location, Residuals vs Leverage",
    context: "Validation des hypothèses de linéarité, normalité et homoscédasticité.",
    interpretation: "Les résidus se répartissent de façon homogène autour de zéro sans forme en U (absence de courbure non-linéaire) ni entonnoir (homoscédasticité respectée). Le QQ-plot confirme l'alignement sur la première bissectrice normale sans point aberrant à fort levier."
  },
  {
    id: "fig04_nlls_vs_lineweaver_burk",
    img: "assets/figures/fig04_nlls_vs_lineweaver_burk.png",
    chapter: "Chapitre 04 : Régression Non Linéaire",
    title: "Ajustement Direct (NLLS) versus Lineweaver-Burk",
    formula: "v = \\frac{V_{\\max}[S]}{K_m + [S]} \\qquad \\Longleftrightarrow \\qquad \\frac{1}{v} = \\frac{K_m}{V_{\\max}}\\frac{1}{[S]} + \\frac{1}{V_{\\max}}",
    method: "Algorithme de Levenberg-Marquardt vs Double Réciproque",
    context: "Cinétique enzymatique de la phosphatase alcaline sur pNPP.",
    interpretation: "La double réciproque de Lineweaver-Burk comprime les points à fortes concentrations et étire artificiellement les faibles concentrations, surestimant considérablement Km. L'ajustement non linéaire direct (NLLS) est non biaisé, conserve la métrique réelle et est exigé par les revues internationales."
  },
  {
    id: "fig04_sigmoidal_4pl_elisa",
    img: "assets/figures/fig04_sigmoidal_4pl_elisa.png",
    chapter: "Chapitre 04 : Régression Non Linéaire",
    title: "Modèle Sigmoïde Logistique 4-Paramètres (4PL)",
    formula: "y = D + \\frac{A - D}{1 + \\left(\\frac{x}{C}\\right)^B}",
    method: "Ajustement NLLS sigmoïde pour dosages immunologiques",
    context: "Dosage ELISA de l'interleukine-6 (IL-6) avec estimation de l'EC50.",
    interpretation: "Le modèle 4PL capture avec précision le bruit de fond optique (A = 0.045), la saturation chromogène (D = 2.450), la pente de Hill (B = 1.15) et la concentration médiane EC50 (C = 62.5 pg/mL), permettant une quantification fiable sur plusieurs ordres de grandeur."
  },
  {
    id: "fig05_pca_correlation_and_scores",
    img: "assets/figures/fig05_pca_correlation_and_scores.png",
    chapter: "Chapitre 05 : Analyse en Composantes Principales",
    title: "Cercle des Corrélations & Plan Factoriel des Patients",
    formula: "z_{ij} = \\frac{x_{ij} - \\bar{x}_j}{s_j}, \\qquad \\sum_{k=1}^2 \\lambda_k = 78.0\\% \\text{ de l'inertie totale}",
    method: "ACP Normée sur données métabolomiques sériques",
    context: "Cohorte de 40 patients : Témoins sains vs Diabétiques vs Stéatohépatite NASH.",
    interpretation: "L'axe PC1 (53.0%) oppose l'inflammation/stress oxydatif (IL-6, MDA, TNF-α) aux défenses antioxydantes (Catalase). Les patients NASH se séparent nettement à l'extrême droite. L'axe PC2 (25.0%) est principalement porté par la SOD."
  },
  {
    id: "fig06_dendrogram_ward.png",
    img: "assets/figures/fig06_dendrogram_ward.png",
    chapter: "Chapitre 06 : Classification Hiérarchique (CAH)",
    title: "Dendrogramme de Ward & Seuil de Coupure Optimal",
    formula: "\\Delta I(A, B) = \\frac{n_A n_B}{n_A + n_B} \\, d_E^2(g_A, g_B)",
    method: "Classification Ascendante Hiérarchique (critère de Ward)",
    context: "Typage de souches de Pseudomonas aeruginosa selon leur profil de résistance aux antibiotiques.",
    interpretation: "Le dendrogramme fusionne pas-à-pas les isolats les plus proches en minimisant la perte d'inertie intra-classe. La ligne rouge horizontale au niveau du saut d'inertie majeur identifie sans ambiguïté k = 3 clusters phénotypiques (Sensibles, Résistance intermédiaire, Multi-résistantes BLSE)."
  },
  {
    id: "fig07_power_sample_size_curve",
    img: "assets/figures/fig07_power_sample_size_curve.png",
    chapter: "Chapitre 07 : Interprétation & Bonnes Pratiques",
    title: "Puissance Statistique (1-β) en Fonction de la Taille d'Échantillon",
    formula: "n = \\frac{2 \\cdot (Z_{\\alpha/2} + Z_\\beta)^2}{d^2}, \\qquad d = \\frac{|\\mu_1 - \\mu_2|}{s}",
    method: "Calcul de puissance et dimensionnement d'échantillon a priori",
    context: "Planification d'expérimentation animale selon le principe des 3R (Réduction, Raffinement, Remplacement).",
    interpretation: "Pour un effet biologique modéré (d = 0.5), il faut au moins n = 17 animaux par groupe pour atteindre la puissance standard de 80%. Tester n = 3 animaux conduit à une puissance < 25%, générant des faux négatifs massifs et une exagération artificielle de l'effet en cas de significativité fortuite."
  },
  {
    id: "fig07_barplot_vs_boxplot_transparency",
    img: "assets/figures/fig07_barplot_vs_boxplot_transparency.png",
    chapter: "Chapitre 07 : Interprétation & Bonnes Pratiques",
    title: "Transparence des Données : Barplot Trompeur vs Boxplot + Jitter",
    formula: "\\text{Médiane}, \\qquad IQR = Q_3 - Q_1, \\qquad \\text{Moustaches} = 1.5 \\times IQR",
    method: "Directives de publication Nature / Cell / PLOS",
    context: "Visualisation de biomarqueurs continus chez l'animal.",
    interpretation: "Une barre pleine avec tige SD masque la distribution sous-jacente et dissimule les sous-groupes bimodaux ou les valeurs aberrantes. Le Boxplot combiné au tracé de tous les points réels individuels (Jitter) offre une transparence totale exigée par la communauté scientifique moderne."
  }
];

// Instructions d'installation par Système d'Exploitation
const osGuideData = {
  windows: [
    {
      step: 1,
      title: "Télécharger & Installer Anaconda (Windows)",
      desc: "Téléchargez l'installateur graphique Anaconda pour Windows (64-Bit Graphical Installer) depuis le site officiel.",
      cmd: "https://www.anaconda.com/download"
    },
    {
      step: 2,
      title: "Ouvrir l'Invite de Commande 'Anaconda Prompt'",
      desc: "Dans le menu Démarrer de Windows, recherchez et ouvrez 'Anaconda Prompt' (en mode Administrateur recommandé).",
      cmd: "conda --version"
    },
    {
      step: 3,
      title: "Créer un Environnement Dédié 'biostat'",
      desc: "Isolez les bibliothèques scientifiques dans un environnement virtuel stable sous Python 3.11.",
      cmd: "conda create -n biostat python=3.11 -y"
    },
    {
      step: 4,
      title: "Activer l'Environnement Virtuel",
      desc: "Activez votre environnement avant toute manipulation.",
      cmd: "conda activate biostat"
    },
    {
      step: 5,
      title: "Installer la Suite Scientifique Complète",
      desc: "Installez les paquets requis pour les TP de biochimie (calculs, graphiques, régression, ACP/CAH et Jupyter).",
      cmd: "pip install numpy scipy pandas matplotlib seaborn scikit-learn statsmodels jupyter"
    },
    {
      step: 6,
      title: "Se Déplacer dans le Dossier des TP & Lancer Jupyter",
      desc: "Naviguez vers le dossier de votre cours et lancez l'interface interactive dans votre navigateur.",
      cmd: "cd Documents/Cours_bio_state/travaux_pratiques && jupyter notebook"
    }
  ],
  macos: [
    {
      step: 1,
      title: "Télécharger Miniconda ou Anaconda (macOS)",
      desc: "Téléchargez l'installateur adapté à votre processeur (Apple Silicon M1/M2/M3 ou Intel) depuis le site officiel.",
      cmd: "https://docs.conda.io/en/latest/miniconda.html"
    },
    {
      step: 2,
      title: "Ouvrir l'Application Terminal",
      desc: "Appuyez sur Cmd + Espace, tapez 'Terminal' et validez par Entrée.",
      cmd: "conda --version"
    },
    {
      step: 3,
      title: "Créer l'Environnement Dédié",
      desc: "Créez l'environnement optimisé pour l'architecture macOS.",
      cmd: "conda create -n biostat python=3.11 -y"
    },
    {
      step: 4,
      title: "Activer l'Environnement",
      desc: "Activez la session biostat.",
      cmd: "conda activate biostat"
    },
    {
      step: 5,
      title: "Installer les Bibliothèques Scientifiques",
      desc: "Installez la pile Python scientifique avec support Retina/Matplotlib.",
      cmd: "pip install numpy scipy pandas matplotlib seaborn scikit-learn statsmodels jupyter"
    },
    {
      step: 6,
      title: "Lancer le Serveur Jupyter",
      desc: "Naviguez vers le dossier et démarrez Jupyter Notebook.",
      cmd: "cd ~/Documents/Cours_bio_state/travaux_pratiques && jupyter notebook"
    }
  ],
  linux: [
    {
      step: 1,
      title: "Télécharger & Installer Miniconda (Linux)",
      desc: "Téléchargez le script shell officiel et exécutez-le dans votre terminal bash.",
      cmd: "wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && bash Miniconda3-latest-Linux-x86_64.sh"
    },
    {
      step: 2,
      title: "Recharger la Session Bash",
      desc: "Actualisez votre configuration shell pour charger la commande conda.",
      cmd: "source ~/.bashrc && conda --version"
    },
    {
      step: 3,
      title: "Créer l'Environnement 'biostat'",
      desc: "Créez l'environnement isolé sous Python 3.11.",
      cmd: "conda create -n biostat python=3.11 -y"
    },
    {
      step: 4,
      title: "Activer l'Environnement",
      desc: "Activez l'environnement de travail.",
      cmd: "conda activate biostat"
    },
    {
      step: 5,
      title: "Installer les Paquets Scientifiques",
      desc: "Installez NumPy, SciPy, Pandas, Seaborn, Scikit-learn et Jupyter.",
      cmd: "pip install numpy scipy pandas matplotlib seaborn scikit-learn statsmodels jupyter"
    },
    {
      step: 6,
      title: "Lancer Jupyter Notebook",
      desc: "Rendez-vous dans le répertoire des TP et lancez l'application.",
      cmd: "cd ~/Documents/Cours_bio_state/travaux_pratiques && jupyter notebook"
    }
  ]
};

// ==========================================================================
// Initialisation Globale au Chargement du DOM
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileNavigation();
  initDownloadsFilter();
  initOsGuide();
  initFiguresGallery();
  initSmoothScroll();
});

// --------------------------------------------------------------------------
// 1. Thème Clair par Défaut & Bascule
// --------------------------------------------------------------------------
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  // Thème clair par défaut si aucun enregistrement préalable
  const currentTheme = localStorage.getItem("bio_theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  toggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("bio_theme", newTheme);
    updateThemeIcon(newTheme);
    showToast(`Mode ${newTheme === 'dark' ? 'Sombre' : 'Clair'} activé`);
  });
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById("themeToggleBtn");
  // Si le thème actuel est clair, proposer de passer au sombre (lune)
  // Si sombre, proposer de passer au clair (soleil)
  toggleBtn.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// --------------------------------------------------------------------------
// 2. Navigation Mobile & Menu Hamburger
// --------------------------------------------------------------------------
function initMobileNavigation() {
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileNavDrawer");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!mobileBtn || !mobileDrawer) return;

  mobileBtn.addEventListener("click", () => {
    mobileDrawer.classList.toggle("open");
    const isOpen = mobileDrawer.classList.contains("open");
    mobileBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
      mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// --------------------------------------------------------------------------
// 3. Hub Central de Téléchargement & Filtres Catégories
// --------------------------------------------------------------------------
function initDownloadsFilter() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const searchInput = document.getElementById("downloadSearch");
  const cards = document.querySelectorAll(".download-card");

  let activeCategory = "all";
  let searchQuery = "";

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-filter");
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }

  function filterCards() {
    cards.forEach(card => {
      const cardCategory = card.getAttribute("data-category");
      const cardText = card.textContent.toLowerCase();

      const matchesCategory = (activeCategory === "all" || cardCategory === activeCategory);
      const matchesSearch = (searchQuery === "" || cardText.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }
}

// --------------------------------------------------------------------------
// 4. Guide des TP & Sélecteur d'OS
// --------------------------------------------------------------------------
function initOsGuide() {
  const osBtns = document.querySelectorAll(".os-btn");
  const stepsContainer = document.getElementById("guideStepsContainer");

  osBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      osBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const os = btn.getAttribute("data-os");
      renderOsSteps(os);
    });
  });

  // Rendu initial (Windows par défaut)
  renderOsSteps("windows");
}

function renderOsSteps(os) {
  const stepsContainer = document.getElementById("guideStepsContainer");
  if (!stepsContainer) return;
  const steps = osGuideData[os] || osGuideData.windows;

  stepsContainer.innerHTML = steps.map(s => `
    <div class="step-item">
      <div class="step-badge">${s.step}</div>
      <div class="step-content">
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
        <div class="terminal-box">
          <code>${s.cmd}</code>
          <button class="terminal-copy-btn" onclick="copyToClipboard('${escapeJsString(s.cmd)}')">
            <i class="fas fa-copy"></i> Copier
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function escapeJsString(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// --------------------------------------------------------------------------
// 5. Galerie Scientifique des Figures HD & Modale KaTeX
// --------------------------------------------------------------------------
function initFiguresGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  const modal = document.getElementById("figureModal");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!galleryGrid) return;

  // Rendu des cartes de la galerie
  galleryGrid.innerHTML = figuresData.map((fig, idx) => `
    <div class="figure-card" onclick="openFigureModal(${idx})">
      <div class="figure-img-container">
        <img src="${fig.img}" alt="${fig.title}" loading="lazy">
        <div class="figure-zoom-overlay">
          <i class="fas fa-search-plus"></i>
        </div>
      </div>
      <div class="figure-body">
        <div class="figure-chapter">${fig.chapter}</div>
        <h4>${fig.title}</h4>
        <p>${fig.context}</p>
        <div class="figure-click-hint">
          <i class="fas fa-info-circle"></i> Voir formule mathématique & interprétation
        </div>
      </div>
    </div>
  `).join("");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

function openFigureModal(index) {
  const fig = figuresData[index];
  if (!fig) return;

  const modal = document.getElementById("figureModal");
  document.getElementById("modalImg").src = fig.img;
  document.getElementById("modalImg").alt = fig.title;
  document.getElementById("modalChapter").textContent = fig.chapter;
  document.getElementById("modalTitle").textContent = fig.title;
  document.getElementById("modalMethod").textContent = fig.method;
  document.getElementById("modalContext").textContent = fig.context;
  document.getElementById("modalInterpretation").textContent = fig.interpretation;

  // Rendu de la formule avec KaTeX
  const formulaContainer = document.getElementById("modalFormula");
  if (formulaContainer) {
    if (window.katex && typeof window.katex.render === "function") {
      try {
        window.katex.render(fig.formula, formulaContainer, {
          displayMode: true,
          throwOnError: false
        });
      } catch (err) {
        console.error("Erreur KaTeX:", err);
        formulaContainer.textContent = fig.formula;
      }
    } else {
      formulaContainer.textContent = fig.formula;
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("figureModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// --------------------------------------------------------------------------
// 6. Copie Presse-Papier & Notifications Toast
// --------------------------------------------------------------------------
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Commande copiée dans le presse-papier !");
  }).catch(() => {
    showToast("Impossible de copier automatiquement.");
  });
}

function showToast(message) {
  let toast = document.getElementById("siteToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "siteToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// --------------------------------------------------------------------------
// 7. Défilement Fluide Navigation & Indicateur de Section Active
// --------------------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Mise à jour du lien actif au défilement
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let currentId = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  }, { passive: true });
}

// ==========================================================================
// Rendu Typographique Mathématique Global KaTeX (Auto-Render)
// ==========================================================================
window.renderAllLatex = function(element) {
  if (typeof window.renderMathInElement === "function") {
    try {
      window.renderMathInElement(element || document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        throwOnError: false
      });
    } catch (err) {
      console.warn("KaTeX render error:", err);
    }
  }
};

function initKatexAutoRender() {
  function tryRender() {
    window.renderAllLatex(document.body);
  }

  tryRender();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryRender);
  }
  window.addEventListener("load", tryRender);
}

initKatexAutoRender();

