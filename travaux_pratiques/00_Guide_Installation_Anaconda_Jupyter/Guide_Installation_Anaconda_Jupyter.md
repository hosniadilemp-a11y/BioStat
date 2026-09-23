# Guide Pratique : Installation d'Anaconda & Prise en Main de Jupyter Notebook
**À destination des étudiants de Master en Biochimie Appliquée \& Biologie**  
*Enseignante : Dr. Sarra BENMOUMOU (Ph.D.) --- Université M'Hamed Bougara de Boumerdès (UMBB)*

---

## 🎯 Bienvenue dans le monde du calcul scientifique biologique !

Chers étudiants,  
En tant que futurs chercheurs, cadres en industrie biopharmaceutique ou biologistes médicaux, vous serez confrontés à des volumes de données croissants (spectrométrie, ELISA, PCR quantitative, métabolomique).  
**Bonne nouvelle :** Vous n'avez besoin d'**aucune connaissance préalable en informatique** pour suivre ces Travaux Pratiques. Python et les carnets interactifs **Jupyter Notebook** ont été conçus pour rendre l'analyse de données aussi intuitive et visuelle que l'utilisation d'un tableur Excel, mais avec une puissance et une reproductibilité incomparables.

---

## 📥 Étape 1 : Téléchargement d'Anaconda

**Anaconda** est une suite logicielle gratuite et complète qui installe en un seul clic :
- Le langage **Python** (version 3.x).
- L'interface graphique **Anaconda Navigator**.
- L'environnement de travail **Jupyter Notebook**.
- Toutes les bibliothèques scientifiques nécessaires à la biochimie (`pandas`, `numpy`, `scipy`, `matplotlib`, `seaborn`, `scikit-learn`).

### Procédure de téléchargement :
1. Rendez-vous sur le site officiel : [https://www.anaconda.com/download](https://www.anaconda.com/download)
2. Le site détecte automatiquement votre système d'exploitation (**Windows**, **macOS** ou **Linux**).
3. Cliquez sur le bouton vert **« Download »** (le fichier d'installation fait environ 900 Mo).

---

## ⚙️ Étape 2 : Installation pas-à-pas

### Sous Windows :
1. Double-cliquez sur le fichier téléchargé (ex : `Anaconda3-xxxx-Windows-x86_64.exe`).
2. Cliquez sur **Next**, puis acceptez la licence (**I Agree**).
3. Choisissez l'option recommandée : **Just Me (recommended)**.
4. Laissez le dossier d'installation par défaut proposé (ex : `C:\Users\VotreNom\anaconda3`).
5. **Important :** À l'écran « Advanced Installation Options », laissez les cases cochées par défaut, puis cliquez sur **Install**.
6. L'installation prend quelques minutes. Une fois terminée, cliquez sur **Next** puis **Finish**.

### Sous macOS :
1. Ouvrez le fichier `.pkg` téléchargé et suivez l'assistant d'installation en conservant les options par défaut.

### Sous Linux (Ubuntu / Debian) :
1. Ouvrez un terminal dans votre dossier de téléchargement.
2. Lancez le script : `bash Anaconda3-xxxx-Linux-x86_64.sh`.
3. Validez la licence avec `Enter` puis tapez `yes` pour accepter.

---

## 🚀 Étape 3 : Lancer Jupyter Notebook

Il existe deux manières très simples de démarrer :

### Méthode 1 : Via l'interface graphique Anaconda Navigator (Recommandée pour débuter)
1. Ouvrez le menu Démarrer (Windows) ou le Launchpad (Mac) et cherchez **Anaconda Navigator**.
2. Dans la fenêtre qui s'ouvre, vous verrez plusieurs icônes d'applications.
3. Repérez la case **Jupyter Notebook** et cliquez simplement sur le bouton **Launch**.
4. Votre navigateur web habituel (Chrome, Firefox, Edge) s'ouvre automatiquement : **vous êtes prêt(e) !**

### Méthode 2 : Directement via le menu d'applications
1. Dans le menu Démarrer de Windows, tapez directement **Jupyter Notebook** et cliquez dessus.

---

## 💻 Étape 4 : Comprendre l'Interface de Jupyter Notebook

Un **Jupyter Notebook** (fichier avec l'extension `.ipynb`) est un « cahier de laboratoire électronique interactif ». Il alterne entre :
- Des **cellules de texte explicatif** (en Markdown) pour décrire le protocole ou interpréter la biologie.
- Des **cellules de code Python** pour faire les calculs et afficher les graphiques.

### Les 3 raccourcis indispensables à retenir :
| Action | Raccourci Clavier |
| :--- | :--- |
| **Exécuter la cellule sélectionnée** | <kbd>Maj (Shift)</kbd> + <kbd>Entrée</kbd> |
| **Insérer une nouvelle cellule en dessous** | Appuyez sur <kbd>Échap</kbd> puis <kbd>B</kbd> |
| **Transformer une cellule en texte explicatif** | Appuyez sur <kbd>Échap</kbd> puis <kbd>M</kbd> (Markdown) |
| **Transformer une cellule en code de calcul** | Appuyez sur <kbd>Échap</kbd> puis <kbd>Y</kbd> (Code) |

---

## 🧪 Étape 5 : Votre Premier Test en Biochimie (3 lignes de code !)

Dans un nouveau notebook, copiez-collez simplement ce code dans une cellule et appuyez sur <kbd>Shift</kbd> + <kbd>Entrée</kbd> :

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 1. Chargement d'un tableau de données de laboratoire (Gamme Bradford)
donnees = pd.read_csv('../datasets/dosage_bradford.csv')

# 2. Visualisation des 5 premières lignes
print("--- Aperçu des données de dosage ---")
print(donnees.head())

# 3. Tracé automatique de la courbe d'étalonnage avec intervalle de confiance
sns.lmplot(data=donnees, x='BSA_ug_mL', y='Absorbance_595nm', color='#1A365D')
plt.title("Gamme Étalon BSA (Bradford à 595 nm)")
plt.xlabel("Concentration en BSA (µg/mL)")
plt.ylabel("Absorbance (A595)")
plt.show()
```

---

## 💾 Étape 6 : Sauvegarder et Exporter vos Travaux

1. **Sauvegarde automatique :** Jupyter sauvegarde votre travail toutes les 2 minutes. Vous pouvez forcer la sauvegarde avec <kbd>Ctrl</kbd> + <kbd>S</kbd> (ou <kbd>Cmd</kbd> + <kbd>S</kbd>).
2. **Export pour remise de compte-rendu :**
   - Allez dans le menu : `File` $\rightarrow$ `Download as` $\rightarrow$ `PDF via HTML (.html)` ou `PDF via LaTeX (.pdf)`.
   - Vous pouvez également imprimer la page web directement en PDF (`Ctrl + P`).

---

*En cas de question technique ou de blocage d'installation, n'hésitez pas à solliciter Dr. Sarra BENMOUMOU lors de la première séance de TP !*
