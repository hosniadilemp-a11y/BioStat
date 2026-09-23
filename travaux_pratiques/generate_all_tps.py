import json
import os

def make_nb(cells):
    return {
        'cells': cells,
        'metadata': {
            'kernelspec': {
                'display_name': 'Python 3 (ipykernel)',
                'language': 'python',
                'name': 'python3'
            },
            'language_info': {
                'name': 'python',
                'version': '3.10'
            }
        },
        'nbformat': 4,
        'nbformat_minor': 5
    }

def md_cell(text):
    return {
        'cell_type': 'markdown',
        'metadata': {},
        'source': [line + '\n' for line in text.split('\n')]
    }

def code_cell(code):
    return {
        'cell_type': 'code',
        'execution_count': None,
        'metadata': {},
        'outputs': [],
        'source': [line + '\n' for line in code.split('\n')]
    }

# 1. TP00 : Prise en main
cells_00 = [
    md_cell("""# TP 00 : Prise en Main de Python & Jupyter pour la Biochimie
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Objectifs du TP :
1. Découvrir l'environnement interactif de Jupyter Notebook.
2. Importer les bibliothèques scientifiques majeures : `pandas` (tableaux), `seaborn` et `matplotlib` (graphiques).
3. Charger un jeu de données de laboratoire et calculer des statistiques descriptives fondamentales (Moyenne, Écart-type SD, Erreur standard SEM).
4. Réaliser des graphiques scientifiques transparents (Boxplots + points individuels)."""),
    code_cell("""# Importation des bibliothèques nécessaires
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Style graphique moderne et épuré
sns.set_theme(style='whitegrid', font_scale=1.1)
print("Bibliothèques chargées avec succès !")"""),
    md_cell("""## 1. Chargement et exploration d'un jeu de données de biochimie
Nous chargeons ici le fichier `peroxydation_mda_diabete.csv` qui contient des mesures de stress oxydatif (Malondialdéhyde - MDA)."""),
    code_cell("""# Chargement du fichier CSV
df = pd.read_csv('../datasets/peroxydation_mda_diabete.csv')

# Affichage des 5 premières lignes
print("--- Aperçu des données ---")
display(df.head())

# Dimensions du tableau
print(f"Nombre total d'échantillons dosés : {len(df)}")
print(f"Colonnes disponibles : {list(df.columns)}")"""),
    md_cell("""## 2. Calculs statistiques descriptifs : Moyenne, SD et SEM par groupe"""),
    code_cell("""# Calcul de la moyenne, de l'écart-type (SD) et du nombre d'échantillons (n)
stats_groupe = df.groupby(['Traitement', 'Genotype'])['MDA_nmol_mg_prot'].agg(
    Moyenne='mean',
    Ecart_Type_SD='std',
    Taille_n='count'
).reset_index()

# Calcul de l'erreur standard de la moyenne (SEM = SD / sqrt(n))
stats_groupe['SEM'] = stats_groupe['Ecart_Type_SD'] / np.sqrt(stats_groupe['Taille_n'])

print("--- Statistiques descriptives du taux de MDA ---")
display(stats_groupe.round(3))"""),
    md_cell("""## 3. Représentation Graphique Scientifique de Qualité Publication
Dans ce cours, nous évitons les diagrammes en bâtons opaques. Nous utilisons des **Boxplots superposés aux points individuels (Scatter plot)**."""),
    code_cell("""plt.figure(figsize=(9, 5))

# 1. Boîte à moustaches (Boxplot)
sns.boxplot(
    data=df, 
    x='Traitement', 
    y='MDA_nmol_mg_prot', 
    hue='Genotype', 
    palette=['#1A365D', '#0D9488'],
    width=0.6,
    boxprops=dict(alpha=0.6)
)

# 2. Points individuels pour une transparence totale
sns.stripplot(
    data=df, 
    x='Traitement', 
    y='MDA_nmol_mg_prot', 
    hue='Genotype', 
    dodge=True, 
    jitter=0.2, 
    color='black', 
    size=6
)

plt.title("Évaluation du Stress Oxydatif Hépatique (MDA) par Condition", fontsize=14, fontweight='bold', pad=15)
plt.xlabel("Protocole de Traitement Antioxydant", fontweight='bold')
plt.ylabel("Taux de MDA (nmol / mg de protéines)", fontweight='bold')
plt.legend(title='Génotype', loc='upper right')
plt.tight_layout()
plt.show()"""),
    md_cell("""## Question d'interprétation pour l'étudiant :
Observez le graphique ci-dessus : le traitement a-t-il la même efficacité chez les souris sauvages (WT) et les souris diabétiques (`db_db`) ? Que remarquez-vous sur la dispersion des points ?""")
]

with open('travaux_pratiques/00_Guide_Installation_Anaconda_Jupyter/TP00_Prise_En_Main_Python_Bio.ipynb', 'w') as f:
    json.dump(make_nb(cells_00), f, indent=2)

# 2. TP01 : ANOVA Croisée
cells_01 = [
    md_cell("""# TP 01 : Analyse de Variance (ANOVA) à Deux Facteurs Croisés
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Contexte Biologique :
Nous étudions l'effet hépatoprotecteur d'une molécule antioxydante naturelle (polyphénol) administrée à deux doses (50 et 100 mg/kg) vs Véhicule témoin, chez des souris saines (WT) et des souris modèles du diabète de type 2 (`db_db`).  
La variable d'intérêt est le taux hépatique de **Malondialdéhyde (MDA)**, un marqueur clé de la péroxydation lipidique membranaire.

## Objectifs :
1. Tester l'effet principal du Traitement, du Génotype et surtout leur **Interaction**.
2. Réaliser le tracé du profil d'interaction (`interaction_plot`).
3. Conclure biologiquement sur la spécificité thérapeutique du polyphénol."""),
    code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import scipy.stats as stats

# Chargement des données
df = pd.read_csv('../datasets/peroxydation_mda_diabete.csv')
display(df.head())"""),
    md_cell("""## 1. Tracé du Profil d'Interaction
Les profils sont-ils parallèles (additivité) ou sécants (interaction) ?"""),
    code_cell("""plt.figure(figsize=(8, 5))

# Calcul des moyennes pour le tracé d'interaction
mean_data = df.groupby(['Traitement', 'Genotype'])['MDA_nmol_mg_prot'].mean().reset_index()

sns.lineplot(
    data=mean_data,
    x='Traitement',
    y='MDA_nmol_mg_prot',
    hue='Genotype',
    marker='o',
    markersize=9,
    linewidth=2.5,
    palette={'WT': '#1A365D', 'db_db': '#D97706'}
)

plt.title("Profil d'Interaction : Traitement x Génotype", fontsize=14, fontweight='bold')
plt.xlabel("Traitement", fontweight='bold')
plt.ylabel("MDA Moyen (nmol/mg)", fontweight='bold')
plt.grid(True, linestyle='--', alpha=0.5)
plt.show()"""),
    md_cell("""## 2. Table ANOVA à Deux Facteurs Croisés"""),
    code_cell("""# Calcul complet de l'ANOVA à deux facteurs
N = len(df)
grand_mean = df['MDA_nmol_mg_prot'].mean()

I = df['Traitement'].nunique()
J = df['Genotype'].nunique()
K = N // (I * J)

SS_total = ((df['MDA_nmol_mg_prot'] - grand_mean)**2).sum()

means_A = df.groupby('Traitement')['MDA_nmol_mg_prot'].mean()
SS_A = (J * K) * ((means_A - grand_mean)**2).sum()

means_B = df.groupby('Genotype')['MDA_nmol_mg_prot'].mean()
SS_B = (I * K) * ((means_B - grand_mean)**2).sum()

means_AB = df.groupby(['Traitement', 'Genotype'])['MDA_nmol_mg_prot'].mean()
SS_cell = K * ((means_AB - grand_mean)**2).sum()
SS_AB = SS_cell - SS_A - SS_B

SS_res = SS_total - SS_cell

df_A = I - 1
df_B = J - 1
df_AB = (I - 1) * (J - 1)
df_res = N - (I * J)

MS_A = SS_A / df_A
MS_B = SS_B / df_B
MS_AB = SS_AB / df_AB
MS_res = SS_res / df_res

F_A = MS_A / MS_res
F_B = MS_B / MS_res
F_AB = MS_AB / MS_res

p_A = 1 - stats.f.cdf(F_A, df_A, df_res)
p_B = 1 - stats.f.cdf(F_B, df_B, df_res)
p_AB = 1 - stats.f.cdf(F_AB, df_AB, df_res)

table_anova = pd.DataFrame({
    'Source': ['Traitement (A)', 'Genotype (B)', 'Interaction A x B', 'Résiduelle'],
    'ddl': [df_A, df_B, df_AB, df_res],
    'SS': [round(SS_A, 2), round(SS_B, 2), round(SS_AB, 2), round(SS_res, 2)],
    'MS': [round(MS_A, 2), round(MS_B, 2), round(MS_AB, 2), round(MS_res, 2)],
    'F_obs': [round(F_A, 2), round(F_B, 2), round(F_AB, 2), np.nan],
    'p_value': [f'{p_A:.4e}', f'{p_B:.4e}', f'{p_AB:.4e}', np.nan]
})

print("=== TABLE ANOVA A DEUX FACTEURS CROISES ===")
display(table_anova)"""),
    md_cell("""## 3. Interprétation Biologique des Résultats :
- **L'interaction $A \times B$ est-elle statistiquement significative ?**
- Pourquoi le polyphénol est-il particulièrement intéressant pour la prise en charge des complications diabétiques ?""")
]

with open('travaux_pratiques/TP01_ANOVA_Croisee/TP01_ANOVA_Croisee_Biochimie.ipynb', 'w') as f:
    json.dump(make_nb(cells_01), f, indent=2)

# 3. TP02 : ANOVA Hiérarchisée
cells_02 = [
    md_cell("""# TP 02 : Analyse de Variance Hiérarchisée (Nested ANOVA)
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Contexte :
Contrôle qualité dans un procédé de bioproduction d'insuline recombinante.
- Facteur principal A : 3 Lots industriels indépendants ($I=3$).
- Facteur emboîté B : 3 Flacons par lot ($J=3$, $B \subset A$).
- Réplicats techniques : 3 mesures de pureté par flacon ($K=3$, $N=27$).

## Objectifs :
1. Calculer l'ANOVA hiérarchique et identifier le bon dénominateur pour le test $F_A$.
2. Évaluer si la variabilité provient des lots ou des flacons."""),
    code_cell("""import pandas as pd
import numpy as np
import scipy.stats as stats

df_nest = pd.read_csv('../datasets/production_insuline_nested.csv')
display(df_nest.head())"""),
    code_cell("""# Calcul ANOVA Hiérarchisée
I = df_nest['Lot'].nunique()
J = 3 # 3 flacons par lot
K = 3 # 3 réplicats par flacon
N = len(df_nest)

grand_mean = df_nest['Purete_Pourcent'].mean()
SS_total = ((df_nest['Purete_Pourcent'] - grand_mean)**2).sum()

means_lot = df_nest.groupby('Lot')['Purete_Pourcent'].mean()
SS_lot = (J * K) * ((means_lot - grand_mean)**2).sum()

means_flacon = df_nest.groupby(['Lot', 'Flacon'])['Purete_Pourcent'].mean()
SS_flacon_total = K * ((means_flacon - grand_mean)**2).sum()
SS_flacon_dans_lot = SS_flacon_total - SS_lot

SS_res = SS_total - SS_flacon_total

df_lot = I - 1
df_flacon_dans_lot = I * (J - 1)
df_res = I * J * (K - 1)

MS_lot = SS_lot / df_lot
MS_flacon_dans_lot = SS_flacon_dans_lot / df_flacon_dans_lot
MS_res = SS_res / df_res

# IMPORTANT : Le test du facteur principal Lot est divisé par MS du facteur emboîté !
F_lot = MS_lot / MS_flacon_dans_lot
F_flacon = MS_flacon_dans_lot / MS_res

p_lot = 1 - stats.f.cdf(F_lot, df_lot, df_flacon_dans_lot)
p_flacon = 1 - stats.f.cdf(F_flacon, df_flacon_dans_lot, df_res)

table_nest = pd.DataFrame({
    'Source': ['Lots (A)', 'Flacons dans Lots B(A)', 'Erreur Technique (Rés)'],
    'ddl': [df_lot, df_flacon_dans_lot, df_res],
    'SS': [round(SS_lot, 2), round(SS_flacon_dans_lot, 2), round(SS_res, 2)],
    'MS': [round(MS_lot, 2), round(MS_flacon_dans_lot, 2), round(MS_res, 2)],
    'F_obs': [round(F_lot, 2), round(F_flacon, 2), np.nan],
    'p_value': [f'{p_lot:.4f}', f'{p_flacon:.4e}', np.nan]
})

print("=== TABLE ANOVA HIERARCHISEE ===")
display(table_nest)"""),
    md_cell("""## Interprétation Biologique & Décision Industrielle :
Le procédé de fermentation est-il stable ? D'où provient la source d'hétérogénéité constatée ?""")
]

with open('travaux_pratiques/TP02_ANOVA_Hierarchisee/TP02_ANOVA_Hierarchisee_Biochimie.ipynb', 'w') as f:
    json.dump(make_nb(cells_02), f, indent=2)

# 4. TP03 : Régression Linéaire
cells_03 = [
    md_cell("""# TP 03 : Corrélation et Régression Linéaire — Gamme Bradford
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Objectifs :
1. Calculer la droite d'étalonnage ($A_{595} = f([\text{BSA}])$) par moindres carrés.
2. Analyser les résidus et calculer $R^2$.
3. Calculer la Limite de Détection (LOD) et de Quantification (LOQ).
4. Quantifier un échantillon inconnu d'absorbance $A_{595} = 0.427$."""),
    code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

gamme = pd.read_csv('../datasets/dosage_bradford.csv')
display(gamme.head())"""),
    code_cell("""X = gamme['BSA_ug_mL']
Y = gamme['Absorbance_595nm']

res = stats.linregress(X, Y)
pente, intercept = res.slope, res.intercept
r2 = res.rvalue**2

print(f"Équation : A595 = {intercept:.4f} + {pente:.4f} * [BSA]")
print(f"Coefficient R² = {r2:.4f}")"""),
    code_cell("""# Tracé de la gamme
plt.figure(figsize=(7, 5))
plt.scatter(X, Y, color='#1A365D', s=50, label='Mesures (triplicats)')
X_grid = np.linspace(0, 25, 100)
plt.plot(X_grid, intercept + pente * X_grid, color='#0D9488', linewidth=2, label=f'Ajustement (R²={r2:.3f})')
plt.title("Gamme Étalon Bradford (BSA)", fontweight='bold')
plt.xlabel("Concentration BSA (µg/mL)")
plt.ylabel("Absorbance (A595)")
plt.legend()
plt.show()"""),
    code_cell("""# LOD / LOQ et prédiction
residus = Y - (intercept + pente * X)
s_res = np.sqrt(np.sum(residus**2) / (len(X) - 2))

LOD = 3.3 * s_res / pente
LOQ = 10.0 * s_res / pente

A_inconnu = 0.427
conc_estimee = (A_inconnu - intercept) / pente

print(f"LOD = {LOD:.2f} µg/mL")
print(f"LOQ = {LOQ:.2f} µg/mL")
print(f"-> Pour A595 = {A_inconnu}, Concentration en protéine = {conc_estimee:.2f} µg/mL")""")
]

with open('travaux_pratiques/TP03_Regression_Lineaire_Dosage/TP03_Regression_Lineaire_Dosage.ipynb', 'w') as f:
    json.dump(make_nb(cells_03), f, indent=2)

# 5. TP04 : Régression Non Linéaire
cells_04 = [
    md_cell("""# TP 04 : Régression Non Linéaire — Cinétique Enzymatique
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Objectifs :
1. Modéliser la cinétique enzymatique de Michaelis-Menten par ajustement direct non linéaire (NLLS).
2. Comparer avec la méthode de double inverse de Lineweaver-Burk."""),
    code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

df_kin = pd.read_csv('../datasets/cinetique_enzyme_phosphatase.csv')
display(df_kin.head())"""),
    code_cell("""def mm(S, Vmax, Km):
    return (Vmax * S) / (Km + S)

S_obs = df_kin['Substrat_mM'].values
v_obs = df_kin['Vitesse_umol_min_mg'].values

popt, pcov = curve_fit(mm, S_obs, v_obs, p0=[100, 1])
Vmax_fit, Km_fit = popt
Vmax_err, Km_err = np.sqrt(np.diag(pcov))

print("=== NLLS DIRECT ===")
print(f"Vmax = {Vmax_fit:.2f} ± {Vmax_err:.2f} µmol/min/mg")
print(f"Km   = {Km_fit:.3f} ± {Km_err:.3f} mM")"""),
    code_cell("""# Lineweaver-Burk
poly = np.polyfit(1.0 / S_obs, 1.0 / v_obs, 1)
Vmax_lb = 1.0 / poly[1]
Km_lb = poly[0] * Vmax_lb

print("=== LINEWEAVER-BURK ===")
print(f"Vmax (LB) = {Vmax_lb:.2f} µmol/min/mg")
print(f"Km   (LB) = {Km_lb:.3f} mM")"""),
    code_cell("""# Superposition graphique
plt.figure(figsize=(8, 5))
plt.scatter(S_obs, v_obs, color='#1A365D', label='Données expérimentales')
S_grid = np.linspace(0.01, 10, 200)
plt.plot(S_grid, mm(S_grid, Vmax_fit, Km_fit), color='#0D9488', linewidth=2, label=f'NLLS : Vmax={Vmax_fit:.1f}, Km={Km_fit:.2f}')
plt.plot(S_grid, mm(S_grid, Vmax_lb, Km_lb), color='#D97706', linestyle='--', label=f'Lineweaver-Burk : Vmax={Vmax_lb:.1f}, Km={Km_lb:.2f}')
plt.title("Cinétique Enzymatique : NLLS Direct vs. Lineweaver-Burk", fontweight='bold')
plt.xlabel("[Substrat] (mM)")
plt.ylabel("Vitesse initiale v")
plt.legend()
plt.show()""")
]

with open('travaux_pratiques/TP04_Cinetique_Non_Lineaire/TP04_Cinetique_Non_Lineaire.ipynb', 'w') as f:
    json.dump(make_nb(cells_04), f, indent=2)

# 6. TP05 : ACP Métabolomique
cells_05 = [
    md_cell("""# TP 05 : Analyse en Composantes Principales (ACP) — Métabolomique
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Objectifs :
1. Standardiser une matrice de biomarqueurs sériques.
2. Évaluer les valeurs propres et le pourcentage de variance expliquée.
3. Tracer le cercle des corrélations des métabolites.
4. Représenter la projection des patients dans le plan factoriel."""),
    code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

df_meta = pd.read_csv('../datasets/metabolomique_serum.csv')
display(df_meta.head())"""),
    code_cell("""metabolites = ['Glucose_mM', 'Triglycerides_gL', 'ALAT_UIL', 'ASAT_UIL', 'HDL_gL', 'Lactate_mM', 'BCAA_uM']
X = df_meta[metabolites].values
X_scaled = StandardScaler().fit_transform(X)

pca = PCA()
X_pca = pca.fit_transform(X_scaled)
var_exp = pca.explained_variance_ratio_ * 100

print(f"Variance Axe 1 : {var_exp[0]:.2f}%")
print(f"Variance Axe 2 : {var_exp[1]:.2f}%")"""),
    code_cell("""# Cercle des corrélations
loadings = pca.components_[:2, :].T * np.sqrt(pca.explained_variance_[:2])

plt.figure(figsize=(6, 6))
circle = plt.Circle((0,0), 1, color='#1A365D', fill=False, linestyle='--')
plt.gca().add_patch(circle)

for i, var_name in enumerate(metabolites):
    plt.arrow(0, 0, loadings[i, 0], loadings[i, 1], head_width=0.03, color='#0D9488', length_includes_head=True)
    plt.text(loadings[i, 0]*1.1, loadings[i, 1]*1.1, var_name, fontweight='bold', color='#1A365D')

plt.xlim(-1.2, 1.2)
plt.ylim(-1.2, 1.2)
plt.axhline(0, color='gray', linestyle=':')
plt.axvline(0, color='gray', linestyle=':')
plt.title(f"Cercle des Corrélations (Axe 1: {var_exp[0]:.1f}% vs Axe 2: {var_exp[1]:.1f}%)", fontweight='bold')
plt.gca().set_aspect('equal', adjustable='box')
plt.show()"""),
    code_cell("""# Plan des individus
df_pca = pd.DataFrame(X_pca[:, :2], columns=['PC1', 'PC2'])
df_pca['Statut'] = df_meta['Statut']

plt.figure(figsize=(8, 5))
sns.scatterplot(
    data=df_pca, x='PC1', y='PC2', hue='Statut', style='Statut', s=85,
    palette={'Temoin_Sain': '#2E7D32', 'Diabete_T2': '#1A365D', 'NASH_Hepatique': '#D97706'}
)
plt.title("Plan Factoriel des Patients (Discrimination Métabolique)", fontweight='bold')
plt.xlabel(f"Axe 1 ({var_exp[0]:.1f}%)")
plt.ylabel(f"Axe 2 ({var_exp[1]:.1f}%)")
plt.legend()
plt.show()""")
]

with open('travaux_pratiques/TP05_ACP_Metabolomique/TP05_ACP_Metabolomique.ipynb', 'w') as f:
    json.dump(make_nb(cells_05), f, indent=2)

# 7. TP06 : CAH
cells_06 = [
    md_cell("""# TP 06 : Classification Hiérarchique Ascendante (CAH) & Heatmap
**Master 2 Biochimie Appliquée — Université M'Hamed Bougara de Boumerdès (UMBB)**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.)*

---

## Objectifs :
1. Construire le dendrogramme par la méthode de Ward.
2. Déterminer le nombre optimal de clusters par coupure.
3. Réaliser une Clustermap (Heatmap bi-clusterisée)."""),
    code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.preprocessing import StandardScaler

df_meta = pd.read_csv('../datasets/metabolomique_serum.csv')
metabolites = ['Glucose_mM', 'Triglycerides_gL', 'ALAT_UIL', 'ASAT_UIL', 'HDL_gL', 'Lactate_mM', 'BCAA_uM']
X = df_meta[metabolites].values
X_scaled = StandardScaler().fit_transform(X)"""),
    code_cell("""# Dendrogramme
Z = linkage(X_scaled, method='ward', metric='euclidean')

plt.figure(figsize=(11, 5))
dendrogram(Z, labels=df_meta['Patient_ID'].values, leaf_rotation=90, leaf_font_size=8, color_threshold=7.5)
plt.axhline(7.5, color='red', linestyle='--', label='Coupure optimale (k=3)')
plt.title("Dendrogramme des Patients (Ward)", fontweight='bold')
plt.xlabel("Patients")
plt.ylabel("Dissimilarité")
plt.legend()
plt.show()"""),
    code_cell("""# Concordance avec la clinique
clusters = fcluster(Z, t=3, criterion='maxclust')
df_meta['Cluster_CAH'] = [f'Cluster_{c}' for c in clusters]
display(pd.crosstab(df_meta['Statut'], df_meta['Cluster_CAH']))"""),
    code_cell("""# Heatmap Biclusterisée
df_heatmap = pd.DataFrame(X_scaled, columns=metabolites, index=df_meta['Patient_ID'])
status_colors = df_meta['Statut'].map({'Temoin_Sain': '#2E7D32', 'Diabete_T2': '#1A365D', 'NASH_Hepatique': '#D97706'})

sns.clustermap(
    df_heatmap, method='ward', cmap='vlag', center=0, figsize=(9, 8),
    row_colors=status_colors, dendrogram_ratio=(0.2, 0.2)
)
plt.show()""")
]

with open('travaux_pratiques/TP06_CAH_Classification_Biologique/TP06_CAH_Classification_Biologique.ipynb', 'w') as f:
    json.dump(make_nb(cells_06), f, indent=2)

print('Tous les Notebooks TP ont été générés avec succès !')
