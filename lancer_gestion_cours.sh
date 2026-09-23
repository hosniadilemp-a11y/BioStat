#!/usr/bin/env bash
# ==============================================================================
# Lanceur Simplifié du Tableau de Bord Enseignant
# Cours de Biostatistiques & Modélisation (Dr. Sarra BENMOUMOU-HOSNI)
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "🚀 Lancement du Tableau de Bord Enseignant (Gestion du Cours)..."
echo "======================================================================"

python3 "$DIR/admin/gestion_cours.py"
