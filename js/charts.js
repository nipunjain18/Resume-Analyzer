/**
 * charts.js — Chart.js Visualizations
 * Neon cyberpunk theme with cyan/purple/blue accents
 * Radar, Bar, Line charts + animated circular progress
 */

let radarChartInstance = null;
let barChartInstance   = null;
let lineChartInstance  = null;

// ─── CHART DEFAULTS ─────────────────────────────────────────────────────────
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = "'Orbitron', 'Inter', -apple-system, sans-serif";
Chart.defaults.font.weight = '500';

// Custom plugin: glowing points on radar
const glowPlugin = {
  id: 'glowPoints',
  afterDatasetDraw(chart) {
    if (chart.config.type !== 'radar') return;
    const meta = chart.getDatasetMeta(0);
    const ctx = chart.ctx;
    meta.data.forEach(point => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 14);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }
};

// Custom plugin: bar value labels
const barLabelsPlugin = {
  id: 'barValueLabels',
  afterDatasetDraw(chart) {
    if (chart.config.type !== 'bar') return;
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = "bold 12px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    meta.data.forEach((bar, i) => {
      const val = chart.data.datasets[0].data[i];
      let color;
      if (val >= 70) color = '#10b981';
      else if (val >= 45) color = '#a855f7';
      else color = '#ef4444';
      ctx.fillStyle = color;
      ctx.fillText(val + '%', bar.x, bar.y - 6);
    });
    ctx.restore();
  }
};

Chart.register(glowPlugin, barLabelsPlugin);

/**
 * Render Radar Chart — Resume vs Job Requirements
 */
function renderRadarChart(radarData) {
  const ctx = document.getElementById('radarChart').getContext('2d');

  if (radarChartInstance) radarChartInstance.destroy();

  const radarGradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 130);
  radarGradient.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
  radarGradient.addColorStop(1, 'rgba(168, 85, 247, 0.03)');

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: radarData.labels,
      datasets: [{
        label: 'Your Resume',
        data: radarData.resume,
        fill: true,
        backgroundColor: radarGradient,
        borderColor: '#00f0ff',
        pointBackgroundColor: '#00f0ff',
        pointBorderColor: 'rgba(10, 14, 26, 0.9)',
        pointHoverBackgroundColor: '#a855f7',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 9,
        tension: 0.1,
      }, {
        label: 'Job Requirements',
        data: radarData.job,
        fill: true,
        backgroundColor: 'rgba(168, 85, 247, 0.04)',
        borderColor: 'rgba(168, 85, 247, 0.2)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2200,
        easing: 'easeOutElastic'
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            backdropColor: 'transparent',
            color: '#334155',
            font: { size: 9, weight: '600' }
          },
          grid: {
            color: 'rgba(0, 240, 255, 0.06)',
            lineWidth: 1,
          },
          angleLines: {
            color: 'rgba(0, 240, 255, 0.06)',
          },
          pointLabels: {
            color: '#94a3b8',
            font: { size: 10, weight: '700', family: "'Orbitron', sans-serif" },
            padding: 14,
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#64748b',
            font: { size: 10, weight: '600' },
            boxWidth: 14,
            boxHeight: 14,
            padding: 20,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 14, 26, 0.95)',
          borderColor: 'rgba(0, 240, 255, 0.4)',
          borderWidth: 1,
          titleColor: '#00f0ff',
          titleFont: { size: 12, weight: '700', family: "'Orbitron', sans-serif" },
          bodyColor: '#e2e8f0',
          bodyFont: { size: 11, weight: '500' },
          padding: { top: 12, bottom: 12, left: 16, right: 16 },
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: ctx => `  ${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });
}

/**
 * Render Bar Chart — Skills Match Breakdown
 */
function renderBarChart(sectionScores) {
  const ctx = document.getElementById('barChart').getContext('2d');

  if (barChartInstance) barChartInstance.destroy();

  const labels = Object.keys(sectionScores);
  const values = Object.values(sectionScores);

  const gradientColors = values.map(v => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    if (v >= 70) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
    } else if (v >= 45) {
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.85)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    }
    return gradient;
  });

  const borderColors = values.map(v => {
    if (v >= 70) return '#10b981';
    if (v >= 45) return '#a855f7';
    return '#ef4444';
  });

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Score (%)',
        data: values,
        backgroundColor: gradientColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.75,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1800,
        easing: 'easeOutBack',
        delay: (context) => context.dataIndex * 150,
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(0, 240, 255, 0.04)', drawTicks: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, weight: '600', family: "'Orbitron', sans-serif" },
            callback: val => val + '%',
            padding: 8,
          },
          border: { color: 'rgba(0, 240, 255, 0.06)', dash: [4, 4] }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, weight: '700', family: "'Orbitron', sans-serif" },
            padding: 8,
          },
          border: { color: 'rgba(0, 240, 255, 0.06)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10, 14, 26, 0.95)',
          borderColor: 'rgba(0, 240, 255, 0.4)',
          borderWidth: 1,
          titleColor: '#00f0ff',
          titleFont: { size: 12, weight: '700', family: "'Orbitron', sans-serif" },
          bodyColor: '#e2e8f0',
          bodyFont: { size: 11, weight: '600' },
          padding: { top: 12, bottom: 12, left: 16, right: 16 },
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: ctx => `  Score: ${ctx.raw}%`
          }
        }
      }
    }
  });
}

/**
 * Render Line Chart — Resume Strength Categories
 */
function renderLineChart(lineData) {
  const ctx = document.getElementById('lineChart').getContext('2d');

  if (lineChartInstance) lineChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(168, 85, 247, 0.02)');

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: lineData.labels,
      datasets: [{
        label: 'Resume Strength',
        data: lineData.values,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#00f0ff',
        borderWidth: 2.5,
        pointBackgroundColor: '#00f0ff',
        pointBorderColor: 'rgba(10, 14, 26, 0.9)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: '#a855f7',
        pointHoverBorderColor: '#fff',
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeOutCubic',
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(0, 240, 255, 0.04)', drawTicks: false },
          ticks: {
            color: '#64748b',
            font: { size: 10, weight: '600', family: "'Orbitron', sans-serif" },
            callback: val => val + '%',
            padding: 8,
          },
          border: { color: 'rgba(0, 240, 255, 0.06)', dash: [4, 4] }
        },
        x: {
          grid: { color: 'rgba(0, 240, 255, 0.03)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, weight: '700', family: "'Orbitron', sans-serif" },
            padding: 8,
          },
          border: { color: 'rgba(0, 240, 255, 0.06)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10, 14, 26, 0.95)',
          borderColor: 'rgba(0, 240, 255, 0.4)',
          borderWidth: 1,
          titleColor: '#00f0ff',
          titleFont: { size: 12, weight: '700', family: "'Orbitron', sans-serif" },
          bodyColor: '#e2e8f0',
          bodyFont: { size: 11, weight: '600' },
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: ctx => `  Strength: ${ctx.raw}%`
          }
        }
      }
    }
  });
}

/**
 * Animated Circular Progress Chart for ATS Score
 */
function renderCircularProgress(score) {
  const canvas = document.getElementById('atsCircleChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 160;
  const center = size / 2;
  const radius = 62;
  const lineWidth = 8;

  // High DPI support
  canvas.width = size * 2;
  canvas.height = size * 2;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(2, 2);

  let currentAngle = 0;
  const targetAngle = (score / 100) * Math.PI * 2;
  const scoreEl = document.getElementById('circularScore');

  function draw(angle) {
    ctx.clearRect(0, 0, size, size);

    // Background ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Tick marks around circumference
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const len = i % 5 === 0 ? 6 : 3;
      const r1 = radius + lineWidth / 2 + 4;
      const r2 = r1 + len;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(a) * r1, center + Math.sin(a) * r1);
      ctx.lineTo(center + Math.cos(a) * r2, center + Math.sin(a) * r2);
      ctx.strokeStyle = i % 5 === 0 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Glowing progress arc
    if (angle > 0) {
      // Outer diffuse glow
      ctx.beginPath();
      ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = lineWidth + 16;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Mid glow
      ctx.beginPath();
      ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = lineWidth + 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Main arc with gradient
      const grad = ctx.createConicGradient(-Math.PI / 2, center, center);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.35, '#a855f7');
      grad.addColorStop(0.7, '#3b82f6');
      grad.addColorStop(1, '#00f0ff');

      ctx.beginPath();
      ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright dot at the tip
      const tipX = center + Math.cos(-Math.PI / 2 + angle) * radius;
      const tipY = center + Math.sin(-Math.PI / 2 + angle) * radius;
      const dotGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
      dotGrad.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
      dotGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.3)');
      dotGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.beginPath();
      ctx.arc(tipX, tipY, 10, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();
    }
  }

  // Animate
  const duration = 2500;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    currentAngle = targetAngle * eased;
    draw(currentAngle);

    if (scoreEl) {
      scoreEl.textContent = Math.round(score * eased) + '%';
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Animate metric bars
 */
function animateMetricBar(id, percentage) {
  const el = document.getElementById(id);
  if (el) {
    setTimeout(() => {
      el.style.width = percentage + '%';
    }, 400);
  }
}
