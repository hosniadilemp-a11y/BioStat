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
