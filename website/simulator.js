/* ==========================================================================
   Laboratoire Virtuel & Simulateur Interactif des Concepts (Chapitre 0)
   Biostatistiques Appliquées - Master 2 Biochimie (UMBB)
   Auteure : Dr. Sarra BENMOUMOU-HOSNI (Ph.D.)
   ========================================================================== */

(function () {
  'use strict';

  // Palette de couleurs scientifiques
  function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      isDark: isDark,
      bg: isDark ? '#0f172a' : '#ffffff',
      text: isDark ? '#f1f5f9' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#64748b',
      grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
      navy: isDark ? '#38bdf8' : '#1a365d',
      teal: '#0d9488',
      tealLight: isDark ? 'rgba(13, 148, 136, 0.35)' : 'rgba(13, 148, 136, 0.20)',
      amber: '#d97706',
      amberLight: isDark ? 'rgba(217, 119, 6, 0.35)' : 'rgba(217, 119, 6, 0.20)',
      red: '#e11d48',
      redLight: isDark ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.20)',
      green: '#10b981',
      greenLight: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.20)'
    };
  }

  // Utilitaires de dessin Canvas Haute Définition (HiDPI / Retina)
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || canvas.parentElement.clientWidth || 600;
    const height = rect.height || 340;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  // ==========================================================================
  // GESTIONNAIRE DES ONGLETS DU SIMULATEUR
  // ==========================================================================
  function initSimulatorTabs() {
    const tabButtons = document.querySelectorAll('.sim-tab-btn');
    const tabPanels = document.querySelectorAll('.sim-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const panel = document.getElementById(targetId);
        if (panel) {
          panel.classList.add('active');
          // Déclencher le tracé du panneau actif
          triggerDraw(targetId);
        }
      });
    });

    // Observer le changement de thème clair/sombre pour redessiner
    const observer = new MutationObserver(() => {
      const activeBtn = document.querySelector('.sim-tab-btn.active');
      if (activeBtn) triggerDraw(activeBtn.getAttribute('data-tab'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Redimensionnement de fenêtre
    window.addEventListener('resize', debounce(() => {
      const activeBtn = document.querySelector('.sim-tab-btn.active');
      if (activeBtn) triggerDraw(activeBtn.getAttribute('data-tab'));
    }, 150));
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function triggerDraw(tabId) {
    switch (tabId) {
      case 'sim-skew': drawSkewness(); break;
      case 'sim-sd-sem': drawSdSem(); break;
      case 'sim-boxplot': drawBoxplot(); break;
      case 'sim-bayes': drawBayes(); break;
      case 'sim-normale': drawNormal(); break;
      case 'sim-tcl': drawTcl(); break;
      case 'sim-ci': drawCi(); break;
      case 'sim-hypo': drawHypo(); break;
    }
  }

  // ==========================================================================
  // ONGLET 1 : MOYENNE vs MÉDIANE (ASYMÉTRIE & OUTLIERS)
  // ==========================================================================
  function drawSkewness() {
    const canvas = document.getElementById('canvas-skew');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const skewSlider = document.getElementById('slider-skewness');
    const outlierSlider = document.getElementById('slider-outlier');
    const skewVal = parseFloat(skewSlider.value);
    const outlierVal = parseFloat(outlierSlider.value);

    // Mettre à jour les labels
    document.getElementById('val-skewness').textContent = skewVal.toFixed(1);
    document.getElementById('val-outlier').textContent = '+' + outlierVal + ' pg/mL';

    // Grille et axes
    ctx.clearRect(0, 0, width, height);
    const padX = 55, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    // Simulation d'une distribution normale asymétrique (Skew-Normal / Log-Normale)
    const points = 300;
    const xMin = 0, xMax = 80 + outlierVal * 0.8;
    const curve = [];

    // Densité théorique
    let maxDensity = 0;
    for (let i = 0; i < points; i++) {
      const x = xMin + (i / (points - 1)) * (xMax - xMin);
      // Modélisation combinée : Log-normale selon l'asymétrie
      const sigma = 0.25 + skewVal * 0.55;
      const m = 25;
      let y = 0;
      if (x > 0) {
        y = (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(x / m), 2) / (2 * sigma * sigma));
      }
      // Ajouter composante outlier si active
      if (outlierVal > 0) {
        const outDist = Math.exp(-Math.pow(x - (m + outlierVal), 2) / (2 * 4 * 4)) * (0.015 * (outlierVal / 80));
        y += outDist;
      }
      if (y > maxDensity) maxDensity = y;
      curve.push({ x, y });
    }

    // Normalisation verticale
    const toCanvasX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = y => padY + plotH - (y / maxDensity) * (plotH * 0.90);

    // Dessin de la zone sous la courbe
    ctx.beginPath();
    ctx.moveTo(toCanvasX(curve[0].x), padY + plotH);
    for (let pt of curve) ctx.lineTo(toCanvasX(pt.x), toCanvasY(pt.y));
    ctx.lineTo(toCanvasX(curve[curve.length - 1].x), padY + plotH);
    ctx.closePath();
    ctx.fillStyle = colors.tealLight;
    ctx.fill();

    // Ligne de la courbe
    ctx.beginPath();
    for (let i = 0; i < curve.length; i++) {
      const pt = curve[i];
      if (i === 0) ctx.moveTo(toCanvasX(pt.x), toCanvasY(pt.y));
      else ctx.lineTo(toCanvasX(pt.x), toCanvasY(pt.y));
    }
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Calculs de Moyenne, Médiane et Mode
    // Mode = max de la densité
    let modeX = 25;
    let maxPtY = 0;
    for (let pt of curve) {
      if (pt.y > maxPtY) { maxPtY = pt.y; modeX = pt.x; }
    }

    // Médiane empirique (intégrale = 50%)
    let cumulative = 0;
    let totalArea = curve.reduce((acc, p) => acc + p.y, 0);
    let medianX = 25;
    for (let pt of curve) {
      cumulative += pt.y;
      if (cumulative >= totalArea * 0.5) { medianX = pt.x; break; }
    }

    // Moyenne arithmétique = barycentre
    let meanX = curve.reduce((acc, p) => acc + p.x * p.y, 0) / totalArea;

    // Lignes verticales de repère
    function drawMarker(xVal, color, label, dashed) {
      const cx = toCanvasX(xVal);
      ctx.beginPath();
      if (dashed) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);
      ctx.moveTo(cx, padY);
      ctx.lineTo(cx, padY + plotH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge de texte
      ctx.fillStyle = color;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, padY - 8);
    }

    drawMarker(modeX, colors.teal, `Mode (${modeX.toFixed(1)})`, true);
    drawMarker(medianX, colors.green, `Médiane (${medianX.toFixed(1)})`, false);
    drawMarker(meanX, colors.red, `Moyenne (${meanX.toFixed(1)})`, false);

    // Axe des X
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0 pg/mL', padX, padY + plotH + 16);
    ctx.fillText('Concentration Sérique en Cytokines (ex: IL-6 pg/mL)', padX + plotW / 2, padY + plotH + 28);
    ctx.fillText(`${xMax.toFixed(0)} pg/mL`, padX + plotW, padY + plotH + 16);

    // Mise à jour des cartes de synthèse
    document.getElementById('metric-mean').textContent = meanX.toFixed(1) + ' pg/mL';
    document.getElementById('metric-median').textContent = medianX.toFixed(1) + ' pg/mL';
    document.getElementById('metric-mode').textContent = modeX.toFixed(1) + ' pg/mL';
    document.getElementById('metric-diff').textContent = (meanX - medianX).toFixed(1) + ' pg/mL';
  }

  // ==========================================================================
  // ONGLET 2 : SD vs SEM
  // ==========================================================================
  function drawSdSem() {
    const canvas = document.getElementById('canvas-sd-sem');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const nSlider = document.getElementById('slider-n');
    const sigmaSlider = document.getElementById('slider-sigma');
    const N = parseInt(nSlider.value, 10);
    const sigma = parseFloat(sigmaSlider.value);
    const sem = sigma / Math.sqrt(N);

    document.getElementById('val-n').textContent = N;
    document.getElementById('val-sigma').textContent = sigma.toFixed(1) + ' g/L';

    ctx.clearRect(0, 0, width, height);
    const padX = 60, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const mu = 40.0;
    const xMin = mu - 35, xMax = mu + 35;
    const points = 250;

    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = y => padY + plotH - (y / 0.35) * (plotH * 0.90);

    // 1. Courbe de la Population (SD)
    ctx.beginPath();
    ctx.moveTo(toX(xMin), padY + plotH);
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
      ctx.lineTo(toX(x), toY(y));
    }
    ctx.lineTo(toX(xMax), padY + plotH);
    ctx.fillStyle = colors.tealLight;
    ctx.fill();

    // Trait SD
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Courbe de la Moyenne d'Échantillon (SEM)
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / (sem * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * sem * sem));
      const cy = Math.max(padY + 10, toY(y));
      if (i === 0) ctx.moveTo(toX(x), cy); else ctx.lineTo(toX(x), cy);
    }
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Barres d'erreur horizontales au centre
    const midY = padY + plotH * 0.45;
    // Barre SD
    ctx.beginPath();
    ctx.moveTo(toX(mu - sigma), midY);
    ctx.lineTo(toX(mu + sigma), midY);
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = colors.teal;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`± 1 SD = ${sigma.toFixed(1)} g/L (Dispersion Biologique)`, toX(mu), midY - 8);

    // Barre SEM
    const semY = padY + plotH * 0.65;
    ctx.beginPath();
    ctx.moveTo(toX(mu - sem), semY);
    ctx.lineTo(toX(mu + sem), semY);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = colors.red;
    ctx.fillText(`± 1 SEM = ${sem.toFixed(2)} g/L (Précision Moyenne)`, toX(mu), semY - 8);

    // Ligne centrale de la moyenne
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(toX(mu), padY);
    ctx.lineTo(toX(mu), padY + plotH);
    ctx.strokeStyle = colors.navy;
    ctx.stroke();
    ctx.setLineDash([]);

    // Axe des X
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Concentration Protéique (g/L)', toX(mu), padY + plotH + 24);

    // Métriques
    document.getElementById('metric-sd').textContent = sigma.toFixed(1) + ' g/L';
    document.getElementById('metric-sem').textContent = sem.toFixed(2) + ' g/L';
    document.getElementById('metric-shrink').textContent = `÷ ${Math.sqrt(N).toFixed(1)} (1/√${N})`;
  }

  // ==========================================================================
  // ONGLET 3 : BOXPLOT DE TUKEY
  // ==========================================================================
  let boxplotData = [];
  function generateBoxplotPoints() {
    const iqrSlider = document.getElementById('slider-iqr');
    const nSlider = document.getElementById('slider-box-n');
    const hasOutlier = document.getElementById('check-outlier').checked;

    const iqr = parseFloat(iqrSlider.value);
    const n = parseInt(nSlider.value, 10);
    const sigma = iqr / 1.349; // relation IQR et sigma d'une loi normale

    const pts = [];
    for (let i = 0; i < n; i++) {
      // Box-Muller normal generator
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      pts.push(50 + z * sigma);
    }
    if (hasOutlier) {
      pts.push(50 + 2.5 * iqr);
      pts.push(50 - 2.4 * iqr);
    }
    pts.sort((a, b) => a - b);
    boxplotData = pts;
  }

  function drawBoxplot() {
    const canvas = document.getElementById('canvas-boxplot');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    if (boxplotData.length === 0) generateBoxplotPoints();
    const pts = boxplotData;
    const n = pts.length;

    // Calculs de Tukey
    const q1 = pts[Math.floor(n * 0.25)];
    const med = pts[Math.floor(n * 0.50)];
    const q3 = pts[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const inliers = pts.filter(x => x >= lowerBound && x <= upperBound);
    const outliers = pts.filter(x => x < lowerBound || x > upperBound);

    const minInlier = inliers[0];
    const maxInlier = inliers[inliers.length - 1];

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = 0, xMax = 100;
    const toX = val => padX + ((val - xMin) / (xMax - xMin)) * plotW;

    const boxY = padY + plotH * 0.40;
    const boxH = 50;

    // 1. Moustaches horizontales
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2;
    // Moustache gauche
    ctx.beginPath();
    ctx.moveTo(toX(minInlier), boxY + boxH / 2);
    ctx.lineTo(toX(q1), boxY + boxH / 2);
    ctx.stroke();
    // Cap gauche
    ctx.beginPath();
    ctx.moveTo(toX(minInlier), boxY + boxH / 2 - 12);
    ctx.lineTo(toX(minInlier), boxY + boxH / 2 + 12);
    ctx.stroke();

    // Moustache droite
    ctx.beginPath();
    ctx.moveTo(toX(q3), boxY + boxH / 2);
    ctx.lineTo(toX(maxInlier), boxY + boxH / 2);
    ctx.stroke();
    // Cap droite
    ctx.beginPath();
    ctx.moveTo(toX(maxInlier), boxY + boxH / 2 - 12);
    ctx.lineTo(toX(maxInlier), boxY + boxH / 2 + 12);
    ctx.stroke();

    // 2. Boîte centrale [Q1 - Q3]
    ctx.fillStyle = colors.tealLight;
    ctx.fillRect(toX(q1), boxY, toX(q3) - toX(q1), boxH);
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2;
    ctx.strokeRect(toX(q1), boxY, toX(q3) - toX(q1), boxH);

    // 3. Trait de Médiane
    ctx.beginPath();
    ctx.moveTo(toX(med), boxY);
    ctx.lineTo(toX(med), boxY + boxH);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 4. Points individuels jittered sous la boîte
    ctx.fillStyle = colors.isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(26, 54, 93, 0.35)';
    for (let i = 0; i < inliers.length; i++) {
      const jitterY = boxY + boxH + 25 + (Math.sin(i * 3.7) * 12);
      ctx.beginPath();
      ctx.arc(toX(inliers[i]), jitterY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Outliers signalés en rouge
    ctx.fillStyle = colors.red;
    ctx.strokeStyle = colors.navy;
    for (let out of outliers) {
      const outX = toX(out);
      ctx.beginPath();
      ctx.arc(outX, boxY + boxH / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillStyle = colors.red;
      ctx.textAlign = 'center';
      ctx.fillText('Outlier !', outX, boxY - 12);
    }

    // Annotations textuelles
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Q1 = ${q1.toFixed(1)}`, toX(q1), boxY - 6);
    ctx.fillText(`Méd = ${med.toFixed(1)}`, toX(med), boxY - 18);
    ctx.fillText(`Q3 = ${q3.toFixed(1)}`, toX(q3), boxY - 6);

    // Axe des X
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Valeur Biologique Mesurée (ex: Unités d\'Activité Enzymatique U/mg)', padX + plotW / 2, padY + plotH + 20);

    // Mise à jour métriques
    document.getElementById('metric-q1').textContent = q1.toFixed(1);
    document.getElementById('metric-med').textContent = med.toFixed(1);
    document.getElementById('metric-q3').textContent = q3.toFixed(1);
    document.getElementById('metric-iqr').textContent = iqr.toFixed(1);
    document.getElementById('metric-outliers-count').textContent = outliers.length;
  }

  // ==========================================================================
  // ONGLET 4 : THÉORÈME DE BAYES & TEST ELISA
  // ==========================================================================
  function drawBayes() {
    const canvas = document.getElementById('canvas-bayes');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const prevSlider = document.getElementById('slider-prev');
    const seSlider = document.getElementById('slider-se');
    const spSlider = document.getElementById('slider-sp');

    const prev = parseFloat(prevSlider.value) / 100;
    const se = parseFloat(seSlider.value) / 100;
    const sp = parseFloat(spSlider.value) / 100;

    document.getElementById('val-prev').textContent = (prev * 100).toFixed(1) + ' %';
    document.getElementById('val-se').textContent = (se * 100).toFixed(1) + ' %';
    document.getElementById('val-sp').textContent = (sp * 100).toFixed(1) + ' %';

    const nTotal = 10000;
    const malades = nTotal * prev;
    const sains = nTotal * (1 - prev);

    const vp = malades * se;
    const fn = malades * (1 - se);
    const fp = sains * (1 - sp);
    const vn = sains * sp;

    const vpp = (vp / (vp + fp)) * 100;
    const vpn = (vn / (vn + fn)) * 100;

    ctx.clearRect(0, 0, width, height);

    // Diagramme en 4 barres comparatives
    const padX = 60, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const barData = [
      { label: 'Vrais Positifs (VP)', val: vp, col: colors.green, sub: 'Malades testés +' },
      { label: 'Faux Positifs (FP)', val: fp, col: colors.red, sub: 'Sains testés +' },
      { label: 'Faux Négatifs (FN)', val: fn, col: colors.amber, sub: 'Malades testés -' },
      { label: 'Vrais Négatifs (VN)', val: Math.min(vn, nTotal * 0.15), col: colors.navy, sub: `Sains - (${Math.round(vn)})` }
    ];

    const maxVal = Math.max(vp, fp, fn) * 1.35 || 100;
    const barW = plotW / 5;

    for (let i = 0; i < 4; i++) {
      const b = barData[i];
      const bx = padX + (i + 0.5) * (plotW / 4) - barW / 2;
      const bH = (b.val / maxVal) * plotH;
      const by = padY + plotH - bH;

      ctx.fillStyle = b.col;
      ctx.fillRect(bx, by, barW, bH);
      ctx.strokeStyle = colors.navy;
      ctx.strokeRect(bx, by, barW, bH);

      // Valeur numérique
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(b.val)}`, bx + barW / 2, by - 8);

      // Label
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(b.label.split(' ')[0], bx + barW / 2, padY + plotH + 16);
      ctx.fillText(b.sub, bx + barW / 2, padY + plotH + 28);
    }

    // Axe horizontal
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    // Titre intérieur
    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Simulation sur Cohorte de N = 10 000 Sujets Dépistés`, width / 2, padY - 14);

    // Métriques
    document.getElementById('metric-vpp').textContent = vpp.toFixed(1) + ' %';
    document.getElementById('metric-vpn').textContent = vpn.toFixed(1) + ' %';
    document.getElementById('metric-fp-ratio').textContent = `${Math.round(fp)} sains testés positifs`;
  }

  // ==========================================================================
  // ONGLET 5 : LOI NORMALE (RÈGLE 68-95-99.7%)
  // ==========================================================================
  function drawNormal() {
    const canvas = document.getElementById('canvas-normale');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const muSlider = document.getElementById('slider-norm-mu');
    const sigSlider = document.getElementById('slider-norm-sig');
    const mu = parseFloat(muSlider.value);
    const sigma = parseFloat(sigSlider.value);

    document.getElementById('val-norm-mu').textContent = mu.toFixed(0);
    document.getElementById('val-norm-sig').textContent = sigma.toFixed(0);

    // Choix de la tranche
    const ruleRadio = document.querySelector('input[name="norm-rule"]:checked').value;
    let kSigma = 1;
    let probText = "68.27%";
    if (ruleRadio === '2') { kSigma = 2; probText = "95.45%"; }
    if (ruleRadio === '1.96') { kSigma = 1.96; probText = "95.00%"; }
    if (ruleRadio === '3') { kSigma = 3; probText = "99.73%"; }

    const boundL = mu - kSigma * sigma;
    const boundR = mu + kSigma * sigma;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma;
    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;
    const maxPdf = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const toY = y => padY + plotH - (y / maxPdf) * (plotH * 0.90);

    const points = 300;

    // 1. Zone ombrée
    ctx.beginPath();
    ctx.moveTo(toX(boundL), padY + plotH);
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      if (x >= boundL && x <= boundR) {
        const y = maxPdf * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
        ctx.lineTo(toX(x), toY(y));
      }
    }
    ctx.lineTo(toX(boundR), padY + plotH);
    ctx.closePath();
    ctx.fillStyle = colors.tealLight;
    ctx.fill();

    // 2. Tracé de la cloche
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = maxPdf * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Lignes verticales des bornes
    function drawBoundLine(val, label) {
      const cx = toX(val);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cx, padY + 15);
      ctx.lineTo(cx, padY + plotH);
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.teal;
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, padY + 10);
    }

    drawBoundLine(boundL, `${boundL.toFixed(1)} (-${kSigma}σ)`);
    drawBoundLine(boundR, `${boundR.toFixed(1)} (+${kSigma}σ)`);

    // Ligne centrale moyenne
    ctx.beginPath();
    ctx.moveTo(toX(mu), padY);
    ctx.lineTo(toX(mu), padY + plotH);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = colors.red;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`μ = ${mu}`, toX(mu), padY - 6);

    // Pourcentage au centre
    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`Probabilité = ${probText}`, toX(mu), padY + plotH * 0.55);

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    document.getElementById('metric-prob').textContent = probText;
    document.getElementById('metric-interval').textContent = `[${boundL.toFixed(1)} ; ${boundR.toFixed(1)}]`;
  }

  // ==========================================================================
  // ONGLET 6 : THÉORÈME CENTRAL LIMITE (TCL)
  // ==========================================================================
  let tclSamples = [];
  function runTclSimulation() {
    const distType = document.getElementById('select-tcl-dist').value;
    const n = parseInt(document.getElementById('slider-tcl-n').value, 10);
    const nSims = 2000;

    const means = [];
    for (let s = 0; s < nSims; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        if (distType === 'exp') {
          // Exponentielle (scale = 2)
          sum += -2.0 * Math.log(Math.random());
        } else if (distType === 'uniform') {
          // Uniforme [0, 10]
          sum += Math.random() * 10;
        } else {
          // Bimodale (mélange 30% à 2 et 70% à 8)
          sum += Math.random() < 0.3 ? (2 + Math.random() * 2) : (8 + Math.random() * 2);
        }
      }
      means.push(sum / n);
    }
    tclSamples = { distType, n, means };
    drawTcl();
  }

  function drawTcl() {
    const canvas = document.getElementById('canvas-tcl');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    if (!tclSamples.means) {
      runTclSimulation();
      return;
    }

    const { n, means } = tclSamples;
    document.getElementById('val-tcl-n').textContent = n;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 35;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    // Histogramme des moyennes
    const bins = 35;
    const minM = Math.min(...means);
    const maxM = Math.max(...means);
    const binW = (maxM - minM) / bins;
    const counts = new Array(bins).fill(0);

    for (let m of means) {
      const idx = Math.min(bins - 1, Math.floor((m - minM) / binW));
      counts[idx]++;
    }
    const maxCount = Math.max(...counts);

    const toX = val => padX + ((val - minM) / (maxM - minM)) * plotW;
    const toY = count => padY + plotH - (count / maxCount) * (plotH * 0.88);

    // Dessin des barres de l'histogramme
    ctx.fillStyle = colors.tealLight;
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 1;

    for (let b = 0; b < bins; b++) {
      const bX1 = toX(minM + b * binW);
      const bX2 = toX(minM + (b + 1) * binW);
      const bY = toY(counts[b]);
      ctx.fillRect(bX1, bY, bX2 - bX1, padY + plotH - bY);
      ctx.strokeRect(bX1, bY, bX2 - bX1, padY + plotH - bY);
    }

    // Courbe normale théorique par-dessus
    const grandMean = means.reduce((a, b) => a + b, 0) / means.length;
    const grandVar = means.reduce((a, b) => a + Math.pow(b - grandMean, 2), 0) / (means.length - 1);
    const grandSd = Math.sqrt(grandVar);

    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = minM + (i / 100) * (maxM - minM);
      const normalY = (1 / (grandSd * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - grandMean, 2) / (2 * grandVar));
      // Échelle
      const scaledY = padY + plotH - (normalY * (means.length * binW) / maxCount) * (plotH * 0.88);
      if (i === 0) ctx.moveTo(toX(x), scaledY); else ctx.lineTo(toX(x), scaledY);
    }
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Moyenne d'Échantillon X̄ (sur n = ${n} mesures répétées 2000 fois)`, width / 2, padY + plotH + 20);

    // Titre
    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(`Convergence vers la Loi Normale : n = ${n} (Moyenne = ${grandMean.toFixed(2)}, Écart-Type = ${grandSd.toFixed(2)})`, width / 2, padY - 10);

    document.getElementById('metric-tcl-mean').textContent = grandMean.toFixed(2);
    document.getElementById('metric-tcl-sd').textContent = grandSd.toFixed(2);
  }

  // ==========================================================================
  // ONGLET 7 : SIMULATION DES INTERVALLES DE CONFIANCE (95% CI)
  // ==========================================================================
  let ciData = [];
  function generateCiData() {
    const n = parseInt(document.getElementById('slider-ci-n').value, 10);
    const muTrue = 100.0;
    const sigmaTrue = 15.0;
    const nStudies = 25;

    const studies = [];
    for (let s = 0; s < nStudies; s++) {
      const sample = [];
      for (let i = 0; i < n; i++) {
        const u1 = Math.random(), u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        sample.push(muTrue + z * sigmaTrue);
      }
      const m = sample.reduce((a, b) => a + b, 0) / n;
      const sVal = Math.sqrt(sample.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (n - 1));
      const sem = sVal / Math.sqrt(n);
      const tCrit = 2.064; // approximation t à df moyen
      const lower = m - tCrit * sem;
      const upper = m + tCrit * sem;
      const covers = lower <= muTrue && muTrue <= upper;
      studies.push({ id: s + 1, m, lower, upper, covers });
    }
    ciData = { n, studies, muTrue };
    drawCi();
  }

  function drawCi() {
    const canvas = document.getElementById('canvas-ci');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    if (!ciData.studies) {
      generateCiData();
      return;
    }

    const { studies, muTrue, n } = ciData;
    document.getElementById('val-ci-n').textContent = n;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 30;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = 80, xMax = 120;
    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;

    // Ligne centrale rouge pour vraie moyenne mu = 100
    const trueX = toX(muTrue);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(trueX, padY);
    ctx.lineTo(trueX, padY + plotH);
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Vraie Moyenne μ = ${muTrue}`, trueX, padY - 8);

    // Tracé de chaque étude
    let coveredCount = 0;
    const rowH = plotH / studies.length;

    for (let i = 0; i < studies.length; i++) {
      const st = studies[i];
      const yPos = padY + (i + 0.5) * rowH;
      const col = st.covers ? colors.green : colors.red;
      if (st.covers) coveredCount++;

      // Segment d'intervalle
      ctx.beginPath();
      ctx.moveTo(toX(st.lower), yPos);
      ctx.lineTo(toX(st.upper), yPos);
      ctx.strokeStyle = col;
      ctx.lineWidth = st.covers ? 1.8 : 2.8;
      ctx.stroke();

      // Point central
      ctx.beginPath();
      ctx.arc(toX(st.m), yPos, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    }

    // Axe des X
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    const rate = (coveredCount / studies.length) * 100;
    document.getElementById('metric-ci-rate').textContent = `${coveredCount}/${studies.length} (${rate.toFixed(0)}%)`;
  }

  // ==========================================================================
  // ONGLET 8 : TESTS D'HYPOTHÈSES (ALPHA, BETA, PUISSANCE)
  // ==========================================================================
  function drawHypo() {
    const canvas = document.getElementById('canvas-hypo');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const deltaSlider = document.getElementById('slider-delta');
    const nSlider = document.getElementById('slider-hypo-n');
    const alphaSelect = document.getElementById('select-alpha');

    const delta = parseFloat(deltaSlider.value);
    const n = parseInt(nSlider.value, 10);
    const alpha = parseFloat(alphaSelect.value);

    document.getElementById('val-delta').textContent = delta.toFixed(1);
    document.getElementById('val-hypo-n').textContent = n;

    // Seuil critique sous H0 (Z-score pour alpha unilatéral 5% = 1.645, 1% = 2.326)
    const zCrit = alpha === 0.01 ? 2.326 : 1.645;
    // Déplacement de H1 : effet standardisé = delta * sqrt(n)
    const shiftH1 = delta * (Math.sqrt(n) / 3.0);

    // Calcul de beta (surface H1 à gauche de zCrit)
    // Approximation de l'intégrale normale
    const zBeta = zCrit - shiftH1;
    const beta = Math.max(0.001, Math.min(0.999, 0.5 * (1 + erf(zBeta / Math.SQRT2))));
    const power = (1 - beta) * 100;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = -3.5, xMax = Math.max(7.5, shiftH1 + 3.5);
    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = y => padY + plotH - (y / 0.42) * (plotH * 0.90);

    const points = 250;

    // 1. Aire Alpha (rouge) sous H0 à droite de zCrit
    ctx.beginPath();
    ctx.moveTo(toX(zCrit), padY + plotH);
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      if (x >= zCrit) {
        const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
        ctx.lineTo(toX(x), toY(y));
      }
    }
    ctx.lineTo(toX(xMax), padY + plotH);
    ctx.closePath();
    ctx.fillStyle = colors.red;
    ctx.fill();

    // 2. Aire Bêta (orange) sous H1 à gauche de zCrit
    ctx.beginPath();
    ctx.moveTo(toX(xMin), padY + plotH);
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      if (x <= zCrit) {
        const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(x - shiftH1, 2));
        ctx.lineTo(toX(x), toY(y));
      }
    }
    ctx.lineTo(toX(zCrit), padY + plotH);
    ctx.closePath();
    ctx.fillStyle = colors.amberLight;
    ctx.fill();

    // 3. Aire Puissance 1-Beta (verte) sous H1 à droite de zCrit
    ctx.beginPath();
    ctx.moveTo(toX(zCrit), padY + plotH);
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      if (x >= zCrit) {
        const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(x - shiftH1, 2));
        ctx.lineTo(toX(x), toY(y));
      }
    }
    ctx.lineTo(toX(xMax), padY + plotH);
    ctx.closePath();
    ctx.fillStyle = colors.greenLight;
    ctx.fill();

    // Courbe H0
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Courbe H1
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(x - shiftH1, 2));
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ligne Seuil critique
    ctx.beginPath();
    ctx.moveTo(toX(zCrit), padY);
    ctx.lineTo(toX(zCrit), padY + plotH);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colors.red;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Seuil Critique (Z = ${zCrit.toFixed(2)})`, toX(zCrit), padY - 8);

    // Titres des courbes
    ctx.fillStyle = colors.navy;
    ctx.fillText('Distribution sous H0 (Pas d\'effet)', toX(0), padY + 14);
    ctx.fillStyle = colors.teal;
    ctx.fillText('Distribution sous H1 (Effet Réel)', toX(shiftH1), padY + 14);

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    // Métriques
    document.getElementById('metric-alpha').textContent = (alpha * 100).toFixed(0) + ' %';
    document.getElementById('metric-beta').textContent = (beta * 100).toFixed(1) + ' %';
    document.getElementById('metric-power').textContent = power.toFixed(1) + ' %';
  }

  // Fonction d'erreur de Gauss (ERF) pour calcul précis de la loi normale
  function erf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  // ==========================================================================
  // ÉCOUTEURS D'ÉVÉNEMENTS DES CONTRÔLES INTERACTIFS
  // ==========================================================================
  function attachSimulatorEvents() {
    // Tab 1
    const sSkew = document.getElementById('slider-skewness');
    const sOut = document.getElementById('slider-outlier');
    if (sSkew && sOut) {
      sSkew.addEventListener('input', drawSkewness);
      sOut.addEventListener('input', drawSkewness);
    }
    // Préréglages Tab 1
    document.querySelectorAll('[data-preset-skew]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-preset-skew');
        if (val === 'norm') { sSkew.value = 0; sOut.value = 0; }
        if (val === 'skew') { sSkew.value = 1.2; sOut.value = 0; }
        if (val === 'outlier') { sSkew.value = 0.3; sOut.value = 65; }
        drawSkewness();
      });
    });

    // Tab 2
    const sN = document.getElementById('slider-n');
    const sSig = document.getElementById('slider-sigma');
    if (sN && sSig) {
      sN.addEventListener('input', drawSdSem);
      sSig.addEventListener('input', drawSdSem);
    }

    // Tab 3
    const sIqr = document.getElementById('slider-iqr');
    const sBoxN = document.getElementById('slider-box-n');
    const cOut = document.getElementById('check-outlier');
    const btnRegenBox = document.getElementById('btn-regen-box');
    if (sIqr && sBoxN && cOut) {
      sIqr.addEventListener('input', () => { generateBoxplotPoints(); drawBoxplot(); });
      sBoxN.addEventListener('input', () => { generateBoxplotPoints(); drawBoxplot(); });
      cOut.addEventListener('change', () => { generateBoxplotPoints(); drawBoxplot(); });
      if (btnRegenBox) btnRegenBox.addEventListener('click', () => { generateBoxplotPoints(); drawBoxplot(); });
    }

    // Tab 4
    const sPrev = document.getElementById('slider-prev');
    const sSe = document.getElementById('slider-se');
    const sSp = document.getElementById('slider-sp');
    if (sPrev && sSe && sSp) {
      sPrev.addEventListener('input', drawBayes);
      sSe.addEventListener('input', drawBayes);
      sSp.addEventListener('input', drawBayes);
    }
    document.querySelectorAll('[data-preset-bayes]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-preset-bayes');
        if (val === 'rare') { sPrev.value = 0.5; sSe.value = 99; sSp.value = 95; }
        if (val === 'epidemic') { sPrev.value = 15; sSe.value = 95; sSp.value = 98; }
        if (val === 'hifi') { sPrev.value = 2; sSe.value = 99.9; sSp.value = 99.5; }
        drawBayes();
      });
    });

    // Tab 5
    const sNormMu = document.getElementById('slider-norm-mu');
    const sNormSig = document.getElementById('slider-norm-sig');
    if (sNormMu && sNormSig) {
      sNormMu.addEventListener('input', drawNormal);
      sNormSig.addEventListener('input', drawNormal);
      document.querySelectorAll('input[name="norm-rule"]').forEach(r => r.addEventListener('change', drawNormal));
    }

    // Tab 6
    const btnTcl = document.getElementById('btn-run-tcl');
    const sTclN = document.getElementById('slider-tcl-n');
    const selTclDist = document.getElementById('select-tcl-dist');
    if (btnTcl && sTclN && selTclDist) {
      btnTcl.addEventListener('click', runTclSimulation);
      sTclN.addEventListener('input', runTclSimulation);
      selTclDist.addEventListener('change', runTclSimulation);
    }

    // Tab 7
    const sCiN = document.getElementById('slider-ci-n');
    const btnRegenCi = document.getElementById('btn-regen-ci');
    if (sCiN && btnRegenCi) {
      sCiN.addEventListener('input', generateCiData);
      btnRegenCi.addEventListener('click', generateCiData);
    }

    // Tab 8
    const sDelta = document.getElementById('slider-delta');
    const sHypoN = document.getElementById('slider-hypo-n');
    const selAlpha = document.getElementById('select-alpha');
    if (sDelta && sHypoN && selAlpha) {
      sDelta.addEventListener('input', drawHypo);
      sHypoN.addEventListener('input', drawHypo);
      selAlpha.addEventListener('change', drawHypo);
    }
  }

  // ==========================================================================
  // INITIALISATION GLOBALE DU MODULE
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initSimulatorTabs();
    attachSimulatorEvents();
    // Dessiner le premier onglet par défaut
    setTimeout(() => {
      drawSkewness();
    }, 200);
  });

})();
