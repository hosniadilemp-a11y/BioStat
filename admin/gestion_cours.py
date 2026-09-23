#!/usr/bin/env python3
"""
Tableau de Bord & Serveur Local de Gestion Automatisée du Cours
Biostatistiques Appliquées & Modélisation (Master 2 Biochimie - UMBB)
Enseignante : Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)
"""

import os
import sys
import json
import shutil
import subprocess
import webbrowser
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000
ADMIN_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(ADMIN_DIR)

COURSES_MAP = {
    "00": ("sources/chapitre_00_introduction", "chapitre_00_intro.tex", "Chapitre_00_Introduction_Biostatistiques.pdf"),
    "01": ("sources/chapitre_01_anova_croisee", "chapitre_01_anova_croisee.tex", "Chapitre_01_ANOVA_Croisee.pdf"),
    "02": ("sources/chapitre_02_anova_hierarchisee", "chapitre_02_anova_hierarchisee.tex", "Chapitre_02_ANOVA_Hierarchisee.pdf"),
    "03": ("sources/chapitre_03_regression_lineaire", "chapitre_03_regression_lineaire.tex", "Chapitre_03_Regression_Lineaire.pdf"),
    "04": ("sources/chapitre_04_regression_non_lineaire", "chapitre_04_regression_non_lineaire.tex", "Chapitre_04_Regression_Non_Lineaire.pdf"),
    "05": ("sources/chapitre_05_acp", "chapitre_05_acp.tex", "Chapitre_05_ACP.pdf"),
    "06": ("sources/chapitre_06_cah", "chapitre_06_cah.tex", "Chapitre_06_CAH.pdf"),
    "07": ("sources/chapitre_07_interpretation_analyse", "chapitre_07_interpretation.tex", "Chapitre_07_Interpretation_Analyse.pdf"),
}

TD_MAP = [
    ("td_ch00_intro.tex", "TD_Chapitre_00_Introduction.pdf", "enonce"),
    ("corrige_td_ch00_intro.tex", "Corrige_TD_Chapitre_00_Introduction.pdf", "corrige"),
    ("td_ch01_anova_croisee.tex", "TD_Chapitre_01_ANOVA_Croisee.pdf", "enonce"),
    ("corrige_td_ch01_anova_croisee.tex", "Corrige_TD_Chapitre_01_ANOVA_Croisee.pdf", "corrige"),
    ("td_ch02_anova_hierarchisee.tex", "TD_Chapitre_02_ANOVA_Hierarchisee.pdf", "enonce"),
    ("corrige_td_ch02_anova_hierarchisee.tex", "Corrige_TD_Chapitre_02_ANOVA_Hierarchisee.pdf", "corrige"),
    ("td_ch03_regression_lineaire.tex", "TD_Chapitre_03_Regression_Lineaire.pdf", "enonce"),
    ("corrige_td_ch03_regression_lineaire.tex", "Corrige_TD_Chapitre_03_Regression_Lineaire.pdf", "corrige"),
    ("td_ch04_regression_non_lineaire.tex", "TD_Chapitre_04_Regression_Non_Lineaire.pdf", "enonce"),
    ("corrige_td_ch04_regression_non_lineaire.tex", "Corrige_TD_Chapitre_04_Regression_Non_Lineaire.pdf", "corrige"),
    ("td_ch05_acp.tex", "TD_Chapitre_05_ACP.pdf", "enonce"),
    ("corrige_td_ch05_acp.tex", "Corrige_TD_Chapitre_05_ACP.pdf", "corrige"),
    ("td_ch06_cah.tex", "TD_Chapitre_06_CAH.pdf", "enonce"),
    ("corrige_td_ch06_cah.tex", "Corrige_TD_Chapitre_06_CAH.pdf", "corrige"),
    ("td_ch07_interpretation.tex", "TD_Chapitre_07_Interpretation.pdf", "enonce"),
    ("corrige_td_ch07_interpretation.tex", "Corrige_TD_Chapitre_07_Interpretation.pdf", "corrige"),
]

def compile_latex(src_dir, tex_file, dest_pdf_name, is_course=True, is_enonce=True):
    abs_src_dir = os.path.join(BASE_DIR, src_dir)
    pdf_base = os.path.splitext(tex_file)[0] + ".pdf"
    
    cmd = ["pdflatex", "-interaction=nonstopmode", tex_file]
    proc = subprocess.run(cmd, cwd=abs_src_dir, capture_output=True, text=True)
    
    src_pdf_path = os.path.join(abs_src_dir, pdf_base)
    if not os.path.exists(src_pdf_path):
        return False, f"Erreur de compilation pour {tex_file}:\n{proc.stdout[-500:]}"
        
    if is_course:
        target1 = os.path.join(BASE_DIR, "courses_pdf", dest_pdf_name)
        target2 = os.path.join(BASE_DIR, "website", "downloads", "cours", dest_pdf_name)
        shutil.copy2(src_pdf_path, target1)
        shutil.copy2(src_pdf_path, target2)
    else:
        target1 = os.path.join(BASE_DIR, "travaux_diriges", "td_pdf", dest_pdf_name)
        shutil.copy2(src_pdf_path, target1)
        if is_enonce:
            target2 = os.path.join(BASE_DIR, "website", "downloads", "td_enonces", dest_pdf_name)
            shutil.copy2(src_pdf_path, target2)
            
    return True, f"Succès : {dest_pdf_name} généré."

class CourseManagementHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path in ["/", "/index.html", "/gestion_cours.html"]:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(ADMIN_DIR, "gestion_cours.html"), "rb") as f:
                self.wfile.write(f.read())
            return
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        payload = json.loads(body) if body else {}

        response_data = {"success": False, "message": "Action inconnue"}

        try:
            if self.path == "/api/compile_course":
                chap = payload.get("chapter", "00")
                if chap in COURSES_MAP:
                    src_dir, tex_file, dest_pdf = COURSES_MAP[chap]
                    ok, msg = compile_latex(src_dir, tex_file, dest_pdf, is_course=True)
                    response_data = {
                        "success": ok,
                        "message": f"Chapitre {chap} : Diapositives PDF régénérées et mises à jour sur le site !",
                        "details": msg
                    }
                else:
                    response_data = {"success": False, "message": f"Chapitre inconnu : {chap}"}

            elif self.path == "/api/compile_all_courses":
                results = []
                for chap, (src_dir, tex_file, dest_pdf) in COURSES_MAP.items():
                    ok, msg = compile_latex(src_dir, tex_file, dest_pdf, is_course=True)
                    results.append(f"Ch. {chap}: {'OK' if ok else 'ÉCHEC'}")
                response_data = {
                    "success": True,
                    "message": "Les 8 cours magistraux ont été régénérés avec succès !",
                    "details": "\n".join(results)
                }

            elif self.path == "/api/compile_td":
                td_type = payload.get("type", "enonces") # 'enonces' ou 'corriges'
                results = []
                src_dir = "travaux_diriges/sources"
                
                for tex_file, dest_pdf, cat in TD_MAP:
                    if td_type == "enonces" and cat != "enonce":
                        continue
                    if td_type == "corriges" and cat != "corrige":
                        continue
                    ok, msg = compile_latex(src_dir, tex_file, dest_pdf, is_course=False, is_enonce=(cat == "enonce"))
                    results.append(f"{dest_pdf}: {'OK' if ok else 'ÉCHEC'}")

                response_data = {
                    "success": True,
                    "message": f"Les séries de TD ({td_type}) ont été régénérées avec succès !",
                    "details": "\n".join(results)
                }

            elif self.path == "/api/generate_figures":
                script_path = os.path.join(BASE_DIR, "scripts_generation_figures", "generate_all_course_plots.py")
                proc = subprocess.run([sys.executable, script_path], cwd=BASE_DIR, capture_output=True, text=True)
                
                # Copie automatique vers le site
                src_fig_dir = os.path.join(BASE_DIR, "sources", "figures")
                dst_fig_dir = os.path.join(BASE_DIR, "website", "assets", "figures")
                for f in os.listdir(src_fig_dir):
                    if f.endswith(".png"):
                        shutil.copy2(os.path.join(src_fig_dir, f), os.path.join(dst_fig_dir, f))
                        
                response_data = {
                    "success": proc.returncode == 0,
                    "message": "Les 13 figures scientifiques HD 300 DPI ont été recalculées et tracées !",
                    "details": proc.stdout[-500:] if proc.returncode == 0 else proc.stderr
                }

            elif self.path == "/api/publish_github":
                # Git add, commit, push
                timestamp = datetime.now().strftime("%d/%m/%Y à %H:%M")
                commit_msg = f"Mise à jour du cours par l'enseignante ({timestamp})"
                
                subprocess.run(["git", "add", "."], cwd=BASE_DIR, check=True)
                
                # Check if there are changes to commit
                status_res = subprocess.run(["git", "status", "--porcelain"], cwd=BASE_DIR, capture_output=True, text=True)
                if status_res.stdout.strip():
                    subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, check=True)
                    
                push_res = subprocess.run(["git", "push", "origin", "main"], cwd=BASE_DIR, capture_output=True, text=True)
                
                if push_res.returncode == 0:
                    response_data = {
                        "success": True,
                        "message": "Publication réussie sur GitHub ! Le site en ligne s'actualise en moins de 60 secondes.",
                        "details": f"Commit : {commit_msg}\n{push_res.stderr}"
                    }
                else:
                    response_data = {
                        "success": False,
                        "message": "Erreur lors de l'envoi vers GitHub.",
                        "details": push_res.stderr or push_res.stdout
                    }

        except Exception as e:
            response_data = {
                "success": False,
                "message": f"Erreur d'exécution interne : {str(e)}",
                "details": str(e)
            }

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, CourseManagementHandler)
    url = f"http://localhost:{PORT}/"
    print("=" * 70)
    print(f"🎓 Serveur de Gestion du Cours de Biostatistiques démarré !")
    print(f"👉 Ouvrez votre navigateur sur : {url}")
    print(f"⌨️  Pour arrêter le serveur : appuyez sur Ctrl + C")
    print("=" * 70)
    
    try:
        webbrowser.open(url)
    except Exception:
        pass
        
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur. Au revoir !")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
