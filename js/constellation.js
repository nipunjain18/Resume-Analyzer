/**
 * constellation.js — Interactive Particle Constellation Hero
 * Canvas-based particle system with mouse-reactive connections,
 * orbiting motion, and color shifts between amber/indigo palette.
 */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: -9999, y: -9999, radius: 180 };
  let animId;
  let time = 0;

  // ─── CONFIG ───
  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 140;
  const MOUSE_CONNECTION_DIST = 200;
  const BASE_SPEED = 0.3;

  // Color palette
  const COLORS = [
    { r: 245, g: 158, b: 11 },   // Amber
    { r: 99, g: 102, b: 241 },   // Indigo
    { r: 16, g: 185, b: 129 },   // Emerald
    { r: 244, g: 114, b: 182 },  // Pink
    { r: 168, g: 85, b: 247 },   // Purple
  ];

  function resize() {
    const container = canvas.parentElement;
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      // Distribute in an elliptical cloud centered in the canvas
      const angle = Math.random() * Math.PI * 2;
      const radiusX = (Math.random() * 0.35 + 0.08) * width;
      const radiusY = (Math.random() * 0.35 + 0.08) * height;

      this.x = width / 2 + Math.cos(angle) * radiusX;
      this.y = height / 2 + Math.sin(angle) * radiusY;
      this.baseX = this.x;
      this.baseY = this.y;

      this.size = Math.random() * 2.5 + 0.8;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.3;

      // Orbit parameters
      this.orbitRadius = Math.random() * 30 + 10;
      this.orbitSpeed = (Math.random() - 0.5) * 0.008;
      this.orbitPhase = Math.random() * Math.PI * 2;

      // Drift
      this.vx = (Math.random() - 0.5) * BASE_SPEED;
      this.vy = (Math.random() - 0.5) * BASE_SPEED;

      // Pulse
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(t) {
      // Orbital motion around base position
      this.orbitPhase += this.orbitSpeed;
      const ox = Math.cos(this.orbitPhase) * this.orbitRadius;
      const oy = Math.sin(this.orbitPhase) * this.orbitRadius * 0.6;

      // Drift
      this.baseX += this.vx;
      this.baseY += this.vy;

      // Boundary soft-wrap
      if (this.baseX < -50 || this.baseX > width + 50 ||
          this.baseY < -50 || this.baseY > height + 50) {
        this.reset();
      }

      this.x = this.baseX + ox;
      this.y = this.baseY + oy;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x += dx * force * 0.03;
        this.y += dy * force * 0.03;
      }

      // Pulse alpha
      this.alpha = 0.3 + Math.sin(t * this.pulseSpeed + this.pulsePhase) * 0.25;
    }

    draw() {
      const { r, g, b } = this.color;
      // Glow
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
      gradient.addColorStop(0, `rgba(${r},${g},${b},${this.alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha + 0.2})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          const ci = particles[i].color;
          const cj = particles[j].color;
          const mr = (ci.r + cj.r) / 2;
          const mg = (ci.g + cj.g) / 2;
          const mb = (ci.b + cj.b) / 2;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Connection to mouse
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < MOUSE_CONNECTION_DIST) {
        const opacity = (1 - mDist / MOUSE_CONNECTION_DIST) * 0.3;
        const c = particles[i].color;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  function drawMouseGlow() {
    if (mouse.x < 0) return;
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(mouse.x - 120, mouse.y - 120, 240, 240);
  }

  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);

    drawMouseGlow();
    drawConnections();

    particles.forEach(p => {
      p.update(time);
      p.draw();
    });

    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
    animate();
  }

  // ─── Event listeners ───
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    // Re-distribute particles on major resize
    particles.forEach(p => p.reset());
  });

  // ─── Public API for analysis pulse ───
  window.triggerConstellationPulse = function () {
    particles.forEach(p => {
      p.orbitSpeed *= 3;
      p.pulseSpeed *= 2;
    });
  };

  window.stopConstellationPulse = function () {
    particles.forEach(p => {
      p.orbitSpeed /= 3;
      p.pulseSpeed /= 2;
    });
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
