/* ==========================================================================
   Laboratoire Virtuel & Simulateur Interactif des Concepts Biostatistiques
   Biostatistiques Appliquées & Modélisation du Vivant — Master 2 Biochimie
   Auteure : Dr. Sarra BENMOUMOU-HOSNI (Ph.D.) — UMBB
   ========================================================================== */

(function () {
  'use strict';

  // Palette de couleurs scientifiques harmonieuses
  function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      isDark: isDark,
      bg: isDark ? '#0f172a' : '#ffffff',
      bgCard: isDark ? '#1e293b' : '#f8fafc',
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
      greenLight: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.20)',
      gold: '#f59e0b'
    };
  }

  // Utilitaires de dessin Canvas Haute Définition (HiDPI / Retina)
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || canvas.parentElement.clientWidth || 600;
    const height = rect.height || 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  // Utilitaire d'appel KaTeX sécurisé
  function triggerKatex(container) {
    if (window.renderAllLatex) {
      window.renderAllLatex(container);
    } else if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(container || document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      });
    }
  }

  // ==========================================================================
  // GESTIONNAIRE DES ONGLETS & SÉLECTEUR DE CHAPITRE
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
          triggerDraw(targetId);
          setTimeout(() => triggerKatex(panel), 60);
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
      case 'sim-anova': drawAnova(); break;
    }
  }

  // ==========================================================================
  // ONGLET 1 : MOYENNE vs MÉDIANE, VRAIE MOYENNE & LOI DES GRANDS NOMBRES
  // ==========================================================================
  let skewSamplePoints = [];

  function generateSkewSample() {
    const skewSlider = document.getElementById('slider-skewness');
    const outlierSlider = document.getElementById('slider-outlier');
    const nSlider = document.getElementById('slider-sample-n');

    const skewVal = skewSlider ? parseFloat(skewSlider.value) : 0.8;
    const outlierVal = outlierSlider ? parseFloat(outlierSlider.value) : 0;
    const n = nSlider ? parseInt(nSlider.value, 10) : 30;

    const sigma = 0.25 + skewVal * 0.55;
    const m = 25;
    const pts = [];

    // Tirage log-normal
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const val = m * Math.exp(z * sigma);
      pts.push(val);
    }

    // Injection de l'outlier extrême si actif
    if (outlierVal > 0) {
      pts.push(m + outlierVal);
    }

    pts.sort((a, b) => a - b);
    skewSamplePoints = pts;
  }

  function drawSkewness() {
    const canvas = document.getElementById('canvas-skew');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const skewSlider = document.getElementById('slider-skewness');
    const outlierSlider = document.getElementById('slider-outlier');
    const nSlider = document.getElementById('slider-sample-n');

    const skewVal = skewSlider ? parseFloat(skewSlider.value) : 0.8;
    const outlierVal = outlierSlider ? parseFloat(outlierSlider.value) : 0;
    const n = nSlider ? parseInt(nSlider.value, 10) : 30;

    if (document.getElementById('val-skewness')) document.getElementById('val-skewness').textContent = skewVal.toFixed(1);
    if (document.getElementById('val-outlier')) document.getElementById('val-outlier').textContent = '+' + outlierVal + ' pg/mL';
    if (document.getElementById('val-sample-n')) document.getElementById('val-sample-n').textContent = n;

    if (skewSamplePoints.length === 0) generateSkewSample();

    ctx.clearRect(0, 0, width, height);
    const padX = 55, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    // Vraie moyenne théorique de la population : E[X] = m * exp(sigma^2 / 2)
    const sigma = 0.25 + skewVal * 0.55;
    const m = 25;
    const trueMeanPop = m * Math.exp((sigma * sigma) / 2);
    const trueMedianPop = m;

    const xMin = 0;
    const xMax = Math.max(90, 75 + outlierVal * 0.95);
    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;

    // Calcul de la densité théorique continue
    const points = 250;
    let maxDensity = 0;
    const curve = [];
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      let y = 0;
      if (x > 0) {
        y = (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(x / m), 2) / (2 * sigma * sigma));
      }
      if (y > maxDensity) maxDensity = y;
      curve.push({ x, y });
    }

    const toY = y => padY + plotH - 30 - (y / maxDensity) * (plotH * 0.70);

    // 1. Zone sous la courbe théorique
    ctx.beginPath();
    ctx.moveTo(toX(curve[0].x), padY + plotH - 30);
    for (let pt of curve) ctx.lineTo(toX(pt.x), toY(pt.y));
    ctx.lineTo(toX(curve[curve.length - 1].x), padY + plotH - 30);
    ctx.closePath();
    ctx.fillStyle = colors.tealLight;
    ctx.fill();

    // Ligne de la courbe
    ctx.beginPath();
    for (let i = 0; i < curve.length; i++) {
      const pt = curve[i];
      if (i === 0) ctx.moveTo(toX(pt.x), toY(pt.y)); else ctx.lineTo(toX(pt.x), toY(pt.y));
    }
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 2. Échantillon individuel (Points jitterés)
    const pts = skewSamplePoints;
    const N_eff = pts.length;
    const sampleMean = pts.reduce((a, b) => a + b, 0) / N_eff;
    const sampleMedian = N_eff % 2 === 1 ? pts[Math.floor(N_eff / 2)] : (pts[N_eff / 2 - 1] + pts[N_eff / 2]) / 2;
    const samplingError = Math.abs(sampleMean - trueMeanPop);

    ctx.fillStyle = colors.isDark ? 'rgba(56, 189, 248, 0.65)' : 'rgba(26, 54, 93, 0.55)';
    for (let i = 0; i < pts.length; i++) {
      const px = toX(pts[i]);
      if (px >= padX && px <= padX + plotW) {
        const jitterY = padY + plotH - 12 + Math.sin(i * 4.3) * 8;
        ctx.beginPath();
        ctx.arc(px, jitterY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Marqueurs verticaux
    function drawMarker(xVal, color, label, dashed, yOffset = 0) {
      const cx = toX(xVal);
      ctx.beginPath();
      if (dashed) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);
      ctx.moveTo(cx, padY);
      ctx.lineTo(cx, padY + plotH - 30);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = 'bold 10.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, padY - 8 - yOffset);
    }

    // Vraie moyenne de population (Or/Navy)
    drawMarker(trueMeanPop, colors.gold, `Vraie Moy. Pop. μ (${trueMeanPop.toFixed(1)})`, true, 12);
    // Moyenne échantillon (Rouge)
    drawMarker(sampleMean, colors.red, `Moyenne Éch. x̄ (${sampleMean.toFixed(1)})`, false, 0);
    // Médiane échantillon (Verte)
    drawMarker(sampleMedian, colors.green, `Médiane Éch. (${sampleMedian.toFixed(1)})`, false, 0);

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH - 30);
    ctx.lineTo(padX + plotW, padY + plotH - 30);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0 pg/mL', padX, padY + plotH + 8);
    ctx.fillText('Dosage Cytokines IL-6 (pg/mL) — Points bleus : mesures individuelles prélevées', padX + plotW / 2, padY + plotH + 8);
    ctx.fillText(`${xMax.toFixed(0)} pg/mL`, padX + plotW, padY + plotH + 8);

    // Mise à jour métriques
    if (document.getElementById('metric-pop-mean')) document.getElementById('metric-pop-mean').textContent = trueMeanPop.toFixed(1) + ' pg/mL';
    if (document.getElementById('metric-mean')) document.getElementById('metric-mean').textContent = sampleMean.toFixed(1) + ' pg/mL';
    if (document.getElementById('metric-median')) document.getElementById('metric-median').textContent = sampleMedian.toFixed(1) + ' pg/mL';
    if (document.getElementById('metric-sample-err')) document.getElementById('metric-sample-err').textContent = samplingError.toFixed(2) + ' pg/mL';
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
    const N = nSlider ? parseInt(nSlider.value, 10) : 16;
    const sigma = sigmaSlider ? parseFloat(sigmaSlider.value) : 8.0;
    const sem = sigma / Math.sqrt(N);

    if (document.getElementById('val-n')) document.getElementById('val-n').textContent = N;
    if (document.getElementById('val-sigma')) document.getElementById('val-sigma').textContent = sigma.toFixed(1) + ' g/L';

    ctx.clearRect(0, 0, width, height);
    const padX = 60, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const mu = 40.0;
    const xMin = mu - 35, xMax = mu + 35;
    const points = 250;

    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = y => padY + plotH - (y / 0.35) * (plotH * 0.90);

    // Courbe SD
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

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Courbe SEM
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

    // Barres de dispersion
    const midY = padY + plotH * 0.45;
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

    const semY = padY + plotH * 0.65;
    ctx.beginPath();
    ctx.moveTo(toX(mu - sem), semY);
    ctx.lineTo(toX(mu + sem), semY);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = colors.red;
    ctx.fillText(`± 1 SEM = ${sem.toFixed(2)} g/L (Précision de la Moyenne)`, toX(mu), semY - 8);

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Concentration Protéique Sérique (g/L)', toX(mu), padY + plotH + 24);

    if (document.getElementById('metric-sd')) document.getElementById('metric-sd').textContent = sigma.toFixed(1) + ' g/L';
    if (document.getElementById('metric-sem')) document.getElementById('metric-sem').textContent = sem.toFixed(2) + ' g/L';
    if (document.getElementById('metric-shrink')) document.getElementById('metric-shrink').textContent = `÷ ${Math.sqrt(N).toFixed(1)} (1/√${N})`;
  }

  // ==========================================================================
  // ONGLET 3 : BOXPLOT DE TUKEY
  // ==========================================================================
  let boxplotData = [];
  function generateBoxplotPoints() {
    const iqrSlider = document.getElementById('slider-iqr');
    const nSlider = document.getElementById('slider-box-n');
    const hasOutlier = document.getElementById('check-outlier') ? document.getElementById('check-outlier').checked : true;

    const iqr = iqrSlider ? parseFloat(iqrSlider.value) : 15;
    const n = nSlider ? parseInt(nSlider.value, 10) : 60;
    const sigma = iqr / 1.349;

    const pts = [];
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(1e-6, Math.random()), u2 = Math.random();
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

    const q1 = pts[Math.floor(n * 0.25)];
    const med = pts[Math.floor(n * 0.50)];
    const q3 = pts[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const inliers = pts.filter(x => x >= lowerBound && x <= upperBound);
    const outliers = pts.filter(x => x < lowerBound || x > upperBound);

    const minInlier = inliers.length > 0 ? inliers[0] : q1;
    const maxInlier = inliers.length > 0 ? inliers[inliers.length - 1] : q3;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = 0, xMax = 100;
    const toX = val => padX + ((val - xMin) / (xMax - xMin)) * plotW;
    const boxY = padY + plotH * 0.38;
    const boxH = 50;

    // Moustaches
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(minInlier), boxY + boxH / 2);
    ctx.lineTo(toX(q1), boxY + boxH / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX(minInlier), boxY + boxH / 2 - 12);
    ctx.lineTo(toX(minInlier), boxY + boxH / 2 + 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX(q3), boxY + boxH / 2);
    ctx.lineTo(toX(maxInlier), boxY + boxH / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX(maxInlier), boxY + boxH / 2 - 12);
    ctx.lineTo(toX(maxInlier), boxY + boxH / 2 + 12);
    ctx.stroke();

    // Boîte
    ctx.fillStyle = colors.tealLight;
    ctx.fillRect(toX(q1), boxY, toX(q3) - toX(q1), boxH);
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 2;
    ctx.strokeRect(toX(q1), boxY, toX(q3) - toX(q1), boxH);

    // Médiane
    ctx.beginPath();
    ctx.moveTo(toX(med), boxY);
    ctx.lineTo(toX(med), boxY + boxH);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Jittered points
    ctx.fillStyle = colors.isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(26, 54, 93, 0.35)';
    for (let i = 0; i < inliers.length; i++) {
      const jitterY = boxY + boxH + 25 + (Math.sin(i * 3.7) * 12);
      ctx.beginPath();
      ctx.arc(toX(inliers[i]), jitterY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outliers
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

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Activité Enzymatique (U/mg de protéine)', padX + plotW / 2, padY + plotH + 20);

    if (document.getElementById('metric-q1')) document.getElementById('metric-q1').textContent = q1.toFixed(1);
    if (document.getElementById('metric-med')) document.getElementById('metric-med').textContent = med.toFixed(1);
    if (document.getElementById('metric-q3')) document.getElementById('metric-q3').textContent = q3.toFixed(1);
    if (document.getElementById('metric-iqr')) document.getElementById('metric-iqr').textContent = iqr.toFixed(1);
    if (document.getElementById('metric-outliers-count')) document.getElementById('metric-outliers-count').textContent = outliers.length;
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

    const prev = prevSlider ? parseFloat(prevSlider.value) / 100 : 0.01;
    const se = seSlider ? parseFloat(seSlider.value) / 100 : 0.99;
    const sp = spSlider ? parseFloat(spSlider.value) / 100 : 0.95;

    if (document.getElementById('val-prev')) document.getElementById('val-prev').textContent = (prev * 100).toFixed(1) + ' %';
    if (document.getElementById('val-se')) document.getElementById('val-se').textContent = (se * 100).toFixed(1) + ' %';
    if (document.getElementById('val-sp')) document.getElementById('val-sp').textContent = (sp * 100).toFixed(1) + ' %';

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
    const padX = 60, padY = 35;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const barData = [
      { label: 'Vrais Positifs (VP)', val: vp, col: colors.green, sub: `Malades + (${Math.round(vp)})` },
      { label: 'Faux Positifs (FP)', val: fp, col: colors.red, sub: `Sains + (${Math.round(fp)})` },
      { label: 'Faux Négatifs (FN)', val: fn, col: colors.amber, sub: `Malades - (${Math.round(fn)})` },
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

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(b.val)}`, bx + barW / 2, by - 8);

      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(b.label.split(' ')[0], bx + barW / 2, padY + plotH + 16);
      ctx.fillText(b.sub, bx + barW / 2, padY + plotH + 28);
    }

    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Cohorte Simulée : N = 10 000 Sujets Dépistés`, width / 2, padY - 14);

    if (document.getElementById('metric-vpp')) document.getElementById('metric-vpp').textContent = vpp.toFixed(1) + ' %';
    if (document.getElementById('metric-vpn')) document.getElementById('metric-vpn').textContent = vpn.toFixed(1) + ' %';
    if (document.getElementById('metric-fp-ratio')) document.getElementById('metric-fp-ratio').textContent = `${Math.round(fp)} sains testés positifs`;

    // Dérivation mathématique pas-à-pas affichée sous le graphique
    const calcBox = document.getElementById('bayes-calc-breakdown');
    if (calcBox) {
      const pPlusM = se * prev;
      const pPlusSain = (1 - sp) * (1 - prev);
      const pPlusTotal = pPlusM + pPlusSain;
      calcBox.innerHTML = `
        <div class="bayes-math-step">
          <div style="font-weight: 700; color: var(--accent-teal); margin-bottom: 0.35rem;">
            <i class="fas fa-calculator"></i> Calcul Pas-à-Pas de la Probabilité Postérieure $P(M \\mid +)$ :
          </div>
          <div style="font-size: 0.95rem; margin: 0.4rem 0;">
            $$P(M \\mid +) = \\frac{P(+ \\mid M) \\cdot P(M)}{P(+)} = \\frac{Se \\cdot P(M)}{Se \\cdot P(M) + (1 - Sp) \\cdot (1 - P(M))}$$
          </div>
          <div style="font-size: 0.92rem; margin: 0.4rem 0;">
            $$P(M \\mid +) = \\frac{${se.toFixed(3)} \\times ${prev.toFixed(4)}}{(${se.toFixed(3)} \\times ${prev.toFixed(4)}) + (${(1-sp).toFixed(3)} \\times ${(1-prev).toFixed(4)})} = \\frac{${pPlusM.toFixed(5)}}{${pPlusM.toFixed(5)} + ${pPlusSain.toFixed(5)}} = \\mathbf{${vpp.toFixed(2)}\\%}$$
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-top: 0.35rem;">
            $\\implies$ Sur $\\mathbf{${Math.round(vp + fp)}}$ sujets testés positifs dans la cohorte, seulement $\\mathbf{${Math.round(vp)}}$ sont réellement malades (${vpp.toFixed(1)}\\%) et $\\mathbf{${Math.round(fp)}}$ sont de faux positifs (${(100 - vpp).toFixed(1)}\\%) !
          </div>
        </div>
      `;
      triggerKatex(calcBox);
    }
  }

  // ==========================================================================
  // ONGLET 5 : LOI NORMALE ANCRÉE SUR UN EXEMPLE BIOLOGIQUE RÉEL
  // ==========================================================================
  const BIO_NORMAL_PRESETS = {
    height_m: { name: 'Taille Adulte (Hommes)', mu: 175, sigma: 7.0, unit: 'cm', label: 'Taille en cm', step: 1 },
    height_f: { name: 'Taille Adulte (Femmes)', mu: 163, sigma: 6.5, unit: 'cm', label: 'Taille en cm', step: 1 },
    albumin: { name: 'Albuminémie Sérique', mu: 42.0, sigma: 3.5, unit: 'g/L', label: 'Albumine sérique (g/L)', step: 0.5 },
    glucose: { name: 'Glycémie à Jeun', mu: 0.95, sigma: 0.08, unit: 'g/L', label: 'Glycémie (g/L)', step: 0.01 },
    custom: { name: 'Paramètre Personnalisé', mu: 100, sigma: 15, unit: 'unités', label: 'Valeur numérique', step: 1 }
  };

  function drawNormal() {
    const canvas = document.getElementById('canvas-normale');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const bioSelect = document.getElementById('select-norm-biomarker');
    const selectedKey = bioSelect ? bioSelect.value : 'height_m';
    const preset = BIO_NORMAL_PRESETS[selectedKey] || BIO_NORMAL_PRESETS.height_m;

    const muSlider = document.getElementById('slider-norm-mu');
    const sigSlider = document.getElementById('slider-norm-sig');

    const mu = muSlider ? parseFloat(muSlider.value) : preset.mu;
    const sigma = sigSlider ? parseFloat(sigSlider.value) : preset.sigma;
    const unit = preset.unit;

    if (document.getElementById('val-norm-mu')) document.getElementById('val-norm-mu').textContent = `${mu.toFixed(selectedKey === 'glucose' ? 2 : 1)} ${unit}`;
    if (document.getElementById('val-norm-sig')) document.getElementById('val-norm-sig').textContent = `${sigma.toFixed(selectedKey === 'glucose' ? 2 : 1)} ${unit}`;

    const ruleRadio = document.querySelector('input[name="norm-rule"]:checked');
    const ruleVal = ruleRadio ? ruleRadio.value : '1.96';
    let kSigma = 1;
    let probText = "68.27%";
    if (ruleVal === '1.96') { kSigma = 1.96; probText = "95.00% (Normes Biologiques)"; }
    if (ruleVal === '2') { kSigma = 2; probText = "95.45%"; }
    if (ruleVal === '3') { kSigma = 3; probText = "99.73%"; }

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

    // Aire ombrée
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

    // Cloche de Gauss
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin);
      const y = maxPdf * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
      if (i === 0) ctx.moveTo(toX(x), toY(y)); else ctx.lineTo(toX(x), toY(y));
    }
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Bornes
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

    drawBoundLine(boundL, `${boundL.toFixed(1)} ${unit} (-${kSigma}σ)`);
    drawBoundLine(boundR, `${boundR.toFixed(1)} ${unit} (+${kSigma}σ)`);

    // Ligne centrale moyenne
    ctx.beginPath();
    ctx.moveTo(toX(mu), padY);
    ctx.lineTo(toX(mu), padY + plotH);
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = colors.red;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`μ = ${mu.toFixed(1)} ${unit}`, toX(mu), padY - 6);

    // Titre intérieur
    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`${probText} de la population`, toX(mu), padY + plotH * 0.50);

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(preset.label, toX(mu), padY + plotH + 20);

    if (document.getElementById('metric-prob')) document.getElementById('metric-prob').textContent = probText;
    if (document.getElementById('metric-interval')) document.getElementById('metric-interval').textContent = `[${boundL.toFixed(1)} ; ${boundR.toFixed(1)}] ${unit}`;
  }

  // ==========================================================================
  // ONGLET 6 : THÉORÈME CENTRAL LIMITE (TCL) ULTRA-VISUEL & ANIMÉ
  // ==========================================================================
  let tclAccumulatedMeans = [];
  let tclLastSamplePoints = [];
  let tclAnimInterval = null;

  function sampleFromParent(distType) {
    if (distType === 'exp') {
      return -2.0 * Math.log(Math.max(1e-6, Math.random()));
    } else if (distType === 'uniform') {
      return Math.random() * 10;
    } else {
      return Math.random() < 0.35 ? (2 + Math.random() * 2) : (7 + Math.random() * 3);
    }
  }

  function addOneTclSample() {
    const distType = document.getElementById('select-tcl-dist') ? document.getElementById('select-tcl-dist').value : 'exp';
    const n = document.getElementById('slider-tcl-n') ? parseInt(document.getElementById('slider-tcl-n').value, 10) : 30;

    const sample = [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const v = sampleFromParent(distType);
      sample.push(v);
      sum += v;
    }
    const mean = sum / n;
    tclLastSamplePoints = sample;
    tclAccumulatedMeans.push(mean);
    drawTcl();
  }

  function runTclFastSimulation() {
    const distType = document.getElementById('select-tcl-dist') ? document.getElementById('select-tcl-dist').value : 'exp';
    const n = document.getElementById('slider-tcl-n') ? parseInt(document.getElementById('slider-tcl-n').value, 10) : 30;
    const nSims = 2000;

    tclAccumulatedMeans = [];
    for (let s = 0; s < nSims; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += sampleFromParent(distType);
      tclAccumulatedMeans.push(sum / n);
    }
    // Dernier échantillon pour le panneau du haut
    tclLastSamplePoints = [];
    for (let i = 0; i < n; i++) tclLastSamplePoints.push(sampleFromParent(distType));
    drawTcl();
  }

  function drawTcl() {
    const canvas = document.getElementById('canvas-tcl');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const distType = document.getElementById('select-tcl-dist') ? document.getElementById('select-tcl-dist').value : 'exp';
    const n = document.getElementById('slider-tcl-n') ? parseInt(document.getElementById('slider-tcl-n').value, 10) : 30;

    if (document.getElementById('val-tcl-n')) document.getElementById('val-tcl-n').textContent = n;

    if (tclAccumulatedMeans.length === 0) {
      runTclFastSimulation();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Séparation en deux zones visuelles :
    // Haut : Population parente (35% hauteur)
    // Bas  : Distribution des moyennes accumulées (65% hauteur)
    const padX = 50;
    const plotW = width - padX * 2;

    const topY = 25;
    const topH = height * 0.28;
    const botY = topY + topH + 35;
    const botH = height - botY - 30;

    const parentXMin = 0, parentXMax = 12;
    const toParentX = x => padX + ((x - parentXMin) / (parentXMax - parentXMin)) * plotW;

    // 1. DESSIN DU HAUT : POPULATION PARENTE
    ctx.fillStyle = colors.isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(padX, topY, plotW, topH);
    ctx.strokeStyle = colors.grid;
    ctx.strokeRect(padX, topY, plotW, topH);

    // Courbe parente théorique
    ctx.beginPath();
    for (let i = 0; i <= 150; i++) {
      const x = (i / 150) * parentXMax;
      let y = 0;
      if (distType === 'exp') y = 0.5 * Math.exp(-0.5 * x);
      else if (distType === 'uniform') y = x <= 10 ? 0.1 : 0;
      else y = (0.35 * Math.exp(-Math.pow(x - 3, 2) / 2) + 0.65 * Math.exp(-Math.pow(x - 8.5, 2) / 3)) * 0.45;

      const cy = topY + topH - (y / 0.55) * (topH * 0.85);
      if (i === 0) ctx.moveTo(toParentX(x), cy); else ctx.lineTo(toParentX(x), cy);
    }
    ctx.strokeStyle = colors.amber;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tirage du dernier échantillon (points bleus en haut)
    if (tclLastSamplePoints.length > 0) {
      ctx.fillStyle = colors.teal;
      for (let p of tclLastSamplePoints) {
        ctx.beginPath();
        ctx.arc(toParentX(p), topY + topH - 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      const lastM = tclLastSamplePoints.reduce((a, b) => a + b, 0) / tclLastSamplePoints.length;
      ctx.beginPath();
      ctx.moveTo(toParentX(lastM), topY);
      ctx.lineTo(toParentX(lastM), topY + topH);
      ctx.strokeStyle = colors.red;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`1. Population Parente (${distType.toUpperCase()}) — ${tclLastSamplePoints.length} points tirés en vert`, padX + 8, topY + 14);

    // 2. DESSIN DU BAS : HISTOGRAMME DES MOYENNES ACCUMULÉES
    const means = tclAccumulatedMeans;
    const minM = Math.min(...means);
    const maxM = Math.max(...means);
    const bins = 32;
    const binW = (maxM - minM) / bins || 0.1;
    const counts = new Array(bins).fill(0);

    for (let m of means) {
      const idx = Math.min(bins - 1, Math.floor((m - minM) / binW));
      counts[idx]++;
    }
    const maxCount = Math.max(...counts) || 1;
    const toBotX = val => padX + ((val - minM) / (maxM - minM)) * plotW;
    const toBotY = count => botY + botH - (count / maxCount) * (botH * 0.88);

    ctx.fillStyle = colors.tealLight;
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 1;

    for (let b = 0; b < bins; b++) {
      const bx1 = toBotX(minM + b * binW);
      const bx2 = toBotX(minM + (b + 1) * binW);
      const by = toBotY(counts[b]);
      ctx.fillRect(bx1, by, bx2 - bx1, botY + botH - by);
      ctx.strokeRect(bx1, by, bx2 - bx1, botY + botH - by);
    }

    // Courbe normale ajustée si effectif suffisant
    const grandMean = means.reduce((a, b) => a + b, 0) / means.length;
    const grandVar = means.reduce((a, b) => a + Math.pow(b - grandMean, 2), 0) / (means.length - 1 || 1);
    const grandSd = Math.sqrt(grandVar);

    if (means.length >= 20) {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = minM + (i / 100) * (maxM - minM);
        const normY = (1 / (grandSd * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - grandMean, 2) / (2 * grandVar));
        const scaledY = botY + botH - (normY * (means.length * binW) / maxCount) * (botH * 0.88);
        if (i === 0) ctx.moveTo(toBotX(x), scaledY); else ctx.lineTo(toBotX(x), scaledY);
      }
      ctx.strokeStyle = colors.red;
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }

    // Ligne de sol
    ctx.beginPath();
    ctx.moveTo(padX, botY + botH);
    ctx.lineTo(padX + plotW, botY + botH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    ctx.fillStyle = colors.navy;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`2. Distribution des Moyennes d'Échantillons (K = ${means.length} échantillons prélevés)`, padX + 8, botY + 14);

    if (document.getElementById('metric-tcl-mean')) document.getElementById('metric-tcl-mean').textContent = grandMean.toFixed(2);
    if (document.getElementById('metric-tcl-sd')) document.getElementById('metric-tcl-sd').textContent = grandSd.toFixed(2);
    if (document.getElementById('metric-tcl-k')) document.getElementById('metric-tcl-k').textContent = `${means.length} échantillons`;
  }

  // ==========================================================================
  // ONGLET 7 : INTERVALLES DE CONFIANCE (95% CI)
  // ==========================================================================
  let ciData = [];
  function generateCiData() {
    const nSlider = document.getElementById('slider-ci-n');
    const n = nSlider ? parseInt(nSlider.value, 10) : 15;
    const muTrue = 100.0;
    const sigmaTrue = 15.0;
    const nStudies = 25;

    const studies = [];
    for (let s = 0; s < nStudies; s++) {
      const sample = [];
      for (let i = 0; i < n; i++) {
        const u1 = Math.max(1e-6, Math.random()), u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        sample.push(muTrue + z * sigmaTrue);
      }
      const m = sample.reduce((a, b) => a + b, 0) / n;
      const sVal = Math.sqrt(sample.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (n - 1));
      const sem = sVal / Math.sqrt(n);
      const tCrit = 2.064;
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
    if (document.getElementById('val-ci-n')) document.getElementById('val-ci-n').textContent = n;

    ctx.clearRect(0, 0, width, height);
    const padX = 50, padY = 30;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const xMin = 80, xMax = 120;
    const toX = x => padX + ((x - xMin) / (xMax - xMin)) * plotW;

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

    let coveredCount = 0;
    const rowH = plotH / studies.length;

    for (let i = 0; i < studies.length; i++) {
      const st = studies[i];
      const yPos = padY + (i + 0.5) * rowH;
      const col = st.covers ? colors.green : colors.red;
      if (st.covers) coveredCount++;

      ctx.beginPath();
      ctx.moveTo(toX(st.lower), yPos);
      ctx.lineTo(toX(st.upper), yPos);
      ctx.strokeStyle = col;
      ctx.lineWidth = st.covers ? 1.8 : 2.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(toX(st.m), yPos, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    const rate = (coveredCount / studies.length) * 100;
    if (document.getElementById('metric-ci-rate')) document.getElementById('metric-ci-rate').textContent = `${coveredCount}/${studies.length} (${rate.toFixed(0)}%)`;
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

    const delta = deltaSlider ? parseFloat(deltaSlider.value) : 1.8;
    const n = nSlider ? parseInt(nSlider.value, 10) : 20;
    const alpha = alphaSelect ? parseFloat(alphaSelect.value) : 0.05;

    if (document.getElementById('val-delta')) document.getElementById('val-delta').textContent = delta.toFixed(1);
    if (document.getElementById('val-hypo-n')) document.getElementById('val-hypo-n').textContent = n;

    const zCrit = alpha === 0.01 ? 2.326 : 1.645;
    const shiftH1 = delta * (Math.sqrt(n) / 3.0);

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

    // Aire Alpha
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

    // Aire Beta
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

    // Aire Puissance 1-Beta
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

    // Titres
    ctx.fillStyle = colors.navy;
    ctx.fillText("Distribution sous H0 (Pas d'effet)", toX(0), padY + 14);
    ctx.fillStyle = colors.teal;
    ctx.fillText("Distribution sous H1 (Effet Réel)", toX(shiftH1), padY + 14);

    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    if (document.getElementById('metric-alpha')) document.getElementById('metric-alpha').textContent = (alpha * 100).toFixed(0) + ' %';
    if (document.getElementById('metric-beta')) document.getElementById('metric-beta').textContent = (beta * 100).toFixed(1) + ' %';
    if (document.getElementById('metric-power')) document.getElementById('metric-power').textContent = power.toFixed(1) + ' %';
  }

  function erf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  // ==========================================================================
  // NOUVEAU MODULE : CHAPITRE 1 — ANOVA À DEUX FACTEURS CROISÉS
  // ==========================================================================
  function drawAnova() {
    const canvas = document.getElementById('canvas-anova');
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const colors = getThemeColors();

    const sliderEffA = document.getElementById('slider-anova-a');
    const sliderEffB = document.getElementById('slider-anova-b');
    const sliderEffAB = document.getElementById('slider-anova-ab');
    const sliderK = document.getElementById('slider-anova-k');

    const effA = sliderEffA ? parseFloat(sliderEffA.value) : 8;
    const effB = sliderEffB ? parseFloat(sliderEffB.value) : 10;
    const effAB = sliderEffAB ? parseFloat(sliderEffAB.value) : 6;
    const K = sliderK ? parseInt(sliderK.value, 10) : 5;

    if (document.getElementById('val-anova-a')) document.getElementById('val-anova-a').textContent = effA.toFixed(1);
    if (document.getElementById('val-anova-b')) document.getElementById('val-anova-b').textContent = effB.toFixed(1);
    if (document.getElementById('val-anova-ab')) document.getElementById('val-anova-ab').textContent = effAB.toFixed(1);
    if (document.getElementById('val-anova-k')) document.getElementById('val-anova-k').textContent = K;

    // Simulation de l'étude (MDA hépatique : Traitement A [Témoin, Dose 1, Dose 2] x Génotype B [WT, db/db])
    // Base mu = 20
    const mu = 15;
    const means = {
      wt: [mu, mu + effA * 0.3, mu + effA * 0.6],
      db: [mu + effB, mu + effB + (effA * 0.3) + effAB * 0.5, mu + effB + (effA * 0.6) + effAB]
    };

    ctx.clearRect(0, 0, width, height);
    const padX = 70, padY = 40;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const yMin = 0, yMax = Math.max(45, mu + effB + effA + Math.abs(effAB) + 10);
    const toY = val => padY + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

    const xPositions = [padX + plotW * 0.18, padX + plotW * 0.50, padX + plotW * 0.82];
    const xLabels = ['Témoin (0 mg/kg)', 'Dose 50 mg/kg', 'Dose 100 mg/kg'];

    // Lignes de profil de réponse
    // 1. Profil Souris Sauvages WT (Bleu)
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const px = xPositions[i];
      const py = toY(means.wt[i]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = colors.navy;
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const px = xPositions[i];
      const py = toY(means.wt[i]);
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.navy;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.navy;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${means.wt[i].toFixed(1)}`, px, py - 12);
    }

    // 2. Profil Souris Diabétiques db/db (Rouge)
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const px = xPositions[i];
      const py = toY(means.db[i]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const px = xPositions[i];
      const py = toY(means.db[i]);
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.red;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.red;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${means.db[i].toFixed(1)}`, px, py - 12);
    }

    // Axe
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.strokeStyle = colors.textMuted;
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(xLabels[i], xPositions[i], padY + plotH + 20);
    }

    // Légende
    ctx.fillStyle = colors.navy;
    ctx.fillRect(padX + 10, padY + 10, 16, 4);
    ctx.fillText("Souris Sauvages (WT)", padX + 85, padY + 14);

    ctx.fillStyle = colors.red;
    ctx.fillRect(padX + 170, padY + 10, 16, 4);
    ctx.fillText("Souris Diabétiques (db/db)", padX + 265, padY + 14);

    // Diagnostic d'Interaction
    const isParallel = Math.abs(effAB) < 0.8;
    const diagText = isParallel
      ? "Droites Parallèles : Pas d'interaction (Modèle Additif Validé). Les effets des facteurs sont indépendants."
      : (effAB > 0
        ? "Droites Divergentes / Non Parallèles : Interaction Synergique significative (p < 0.05) !"
        : "Croisement des Droites : Interaction Antagoniste significative !");

    // Calcul de la table ANOVA simplifiée
    const ssA = 2 * K * Math.pow(effA * 0.45, 2);
    const ssB = 3 * K * Math.pow(effB * 0.5, 2);
    const ssAB = K * Math.pow(effAB, 2) * 1.5;
    const ssRes = 6 * (K - 1) * 3.5;

    const msAB = ssAB / 2;
    const msRes = ssRes / (6 * (K - 1) || 1);
    const fAB = msAB / (msRes || 1);
    const pValAB = Math.max(0.0001, Math.min(0.99, Math.exp(-fAB * 0.4)));

    if (document.getElementById('metric-anova-ssab')) document.getElementById('metric-anova-ssab').textContent = ssAB.toFixed(1);
    if (document.getElementById('metric-anova-fab')) document.getElementById('metric-anova-fab').textContent = fAB.toFixed(2);
    if (document.getElementById('metric-anova-pab')) document.getElementById('metric-anova-pab').textContent = pValAB < 0.001 ? '< 0.001' : pValAB.toFixed(3);
    if (document.getElementById('metric-anova-status')) document.getElementById('metric-anova-status').textContent = isParallel ? 'Modèle Additif' : 'Interaction Significative';

    const diagCard = document.getElementById('anova-diag-insight');
    if (diagCard) {
      diagCard.innerHTML = `
        <h5 class="sim-insight-title" style="color: ${isParallel ? 'var(--accent-teal)' : 'var(--accent-red, #e11d48)'};">
          <i class="fas ${isParallel ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${isParallel ? 'Absence d\'Interaction' : 'Présence d\'Interaction Significative'}
        </h5>
        <p class="sim-insight-desc">${diagText}</p>
      `;
    }
  }

  // ==========================================================================
  // ATTACHEMENT DES ÉVÉNEMENTS
  // ==========================================================================
  function attachSimulatorEvents() {
    // Tab 1 : Skewness & Échantillon
    const sSkew = document.getElementById('slider-skewness');
    const sOut = document.getElementById('slider-outlier');
    const sSampleN = document.getElementById('slider-sample-n');
    const btnResample = document.getElementById('btn-resample-skew');

    if (sSkew) sSkew.addEventListener('input', () => { generateSkewSample(); drawSkewness(); });
    if (sOut) sOut.addEventListener('input', () => { generateSkewSample(); drawSkewness(); });
    if (sSampleN) sSampleN.addEventListener('input', () => { generateSkewSample(); drawSkewness(); });
    if (btnResample) btnResample.addEventListener('click', () => { generateSkewSample(); drawSkewness(); });

    document.querySelectorAll('[data-preset-skew]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-preset-skew');
        if (sSkew && sOut) {
          if (val === 'norm') { sSkew.value = 0; sOut.value = 0; }
          if (val === 'skew') { sSkew.value = 1.2; sOut.value = 0; }
          if (val === 'outlier') { sSkew.value = 0.4; sOut.value = 65; }
          generateSkewSample();
          drawSkewness();
        }
      });
    });

    // Tab 2 : SD vs SEM
    const sN = document.getElementById('slider-n');
    const sSig = document.getElementById('slider-sigma');
    if (sN && sSig) {
      sN.addEventListener('input', drawSdSem);
      sSig.addEventListener('input', drawSdSem);
    }

    // Tab 3 : Boxplot
    const sIqr = document.getElementById('slider-iqr');
    const sBoxN = document.getElementById('slider-box-n');
    const cOut = document.getElementById('check-outlier');
    const btnRegenBox = document.getElementById('btn-regen-box');
    if (sIqr && sBoxN) {
      sIqr.addEventListener('input', () => { generateBoxplotPoints(); drawBoxplot(); });
      sBoxN.addEventListener('input', () => { generateBoxplotPoints(); drawBoxplot(); });
      if (cOut) cOut.addEventListener('change', () => { generateBoxplotPoints(); drawBoxplot(); });
      if (btnRegenBox) btnRegenBox.addEventListener('click', () => { generateBoxplotPoints(); drawBoxplot(); });
    }

    // Tab 4 : Bayes
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

    // Tab 5 : Loi Normale
    const selBioNorm = document.getElementById('select-norm-biomarker');
    const sNormMu = document.getElementById('slider-norm-mu');
    const sNormSig = document.getElementById('slider-norm-sig');

    if (selBioNorm) {
      selBioNorm.addEventListener('change', () => {
        const key = selBioNorm.value;
        const p = BIO_NORMAL_PRESETS[key];
        if (p && sNormMu && sNormSig) {
          sNormMu.value = p.mu;
          sNormSig.value = p.sigma;
          if (p.min) sNormMu.min = p.min;
          if (p.max) sNormMu.max = p.max;
        }
        drawNormal();
      });
    }

    if (sNormMu && sNormSig) {
      sNormMu.addEventListener('input', drawNormal);
      sNormSig.addEventListener('input', drawNormal);
      document.querySelectorAll('input[name="norm-rule"]').forEach(r => r.addEventListener('change', drawNormal));
    }

    // Tab 6 : TCL
    const btnTclStep = document.getElementById('btn-step-tcl');
    const btnTclAnim = document.getElementById('btn-anim-tcl');
    const btnTclRun = document.getElementById('btn-run-tcl');
    const btnTclReset = document.getElementById('btn-reset-tcl');
    const sTclN = document.getElementById('slider-tcl-n');
    const selTclDist = document.getElementById('select-tcl-dist');

    if (btnTclStep) btnTclStep.addEventListener('click', addOneTclSample);
    if (btnTclRun) btnTclRun.addEventListener('click', runTclFastSimulation);
    if (btnTclReset) {
      btnTclReset.addEventListener('click', () => {
        if (tclAnimInterval) { clearInterval(tclAnimInterval); tclAnimInterval = null; }
        tclAccumulatedMeans = [];
        tclLastSamplePoints = [];
        drawTcl();
      });
    }
    if (btnTclAnim) {
      btnTclAnim.addEventListener('click', () => {
        if (tclAnimInterval) {
          clearInterval(tclAnimInterval);
          tclAnimInterval = null;
          btnTclAnim.innerHTML = '<i class="fas fa-play"></i> Animation Continue';
        } else {
          btnTclAnim.innerHTML = '<i class="fas fa-pause"></i> Pause';
          tclAnimInterval = setInterval(() => {
            if (tclAccumulatedMeans.length >= 2500) {
              clearInterval(tclAnimInterval);
              tclAnimInterval = null;
              btnTclAnim.innerHTML = '<i class="fas fa-play"></i> Animation Continue';
              return;
            }
            addOneTclSample();
          }, 40);
        }
      });
    }
    if (sTclN) sTclN.addEventListener('input', runTclFastSimulation);
    if (selTclDist) selTclDist.addEventListener('change', runTclFastSimulation);

    // Tab 7 : CI
    const sCiN = document.getElementById('slider-ci-n');
    const btnRegenCi = document.getElementById('btn-regen-ci');
    if (sCiN && btnRegenCi) {
      sCiN.addEventListener('input', generateCiData);
      btnRegenCi.addEventListener('click', generateCiData);
    }

    // Tab 8 : Hypothèses
    const sDelta = document.getElementById('slider-delta');
    const sHypoN = document.getElementById('slider-hypo-n');
    const selAlpha = document.getElementById('select-alpha');
    if (sDelta && sHypoN && selAlpha) {
      sDelta.addEventListener('input', drawHypo);
      sHypoN.addEventListener('input', drawHypo);
      selAlpha.addEventListener('change', drawHypo);
    }

    // Tab 9 : ANOVA (Chapitre 1)
    const slAnovaA = document.getElementById('slider-anova-a');
    const slAnovaB = document.getElementById('slider-anova-b');
    const slAnovaAB = document.getElementById('slider-anova-ab');
    const slAnovaK = document.getElementById('slider-anova-k');
    if (slAnovaA && slAnovaB && slAnovaAB && slAnovaK) {
      slAnovaA.addEventListener('input', drawAnova);
      slAnovaB.addEventListener('input', drawAnova);
      slAnovaAB.addEventListener('input', drawAnova);
      slAnovaK.addEventListener('input', drawAnova);
    }
  }

  // ==========================================================================
  // INITIALISATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initSimulatorTabs();
    attachSimulatorEvents();

    setTimeout(() => {
      const activeBtn = document.querySelector('.sim-tab-btn.active');
      const firstTab = activeBtn ? activeBtn.getAttribute('data-tab') : 'sim-skew';
      triggerDraw(firstTab);
      triggerKatex(document.querySelector('.sim-section'));
    }, 250);
  });

  // Exposer les méthodes d'accès si besoin
  window.BioStatSimulator = {
    triggerDraw: triggerDraw,
    drawSkewness: drawSkewness,
    drawAnova: drawAnova
  };

})();
