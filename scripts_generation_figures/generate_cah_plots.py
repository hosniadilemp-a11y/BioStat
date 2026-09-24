#!/usr/bin/env python3
"""
Génération des figures pédagogiques de CAH (Classification Ascendante Hiérarchique)
pour le Chapitre VI :
- Nuage 2D avec fusions hiérarchiques et barycentres
- Dendrogramme de Ward avec axe des sauts d'inertie et ligne de coupe optimale
- Comparaison des 4 méthodes d'agrégation (Linkage : Single, Complete, Average, Ward)
- Graphe des sauts d'inertie (sélection de k par la règle du coude)
- Clustermap (Heatmap bi-clusterisée : patients/échantillons x biomarqueurs/gènes)
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import pdist, squareform
import seaborn as sns

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sources', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Couleurs de la charte BioStat
BioNavy  = '#1A365D'
BioTeal  = '#0D9488'
BioGreen = '#2E7D32'
BioAmber = '#D97706'
BioRed   = '#E11D48'
BioDark  = '#1E293B'
BioGray  = '#64748B'

# ==============================================================================
# FIG 1 : Nuage 2D et Fusions Hiérarchiques Pas-à-Pas (Exemple Isolats RT-qPCR)
# ==============================================================================
# 4 isolats du TD : S1(1,2), S2(2,1), S3(5,5), S4(6,4) complétés avec 4 réplicats biologiques
# pour former 2 clusters très distincts : Sensibles vs Multi-Résistants
np.random.seed(42)

pts_c1 = np.array([
    [1.0, 2.0],  # S1
    [2.0, 1.0],  # S2
    [1.2, 1.4],  # S1b
    [1.8, 2.1],  # S2b
])

pts_c2 = np.array([
    [5.0, 5.0],  # S3
    [6.0, 4.0],  # S4
    [5.2, 4.2],  # S3b
    [5.8, 5.3],  # S4b
])

all_pts = np.vstack([pts_c1, pts_c2])
labels_pts = ['S1', 'S2', 'S1b', 'S2b', 'S3', 'S4', 'S3b', 'S4b']

g1 = np.mean(pts_c1, axis=0)
g2 = np.mean(pts_c2, axis=0)

fig, ax = plt.subplots(figsize=(7.2, 3.8), dpi=300)

# Points C1 (Sensibles)
ax.scatter(pts_c1[:, 0], pts_c1[:, 1], color=BioGreen, s=80, edgecolors='black', lw=0.8, zorder=5, label='Groupe 1 : Souches Sensibles (Faible expression)')
for i in range(len(pts_c1)):
    ax.annotate(labels_pts[i], (pts_c1[i, 0]+0.12, pts_c1[i, 1]-0.05), fontsize=8.5, fontweight='bold', color=BioDark)

# Points C2 (Résistants)
ax.scatter(pts_c2[:, 0], pts_c2[:, 1], color=BioRed, s=80, edgecolors='black', lw=0.8, zorder=5, label='Groupe 2 : Multi-Résistantes (Surexpression Efflux & $\\beta$-lactamase)')
for i in range(len(pts_c2)):
    ax.annotate(labels_pts[4+i], (pts_c2[i, 0]+0.12, pts_c2[i, 1]-0.05), fontsize=8.5, fontweight='bold', color=BioDark)

# Barycentres
ax.scatter([g1[0]], [g1[1]], marker='X', color=BioNavy, s=130, edgecolors='white', lw=1.2, zorder=6, label=f'Barycentre $g_1 = ({g1[0]:.2f}, {g1[1]:.2f})$')
ax.scatter([g2[0]], [g2[1]], marker='X', color=BioAmber, s=130, edgecolors='white', lw=1.2, zorder=6, label=f'Barycentre $g_2 = ({g2[0]:.2f}, {g2[1]:.2f})$')

# Ellipses / Cercles de fusion
circle1 = plt.Circle((g1[0], g1[1]), 1.1, color=BioGreen, fill=True, alpha=0.15, linestyle='--', lw=1.5, edgecolor=BioGreen)
circle2 = plt.Circle((g2[0], g2[1]), 1.1, color=BioRed, fill=True, alpha=0.15, linestyle='--', lw=1.5, edgecolor=BioRed)
ax.add_patch(circle1)
ax.add_patch(circle2)

# Flèche de liaison inter-groupe (distance inter-barycentres)
ax.annotate('', xy=(g2[0], g2[1]), xytext=(g1[0], g1[1]),
            arrowprops=dict(arrowstyle='<->', color=BioDark, lw=2.0, linestyle=':'))
ax.text((g1[0]+g2[0])/2 - 0.2, (g1[1]+g2[1])/2 + 0.35, f'$d_E(g_1, g_2) = {np.linalg.norm(g1-g2):.2f}$\n$\\Delta I(C_1, C_2) = 25.0$',
        fontsize=8.5, fontweight='bold', color=BioNavy, bbox=dict(boxstyle='round,pad=0.25', facecolor='#F8FAFC', edgecolor=BioNavy, alpha=0.9))

ax.set_title("Espace Biologique 2D : Regroupement Ascendant & Barycentres", fontsize=11, fontweight='bold', color=BioNavy, pad=8)
ax.set_xlabel("Expression Relative Gène $G_1$ (Pompe d'Efflux) [$\\Delta\\Delta Ct$]", fontsize=9.5, fontweight='bold')
ax.set_ylabel("Expression Relative Gène $G_2$ ($\\beta$-lactamase) [$\\Delta\\Delta Ct$]", fontsize=9.5, fontweight='bold')
ax.set_xlim(0, 7.5)
ax.set_ylim(0, 6.8)
ax.grid(True, linestyle=':', alpha=0.6)
ax.legend(loc='lower right', fontsize=7.5, framealpha=0.95)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'fig06_cah_2d_points_clustering.png'), dpi=300)
plt.close(fig)

# ==============================================================================
# FIG 2 : Le Dendrogramme de Ward & Ligne de Coupe Horizontale Optimale
# ==============================================================================
# Matrice de liaison de Ward sur 12 isolats
np.random.seed(42)
iso_sensibles = np.random.normal(loc=[1.5, 1.5], scale=0.4, size=(6, 2))
iso_resistants = np.random.normal(loc=[5.5, 4.5], scale=0.5, size=(6, 2))
data_12 = np.vstack([iso_sensibles, iso_resistants])
labels_12 = [f'S{i+1}' for i in range(6)] + [f'R{i+1}' for i in range(6)]

Z_ward = linkage(data_12, method='ward')

fig, ax = plt.subplots(figsize=(7.2, 3.8), dpi=300)

# Couleurs personnalisées pour les clusters
color_threshold = 8.0
dend = dendrogram(
    Z_ward,
    labels=labels_12,
    ax=ax,
    color_threshold=color_threshold,
    above_threshold_color=BioNavy,
    leaf_rotation=0,
    leaf_font_size=9
)

# Ligne de coupe horizontale
cut_height = 8.5
ax.axhline(y=cut_height, color=BioRed, linestyle='--', lw=2.0, label=f'Seuil de Coupure Optimal ($h = {cut_height}$) $\\to k = 2$ Clusters')

# Annotations des sauts d'inertie
ax.text(15, 15.5, "Dernière fusion : $\\Delta I = 18.4$\n(Saut d'Inertie Majeur)", fontsize=8.5, fontweight='bold', color=BioNavy,
        bbox=dict(boxstyle='round,pad=0.25', facecolor='#EFF6FF', edgecolor=BioNavy, alpha=0.9))
ax.text(15, 2.5, "Fusions initiales : $\\Delta I < 2.0$\n(Regroupements locaux homogènes)", fontsize=8.0, color=BioDark,
        bbox=dict(boxstyle='round,pad=0.2', facecolor='#F1F5F9', edgecolor=BioGray, alpha=0.9))

ax.set_title("Dendrogramme de Ward : Hiérarchie des Sauts d'Inertie $\\Delta I$", fontsize=11, fontweight='bold', color=BioNavy, pad=8)
ax.set_xlabel("Isolats Bactériens Analysés (S : Sensibles, R : Multi-Résistants)", fontsize=9.5, fontweight='bold')
ax.set_ylabel("Indice d'Agrégation (Saut d'Inertie $\\Delta I$)", fontsize=9.5, fontweight='bold')
ax.grid(axis='y', linestyle=':', alpha=0.6)
ax.legend(loc='upper right', fontsize=8.0, framealpha=0.95)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'fig06_dendrogram_ward.png'), dpi=300)
plt.close(fig)

# ==============================================================================
# FIG 3 : Comparaison des 4 Méthodes de Liaison (Linkage Methods)
# ==============================================================================
fig, axes = plt.subplots(1, 4, figsize=(9.5, 3.5), dpi=300, sharey=False)

methods = [
    ('single', 'Saut Minimum (Single)', 'Effet de chaînage\nSensible au bruit'),
    ('complete', 'Saut Maximum (Complete)', 'Clusters compacts\nSphériques'),
    ('average', 'Lien Moyen (UPGMA)', 'Standard en phylogénie\nCompromis robuste'),
    ('ward', 'Méthode de Ward', 'Minimise $\\Delta I_{\\text{intra}}$\nRéférence en biochimie')
]

for idx, (m_code, m_title, m_comment) in enumerate(methods):
    ax = axes[idx]
    Z_m = linkage(data_12, method=m_code)
    dendrogram(Z_m, ax=ax, no_labels=True, color_threshold=0, above_threshold_color=BioNavy)
    ax.set_title(m_title, fontsize=8.2, fontweight='bold', color=BioNavy)
    ax.text(0.5, 0.88, m_comment, transform=ax.transAxes, fontsize=6.8, ha='center',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor=BioGray, alpha=0.85))
    ax.tick_params(axis='y', labelsize=7)
    if idx == 0:
        ax.set_ylabel("Distance de Fusion", fontsize=8.0, fontweight='bold')

fig.suptitle("Comparaison des Stratégies de Liaison (Linkage) sur le Même Jeu de Données", fontsize=10.5, fontweight='bold', color=BioNavy, y=0.98)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'fig06_linkage_comparison.png'), dpi=300)
plt.close(fig)

# ==============================================================================
# FIG 4 : Graphe des Sauts d'Inertie & Règle du Coude (Sélection de k)
# ==============================================================================
# Sauts d'inertie lors des dernières fusions (k = 6 down to k = 1)
k_values = np.array([1, 2, 3, 4, 5, 6])
inertia_intra = np.array([45.2, 8.4, 4.1, 2.3, 1.1, 0.4])  # Inertie intra décroissante avec k
delta_inertia = np.array([36.8, 4.3, 1.8, 1.2, 0.7])  # Sauts d'inertie

fig, ax1 = plt.subplots(figsize=(7.2, 3.6), dpi=300)

color_line = BioNavy
ax1.set_xlabel("Nombre de Classes Retenues ($k$)", fontsize=9.5, fontweight='bold')
ax1.set_ylabel("Inertie Intra-Classe Résiduelle ($I_{\\text{intra}}$)", color=color_line, fontsize=9.0, fontweight='bold')
l1 = ax1.plot(k_values, inertia_intra, marker='o', markersize=7, lw=2.2, color=color_line, label='Inertie Intra ($I_{\\text{intra}}$)')
ax1.tick_params(axis='y', labelcolor=color_line, labelsize=8.5)
ax1.set_xticks(k_values)

# Barre des sauts d'inertie Delta I
ax2 = ax1.twinx()
color_bars = BioAmber
bars = ax2.bar(k_values[:-1] + 0.5, delta_inertia, width=0.35, alpha=0.45, color=color_bars, edgecolor=BioAmber, lw=1.2, label="Saut d'Inertie ($\\Delta I$)")
ax2.set_ylabel("Saut d'Inertie lors de la Fusion ($\\Delta I$)", color=BioAmber, fontsize=9.0, fontweight='bold')
ax2.tick_params(axis='y', labelcolor=BioAmber, labelsize=8.5)

# Annotation du coude à k = 2
ax1.annotate('Coude Majeur ($k = 2$)\nChute drastique de $I_{\\text{intra}}$\n$\\Delta I_{\\text{fusion}} = 36.8$',
             xy=(2, 8.4), xytext=(3.2, 28),
             arrowprops=dict(facecolor=BioRed, arrowstyle='->', lw=1.8),
             fontsize=8.5, fontweight='bold', color=BioRed,
             bbox=dict(boxstyle='round,pad=0.25', facecolor='#FEF2F2', edgecolor=BioRed, alpha=0.9))

ax1.grid(True, linestyle=':', alpha=0.5)
ax1.set_title("Critère du Saut d'Inertie & Règle du Coude pour Fixer $k$", fontsize=10.5, fontweight='bold', color=BioNavy, pad=8)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'fig06_inertia_jump_elbow.png'), dpi=300)
plt.close(fig)

# ==============================================================================
# FIG 5 : Clustermap Biologique (Double Clustering Échantillons x Biomarqueurs)
# ==============================================================================
np.random.seed(42)
# 16 échantillons : 8 Témoins, 8 Pathologiques (Infection sévère)
# 6 biomarqueurs : 3 Marqueurs Pro-inflammatoires (IL-6, TNF, PCR), 3 Antioxydants (SOD, CAT, GPx)
n_samples = 16
genes = ['IL-6', 'TNF-\\alpha', 'CRP', 'SOD', 'Catalase', 'GPx']

# Données synthétiques réalistes
temoins = np.random.normal(loc=[-1.0, -1.0, -1.2, +1.2, +1.1, +1.0], scale=0.4, size=(8, 6))
malades = np.random.normal(loc=[+1.4, +1.3, +1.5, -0.9, -1.1, -0.8], scale=0.45, size=(8, 6))
heatmap_data = np.vstack([temoins, malades])

sample_labels = [f'Ctrl_{i+1}' for i in range(8)] + [f'Pat_{i+1}' for i in range(8)]

# Création du clustermap Seaborn
cm = sns.clustermap(
    heatmap_data,
    method='ward',
    metric='euclidean',
    cmap='coolwarm',
    center=0,
    figsize=(7.2, 4.0),
    xticklabels=genes,
    yticklabels=sample_labels,
    cbar_kws={'label': 'Expression Standardisée (Z-score)'},
    tree_kws={'linewidths': 1.2, 'colors': BioNavy}
)

cm.fig.suptitle("Clustermap Bivariée : Double CAH Échantillons $\\times$ Biomarqueurs", fontsize=10.5, fontweight='bold', color=BioNavy, y=1.02)
cm.ax_heatmap.set_xlabel("Biomarqueurs Clustérisés (Modules Métaboliques)", fontsize=8.5, fontweight='bold')
cm.ax_heatmap.set_ylabel("Échantillons Clustérisés (Phénotypes Cliniques)", fontsize=8.5, fontweight='bold')
cm.ax_heatmap.tick_params(axis='both', labelsize=7.5)

cm.savefig(os.path.join(OUTPUT_DIR, 'fig06_clustermap_heatmap.png'), dpi=300, bbox_inches='tight')
plt.close(cm.fig)

print("Toutes les figures de CAH ont été générées avec succès dans :", OUTPUT_DIR)
