#!/usr/bin/env python3
"""
Génération des figures pédagogiques d'ACP pour le Chapitre V :
Exemple biologique concret chez la souris :
- Réduction de 2 variables fortement corrélées (Poids corporel vs Tissu adipeux) à 1 seule composante (PC1).
- Scree plot et critère de Kaiser.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sources', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Couleurs de la charte BioStat
BioNavy  = '#1A365D'
BioTeal  = '#0D9488'
BioGreen = '#2E7D32'
BioAmber = '#D97706'
BioRed   = '#E11D48'
BioDark  = '#1E293B'

np.random.seed(42)

# --- Jeu de données : 24 souris (12 Témoins Chow, 12 Obèses HFD) ---
n_chow = 12
n_hfd = 12
n_total = n_chow + n_hfd

# Chow : Souris minces (Poids: ~26 g, Adipeux: ~320 mg)
poids_chow = np.random.normal(26.0, 1.8, n_chow)
adip_chow  = 12.0 * poids_chow + np.random.normal(10, 25, n_chow)

# HFD : Souris obèses sous régime riche en graisse (Poids: ~44 g, Adipeux: ~1400 mg)
poids_hfd = np.random.normal(44.0, 3.2, n_hfd)
adip_hfd  = 32.0 * poids_hfd + np.random.normal(-50, 45, n_hfd)

poids = np.concatenate([poids_chow, poids_hfd])
adip  = np.concatenate([adip_chow, adip_hfd])
labels = ['Témoin (Chow)'] * n_chow + ['Régime Gras (HFD)'] * n_hfd

X_raw = np.column_stack([poids, adip])

# ==============================================================================
# FIG 1 : La Redondance Biologique 2D (Poids vs Tissu Adipeux)
# ==============================================================================
fig, ax = plt.subplots(figsize=(7.2, 4.0), dpi=300)

ax.scatter(poids_chow, adip_chow, color=BioGreen, s=65, edgecolors='black', lw=0.7, label='Souris Témoins (Chow, n=12)', zorder=4)
ax.scatter(poids_hfd, adip_hfd, color=BioRed, s=65, edgecolors='black', lw=0.7, label='Souris Obèses (HFD, n=12)', zorder=4)

# Régression linéaire pour montrer la redondance
m, b = np.polyfit(poids, adip, 1)
x_vals = np.linspace(22, 52, 100)
r_val = np.corrcoef(poids, adip)[0, 1]
ax.plot(x_vals, m * x_vals + b, color=BioNavy, lw=2.0, linestyle='--', label=f'Trajectoire linéaire commune (r = {r_val:.2f})')

# Barycentre
ax.scatter([np.mean(poids)], [np.mean(adip)], color='gold', s=120, marker='*', edgecolors='black', lw=1.2, zorder=6, label='Barycentre G(X̄₁, X̄₂)')

ax.set_title("A. Le Problème 2D : Deux Variables Fortement Corrélées chez la Souris", fontweight='bold', fontsize=10, color=BioNavy)
ax.set_xlabel("Variable 1 : Poids Corporel Total ($X_1$, en g)", fontsize=9)
ax.set_ylabel("Variable 2 : Masse Tissu Adipeux ($X_2$, en mg)", fontsize=9)
ax.legend(frameon=True, facecolor='white', fontsize=7.5, loc='upper left')
ax.grid(True, alpha=0.35)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig05_mice_2d_redundancy.png'))
plt.close()

# ==============================================================================
# FIG 2 : Rotation des Axes & Recherche de la Variance Maximale (PC1 et PC2)
# ==============================================================================
scaler = StandardScaler()
X_std = scaler.fit_transform(X_raw)

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_std)

eig_vals = pca.explained_variance_
var_exp = pca.explained_variance_ratio_ * 100

v1 = pca.components_[0]
v2 = pca.components_[1]

fig, ax = plt.subplots(figsize=(7.2, 4.0), dpi=300)

ax.scatter(X_std[:n_chow, 0], X_std[:n_chow, 1], color=BioGreen, s=60, edgecolors='black', lw=0.6, label='Témoins (Chow)', zorder=5)
ax.scatter(X_std[n_chow:, 0], X_std[n_chow:, 1], color=BioRed, s=60, edgecolors='black', lw=0.6, label='Obèses (HFD)', zorder=5)

# Tracé des deux nouveaux axes principaux
scale_arrow = 2.4
ax.plot([-scale_arrow * v1[0], scale_arrow * v1[0]], [-scale_arrow * v1[1], scale_arrow * v1[1]], color=BioNavy, lw=2.2, label=f'Axe PC1 : {var_exp[0]:.1f}% de variance (λ₁ = {eig_vals[0]:.2f})')
ax.plot([-1.1 * v2[0], 1.1 * v2[0]], [-1.1 * v2[1], 1.1 * v2[1]], color=BioTeal, lw=2.0, linestyle='-.', label=f'Axe PC2 (orthogonal) : {var_exp[1]:.1f}% (λ₂ = {eig_vals[1]:.2f})')

# Projections orthogonales sur PC1 pour quelques points témoins et HFD
for i in [2, 7, 14, 20]:
    pt = X_std[i]
    proj = np.dot(pt, v1) * v1
    ax.plot([pt[0], proj[0]], [pt[1], proj[1]], color='gray', linestyle=':', lw=1.2, zorder=3)
    ax.scatter([proj[0]], [proj[1]], color=BioNavy, s=25, zorder=4)

ax.axhline(0, color='lightgray', linestyle='-', lw=0.8)
ax.axvline(0, color='lightgray', linestyle='-', lw=0.8)
ax.set_title("B. Rotation des Axes : PC1 Maximise l'Inertie, PC2 est Orthogonal", fontweight='bold', fontsize=10, color=BioNavy)
ax.set_xlabel("Poids Corporel Centré-Réduit ($Z_1$)", fontsize=9)
ax.set_ylabel("Masse Adipeuse Centrée-Réduite ($Z_2$)", fontsize=9)
ax.legend(frameon=True, facecolor='white', fontsize=7.5, loc='upper left')
ax.set_aspect('equal')
ax.grid(True, alpha=0.35)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig05_mice_pca_axes_rotation.png'))
plt.close()

# ==============================================================================
# FIG 3 : Réduction 1D : Projection sur PC1 (L'Axe d'Adiposité Synthétique)
# ==============================================================================
fig, (ax_top, ax_bot) = plt.subplots(2, 1, figsize=(7.5, 4.0), dpi=300, sharex=True, gridspec_kw={'height_ratios': [1.2, 1]})

# Vue 1 : Points projetés sur la droite PC1
ax_top.scatter(X_pca[:n_chow, 0], np.zeros(n_chow), color=BioGreen, s=70, edgecolors='black', lw=0.8, label='Chow (Scores PC1 négatifs)', zorder=5)
ax_top.scatter(X_pca[n_chow:, 0], np.zeros(n_hfd), color=BioRed, s=70, edgecolors='black', lw=0.8, label='HFD (Scores PC1 positifs)', zorder=5)
ax_top.axhline(0, color=BioNavy, lw=1.8)
ax_top.set_yticks([])
ax_top.set_title("C. Réduction 2D $\\to$ 1D : Projection des Souris sur l'Axe Unique PC1", fontweight='bold', fontsize=10, color=BioNavy)
ax_top.legend(frameon=True, facecolor='white', fontsize=8, loc='upper left')
ax_top.grid(True, alpha=0.3)

# Vue 2 : Densités/Distribution des scores le long de PC1
ax_bot.hist(X_pca[:n_chow, 0], bins=6, color=BioGreen, alpha=0.55, edgecolor=BioGreen, label='Distribution Témoins (Minces)')
ax_bot.hist(X_pca[n_chow:, 0], bins=6, color=BioRed, alpha=0.55, edgecolor=BioRed, label='Distribution HFD (Obèses)')
ax_bot.axvline(0, color=BioNavy, linestyle='--', lw=1.5, label='Origine (Moyenne globale = 0)')
ax_bot.set_xlabel("Score sur la Composante Principale 1 (Indice Composite d'Adiposité)", fontsize=9, fontweight='bold')
ax_bot.set_ylabel("Effectif", fontsize=9)
ax_bot.legend(frameon=True, facecolor='white', fontsize=8, loc='upper left')
ax_bot.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig05_mice_1d_reduction.png'))
plt.close()

# ==============================================================================
# FIG 4 : Éboulis des Valeurs Propres (Scree Plot) & Critère de Kaiser
# ==============================================================================
# Exemple multivarié avec p = 5 variables (comme dans le TD 05 : MDA, IL-6, TNF, Catalase, SOD)
lambdas = np.array([2.65, 1.25, 0.60, 0.35, 0.15])
axes_labels = [f"PC{k}" for k in range(1, 6)]
pct_variance = lambdas / np.sum(lambdas) * 100
cum_pct = np.cumsum(pct_variance)

fig, ax1 = plt.subplots(figsize=(7.2, 3.8), dpi=300)

bars = ax1.bar(axes_labels, lambdas, color=BioNavy, alpha=0.85, width=0.55, edgecolor='black', lw=0.8, label='Valeur Propre (λₖ)')
ax1.axhline(1.0, color=BioAmber, linestyle='--', lw=2.0, label='Critère de Kaiser (λ = 1.0)')
ax1.set_ylabel("Valeur Propre (Inertie λₖ)", fontsize=9, color=BioNavy, fontweight='bold')
ax1.set_ylim(0, 3.2)

# Courbe du pourcentage cumulé sur le second axe Y
ax2 = ax1.twinx()
ax2.plot(axes_labels, cum_pct, color=BioTeal, marker='o', lw=2.2, markersize=6, label='% Cumulé de Variance')
ax2.set_ylabel("Pourcentage Cumulé d'Inertie (%)", fontsize=9, color=BioTeal, fontweight='bold')
ax2.set_ylim(0, 110)

# Annotations des pourcentages sur les barres
for i, bar in enumerate(bars):
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.08, f"{pct_variance[i]:.1f}%", ha='center', va='bottom', fontsize=8, fontweight='bold', color=BioNavy)

# Annotation du coude
ax1.annotate("Règle du Coude (Elbow)\nArrêt à PC2", xy=(1, 1.25), xytext=(2.2, 2.0),
            arrowprops=dict(facecolor=BioRed, shrink=0.08, width=1.5, headwidth=6),
            fontsize=8.5, fontweight='bold', color=BioRed, bbox=dict(boxstyle="round,pad=0.3", fc="white", ec=BioRed, lw=1))

ax1.set_title("Éboulis des Valeurs Propres (Scree Plot) \& Critère de Kaiser", fontweight='bold', fontsize=10, color=BioNavy)
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper right', fontsize=8, frameon=True, facecolor='white')
ax1.grid(True, alpha=0.35, axis='y')

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, 'fig05_scree_plot_kaiser.png'))
plt.close()

print("Figures ACP générées avec succès dans :", OUTPUT_DIR)
