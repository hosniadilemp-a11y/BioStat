import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.optimize import curve_fit
from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# Dossier de destination des figures
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../sources/figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configuration générale de Matplotlib pour des graphiques de haute qualité
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.edgecolor'] = '#1A365D'
plt.rcParams['axes.linewidth'] = 1.0
plt.rcParams['grid.color'] = '#E2E8F0'
plt.rcParams['grid.linestyle'] = '--'

BioNavy = '#1A365D'
BioTeal = '#0D9488'
BioGreen = '#2E7D32'
BioAmber = '#D97706'
BioRed = '#E11D48'
BioDark = '#1E293B'

print(f"Génération des figures dans : {OUTPUT_DIR}")

# ==============================================================================
# CHAPITRE 0 : Figures
# ==============================================================================

# Fig 0.1 : Loi Normale, SD vs SEM
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

x = np.linspace(-4, 4, 1000)
y = stats.norm.pdf(x, 0, 1)

ax1.plot(x, y, color=BioNavy, lw=2.5)
ax1.fill_between(x, y, where=(x >= -1) & (x <= 1), color=BioTeal, alpha=0.3, label='± 1 SD (68.3%)')
ax1.fill_between(x, y, where=((x >= -2) & (x < -1)) | ((x > 1) & (x <= 2)), color=BioNavy, alpha=0.2, label='± 2 SD (95.4%)')
ax1.axvline(0, color=BioNavy, linestyle='--', lw=1.5)
ax1.set_title("Écart-Type (SD) : Dispersion Biologique", fontweight='bold', fontsize=11, color=BioNavy)
ax1.set_xlabel("Écart à la moyenne ($\mu$)", fontsize=10)
ax1.set_ylabel("Densité de probabilité", fontsize=10)
ax1.legend(frameon=True, facecolor='white', loc='upper right', fontsize=9)
ax1.grid(True, alpha=0.5)

# SEM
n_vals = [3, 10, 30]
colors_sem = [BioAmber, BioTeal, BioNavy]
for n, c in zip(n_vals, colors_sem):
    y_sem = stats.norm.pdf(x, 0, 1/np.sqrt(n))
    ax2.plot(x, y_sem, color=c, lw=2, label=f'Moyenne d\'échantillon (n={n})')

ax2.set_title("Erreur Standard (SEM) : Précision de l'Estimation", fontweight='bold', fontsize=11, color=BioNavy)
ax2.set_xlabel("Écart de l'estimation ($\mu$)", fontsize=10)
ax2.set_ylabel("Densité de probabilité", fontsize=10)
ax2.legend(frameon=True, facecolor='white', loc='upper right', fontsize=9)
ax2.grid(True, alpha=0.5)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_distributions_sd_sem.png'))
plt.close()

# Fig 0.2 : Tests d'hypothèses Alpha et Bêta
fig, ax = plt.subplots(figsize=(7, 3.8), dpi=300)
x = np.linspace(-4, 7, 1000)
y_h0 = stats.norm.pdf(x, 0, 1)
y_h1 = stats.norm.pdf(x, 3, 1)

crit = stats.norm.ppf(0.95, 0, 1) # Seuil unilatéral 5%

ax.plot(x, y_h0, color=BioNavy, lw=2.5, label='Distribution sous $H_0$ (Pas d\'effet)')
ax.plot(x, y_h1, color=BioTeal, lw=2.5, label='Distribution sous $H_1$ (Effet biologique réel)')

# Alpha (Rejet H0 à tort)
ax.fill_between(x, y_h0, where=(x >= crit), color=BioRed, alpha=0.5, label=r'Risque $\alpha$ (Erreur Type I : 5%)')
# Beta (Non rejet H0 à tort)
ax.fill_between(x, y_h1, where=(x < crit), color=BioAmber, alpha=0.4, label=r'Risque $\beta$ (Erreur Type II)')
# Puissance
ax.fill_between(x, y_h1, where=(x >= crit), color=BioGreen, alpha=0.3, label=r'Puissance $1-\beta$ (Décision correcte)')

ax.axvline(crit, color='black', linestyle='--', lw=1.5)
ax.text(crit+0.1, 0.35, f'Seuil critique\n(Z = {crit:.2f})', fontsize=9, fontweight='bold')

ax.set_title(r"Logique Statistique : Risques $\alpha$, $\beta$ et Puissance ($1-\beta$)", fontweight='bold', fontsize=11, color=BioNavy)
ax.set_xlabel("Valeur de la statistique de test", fontsize=10)
ax.set_ylabel("Densité", fontsize=10)
ax.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8)
ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_hypothesis_testing_alpha_beta.png'))
plt.close()


# Fig 0.3 : Tendance Centrale et Asymétrie (Moyenne vs Médiane vs Mode)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

# Distribution Symétrique (Normale)
x_sym = np.linspace(-4, 4, 1000)
y_sym = stats.norm.pdf(x_sym, 0, 1)
ax1.plot(x_sym, y_sym, color=BioNavy, lw=2.5)
ax1.fill_between(x_sym, y_sym, color=BioTeal, alpha=0.15)
ax1.axvline(0, color=BioRed, linestyle='-', lw=2, label='Moyenne = Médiane = Mode (0.0)')
ax1.set_title("Distribution Symétrique (Normale)", fontweight='bold', fontsize=11, color=BioNavy)
ax1.set_xlabel("Valeur mesurée (ex: Protéinémie g/L centrée)", fontsize=10)
ax1.set_ylabel("Densité de probabilité", fontsize=10)
ax1.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
ax1.grid(True, alpha=0.4)

# Distribution Asymétrique à Droite (Log-Normale, ex: Cytokines IL-6 pg/mL)
x_asym = np.linspace(0.01, 8, 1000)
s_param = 0.75
y_asym = stats.lognorm.pdf(x_asym, s_param, scale=2.0)
mode_val = 2.0 * np.exp(-s_param**2)
median_val = 2.0
mean_val = 2.0 * np.exp(s_param**2 / 2)

ax2.plot(x_asym, y_asym, color=BioNavy, lw=2.5)
ax2.fill_between(x_asym, y_asym, color=BioAmber, alpha=0.15)
ax2.axvline(mode_val, color=BioTeal, linestyle=':', lw=2, label=f'Mode ({mode_val:.2f})')
ax2.axvline(median_val, color=BioGreen, linestyle='--', lw=2.2, label=f'Médiane ({median_val:.2f})')
ax2.axvline(mean_val, color=BioRed, linestyle='-', lw=2, label=f'Moyenne ({mean_val:.2f})')
ax2.set_title("Distribution Asymétrique Positive (Biomarqueurs)", fontweight='bold', fontsize=11, color=BioNavy)
ax2.set_xlabel("Concentration sérique (ex: IL-6 pg/mL)", fontsize=10)
ax2.set_ylabel("Densité de probabilité", fontsize=10)
ax2.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_central_tendency_skewness.png'))
plt.close()

# Fig 0.4 : Anatomie Complète du Boxplot (Tukey) et Détection des Outliers
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

np.random.seed(42)
data_normal = np.random.normal(50, 8, 80)
# Ajouter deux outliers
data_with_outliers = np.concatenate([data_normal, [18.0, 82.0]])

# Boxplot détaillé
bp = ax1.boxplot(data_with_outliers, patch_artist=True, widths=0.4,
                 boxprops=dict(facecolor=BioTeal, alpha=0.4, color=BioNavy, lw=1.5),
                 medianprops=dict(color=BioRed, lw=2.5),
                 whiskerprops=dict(color=BioNavy, lw=1.5, linestyle='--'),
                 capprops=dict(color=BioNavy, lw=1.5),
                 flierprops=dict(marker='o', markerfacecolor=BioRed, markeredgecolor=BioNavy, markersize=8))

# Annotations pédagogiques sur le Boxplot
q1, med, q3 = np.percentile(data_with_outliers, [25, 50, 75])
iqr = q3 - q1
lower_whisker = np.min(data_with_outliers[data_with_outliers >= q1 - 1.5 * iqr])
upper_whisker = np.max(data_with_outliers[data_with_outliers <= q3 + 1.5 * iqr])

ax1.text(1.28, med, f"Médiane = {med:.1f}", va='center', fontsize=9, fontweight='bold', color=BioRed)
ax1.text(1.28, q3, f"Q3 (75%) = {q3:.1f}", va='center', fontsize=8.5, color=BioNavy)
ax1.text(1.28, q1, f"Q1 (25%) = {q1:.1f}", va='center', fontsize=8.5, color=BioNavy)
ax1.text(0.72, (q1 + q3)/2, f"IQR = {iqr:.1f}", ha='right', va='center', fontsize=8.5, fontweight='bold', color=BioNavy)
ax1.annotate('Outlier biologique (> 1.5×IQR)', xy=(1, 82), xytext=(1.25, 80),
             arrowprops=dict(facecolor=BioRed, arrowstyle='->', lw=1.5), fontsize=8.5, fontweight='bold', color=BioRed)

ax1.set_xlim(0.4, 1.9)
ax1.set_title("Anatomie du Boxplot de Tukey (IQR & Outliers)", fontweight='bold', fontsize=11, color=BioNavy)
ax1.set_ylabel("Mesure biologique (ex: Activité enzymatique)", fontsize=10)
ax1.set_xticks([1])
ax1.set_xticklabels(["Échantillon Expérimental"], fontsize=9.5)
ax1.grid(True, axis='y', alpha=0.4)

# Comparaison Boxplot vs Violin Plot vs Points individuels
sns.violinplot(data=[data_with_outliers], ax=ax2, color=BioTeal, inner=None, cut=0)
sns.boxplot(data=[data_with_outliers], ax=ax2, width=0.15, color='white', boxprops=dict(alpha=0.7),
            medianprops=dict(color=BioRed, lw=2))
sns.stripplot(data=[data_with_outliers], ax=ax2, color=BioNavy, size=5, jitter=0.15, alpha=0.6)
ax2.set_title("Violin Plot + Boxplot + Données Individuelles", fontweight='bold', fontsize=11, color=BioNavy)
ax2.set_ylabel("Mesure biologique", fontsize=10)
ax2.set_xticks([0])
ax2.set_xticklabels(["Distribution Réelle Complète"], fontsize=9.5)
ax2.grid(True, axis='y', alpha=0.4)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_boxplots_outliers_tukey.png'))
plt.close()

# Fig 0.5 : Théorème Central Limite (TCL) en Biologie
fig, axes = plt.subplots(1, 3, figsize=(11, 3.8), dpi=300)

np.random.seed(123)
# Population parente non normale : Exponentielle (ex: durée de survie cellulaire en culture)
pop_exp = np.random.exponential(scale=2.0, size=50000)

axes[0].hist(pop_exp, bins=40, density=True, color=BioAmber, alpha=0.6, edgecolor=BioNavy)
axes[0].set_title("Population Parente (Non Normale)\nex: Temps de survie (Exp)", fontweight='bold', fontsize=10, color=BioNavy)
axes[0].set_xlabel("Valeur biologique brute", fontsize=9)
axes[0].set_ylabel("Densité", fontsize=9)
axes[0].set_xlim(0, 10)
axes[0].grid(True, alpha=0.3)

# Échantillons de n = 5
means_n5 = [np.mean(np.random.choice(pop_exp, size=5)) for _ in range(5000)]
axes[1].hist(means_n5, bins=35, density=True, color=BioTeal, alpha=0.6, edgecolor=BioNavy)
axes[1].set_title("Distribution des Moyennes ($n = 5$)\nAsymétrie réduite", fontweight='bold', fontsize=10, color=BioNavy)
axes[1].set_xlabel("Moyenne $\\bar{X}$ de 5 mesures", fontsize=9)
axes[1].set_xlim(0, 6)
axes[1].grid(True, alpha=0.3)

# Échantillons de n = 30
means_n30 = [np.mean(np.random.choice(pop_exp, size=30)) for _ in range(5000)]
axes[2].hist(means_n30, bins=35, density=True, color=BioGreen, alpha=0.6, edgecolor=BioNavy)
# Courbe normale théorique par dessus
x_norm = np.linspace(1, 3, 200)
axes[2].plot(x_norm, stats.norm.pdf(x_norm, 2.0, 2.0/np.sqrt(30)), color=BioRed, lw=2.2, label='Courbe Gaussienne')
axes[2].set_title("Distribution des Moyennes ($n = 30$)\nConvergence Gaussienne (TCL)", fontweight='bold', fontsize=10, color=BioNavy)
axes[2].set_xlabel("Moyenne $\\bar{X}$ de 30 mesures", fontsize=9)
axes[2].set_xlim(0.8, 3.2)
axes[2].legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_central_limit_theorem.png'))
plt.close()

# Fig 0.6 : Théorème de Bayes & Diagnostic ELISA (VPP vs Prévalence & Matrice)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

# Panel A : Arbre / Matrice pour N = 10 000 (Prévalence 1%, Se 99%, Sp 95%)
prev = 0.01
se = 0.99
sp = 0.95
n_total = 10000
malades = n_total * prev
sains = n_total * (1 - prev)
vp = malades * se
fn = malades * (1 - se)
fp = sains * (1 - sp)
vn = sains * sp

categories = ['Vrais Positifs\n(Malades)', 'Faux Positifs\n(Sains testés +)', 'Faux Négatifs\n(Malades testés -)']
values = [vp, fp, fn]
colors_cat = [BioTeal, BioRed, BioAmber]
bars = ax1.bar(categories, values, color=colors_cat, width=0.55, edgecolor=BioNavy, lw=1.2)
for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2, yval + 10, f'{int(yval)}', ha='center', va='bottom', fontsize=9.5, fontweight='bold')

vpp_example = vp / (vp + fp) * 100
ax1.set_title(f"A. Diagnostic Maladie Rare (N = 10 000)\nPrévalence 1%, Se=99%, Sp=95% $\\rightarrow$ VPP = {vpp_example:.1f}%", fontweight='bold', fontsize=9.5, color=BioNavy)
ax1.set_ylabel("Nombre d'individus", fontsize=9.5)
ax1.set_ylim(0, max(values) * 1.25)
ax1.grid(True, axis='y', alpha=0.3)

# Panel B : Courbe VPP en fonction de la Prévalence
prevalences = np.linspace(0.001, 0.20, 500)
for sp_val, col, ls in zip([0.90, 0.95, 0.99, 0.999], [BioAmber, BioNavy, BioTeal, BioGreen], ['--', '-.', '-', ':']):
    vpp_curve = (0.99 * prevalences) / (0.99 * prevalences + (1 - sp_val) * (1 - prevalences)) * 100
    ax2.plot(prevalences * 100, vpp_curve, label=f'Spécificité = {sp_val*100:.1f}%', color=col, linestyle=ls, lw=2.2)

ax2.set_title("B. Valeur Prédictive Positive (VPP)\nselon la Prévalence (Sensibilité = 99%)", fontweight='bold', fontsize=9.5, color=BioNavy)
ax2.set_xlabel("Prévalence réelle dans la population (%)", fontsize=9.5)
ax2.set_ylabel("VPP : P(Malade | Test +) (%)", fontsize=9.5)
ax2.legend(frameon=True, facecolor='white', loc='lower right', fontsize=8.5)
ax2.grid(True, alpha=0.3)
ax2.set_xlim(0.1, 20)
ax2.set_ylim(0, 105)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_bayes_diagnostic_elisa.png'))
plt.close()


# Fig 0.7 : Lois Discrètes (Binomiale vs Poisson en Microbiologie)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.0), dpi=300)

# Binomiale : viabilité cellulaire ou puits positifs PCR
n_binom, p_binom = 20, 0.35
k_vals_binom = np.arange(0, 16)
pmf_binom = stats.binom.pmf(k_vals_binom, n_binom, p_binom)

ax1.bar(k_vals_binom, pmf_binom, color=BioTeal, alpha=0.7, edgecolor=BioNavy, lw=1.2, width=0.6)
ax1.set_title("A. Loi Binomiale $\\mathcal{B}(n=20, p=0.35)$\nSuccès/Échec (ex: Puits qPCR Positifs)", fontweight='bold', fontsize=10, color=BioNavy)
ax1.set_xlabel("Nombre de succès $k$ (puits amplifiés)", fontsize=9.5)
ax1.set_ylabel("Probabilité $P(X = k)$", fontsize=9.5)
ax1.axvline(n_binom * p_binom, color=BioRed, linestyle='--', lw=2, label=f'Espérance $\\mu = np = {n_binom*p_binom:.1f}$')
ax1.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
ax1.grid(True, alpha=0.3)

# Poisson : comptage d'UFC en boîte de Pétri
lambda_poisson = 4.2
k_vals_poisson = np.arange(0, 14)
pmf_poisson = stats.poisson.pmf(k_vals_poisson, lambda_poisson)

ax2.bar(k_vals_poisson, pmf_poisson, color=BioAmber, alpha=0.7, edgecolor=BioNavy, lw=1.2, width=0.6)
ax2.set_title("B. Loi de Poisson $\\mathcal{P}(\\lambda=4.2)$\nÉvénements Rares (ex: Colonies UFC / Boîte)", fontweight='bold', fontsize=10, color=BioNavy)
ax2.set_xlabel("Nombre de colonies observées $k$", fontsize=9.5)
ax2.set_ylabel("Probabilité $P(X = k)$", fontsize=9.5)
ax2.axvline(lambda_poisson, color=BioRed, linestyle='--', lw=2, label=f'Espérance = Variance = $\\lambda = {lambda_poisson}$')
ax2.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_poisson_binomial.png'))
plt.close()


# Fig 0.8 : Simulation de 25 Intervalles de Confiance à 95%
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.3), dpi=300)

np.random.seed(42)
mu_true = 100.0
sigma_true = 15.0
n_samples = 25
sample_size = 12

ci_lowers, ci_uppers, means = [], [], []
covers = []

for i in range(n_samples):
    sample = np.random.normal(mu_true, sigma_true, sample_size)
    m = np.mean(sample)
    s = np.std(sample, ddof=1)
    sem = s / np.sqrt(sample_size)
    t_crit = stats.t.ppf(0.975, df=sample_size-1)
    lower = m - t_crit * sem
    upper = m + t_crit * sem
    means.append(m)
    ci_lowers.append(lower)
    ci_uppers.append(upper)
    covers.append(lower <= mu_true <= upper)

y_indices = np.arange(1, n_samples + 1)
for i in range(n_samples):
    col = BioTeal if covers[i] else BioRed
    lw_val = 1.8 if covers[i] else 2.6
    ax1.plot([ci_lowers[i], ci_uppers[i]], [y_indices[i], y_indices[i]], color=col, lw=lw_val)
    ax1.plot(means[i], y_indices[i], marker='o', markersize=4, color=col)

ax1.axvline(mu_true, color=BioNavy, linestyle='--', lw=2, label=f'Vraie moyenne $\\mu = {mu_true}$')
ax1.set_title("A. 25 Intervalles de Confiance à 95%\nVert = Couvre $\\mu$ | Rouge = Manque $\\mu$", fontweight='bold', fontsize=9.5, color=BioNavy)
ax1.set_xlabel("Valeur estimée du paramètre", fontsize=9.5)
ax1.set_ylabel("Numéro de l'expérience indépendante", fontsize=9.5)
ax1.set_ylim(0.5, n_samples + 0.5)
ax1.legend(frameon=True, facecolor='white', loc='upper right', fontsize=8.5)
ax1.grid(True, alpha=0.3)

# Panel B : Effet de la taille de l'échantillon N sur la largeur de l'IC 95%
n_sizes = np.array([3, 6, 12, 25, 50, 100])
ci_widths = [2 * stats.t.ppf(0.975, df=n-1) * (sigma_true / np.sqrt(n)) for n in n_sizes]

ax2.plot(n_sizes, ci_widths, marker='s', color=BioNavy, lw=2.2, markersize=6)
ax2.fill_between(n_sizes, ci_widths, color=BioTeal, alpha=0.2)
ax2.set_title("B. Rétrécissement de l'IC 95%\navec la taille d'échantillon ($1/\\sqrt{N}$)", fontweight='bold', fontsize=9.5, color=BioNavy)
ax2.set_xlabel("Nombre de réplicats biologiques $N$", fontsize=9.5)
ax2.set_ylabel("Largeur totale de l'IC 95%", fontsize=9.5)
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_confidence_intervals_simulation.png'))
plt.close()


# Fig 0.9 : Arbre Décisionnel des Tests Biostatistiques
fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
ax.axis('off')

# Dessin vectoriel clair de l'arbre
boxes_info = [
    # Niveau 1 : Question Racine
    (0.50, 0.90, "Quel est l'objectif de l'analyse ?", BioNavy, 0.40, 0.12),
    # Niveau 2 : Deux Branches
    (0.25, 0.65, "Comparer des Groupes\n(Moyennes / Médianes)", BioTeal, 0.35, 0.14),
    (0.75, 0.65, "Analyser des Relations\n(Corrélation / Régression)", BioAmber, 0.35, 0.14),
    # Niveau 3 : Groupes
    (0.12, 0.35, "2 Groupes\n• Paramétrique : Student $t$\n• Non-param. : Mann-Whitney", BioNavy, 0.23, 0.22),
    (0.38, 0.35, "$\\geq 3$ Groupes\n• Paramétrique : ANOVA\n• Non-param. : Kruskal-Wallis", BioNavy, 0.23, 0.22),
    # Niveau 3 : Relations
    (0.64, 0.35, "Liaison Linéaire\n• Paramétrique : Pearson $r$\n• Non-param. : Spearman $\\rho$", BioNavy, 0.23, 0.22),
    (0.88, 0.35, "Modélisation\n• Linéaire : MCO ($y=ax+b$)\n• Non Linéaire : Michaelis-Menten", BioNavy, 0.23, 0.22),
]

for xc, yc, txt, col, w, h in boxes_info:
    rect = plt.Rectangle((xc - w/2, yc - h/2), w, h, facecolor=col, alpha=0.15, edgecolor=col, lw=2, transform=ax.transAxes, zorder=2)
    ax.add_patch(rect)
    ax.text(xc, yc, txt, ha='center', va='center', fontsize=8.5, fontweight='bold', color=BioDark, transform=ax.transAxes, zorder=3)

# Flèches de connexion
arrows = [
    ((0.45, 0.84), (0.30, 0.72)),
    ((0.55, 0.84), (0.70, 0.72)),
    ((0.20, 0.58), (0.15, 0.46)),
    ((0.30, 0.58), (0.35, 0.46)),
    ((0.70, 0.58), (0.66, 0.46)),
    ((0.80, 0.58), (0.86, 0.46)),
]
for p1, p2 in arrows:
    ax.annotate('', xy=p2, xytext=p1, xycoords='axes fraction', textcoords='axes fraction',
                arrowprops=dict(arrowstyle="->", color=BioNavy, lw=1.8))

ax.set_title("Arbre Décisionnel Fondamental en Biostatistiques (Master 2)", fontweight='bold', fontsize=12, color=BioNavy, pad=15)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig00_decision_tree_tests.png'))
plt.close()

# ==============================================================================
# CHAPITRE 1 : Figures
# ==============================================================================

# Fig 1.1 : Profils d'interaction
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.5, 4), dpi=300)

doses = ['Témoin', 'Dose Faible', 'Dose Forte']
wt_add = [10, 15, 20]
mut_add = [18, 23, 28]

ax1.plot(doses, wt_add, marker='o', color=BioNavy, lw=2.5, label='Génotype WT')
ax1.plot(doses, mut_add, marker='s', color=BioTeal, lw=2.5, label='Génotype Muté')
ax1.set_title("A. Absence d'Interaction (Additivité)\nCourbes Parallèles", fontweight='bold', fontsize=10, color=BioNavy)
ax1.set_ylabel("Activité enzymatique (UI/L)", fontsize=9)
ax1.legend(frameon=True, facecolor='white', fontsize=8)
ax1.grid(True, alpha=0.5)

wt_int = [10, 16, 22]
mut_int = [18, 14, 8]

ax2.plot(doses, wt_int, marker='o', color=BioNavy, lw=2.5, label='Génotype WT')
ax2.plot(doses, mut_int, marker='s', color=BioRed, lw=2.5, label='Génotype Muté')
ax2.set_title("B. Interaction Significative (Antagonisme)\nCourbes Sécantes", fontweight='bold', fontsize=10, color=BioNavy)
ax2.set_ylabel("Activité enzymatique (UI/L)", fontsize=9)
ax2.legend(frameon=True, facecolor='white', fontsize=8)
ax2.grid(True, alpha=0.5)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig01_interaction_profiles.png'))
plt.close()

# Fig 1.2 : Données réelles MDA
df_mda = pd.read_csv(os.path.join(OUTPUT_DIR, '../../travaux_pratiques/datasets/peroxydation_mda_diabete.csv'))
fig, ax = plt.subplots(figsize=(7, 4), dpi=300)
sns.boxplot(data=df_mda, x='Traitement', y='MDA_nmol_mg_prot', hue='Genotype', palette=[BioNavy, BioTeal], ax=ax, width=0.55, boxprops=dict(alpha=0.6))
sns.stripplot(data=df_mda, x='Traitement', y='MDA_nmol_mg_prot', hue='Genotype', dodge=True, jitter=0.2, color='black', size=5, ax=ax)
ax.set_title("Stress Oxydatif Hépatique (MDA) : Effet Traitement x Génotype", fontweight='bold', fontsize=11, color=BioNavy)
ax.set_xlabel("Traitement Antioxydant", fontsize=10)
ax.set_ylabel("MDA (nmol / mg de protéines)", fontsize=10)
handles, labels = ax.get_legend_handles_labels()
ax.legend(handles[:2], labels[:2], title="Génotype", frameon=True, facecolor='white')
ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig01_mda_two_way_anova.png'))
plt.close()


# ==============================================================================
# CHAPITRE 2 : Figures
# ==============================================================================

# Fig 2.1 : Structure hiérarchisée
fig, ax = plt.subplots(figsize=(8, 3.8), dpi=300)
ax.axis('off')

# Dessin de l'arbre hiérarchique avec rectangles
lots = ['Lot 1', 'Lot 2', 'Lot 3']
colors_lot = [BioNavy, BioTeal, BioGreen]
for i, l in enumerate(lots):
    x_lot = 1.5 + i * 3.2
    rect_lot = plt.Rectangle((x_lot-0.9, 2.5), 1.8, 0.7, facecolor=colors_lot[i], edgecolor='black', alpha=0.85, zorder=3)
    ax.add_patch(rect_lot)
    ax.text(x_lot, 2.85, l, color='white', fontweight='bold', ha='center', va='center', fontsize=10)
    
    # Flacons
    for j in range(3):
        x_f = x_lot - 0.7 + j * 0.7
        rect_f = plt.Rectangle((x_f-0.28, 1.2), 0.56, 0.5, facecolor=colors_lot[i], alpha=0.35, edgecolor=colors_lot[i], zorder=3)
        ax.add_patch(rect_f)
        ax.text(x_f, 1.45, f'F{j+1}', color='black', fontsize=8, ha='center', va='center', fontweight='bold')
        ax.plot([x_lot, x_f], [2.5, 1.7], color='gray', lw=1.2, zorder=1)
        
        # Réplicats
        for r in range(2):
            x_r = x_f - 0.12 + r * 0.24
            circle = plt.Circle((x_r, 0.3), 0.08, color='#64748B', zorder=3)
            ax.add_patch(circle)
            ax.plot([x_f, x_r], [1.2, 0.38], color='lightgray', lw=1, zorder=1)

ax.text(0.1, 2.85, "Facteur A\n(Principal)", fontweight='bold', color=BioNavy, va='center', fontsize=9)
ax.text(0.1, 1.45, "Facteur B(A)\n(Emboîté)", fontweight='bold', color=BioTeal, va='center', fontsize=9)
ax.text(0.1, 0.3, "Réplicats\nTechniques", fontweight='bold', color='#64748B', va='center', fontsize=9)

ax.set_xlim(-0.2, 9.5)
ax.set_ylim(0, 3.5)
ax.set_title("Architecture d'un Plan d'Expérience Hiérarchisé (Nested Design)", fontweight='bold', fontsize=11, color=BioNavy)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig02_nested_design_tree.png'))
plt.close()


# ==============================================================================
# CHAPITRE 3 : Figures
# ==============================================================================

# Fig 3.1 : Gamme Bradford avec LOD/LOQ
df_brad = pd.read_csv(os.path.join(OUTPUT_DIR, '../../travaux_pratiques/datasets/dosage_bradford.csv'))
X = df_brad['BSA_ug_mL'].values
Y = df_brad['Absorbance_595nm'].values

res = stats.linregress(X, Y)
pente, inter = res.slope, res.intercept
residus = Y - (inter + pente * X)
s_res = np.sqrt(np.sum(residus**2) / (len(X) - 2))
LOD = 3.3 * s_res / pente
LOQ = 10.0 * s_res / pente

X_line = np.linspace(0, 26, 200)
Y_line = inter + pente * X_line

# Bandes de confiance à 95%
n = len(X)
se_fit = s_res * np.sqrt(1/n + (X_line - np.mean(X))**2 / np.sum((X - np.mean(X))**2))
se_pred = s_res * np.sqrt(1 + 1/n + (X_line - np.mean(X))**2 / np.sum((X - np.mean(X))**2))
t_crit = stats.t.ppf(0.975, n - 2)

fig, ax = plt.subplots(figsize=(7.5, 4.3), dpi=300)
ax.scatter(X, Y, color=BioNavy, s=40, zorder=5, label='Triplicats expérimentaux')
ax.plot(X_line, Y_line, color=BioTeal, lw=2.2, label=f'Régression linéaire ($R^2 = {res.rvalue**2:.4f}$)')
ax.fill_between(X_line, Y_line - t_crit * se_fit, Y_line + t_crit * se_fit, color=BioTeal, alpha=0.25, label='Intervalle de confiance (95%)')
ax.fill_between(X_line, Y_line - t_crit * se_pred, Y_line + t_crit * se_pred, color='gray', alpha=0.12, label='Intervalle de prédiction (95%)')

ax.axvline(LOD, color=BioAmber, linestyle=':', lw=1.8, label=f'LOD = {LOD:.2f} µg/mL')
ax.axvline(LOQ, color=BioGreen, linestyle='--', lw=1.8, label=f'LOQ = {LOQ:.2f} µg/mL')

ax.set_title("Gamme Étalon Bradford : Droite, Bandes de Confiance, LOD & LOQ", fontweight='bold', fontsize=11, color=BioNavy)
ax.set_xlabel("Concentration en BSA (µg/mL)", fontsize=10)
ax.set_ylabel("Absorbance (595 nm)", fontsize=10)
ax.legend(frameon=True, facecolor='white', fontsize=8, loc='upper left')
ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig03_bradford_calibration.png'))
plt.close()

# Fig 3.2 : Diagnostic des résidus
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.5, 3.8), dpi=300)
ax1.scatter(X, residus, color=BioTeal, s=45)
ax1.axhline(0, color=BioNavy, linestyle='--', lw=1.5)
ax1.set_title("A. Résidus vs. Valeurs Prédites (Homoscédasticité)", fontweight='bold', fontsize=10, color=BioNavy)
ax1.set_xlabel("Concentration prédite (µg/mL)", fontsize=9)
ax1.set_ylabel("Résidu ($Y_i - \hat{Y}_i$)", fontsize=9)
ax1.grid(True, alpha=0.4)

stats.probplot(residus, plot=ax2)
ax2.get_lines()[0].set_color(BioTeal)
ax2.get_lines()[0].set_markersize(6)
ax2.get_lines()[1].set_color(BioNavy)
ax2.get_lines()[1].set_linewidth(1.8)
ax2.set_title("B. Normalité des Résidus (Q-Q Plot)", fontweight='bold', fontsize=10, color=BioNavy)
ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig03_residuals_diagnostics.png'))
plt.close()


# ==============================================================================
# CHAPITRE 4 : Figures
# ==============================================================================

# Fig 4.1 : Michaelis-Menten & Lineweaver-Burk
df_kin = pd.read_csv(os.path.join(OUTPUT_DIR, '../../travaux_pratiques/datasets/cinetique_enzyme_phosphatase.csv'))
S_obs = df_kin['Substrat_mM'].values
v_obs = df_kin['Vitesse_umol_min_mg'].values

def mm_func(S, Vmax, Km):
    return (Vmax * S) / (Km + S)

popt, _ = curve_fit(mm_func, S_obs, v_obs, p0=[120, 0.5])
Vmax_fit, Km_fit = popt

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

S_grid = np.linspace(0.01, 10, 200)
v_curve = mm_func(S_grid, Vmax_fit, Km_fit)

ax1.scatter(S_obs, v_obs, color=BioNavy, s=40, label='Données expérimentales', zorder=5)
ax1.plot(S_grid, v_curve, color=BioTeal, lw=2.5, label='Ajustement NLLS Direct')
ax1.axhline(Vmax_fit, color=BioAmber, linestyle='--', lw=1.5, label=f'Vmax = {Vmax_fit:.1f}')
ax1.axhline(Vmax_fit/2, color='gray', linestyle=':', lw=1.2)
ax1.axvline(Km_fit, color=BioGreen, linestyle='--', lw=1.5, label=f'Km = {Km_fit:.2f} mM')
ax1.set_title("A. Cinétique Hyperbolique de Saturation", fontweight='bold', fontsize=10, color=BioNavy)
ax1.set_xlabel("Concentration de Substrat [S] (mM)", fontsize=9)
ax1.set_ylabel("Vitesse initiale v (µmol/min/mg)", fontsize=9)
ax1.legend(frameon=True, facecolor='white', fontsize=8, loc='lower right')
ax1.grid(True, alpha=0.4)

# Lineweaver-Burk
inv_S = 1.0 / S_obs
inv_v = 1.0 / v_obs
p_lb = np.polyfit(inv_S, inv_v, 1)

inv_S_grid = np.linspace(0.05, 20, 100)
ax2.scatter(inv_S, inv_v, color=BioRed, s=40, label='Double Inverse (1/v vs 1/[S])')
ax2.plot(inv_S_grid, np.polyval(p_lb, inv_S_grid), color=BioNavy, lw=2, label='Régression linéaire LB')
ax2.set_title("B. Piège de Lineweaver-Burk\nDistorsion des Erreurs à faible [S]", fontweight='bold', fontsize=10, color=BioNavy)
ax2.set_xlabel("1 / [S] ($mM^{-1}$)", fontsize=9)
ax2.set_ylabel("1 / v", fontsize=9)
ax2.legend(frameon=True, facecolor='white', fontsize=8)
ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig04_nlls_vs_lineweaver_burk.png'))
plt.close()

# Fig 4.2 : 4PL Dose-Response ELISA
fig, ax = plt.subplots(figsize=(7, 3.8), dpi=300)
log_dose = np.linspace(-3, 3, 200)
bottom, top, log_ic50, hill = 0.05, 1.85, 0.0, 1.0
y_4pl = bottom + (top - bottom) / (1 + 10**((log_ic50 - log_dose) * hill))

ax.plot(log_dose, y_4pl, color=BioNavy, lw=2.5, label='Modèle Sigmoïde 4PL')
ax.axhline(bottom, color='gray', linestyle=':', lw=1.2, label=f'Bottom (Bruit de fond = {bottom})')
ax.axhline(top, color='gray', linestyle='--', lw=1.2, label=f'Top (Signal max = {top})')
ax.axvline(log_ic50, color=BioRed, linestyle='-', lw=1.5, label='IC50 (Point d\'inflexion)')
ax.plot([log_ic50], [(bottom + top)/2], marker='o', markersize=8, color=BioRed)

ax.set_title("Modèle Logistique à 4 Paramètres (4PL) pour Courbes Dose-Réponse / ELISA", fontweight='bold', fontsize=10, color=BioNavy)
ax.set_xlabel(r"Log$_{10}$ [Dose d'Inhibiteur ou Antigène]", fontsize=9)
ax.set_ylabel("Signal Optique (Absorbance à 450 nm)", fontsize=9)
ax.legend(frameon=True, facecolor='white', fontsize=8, loc='upper left')
ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig04_sigmoidal_4pl_elisa.png'))
plt.close()


# ==============================================================================
# CHAPITRE 5 : Figures
# ==============================================================================

# Fig 5.1 & 5.2 : ACP Métabolomique
df_meta = pd.read_csv(os.path.join(OUTPUT_DIR, '../../travaux_pratiques/datasets/metabolomique_serum.csv'))
metabolites = ['Glucose_mM', 'Triglycerides_gL', 'ALAT_UIL', 'ASAT_UIL', 'HDL_gL', 'Lactate_mM', 'BCAA_uM']
X_meta = df_meta[metabolites].values
X_scaled = StandardScaler().fit_transform(X_meta)

pca = PCA()
X_pca = pca.fit_transform(X_scaled)
var_exp = pca.explained_variance_ratio_ * 100

# Cercle des corrélations
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 5), dpi=300)

circle = plt.Circle((0,0), 1, color=BioNavy, fill=False, lw=1.8, linestyle='--')
ax1.add_patch(circle)
loadings = pca.components_[:2, :].T * np.sqrt(pca.explained_variance_[:2])

for i, var in enumerate(metabolites):
    ax1.arrow(0, 0, loadings[i, 0], loadings[i, 1], head_width=0.035, color=BioTeal, length_includes_head=True, lw=1.6)
    offset_x = loadings[i, 0] * 1.12
    offset_y = loadings[i, 1] * 1.12
    ax1.text(offset_x, offset_y, var, fontsize=8, fontweight='bold', color=BioNavy, ha='center', va='center')

ax1.set_xlim(-1.25, 1.25)
ax1.set_ylim(-1.25, 1.25)
ax1.axhline(0, color='gray', linestyle=':', lw=1)
ax1.axvline(0, color='gray', linestyle=':', lw=1)
ax1.set_aspect('equal', adjustable='box')
ax1.set_title(f"A. Cercle des Corrélations\n(Dim 1 : {var_exp[0]:.1f}% | Dim 2 : {var_exp[1]:.1f}%)", fontweight='bold', fontsize=10, color=BioNavy)
ax1.set_xlabel("Composante Principale 1", fontsize=9)
ax1.set_ylabel("Composante Principale 2", fontsize=9)

# Plan des individus
palette_status = {'Temoin_Sain': BioGreen, 'Diabete_T2': BioNavy, 'NASH_Hepatique': BioAmber}
for stat_name, color in palette_status.items():
    idx = (df_meta['Statut'] == stat_name)
    ax2.scatter(X_pca[idx, 0], X_pca[idx, 1], color=color, label=stat_name.replace('_', ' '), s=60, alpha=0.85, edgecolors='black', lw=0.6)

ax2.axhline(0, color='gray', linestyle=':', lw=1)
ax2.axvline(0, color='gray', linestyle=':', lw=1)
ax2.set_title("B. Plan Factoriel des Patients\nDiscrimination des Signatures Métaboliques", fontweight='bold', fontsize=10, color=BioNavy)
ax2.set_xlabel(f"Axe 1 ({var_exp[0]:.1f}%) : Dysrégulation Métabolique", fontsize=9)
ax2.set_ylabel(f"Axe 2 ({var_exp[1]:.1f}%) : Atteinte Hépatique", fontsize=9)
ax2.legend(frameon=True, facecolor='white', fontsize=8)
ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig05_pca_correlation_and_scores.png'))
plt.close()


# ==============================================================================
# CHAPITRE 6 : Figures
# ==============================================================================

# Fig 6.1 : Dendrogramme Ward
Z = linkage(X_scaled, method='ward', metric='euclidean')

fig, ax = plt.subplots(figsize=(8, 4), dpi=300)
dendrogram(Z, labels=df_meta['Patient_ID'].values, leaf_rotation=90, leaf_font_size=7, color_threshold=7.5, ax=ax)
ax.axhline(7.5, color=BioRed, linestyle='--', lw=2, label='Seuil de coupure optimal (k=3 classes)')
ax.set_title("Dendrogramme de Classification Hiérarchique Ascendante (Ward)", fontweight='bold', fontsize=11, color=BioNavy)
ax.set_xlabel("Échantillons Patients", fontsize=9)
ax.set_ylabel("Dissimilarité (Perte d'Inertie)", fontsize=9)
ax.legend(frameon=True, facecolor='white', fontsize=9)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig06_dendrogram_ward.png'))
plt.close()


# ==============================================================================
# CHAPITRE 7 : Figures
# ==============================================================================

# Fig 7.1 : Pourquoi les barplots sont trompeurs vs Boxplot / Violin plot
np.random.seed(123)
g1 = np.random.normal(20, 4, 30)
g2_bimodal = np.concatenate([np.random.normal(14, 1.5, 15), np.random.normal(26, 1.5, 15)])

df_plot_demo = pd.DataFrame({
    'Groupe': ['Groupe A (Normal)']*30 + ['Groupe B (Bimodal)']*30,
    'Mesure': np.concatenate([g1, g2_bimodal])
})

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.5, 4), dpi=300)

# Barplot trompeur
means = df_plot_demo.groupby('Groupe')['Mesure'].mean()
stds = df_plot_demo.groupby('Groupe')['Mesure'].std()
ax1.bar(means.index, means.values, yerr=stds.values, capsize=6, color=[BioNavy, BioTeal], alpha=0.6, edgecolor='black')
ax1.set_title("A. Diagramme en Barres : Trompeur !\n(Les deux moyennes et SD semblent identiques)", fontweight='bold', fontsize=9.5, color=BioRed)
ax1.set_ylabel("Valeur mesurée", fontsize=9)
ax1.set_ylim(0, 32)
ax1.grid(True, alpha=0.3)

# Boxplot + Jitter transparent
sns.boxplot(data=df_plot_demo, x='Groupe', y='Mesure', palette=[BioNavy, BioTeal], ax=ax2, width=0.45, boxprops=dict(alpha=0.5))
sns.stripplot(data=df_plot_demo, x='Groupe', y='Mesure', color='black', size=6, jitter=0.2, ax=ax2)
ax2.set_title("B. Boxplot + Points Individuels : Transparent !\n(Révèle immédiatement deux sous-populations)", fontweight='bold', fontsize=9.5, color=BioGreen)
ax2.set_ylabel("Valeur mesurée", fontsize=9)
ax2.set_ylim(0, 32)
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig07_barplot_vs_boxplot_transparency.png'))
plt.close()

# Fig 7.2 : Courbe de Puissance
n_samples = np.arange(3, 40)
power_large = [stats.norm.sf(stats.norm.ppf(0.975) - 0.8 * np.sqrt(n/2)) + stats.norm.cdf(-stats.norm.ppf(0.975) - 0.8 * np.sqrt(n/2)) for n in n_samples]
power_med = [stats.norm.sf(stats.norm.ppf(0.975) - 0.5 * np.sqrt(n/2)) + stats.norm.cdf(-stats.norm.ppf(0.975) - 0.5 * np.sqrt(n/2)) for n in n_samples]
power_small = [stats.norm.sf(stats.norm.ppf(0.975) - 0.2 * np.sqrt(n/2)) + stats.norm.cdf(-stats.norm.ppf(0.975) - 0.2 * np.sqrt(n/2)) for n in n_samples]

fig, ax = plt.subplots(figsize=(7, 3.8), dpi=300)
ax.plot(n_samples, power_large, color=BioGreen, lw=2.2, label='Grand effet (d = 0.8)')
ax.plot(n_samples, power_med, color=BioTeal, lw=2.2, label='Effet moyen (d = 0.5)')
ax.plot(n_samples, power_small, color=BioAmber, lw=2.2, label='Faible effet (d = 0.2)')
ax.axhline(0.80, color=BioRed, linestyle='--', lw=1.5, label='Standard de publication (Puissance = 80%)')

ax.set_title(r"Puissance Statistique ($1 - \beta$) en Fonction de la Taille d'Échantillon ($N$)", fontweight='bold', fontsize=10.5, color=BioNavy)
ax.set_xlabel(r"Nombre d'animaux ou réplicats par groupe ($n$)", fontsize=9)
ax.set_ylabel(r"Puissance statistique ($1 - \beta$)", fontsize=9)
ax.set_ylim(0, 1.05)
ax.legend(frameon=True, facecolor='white', fontsize=8, loc='lower right')
ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig07_power_sample_size_curve.png'))
plt.close()

print("Toutes les figures ont été générées avec succès dans sources/figures/ !")
