/**
 * neural-network.js — Three.js 3D Neural Network Visualization
 * Animated glowing nodes with connecting lines in 3D space
 */
(function () {
  const container = document.getElementById('hero3d');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ─── NODES ───
  const NODE_COUNT = 60;
  const SPREAD = 20;
  const nodes = [];
  const nodePositions = [];

  const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);

  const colors = [
    new THREE.Color(0x00f0ff), // cyan
    new THREE.Color(0xa855f7), // purple
    new THREE.Color(0x3b82f6), // blue
    new THREE.Color(0x10b981), // green
    new THREE.Color(0xec4899), // pink
  ];

  for (let i = 0; i < NODE_COUNT; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: color });
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

    node.position.x = (Math.random() - 0.5) * SPREAD;
    node.position.y = (Math.random() - 0.5) * SPREAD;
    node.position.z = (Math.random() - 0.5) * SPREAD;

    node.userData = {
      baseX: node.position.x,
      baseY: node.position.y,
      baseZ: node.position.z,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      amplitude: 0.3 + Math.random() * 0.5,
    };

    scene.add(node);
    nodes.push(node);
    nodePositions.push(node.position);
  }

  // ─── GLOW SPRITES ───
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const glowCtx = glowCanvas.getContext('2d');
  const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
  gradient.addColorStop(0.4, 'rgba(0, 240, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
  glowCtx.fillStyle = gradient;
  glowCtx.fillRect(0, 0, 64, 64);

  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  nodes.forEach(node => {
    const sprite = new THREE.Sprite(glowMaterial.clone());
    sprite.scale.set(1.5, 1.5, 1);
    sprite.material.color = node.material.color.clone();
    node.add(sprite);
  });

  // ─── CONNECTION LINES ───
  const CONNECTION_DIST = 6;
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
  });

  let linesGeometry = new THREE.BufferGeometry();
  let lines = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lines);

  function updateConnections() {
    const positions = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < CONNECTION_DIST) {
          positions.push(
            nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
            nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
          );
        }
      }
    }

    scene.remove(lines);
    linesGeometry.dispose();
    linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);
  }

  // ─── ANIMATION LOOP ───
  let time = 0;

  function animate() {
    time += 0.01;

    // Animate nodes
    nodes.forEach(node => {
      const d = node.userData;
      node.position.x = d.baseX + Math.sin(time * d.speed + d.phase) * d.amplitude;
      node.position.y = d.baseY + Math.cos(time * d.speed * 0.7 + d.phase) * d.amplitude;
      node.position.z = d.baseZ + Math.sin(time * d.speed * 0.5 + d.phase * 2) * d.amplitude * 0.5;

      // Pulse scale
      const pulse = 1 + Math.sin(time * 2 + d.phase) * 0.3;
      node.scale.setScalar(pulse);
    });

    // Slow rotation of entire scene
    scene.rotation.y = time * 0.1;
    scene.rotation.x = Math.sin(time * 0.05) * 0.1;

    // Update connections periodically
    if (Math.floor(time * 100) % 5 === 0) {
      updateConnections();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // ─── RESIZE ───
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  // Initialize
  updateConnections();
  animate();
})();
