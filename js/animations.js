/**
 * animations.js — GSAP Animations, Scanner, Card Tilt
 * Powered by GSAP + ScrollTrigger for immersive futuristic animations
 */

// ═══════════════════════════════════════════════════
// 1. GSAP DASHBOARD ENTRANCE ANIMATIONS
// ═══════════════════════════════════════════════════

function animateDashboardEntrance() {
  gsap.registerPlugin(ScrollTrigger);

  // Stagger all score metric cards
  gsap.from('.metric-card', {
    y: 60,
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.4)',
    delay: 0.2,
  });

  // Dashboard header
  gsap.from('.dash-header', {
    y: 40,
    opacity: 0,
    filter: 'blur(8px)',
    duration: 1,
    ease: 'power3.out',
  });

  // Chart cards
  gsap.from('.chart-card', {
    y: 50,
    opacity: 0,
    scale: 0.95,
    filter: 'blur(8px)',
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.5,
  });
}

// ═══════════════════════════════════════════════════
// 2. SKILL TAG ANIMATIONS
// ═══════════════════════════════════════════════════

function animateSkillTags() {
  gsap.fromTo('.skill-tag', {
    x: -18,
    opacity: 0,
  }, {
    x: 0,
    opacity: 1,
    duration: 0.28,
    stagger: 0.02,
    ease: 'power2.out',
    clearProps: 'transform,opacity,filter',
  });
}

function animateKeywordTags() {
  gsap.from('.kw-tag', {
    scale: 0,
    opacity: 0,
    rotation: -10,
    duration: 0.4,
    stagger: 0.03,
    ease: 'back.out(2)',
  });
}

// ═══════════════════════════════════════════════════
// 3. INSIGHT & SUGGESTION CARD ANIMATIONS
// ═══════════════════════════════════════════════════

function animateInsightCards() {
  gsap.fromTo('.insight-card', {
    y: 28,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power3.out',
    clearProps: 'transform,opacity,filter',
  });
}

function animateSuggestionCards() {
  gsap.fromTo('.suggestion-card', {
    y: 28,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power3.out',
    clearProps: 'transform,opacity,filter',
  });
}

function animateSkillProgressBars() {
  gsap.from('.skill-progress-item', {
    x: -40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.06,
    ease: 'power3.out',
  });
}

function animateRewriteLab() {
  gsap.fromTo('.priority-target, .rewrite-blueprint-card', {
    y: 24,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.06,
    ease: 'power3.out',
    clearProps: 'transform,opacity,filter',
  });
}

// ═══════════════════════════════════════════════════
// 3.5  INTELLIGENCE PANEL ANIMATIONS
// ═══════════════════════════════════════════════════

function animateIntelligencePanel() {
  // Interview probability card
  gsap.fromTo('.interview-prob-card', {
    y: 40, opacity: 0, scale: 0.95,
  }, {
    y: 0, opacity: 1, scale: 1,
    duration: 0.8, ease: 'back.out(1.2)',
  });

  // Role cards
  gsap.fromTo('.role-card', {
    y: 30, opacity: 0, scale: 0.92,
  }, {
    y: 0, opacity: 1, scale: 1,
    duration: 0.6, stagger: 0.1,
    ease: 'back.out(1.4)', delay: 0.2,
    clearProps: 'transform,opacity',
  });

  // Risk insight cards
  gsap.fromTo('.risk-insight-card', {
    x: -30, opacity: 0,
  }, {
    x: 0, opacity: 1,
    duration: 0.5, stagger: 0.08,
    ease: 'power3.out', delay: 0.3,
    clearProps: 'transform,opacity',
  });

  // Improvement cards
  gsap.fromTo('.improvement-card', {
    y: 24, opacity: 0,
  }, {
    y: 0, opacity: 1,
    duration: 0.55, stagger: 0.1,
    ease: 'power3.out', delay: 0.4,
    clearProps: 'transform,opacity',
  });

  // Roadmap items
  gsap.fromTo('.roadmap-item', {
    x: -20, opacity: 0,
  }, {
    x: 0, opacity: 1,
    duration: 0.4, stagger: 0.06,
    ease: 'power2.out', delay: 0.5,
    clearProps: 'transform,opacity',
  });
}

// ═══════════════════════════════════════════════════
// 4. CARD TILT + MAGNETIC HOVER
// ═══════════════════════════════════════════════════

function initCardTilt() {
  const tiltCards = document.querySelectorAll('.upload-card, .jd-card, .chart-card, .metric-card');
  const maxTilt = 3;

  tiltCards.forEach(card => {
    if (card.dataset.tiltBound === 'true') return;
    card.dataset.tiltBound = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (0.5 - y) * maxTilt;
      const tiltY = (x - 0.5) * maxTilt;

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ═══════════════════════════════════════════════════
// 5. AI SCANNING ANIMATION
// ═══════════════════════════════════════════════════

function showScanner() {
  const overlay = document.getElementById('scannerOverlay');
  if (overlay) overlay.classList.add('active');

  document.querySelectorAll('.scanner-step').forEach(step => {
    step.className = 'scanner-step';
  });

  // Reset progress bar
  const progressFill = document.getElementById('scannerProgressFill');
  if (progressFill) progressFill.style.width = '0%';

  // Reset console
  const consoleBody = document.getElementById('consoleBody');
  if (consoleBody) consoleBody.innerHTML = '';
}

function hideScanner() {
  const overlay = document.getElementById('scannerOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Hacker console log messages
const CONSOLE_LOGS = [
  { text: '> Initializing AI_INTEL_ENGINE v4.0...', cls: 'console-prefix' },
  { text: '> Loading NLP tokenizer...', cls: 'console-info' },
  { text: '> Parsing resume structure [PDF → text]...', cls: 'console-info' },
  { text: '> Detected resume sections: EXPERIENCE, EDUCATION, SKILLS, PROJECTS', cls: 'console-success' },
  { text: '> Extracting skill entities from resume...', cls: 'console-info' },
  { text: '> Running skill normalization: node.js → node, react.js → react', cls: 'console-warn' },
  { text: '> Tokenizing job description (bigram + trigram)...', cls: 'console-info' },
  { text: '> Cross-referencing SKILLS_DATABASE (7 categories, 180+ terms)...', cls: 'console-info' },
  { text: '> Skill match analysis complete ✓', cls: 'console-success' },
  { text: '> Computing keyword overlap ratio...', cls: 'console-info' },
  { text: '> Calculating weighted ATS score [40/25/20/10/5]...', cls: 'console-warn' },
  { text: '> Scoring: skills=0.40w  keywords=0.25w  experience=0.20w', cls: 'console-info' },
  { text: '> Scoring: content=0.10w  completeness=0.05w', cls: 'console-info' },
  { text: '> Building priority injection targets...', cls: 'console-info' },
  { text: '> Generating rewrite blueprints...', cls: 'console-info' },
  { text: '> Running recruiter insight heuristics...', cls: 'console-info' },
  { text: '> Compiling final analysis report...', cls: 'console-success' },
  { text: '> ████████████████████████████████ 100% COMPLETE', cls: 'console-success' },
];

function appendConsoleLine(text, cls) {
  const body = document.getElementById('consoleBody');
  if (!body) return;
  const line = document.createElement('div');
  line.className = 'console-line';
  line.innerHTML = `<span class="${cls}">${text}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

async function runScannerSteps() {
  const steps = document.querySelectorAll('.scanner-step');
  const progressFill = document.getElementById('scannerProgressFill');
  const delays = [600, 500, 700, 500, 400];
  const totalSteps = steps.length;

  // Start console logs in parallel
  let logIdx = 0;
  const logInterval = setInterval(() => {
    if (logIdx < CONSOLE_LOGS.length) {
      appendConsoleLine(CONSOLE_LOGS[logIdx].text, CONSOLE_LOGS[logIdx].cls);
      logIdx++;
    } else {
      clearInterval(logInterval);
    }
  }, 180);

  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delays[i]));

    if (i > 0) {
      steps[i - 1].classList.remove('active');
      steps[i - 1].classList.add('done');
      steps[i - 1].textContent = '✓ ' + steps[i - 1].textContent.replace(/^[◈✓]\s*/, '');
    }

    steps[i].classList.add('active');

    // Update progress bar
    if (progressFill) {
      progressFill.style.width = ((i + 1) / totalSteps * 100) + '%';
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  const last = steps[steps.length - 1];
  last.classList.remove('active');
  last.classList.add('done');
  last.textContent = '✓ ' + last.textContent.replace(/^[◈✓]\s*/, '');

  if (progressFill) progressFill.style.width = '100%';

  // Ensure all console logs finish
  clearInterval(logInterval);
  while (logIdx < CONSOLE_LOGS.length) {
    appendConsoleLine(CONSOLE_LOGS[logIdx].text, CONSOLE_LOGS[logIdx].cls);
    logIdx++;
  }
}

// ═══════════════════════════════════════════════════
// 6. ANIMATED NUMBER COUNTER
// ═══════════════════════════════════════════════════

function animateCounter(el, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════════
// 6. SECTION SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Animate section headers on scroll
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.from(header, {
      y: 40,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

// ═══════════════════════════════════════════════════
// 7. INITIALIZATION
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initCardTilt(), 500);

  // Re-init tilt when dashboard becomes visible
  const dashboardObserver = new MutationObserver(() => {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.style.display !== 'none') {
      setTimeout(() => {
        initCardTilt();
        initScrollAnimations();
      }, 300);
    }
  });

  dashboardObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });
});
