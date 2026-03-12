/**
 * script.js — Main App Controller
 * Orchestrates analysis flow, populates all dashboard sections
 */

// ─── ANALYSIS ENTRY POINT ────────────────────────────────────────────────────
async function startAnalysis() {
  const jdText = document.getElementById('jobDescription').value.trim();

  if (!resumeText || resumeText.length < 50) {
    showAlert('Please upload a valid resume PDF first.', 'error');
    return;
  }

  if (!jdText || jdText.length < 50) {
    showAlert('Please paste a job description (at least 50 characters).', 'error');
    return;
  }

  showScanner();

  try {
    await runScannerSteps();

    const results = analyzeResume(resumeText, jdText);

    hideScanner();
    displayResults(results, jdText);

  } catch (err) {
    hideScanner();
    showAlert('Analysis failed: ' + err.message, 'error');
    console.error(err);
  }
}


function computeRiskFromScores(atsScore, skillMatchScore, experienceRelevance) {
  if (atsScore >= 75 && skillMatchScore >= 70 && experienceRelevance >= 60) return 'Low';
  if (atsScore >= 60 && (skillMatchScore >= 55 || experienceRelevance >= 50)) return 'Medium';
  if (atsScore >= 45) return 'High';
  return 'Very High';
}

function computeAtsScoreFromSections(sections) {
  const skills      = Number(sections.skills)      || 0;
  const keywords    = Number(sections.keywords)    || 0;
  const experience  = Number(sections.experience)  || 0;
  const content     = Number(sections.content)     || 0;
  const completeness = Number(sections.completeness) || 0;

  // Weights: 40% Skill | 30% Keyword | 20% Experience | 10% Structure (content 7% + completeness 3%)
  const raw = (
    (skills      / 100) * 0.40 +
    (keywords    / 100) * 0.30 +
    (experience  / 100) * 0.20 +
    (content     / 100) * 0.07 +
    (completeness / 100) * 0.03
  );

  return Math.min(Math.round(raw * 100), 99);
}


// ─── DISPLAY RESULTS ─────────────────────────────────────────────────────────
function displayResults(results, jdText) {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.getElementById('uploadSection').style.display = 'none';
  const dashboard = document.getElementById('dashboard');
  dashboard.style.display = 'block';

  // Job title
  const firstLine = jdText.split('\n')[0].substring(0, 60);
  document.getElementById('dashJobTitle').textContent = `vs. "${firstLine}..."`;

  window._analysisResults = results;
  window._jdText = jdText;
  window._chartsRendered = false;
  window._compareChartRendered = false;
  window._intelligenceRendered = false;

  initDashboardTabs(results);
  renderQuickSummary(results);
  renderStatsTicker(results);

  // Dashboard entrance animations
  setTimeout(() => animateDashboardEntrance(), 100);

  // ── ATS Circular Progress
  setTimeout(() => renderCircularProgress(results.atsScore), 300);

  // ── Verdict
  const verdictEl = document.getElementById('scoreVerdict');
  let verdictClass, verdictText;
  if (results.atsScore >= 75) {
    verdictClass = 'verdict-great'; verdictText = '🚀 EXCELLENT MATCH';
  } else if (results.atsScore >= 55) {
    verdictClass = 'verdict-good'; verdictText = '✅ GOOD MATCH';
  } else if (results.atsScore >= 35) {
    verdictClass = 'verdict-fair'; verdictText = '⚠ NEEDS WORK';
  } else {
    verdictClass = 'verdict-poor'; verdictText = '❌ POOR MATCH';
  }
  verdictEl.className = 'metric-verdict ' + verdictClass;
  verdictEl.textContent = verdictText;

  // ── Skill Match Score
  document.getElementById('skillMatchScore').textContent = results.skillMatchScore + '%';
  animateMetricBar('skillMatchBar', results.skillMatchScore);

  // ── Experience Relevance
  document.getElementById('expRelevanceScore').textContent = results.experienceRelevance + '%';
  animateMetricBar('expRelevanceBar', results.experienceRelevance);

  // ── Keyword Optimization
  document.getElementById('keywordOptScore').textContent = results.keywordOptimization + '%';
  animateMetricBar('keywordOptBar', results.keywordOptimization);

  // ── Rejection Risk
  const riskEl = document.getElementById('rejectionRisk');
  const riskTag = document.getElementById('riskTag');
  riskEl.textContent = results.rejectionRisk;

  if (results.rejectionRisk === 'Low') {
    riskTag.textContent = '🛡 Safe Zone';
    riskTag.style.background = 'rgba(16,185,129,0.1)';
    riskTag.style.color = '#10b981';
    riskTag.style.border = '1px solid rgba(16,185,129,0.3)';
  } else if (results.rejectionRisk === 'Medium') {
    riskTag.textContent = '⚡ Moderate Risk';
    riskTag.style.background = 'rgba(168,85,247,0.1)';
    riskTag.style.color = '#a855f7';
    riskTag.style.border = '1px solid rgba(168,85,247,0.3)';
  } else if (results.rejectionRisk === 'High') {
    riskTag.textContent = '⚠ High Risk';
    riskTag.style.background = 'rgba(245,158,11,0.1)';
    riskTag.style.color = '#f59e0b';
    riskTag.style.border = '1px solid rgba(245,158,11,0.3)';
  } else {
    riskTag.textContent = '🔴 Critical Risk';
    riskTag.style.background = 'rgba(239,68,68,0.1)';
    riskTag.style.color = '#ef4444';
    riskTag.style.border = '1px solid rgba(239,68,68,0.3)';
  }

  // ── Matched Skills (grouped by Technical / Tools & Technologies / Soft Skills)
  renderGroupedSkills(
    document.getElementById('matchedSkillsList'),
    results.matchedSkillsByGroup || {},
    'matched',
    'No direct skill matches found'
  );

  // ── Missing Skills (grouped)
  renderGroupedSkills(
    document.getElementById('missingSkillsList'),
    results.missingSkillsByGroup || {},
    'missing',
    '🎉 No missing skills!'
  );

  setTimeout(() => animateSkillTags(), 600);

  // ── Skill Progress Bars
  renderSkillProgressBars(results.skillCategories);

  // ── Precision Rewrite Lab
  renderPrecisionRewriteLab(results.priorityTargets, results.rewriteBlueprints);

  // ── Suggestions
  renderSuggestions(results.suggestions);

  // ── Keywords Cloud
  renderKeywordsCloud(results.jdKeywords, results.matchedKeywords);

  // ── AI Insights
  renderInsights(results.insights);

  // ── Resume Strengths
  renderStrengths(results.strengths);
}

function renderQuickSummary(results) {
  const status = document.getElementById('quickSummaryStatus');
  const copy = document.getElementById('quickSummaryCopy');
  const highlight = document.getElementById('quickSummaryHighlight');
  const strengthsList = document.getElementById('quickStrengthsList');
  const gapsList = document.getElementById('quickGapsList');
  const actionText = document.getElementById('quickActionText');

  const overallFit = results.atsScore >= 75
    ? 'Strong fit'
    : results.atsScore >= 55
      ? 'Decent fit'
      : results.atsScore >= 35
        ? 'Needs tailoring'
        : 'Weak fit';

  status.textContent = `Overall fit: ${overallFit}`;
  copy.textContent = `Your resume currently matches ${results.atsScore}% of this role. Focus on the missing items below before sending it.`;
  highlight.textContent = `${results.atsScore}% match`;
  actionText.textContent = results.suggestions[0]?.text || 'Add missing skills and keywords from the job description.';

  const matchedSkills = Array.isArray(results.matchedSkills) ? results.matchedSkills : [];
  const missingSkills = Array.isArray(results.missingSkills) ? results.missingSkills : [];
  const matchedKeywords = Array.isArray(results.matchedKeywords) ? results.matchedKeywords : [];
  const missingKeywords = Array.isArray(results.missingKeywords) ? results.missingKeywords : [];

  // Prefer high-signal keyword types in the Quick Read chips.
  // This avoids showing generic verbs (e.g., "Build") or filler tokens.
  const jdDetails = Array.isArray(results.jdKeywordDetails) ? results.jdKeywordDetails : [];
  const matchedDetails = Array.isArray(results.matchedKeywordDetails) ? results.matchedKeywordDetails : [];
  const allowedQuickTypes = new Set(['skill', 'industry', 'certification', 'qualification']);

  const quickMatchedKeywords = [...new Set(
    matchedDetails
      .filter(d => d && d.matched && allowedQuickTypes.has(d.type))
      .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
      .map(d => d.display)
  )].slice(0, 10);

  const matchedCanonicalSet = new Set(
    matchedDetails
      .filter(d => d && d.matched)
      .map(d => String(d.canonical || d.display || ''))
      .filter(Boolean)
  );

  const quickMissingKeywords = [...new Set(
    jdDetails
      .filter(d => d && allowedQuickTypes.has(d.type))
      .filter(d => !matchedCanonicalSet.has(String(d.canonical || d.display || '')))
      .sort((a, b) => (b.weight * b.occurrences) - (a.weight * a.occurrences))
      .map(d => d.display)
  )].slice(0, 10);

  const strengths = matchedSkills.length
    ? matchedSkills
    : (quickMatchedKeywords.length ? quickMatchedKeywords : matchedKeywords.slice(0, 10));

  const gaps = [...new Set(
    missingSkills.length
      ? missingSkills
      : (quickMissingKeywords.length ? quickMissingKeywords : missingKeywords.slice(0, 10))
  )];

  renderQuickChips(strengthsList, strengths, 'positive', 'No strong matches detected yet.');
  renderQuickChips(gapsList, gaps, 'warning', 'No major gaps detected.');
}

function renderQuickChips(container, items, variant, emptyText) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'quick-chip neutral';
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const chip = document.createElement('span');
    chip.className = `quick-chip ${variant}`;
    chip.textContent = capitalizeSkill(item);
    container.appendChild(chip);
  });
}

function initDashboardTabs(results) {
  const tabs = document.querySelectorAll('.dashboard-tab');

  tabs.forEach(tab => {
    if (tab.dataset.bound === 'true') return;
    tab.dataset.bound = 'true';

    tab.addEventListener('click', () => {
      setActiveDashboardPanel(tab.dataset.panel, results);
    });
  });

  setActiveDashboardPanel('overviewPanel', results);
}

function setActiveDashboardPanel(panelId, results) {
  const tabs = document.querySelectorAll('.dashboard-tab');
  const panels = document.querySelectorAll('.dashboard-panel');

  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panelId);
  });

  panels.forEach(panel => {
    const isActive = panel.id === panelId;
    panel.classList.toggle('active', isActive);
  });

  if (panelId === 'detailsPanel' && !window._chartsRendered) {
    setTimeout(() => {
      renderRadarChart(results.radarData);
      renderBarChart(results.sectionScores);
      renderLineChart(results.lineData);
      window._chartsRendered = true;
    }, 80);
  }

  if (panelId === 'comparePanel' && !window._compareChartRendered) {
    setTimeout(() => {
      renderComparePanel(results);
      window._compareChartRendered = true;
    }, 80);
  }

  if (panelId === 'intelligencePanel' && !window._intelligenceRendered) {
    setTimeout(() => {
      renderIntelligencePanel(results);
      window._intelligenceRendered = true;
    }, 80);
  }

}

// ─── RENDER RESUME STRENGTHS ─────────────────────────────────────────────────
function renderStrengths(strengths) {
  const grid = document.getElementById('strengthsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!strengths || strengths.length === 0) {
    grid.innerHTML = '<p style="color:#64748b;font-size:0.85rem;text-align:center;padding:24px">No strengths detected — add more projects, skills, and experience to your resume.</p>';
    return;
  }

  strengths.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'insight-card strength';
    card.style.animationDelay = `${i * 0.15}s`;
    card.innerHTML = `
      <div class="insight-icon">${s.icon}</div>
      <div class="insight-content">
        <div class="insight-title">${s.title}</div>
        <div class="insight-desc">${s.desc}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  setTimeout(() => animateInsightCards(), 600);
}

// ─── RENDER AI INSIGHTS ──────────────────────────────────────────────────────
function renderInsights(insights) {
  const grid = document.getElementById('insightsGrid');
  grid.innerHTML = '';

  insights.forEach((insight, i) => {
    const card = document.createElement('div');
    card.className = `insight-card ${insight.type}`;
    card.style.animationDelay = `${i * 0.3}s`;
    card.innerHTML = `
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-content">
        <div class="insight-title">${insight.title}</div>
        <div class="insight-desc">${insight.desc}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  setTimeout(() => animateInsightCards(), 700);
}

// ─── RENDER SUGGESTIONS ──────────────────────────────────────────────────────
function renderSuggestions(suggestions) {
  const grid = document.getElementById('suggestionsGrid');
  grid.innerHTML = '';

  suggestions.forEach((sug, i) => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.style.animationDelay = `${i * 0.4}s`;
    card.innerHTML = `
      <div class="suggestion-icon">${sug.icon}</div>
      <div class="suggestion-text">${sug.text}</div>
    `;
    grid.appendChild(card);
  });

  setTimeout(() => animateSuggestionCards(), 900);
}

// ─── RENDER GROUPED SKILLS (matched or missing, split into 3 categories) ─────
function renderGroupedSkills(container, groups, variant, emptyText) {
  container.innerHTML = '';

  const dotColor   = variant === 'matched' ? 'green' : 'red';
  const emptyColor = variant === 'matched' ? '#64748b' : '#10b981';

  const GROUP_LABELS = {
    technical: '⚙️ Technical Skills',
    tools:     '🛠 Tools & Technologies',
    soft:      '🤝 Soft Skills',
    other:     '📌 Other',
  };

  const hasAny = Object.values(groups).some(arr => arr.length > 0);
  if (!hasAny) {
    container.innerHTML = `<p style="color:${emptyColor};font-size:0.8rem;text-align:center;padding:20px">${emptyText}</p>`;
    return;
  }

  for (const key of ['technical', 'tools', 'soft', 'other']) {
    const skills = groups[key];
    if (!skills || skills.length === 0) continue;

    // Group header
    const header = document.createElement('p');
    header.className = 'skill-group-label';
    header.textContent = GROUP_LABELS[key];
    container.appendChild(header);

    // Skill tags
    for (const skill of skills) {
      const tag = document.createElement('div');
      tag.className = `skill-tag ${variant}`;
      tag.innerHTML = `<div class="skill-dot ${dotColor}"></div>${capitalizeSkill(skill)}`;
      container.appendChild(tag);
    }
  }
}

// ─── RENDER SKILL PROGRESS BARS ──────────────────────────────────────────────
function renderSkillProgressBars(skillCategories) {
  const container = document.getElementById('skillProgressBars');
  container.innerHTML = '';

  const categoryNames = {
    programming: 'Programming',
    web: 'Web Technologies',
    data: 'Data & ML',
    database: 'Databases',
    cloud: 'Cloud & DevOps',
    soft: 'Soft Skills',
    tools: 'Tools & IDEs',
  };

  for (const [category, data] of Object.entries(skillCategories)) {
    const item = document.createElement('div');
    item.className = 'skill-progress-item';

    const fillClass = data.percent >= 70 ? 'green' : data.percent >= 40 ? '' : 'red';

    item.innerHTML = `
      <div class="skill-progress-name">${categoryNames[category] || category}</div>
      <div class="skill-progress-bar-wrap">
        <div class="skill-progress-bar-fill ${fillClass}" style="width: 0%"></div>
      </div>
      <div class="skill-progress-value">${data.matched}/${data.total}</div>
    `;
    container.appendChild(item);

    // Animate the bar after DOM insertion
    setTimeout(() => {
      item.querySelector('.skill-progress-bar-fill').style.width = data.percent + '%';
    }, 500);
  }

  setTimeout(() => animateSkillProgressBars(), 800);
}

// ─── PRECISION REWRITE LAB ──────────────────────────────────────────────────
function renderPrecisionRewriteLab(priorityTargets, rewriteBlueprints) {
  const priorityGrid = document.getElementById('priorityTargetsGrid');
  const blueprintsList = document.getElementById('rewriteBlueprintsList');

  priorityGrid.innerHTML = '';
  blueprintsList.innerHTML = '';

  if (!priorityTargets || priorityTargets.length === 0) {
    priorityGrid.innerHTML = '<p class="rewrite-empty">No high-value injection targets detected for this job description.</p>';
  } else {
    priorityTargets.forEach(target => {
      const card = document.createElement('article');
      card.className = 'priority-target';
      card.innerHTML = `
        <div class="priority-topline">
          <span class="priority-term">${escapeHtml(capitalizeSkill(target.term))}</span>
          <span class="priority-impact">${target.impact}% impact</span>
        </div>
        <div class="priority-meta">
          <span>${escapeHtml(target.actionZone)}</span>
          <span>${target.type === 'skill' ? 'Skill gap' : 'Keyword gap'}</span>
        </div>
        <p class="priority-rationale">${escapeHtml(target.rationale)}</p>
      `;
      priorityGrid.appendChild(card);
    });
  }

  if (!rewriteBlueprints || rewriteBlueprints.length === 0) {
    blueprintsList.innerHTML = '<p class="rewrite-empty">No rewrite templates available yet.</p>';
  } else {
    rewriteBlueprints.forEach(blueprint => {
      const card = document.createElement('article');
      card.className = 'rewrite-blueprint-card';
      card.innerHTML = `
        <div class="rewrite-header-row">
          <div>
            <div class="rewrite-title">${escapeHtml(blueprint.title)}</div>
            <div class="rewrite-section-tag">Place in ${escapeHtml(blueprint.section)}</div>
          </div>
          <div class="rewrite-target-chip">${escapeHtml(capitalizeSkill(blueprint.targetTerm))}</div>
        </div>
        <div class="rewrite-evidence-block">
          <div class="rewrite-label">Current evidence</div>
          <p>${escapeHtml(blueprint.evidence)}</p>
        </div>
        <div class="rewrite-template-block">
          <div class="rewrite-label">Upgrade template</div>
          <p>${escapeHtml(blueprint.template)}</p>
        </div>
        <p class="rewrite-reason">${escapeHtml(blueprint.reason)}</p>
      `;
      blueprintsList.appendChild(card);
    });
  }

  setTimeout(() => animateRewriteLab(), 850);
}

// ─── KEYWORDS CLOUD ──────────────────────────────────────────────────────────
function renderKeywordsCloud(allKeywords, matchedKeywords) {
  const cloud = document.getElementById('keywordsCloud');
  cloud.innerHTML = '';

  const matchedSet = new Set(matchedKeywords);

  allKeywords.slice(0, 30).forEach(kw => {
    const tag = document.createElement('span');
    const isMatched = matchedSet.has(kw);
    tag.className = `kw-tag ${isMatched ? 'kw-found' : 'kw-missing'}`;
    tag.innerHTML = `${isMatched ? '✓' : '✗'} ${kw}`;
    tag.title = isMatched ? 'Found in resume' : 'Missing from resume';
    cloud.appendChild(tag);
  });

  setTimeout(() => animateKeywordTags(), 1000);
}

// ─── RENDER STATS TICKER ─────────────────────────────────────────────────────
function renderStatsTicker(results) {
  const stats = results.stats || {};
  const els = {
    statResumeWords: stats.resumeWordCount || 0,
    statJdWords: stats.jdWordCount || 0,
    statSkillsFound: (results.matchedSkills || []).length + (results.missingSkills || []).length,
    statKwMatched: (results.matchedKeywords || []).length,
    statGaps: (results.missingSkills || []).length,
  };
  for (const [id, target] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) animateCounter(el, target, 1400);
  }
}

// ─── RENDER COMPARE PANEL ────────────────────────────────────────────────────
let compareRadarInstance = null;

function renderComparePanel(results) {
  // Score breakdown horizontal bars
  const barsContainer = document.getElementById('compareBars');
  if (barsContainer) {
    barsContainer.innerHTML = '';
    const scores = results.sectionScores || {};
    const breakdownData = [
      { label: 'Skills Match', value: scores['Skills'] ?? results.skillMatchScore, gradient: 'gradient-cyan' },
      { label: 'Keywords', value: scores['Keywords'] ?? results.keywordOptimization, gradient: 'gradient-purple' },
      { label: 'Experience', value: scores['Experience'] ?? results.experienceRelevance, gradient: 'gradient-green' },
      { label: 'Content Quality', value: scores['Content'] ?? 0, gradient: 'gradient-amber' },
      { label: 'Completeness', value: scores['Completeness'] ?? 0, gradient: 'gradient-blue' },
    ];
    breakdownData.forEach(item => {
      const row = document.createElement('div');
      row.className = 'compare-bar-row';
      row.innerHTML = `
        <div class="compare-bar-label">${escapeHtml(item.label)}</div>
        <div class="compare-bar-track">
          <div class="compare-bar-fill ${item.gradient}" style="width:0%"></div>
        </div>
        <div class="compare-bar-pct">${item.value}%</div>
      `;
      barsContainer.appendChild(row);
      setTimeout(() => {
        row.querySelector('.compare-bar-fill').style.width = item.value + '%';
      }, 300);
    });
  }

  // Side-by-side keywords
  const resumeKwEl = document.getElementById('compareResumeKw');
  const jdMissingEl = document.getElementById('compareJdMissing');

  if (resumeKwEl) {
    resumeKwEl.innerHTML = '';
    (results.matchedKeywords || []).slice(0, 25).forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'compare-tag found';
      tag.textContent = '✓ ' + kw;
      resumeKwEl.appendChild(tag);
    });
    if (!(results.matchedKeywords || []).length) {
      resumeKwEl.innerHTML = '<span class="compare-tag found">No keyword matches</span>';
    }
  }

  if (jdMissingEl) {
    jdMissingEl.innerHTML = '';
    const allMissing = [...(results.missingSkills || []), ...(results.missingKeywords || []).slice(0, 10)];
    const seen = new Set();
    allMissing.forEach(kw => {
      if (seen.has(kw)) return;
      seen.add(kw);
      const tag = document.createElement('span');
      tag.className = 'compare-tag missing';
      tag.textContent = '✗ ' + kw;
      jdMissingEl.appendChild(tag);
    });
    if (!allMissing.length) {
      jdMissingEl.innerHTML = '<span class="compare-tag found">No gaps — excellent!</span>';
    }
  }

  // Category comparison radar
  renderCompareRadar(results);
}

function renderCompareRadar(results) {
  const canvas = document.getElementById('compareRadarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (compareRadarInstance) compareRadarInstance.destroy();

  const categories = results.skillCategories || {};
  const labels = [];
  const resumeValues = [];
  const jobValues = [];

  const categoryNames = {
    programming: 'Programming', web: 'Web Tech', data: 'Data & ML',
    database: 'Databases', cloud: 'Cloud & DevOps', soft: 'Soft Skills', tools: 'Tools',
  };

  for (const [key, data] of Object.entries(categories)) {
    labels.push(categoryNames[key] || key);
    resumeValues.push(data.percent);
    jobValues.push(100);
  }

  if (labels.length < 3) {
    labels.push('Overall');
    resumeValues.push(results.atsScore);
    jobValues.push(100);
  }

  const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 130);
  gradient.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 240, 255, 0.03)');

  compareRadarInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Your Resume',
        data: resumeValues,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#a855f7',
        pointBackgroundColor: '#a855f7',
        pointBorderColor: 'rgba(10, 14, 26, 0.9)',
        borderWidth: 2.5,
        pointRadius: 5,
        tension: 0.1,
      }, {
        label: 'Job Requirements',
        data: jobValues,
        fill: true,
        backgroundColor: 'rgba(0, 240, 255, 0.04)',
        borderColor: 'rgba(0, 240, 255, 0.2)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 2000, easing: 'easeOutElastic' },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, backdropColor: 'transparent', color: '#334155', font: { size: 9 } },
          grid: { color: 'rgba(168, 85, 247, 0.06)' },
          angleLines: { color: 'rgba(168, 85, 247, 0.06)' },
          pointLabels: { color: '#94a3b8', font: { size: 10, weight: '700', family: "'Orbitron', sans-serif" }, padding: 14 }
        }
      },
      plugins: {
        legend: { labels: { color: '#64748b', font: { size: 10, weight: '600' }, boxWidth: 14, padding: 20, usePointStyle: true, pointStyle: 'rectRounded' } },
        tooltip: {
          backgroundColor: 'rgba(10,14,26,0.95)', borderColor: 'rgba(168,85,247,0.4)', borderWidth: 1,
          titleColor: '#a855f7', bodyColor: '#e2e8f0', cornerRadius: 10, displayColors: false,
          callbacks: { label: c => `  ${c.dataset.label}: ${c.raw}%` }
        }
      }
    }
  });
}

// ─── RENDER INTELLIGENCE PANEL ───────────────────────────────────────────────
function renderIntelligencePanel(results) {
  renderInterviewProbability(results.interviewProbability, results);
  renderRecommendedRoles(results.recommendedRoles);
  renderRecruiterRisks(results.recruiterRisks);
  renderImprovementLab(results.resumeImprovements);
  renderSkillGapRoadmap(results.skillGapRoadmap);
  setTimeout(() => animateIntelligencePanel(), 200);
}

// ─── INTERVIEW PROBABILITY ───────────────────────────────────────────────────
function renderInterviewProbability(prob, results) {
  const scoreEl = document.getElementById('interviewCircleScore');
  const levelEl = document.getElementById('interviewProbLevel');
  const descEl  = document.getElementById('interviewProbDesc');
  const breakdownEl = document.getElementById('interviewProbBreakdown');

  if (!scoreEl) return;

  // Animate the circular progress
  renderInterviewCircle(prob.score, prob.color);

  // Animate counter
  animateCounter(scoreEl, prob.score, 1800);
  scoreEl.textContent = '0%';
  const counterEnd = () => { scoreEl.textContent = prob.score + '%'; };
  setTimeout(counterEnd, 1900);

  // Level badge
  const colorMap = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--danger)' };
  const bgMap = { green: 'rgba(16,185,129,0.12)', amber: 'rgba(245,158,11,0.12)', red: 'rgba(239,68,68,0.12)' };
  levelEl.textContent = prob.level + ' Chance';
  levelEl.style.color = colorMap[prob.color];
  levelEl.style.background = bgMap[prob.color];

  // Description
  if (prob.score >= 70) {
    descEl.textContent = 'Strong interview probability. Your resume aligns well with this position. Focus on preparation.';
  } else if (prob.score >= 45) {
    descEl.textContent = 'Moderate chance. Closing skill and keyword gaps could push you into the interview zone.';
  } else {
    descEl.textContent = 'Low probability. Significant resume tailoring is needed to pass ATS screening for this role.';
  }

  // Breakdown bars
  breakdownEl.innerHTML = '';
  const factors = [
    { label: 'ATS Score',     value: results.atsScore,            weight: '35%', color: 'cyan' },
    { label: 'Skill Match',   value: results.skillMatchScore,     weight: '35%', color: 'purple' },
    { label: 'Keywords',      value: results.keywordOptimization, weight: '20%', color: 'blue' },
    { label: 'Experience',    value: results.experienceRelevance, weight: '10%', color: 'green' },
  ];
  factors.forEach(f => {
    const row = document.createElement('div');
    row.className = 'interview-factor-row';
    row.innerHTML = `
      <span class="interview-factor-label">${escapeHtml(f.label)}</span>
      <div class="interview-factor-bar-track">
        <div class="interview-factor-bar-fill ${f.color}" style="width:0%"></div>
      </div>
      <span class="interview-factor-value">${f.value}%</span>
      <span class="interview-factor-weight">\u00d7${f.weight}</span>
    `;
    breakdownEl.appendChild(row);
    setTimeout(() => {
      row.querySelector('.interview-factor-bar-fill').style.width = f.value + '%';
    }, 400);
  });
}

function renderInterviewCircle(score, color) {
  const canvas = document.getElementById('interviewCircle');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const lineWidth = 12;

  const colorMap = {
    green: { main: '#10b981', glow: 'rgba(16,185,129,0.4)' },
    amber: { main: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    red:   { main: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  };
  const c = colorMap[color] || colorMap.green;

  let currentAngle = 0;
  const targetAngle = (score / 100) * Math.PI * 2;
  const duration = 1500;
  const start = performance.now();

  function draw(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    currentAngle = targetAngle * eased;

    ctx.clearRect(0, 0, size, size);

    // Background track
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Glow
    ctx.save();
    ctx.shadowColor = c.glow;
    ctx.shadowBlur = 20;

    // Progress arc
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + currentAngle);
    ctx.strokeStyle = c.main;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    if (progress < 1) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ─── RECOMMENDED ROLES ──────────────────────────────────────────────────────
function renderRecommendedRoles(roles) {
  const grid = document.getElementById('rolesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!roles || roles.length === 0) {
    grid.innerHTML = '<div class="glass-card" style="padding:32px;text-align:center;color:var(--text-muted);grid-column:1/-1">No strong role matches detected. Add more skills to your resume.</div>';
    return;
  }

  roles.forEach((role, i) => {
    const card = document.createElement('div');
    card.className = 'glass-card role-card';
    card.style.animationDelay = `${i * 0.12}s`;

    const confClass = role.confidence >= 70 ? 'high' : role.confidence >= 45 ? 'mid' : 'low';

    card.innerHTML = `
      <div class="role-card-top">
        <span class="role-icon">${role.icon}</span>
        <div class="role-info">
          <div class="role-name">${escapeHtml(role.role)}</div>
          <div class="role-match-count">${role.matchCount}/${role.totalSkills} skills matched</div>
        </div>
        <div class="role-confidence ${confClass}">${role.confidence}%</div>
      </div>
      <div class="role-skills-row">
        ${role.matchedSkills.map(s => `<span class="role-skill-chip">${escapeHtml(s)}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── RECRUITER RISK INSIGHTS ─────────────────────────────────────────────────
function renderRecruiterRisks(risks) {
  const grid = document.getElementById('riskInsightsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!risks || risks.length === 0) {
    grid.innerHTML = '<div class="glass-card" style="padding:32px;text-align:center;color:var(--green);grid-column:1/-1">\u2705 No significant recruiter risks detected. Your resume is well-optimized!</div>';
    return;
  }

  risks.forEach((risk, i) => {
    const card = document.createElement('div');
    card.className = `risk-insight-card ${risk.severity}`;
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="risk-insight-icon">${risk.icon}</div>
      <div class="risk-insight-content">
        <div class="risk-insight-title">${escapeHtml(risk.title)}</div>
        <div class="risk-insight-desc">${escapeHtml(risk.desc)}</div>
      </div>
      <div class="risk-severity-badge ${risk.severity}">${risk.severity.toUpperCase()}</div>
    `;
    grid.appendChild(card);
  });
}

// ─── AI RESUME IMPROVEMENT LAB ───────────────────────────────────────────────
function renderImprovementLab(improvements) {
  const container = document.getElementById('improvementLab');
  if (!container) return;
  container.innerHTML = '';

  if (!improvements || improvements.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding:32px;text-align:center;color:var(--green)">\u2705 No weak bullet points detected. Your resume language is strong!</div>';
    return;
  }

  improvements.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'glass-card improvement-card';
    card.style.animationDelay = `${i * 0.12}s`;

    card.innerHTML = `
      <div class="improvement-header">
        <span class="improvement-number">#${i + 1}</span>
        <span class="improvement-badge-before">BEFORE</span>
      </div>
      <div class="improvement-original">${escapeHtml(item.original)}</div>
      <div class="improvement-arrow">\u2b07 AI Enhanced</div>
      <div class="improvement-badge-after">AFTER</div>
      <div class="improvement-improved">${escapeHtml(item.improved)}</div>
      <button class="improvement-copy-btn" onclick="copyImprovement(this, '${escapeHtml(item.improved).replace(/'/g, "\\'")}')">
        \ud83d\udccb Copy
      </button>
    `;
    container.appendChild(card);
  });
}

function copyImprovement(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '\u2705 Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ─── SKILL GAP ROADMAP ──────────────────────────────────────────────────────
function renderSkillGapRoadmap(roadmap) {
  const grid = document.getElementById('roadmapGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!roadmap || roadmap.length === 0) {
    grid.innerHTML = '<p style="color:var(--green);text-align:center;padding:24px;grid-column:1/-1">\u2705 No skill gaps detected for this role!</p>';
    return;
  }

  roadmap.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'roadmap-item';
    card.style.animationDelay = `${i * 0.08}s`;

    const priorityClass = item.priority === 'Critical' ? 'critical' : item.priority === 'High' ? 'high' : 'medium';
    const difficultyClass = item.difficulty === 'Advanced' ? 'advanced' : item.difficulty === 'Intermediate' ? 'intermediate' : 'beginner';

    card.innerHTML = `
      <div class="roadmap-rank">${i + 1}</div>
      <div class="roadmap-info">
        <div class="roadmap-skill-name">${escapeHtml(item.skill)}</div>
        <div class="roadmap-meta">
          <span class="roadmap-priority ${priorityClass}">${item.priority}</span>
          <span class="roadmap-difficulty ${difficultyClass}">${item.difficulty}</span>
          <span class="roadmap-time">\u23f1 ${item.timeWeeks} weeks</span>
          <span class="roadmap-category">${escapeHtml(item.category)}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── RESET APP ───────────────────────────────────────────────────────────────
function resetApp() {
  resumeText = '';
  window._intelligenceRendered = false;

  document.getElementById('uploadSection').style.display = '';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('fileStatus').textContent = 'No file selected';
  document.getElementById('fileStatus').className = 'file-status';
  document.getElementById('resumePreview').style.display = 'none';
  document.getElementById('resumePreview').textContent = '';
  document.getElementById('jobDescription').value = '';
  document.getElementById('charCount').textContent = '0 characters';
  document.getElementById('resumeFile').value = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── DOWNLOAD REPORT ─────────────────────────────────────────────────────────
function downloadReport() {
  if (!window._analysisResults) return;

  const r = window._analysisResults;
  const now = new Date().toLocaleDateString();

  const reportContent = `
========================================
  AI RESUME INTELLIGENCE SYSTEM
  Analysis Report — ${now}
========================================

ATS MATCH SCORE: ${r.atsScore}%
Skill Match:     ${r.skillMatchScore}%
Experience:      ${r.experienceRelevance}%
Keywords:        ${r.keywordOptimization}%
Rejection Risk:  ${r.rejectionRisk}

----------------------------------------
KEYWORD ANALYSIS
----------------------------------------
  Total JD Keywords : ${r.totalJDKeywords ?? 'N/A'}
  Matched Keywords  : ${r.matchedKeywords.length}
  Missing Keywords  : ${r.missingKeywords.length}
  Keyword Score     : ${r.keywordOptimization}%

  Top 10 Missing Keywords (by importance):
${(r.topMissingKeywords || []).map((k, i) => `    ${i + 1}. ${k}`).join('\n') || '    None — great keyword coverage!'}

----------------------------------------
MATCHED SKILLS (${r.matchedSkills.length})
----------------------------------------
${r.matchedSkills.map(s => '  ✓ ' + capitalizeSkill(s)).join('\n') || '  None detected'}

----------------------------------------
MISSING SKILLS (${r.missingSkills.length})
----------------------------------------
${r.missingSkills.map(s => '  ✗ ' + capitalizeSkill(s)).join('\n') || '  None — Great job!'}

----------------------------------------
SECTION SCORES
----------------------------------------
${Object.entries(r.sectionScores).map(([k, v]) => `  ${k.padEnd(15)}: ${v}%`).join('\n')}

----------------------------------------
RESUME SECTIONS DETECTED
----------------------------------------
${r.detectedSections ? Object.entries(r.detectedSections).map(([k, v]) => `  ${k.padEnd(15)}: ${v ? '✓ Found' : '✗ Missing'}`).join('\n') : '  N/A'}

----------------------------------------
PRECISION REWRITE LAB
----------------------------------------
${(r.priorityTargets || []).map((target, i) => `  ${i + 1}. ${capitalizeSkill(target.term)} | ${target.impact}% impact | ${target.actionZone}`).join('\n') || '  No priority targets generated'}

----------------------------------------
REWRITE BLUEPRINTS
----------------------------------------
${(r.rewriteBlueprints || []).map((blueprint, i) => `  ${i + 1}. ${blueprint.title}\n     Section: ${blueprint.section}\n     Template: ${blueprint.template}`).join('\n\n') || '  No rewrite blueprints generated'}

----------------------------------------
AI INSIGHTS
----------------------------------------
${r.insights.map((ins, i) => `  ${i + 1}. [${ins.title}] ${ins.desc}`).join('\n\n')}

----------------------------------------
RESUME STRENGTHS
----------------------------------------
${(r.strengths || []).length > 0
  ? r.strengths.map((s, i) => `  ${i + 1}. ${s.icon} ${s.title}\n     ${s.desc}`).join('\n\n')
  : '  No strengths detected — add more projects, skills, and experience.'}

----------------------------------------
IMPROVEMENT SUGGESTIONS
----------------------------------------
${r.suggestions.map((s, i) => `  ${i + 1}. ${s.text}`).join('\n\n')}

========================================
  Generated by AI Resume Intelligence System
  Local analysis only
========================================
`.trim();

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI_Resume_Report_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function capitalizeSkill(skill) {
  if (typeof window.formatSkillName === 'function') {
    return window.formatSkillName(skill);
  }

  return skill.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background: ${type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 240, 255, 0.1)'};
    border: 1px solid ${type === 'error' ? '#ef4444' : '#00f0ff'};
    color: ${type === 'error' ? '#ef4444' : '#00f0ff'};
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
    z-index: 1000;
    max-width: 320px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: fadeUp 0.3s ease;
    letter-spacing: 0.04em;
  `;
  alert.textContent = (type === 'error' ? '⚠ ' : 'ℹ ') + message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.3s ease';
    setTimeout(() => alert.remove(), 300);
  }, 3500);
}
