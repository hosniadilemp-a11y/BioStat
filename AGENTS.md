# Directives Générales pour les Agents IA (AGENTS.md)
## Cours de Biostatistiques Appliquées & Modélisation (M2 Biochimie, UMBB)
### Enseignante : Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)

Ce fichier définit les directives obligatoires pour tout agent ou modèle IA intervenant sur ce projet :

1. **Emplacement Unique des PDFs** :
   - Tous les fichiers PDF finaux doivent être générés et stockés **exclusivement** dans `website/downloads/` (`website/downloads/cours/` pour les diapositives Beamer, `website/downloads/td_enonces/` pour les énoncés TD).
   - Ne jamais créer de répertoires parallèles de PDF (ex : aucun dossier `courses_pdf/`).

2. **Zéro Débordement Beamer** :
   - Présentations en `\documentclass[aspectratio=169,10pt]{beamer}`.
   - Les diapositives ne doivent jamais déborder en hauteur ou en largeur.
   - Utiliser `\begin{columns}[onlytextwidth, T]` et des boîtes `tcolorbox` de thème (`conceptbox`, `biobox`, `warnbox`, `takeawaybox`).
   - Tableaux obligatoirement encapsulés dans `\resizebox{\linewidth}{!}{...}` ou polices réduites.

3. **Une Notion par Diapositive avec Exemple Biologique Concret** :
   - Pour chaque formule mathématique ou concept statistique ($S^2$, $SD$, $SEM$, $SS$, $MS$, $F$, etc.), consacrer **une diapositive entière distincte**.
   - Accompagner chaque notion d'un exemple concret de biochimie/biologie (ex : ELISA, spectrophotométrie, qPCR, peroxydation lipidique MDA, modèles animaux).
   - Expliquer la signification biologique du paramètre pour des étudiants en Master 2 sans formation informatique.

4. **Alignement Tripartite (Cours ↔ TD ↔ TP)** :
   - Toute modification ou extension d'un chapitre de cours doit être répercutée dans le TD correspondant (`travaux_diriges/sources/`) et le TP Jupyter correspondant (`travaux_pratiques/`).

5. **Tableau de Bord Enseignant (`admin/gestion_cours.py`)** :
   - Serveur Python standard, multithreadé (`ThreadingHTTPServer`), avec `errors="replace"` sur les subprocess et sauvegarde directe dans `website/downloads/`.
