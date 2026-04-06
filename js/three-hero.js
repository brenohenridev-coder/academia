/**
 * TITAN FITNESS — Three.js Hero v3
 * Efeito ambiente sutil — sem blinding glow
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Paleta lima — partículas mais escassas agora
  const PALETTE = [
    { r: 0.725, g: 1.000, b: 0.016 }, // #B9FF04
    { r: 0.588, g: 0.831, b: 0.000 }, // #96D400
    { r: 0.831, g: 1.000, b: 0.314 }, // #D4FF50
    { r: 0.940, g: 1.000, b: 0.720 }, // lima pálido
    { r: 1.000, g: 1.000, b: 1.000 }, // branco pontual
  ];

  // *** REDUZIDO de 9000 → 2200 ***
  const COUNT = 2200;
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const sizes     = new Float32Array(COUNT);
  const randoms   = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const t = Math.random();

    if (t < 0.35) {
      // Espiral
      const turns  = 5 + Math.random() * 4;
      const theta  = Math.random() * Math.PI * 2 * turns;
      const tNorm  = theta / (Math.PI * 2 * turns);
      const radius = 1.0 + tNorm * 2.2 + (Math.random() - 0.5) * 0.3;
      positions[i * 3]     = Math.cos(theta) * radius;
      positions[i * 3 + 1] = tNorm * 7.0 - 3.5 + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    } else if (t < 0.70) {
      // Nuvem dispersa
      const r     = Math.pow(Math.random(), 0.4) * 4.5;
      const th    = Math.random() * Math.PI * 2;
      const ph    = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.cos(ph) * 0.4;
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    } else {
      // Anel
      const th2 = Math.random() * Math.PI * 2;
      const ph2 = Math.random() * Math.PI * 2;
      const R = 2.8, r2 = 0.4 + Math.random() * 0.4;
      positions[i * 3]     = (R + r2 * Math.cos(ph2)) * Math.cos(th2);
      positions[i * 3 + 1] = r2 * Math.sin(ph2) * 0.28;
      positions[i * 3 + 2] = (R + r2 * Math.cos(ph2)) * Math.sin(th2);
    }

    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i]   = 0.4 + Math.random() * 1.8;
    randoms[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors,    3));
  geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1));
  geometry.setAttribute('aRandom',  new THREE.BufferAttribute(randoms,   1));

  const vertexShader = /* glsl */`
    attribute vec3  aColor;
    attribute float aSize;
    attribute float aRandom;
    uniform float   uTime;
    uniform float   uPixelRatio;
    varying vec3    vColor;
    varying float   vAlpha;

    void main() {
      vColor = aColor;
      vec3 pos = position;
      pos.y += sin(uTime * 0.5 + pos.x * 0.7 + aRandom) * 0.18;
      pos.y += cos(uTime * 0.35 + pos.z * 0.5 + aRandom) * 0.11;
      float pulse = 1.0 + sin(uTime * 0.36 + aRandom) * 0.022;
      pos.x *= pulse;
      pos.z *= pulse;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * uPixelRatio * (260.0 / -mv.z);
      gl_Position  = projectionMatrix * mv;
      vAlpha = clamp(1.0 - length(position) / 6.5, 0.05, 1.0);
    }
  `;

  // *** ALPHA MÁXIMO REDUZIDO: 0.9 → 0.38 ***
  const fragmentShader = /* glsl */`
    varying vec3  vColor;
    varying float vAlpha;

    void main() {
      vec2  uv   = gl_PointCoord - 0.5;
      float dist = length(uv);
      if (dist > 0.5) discard;
      float core = 1.0 - smoothstep(0.0, 0.22, dist);
      float halo = 1.0 - smoothstep(0.1, 0.5,  dist);
      float alpha = (core * 0.65 + halo * 0.25) * vAlpha * 0.38;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime:       { value: 0.0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    transparent: true,
    depthWrite:  false,
    // *** TROCADO AdditiveBlending → NormalBlending ***
    // Additive soma luz de todas as partículas → cria branco cegante
    // Normal blend preserva opacidade individual sem acumular
    blending:    THREE.NormalBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Icosaedro wireframe — lima muito sutil
  const geoIco = new THREE.IcosahedronGeometry(0.85, 1);
  const matIco = new THREE.MeshBasicMaterial({
    color: 0x96D400, wireframe: true, transparent: true, opacity: 0.07,
  });
  const ico = new THREE.Mesh(geoIco, matIco);
  scene.add(ico);

  // Anel externo
  const geoRing = new THREE.TorusGeometry(2.85, 0.016, 4, 90);
  const matRing = new THREE.MeshBasicMaterial({
    color: 0xB9FF04, transparent: true, opacity: 0.05,
  });
  const ring = new THREE.Mesh(geoRing, matRing);
  ring.rotation.x = Math.PI * 0.38;
  scene.add(ring);

  // Mouse parallax
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 1.2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.9;
  });
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      mouseX = (e.touches[0].clientX / window.innerWidth  - 0.5) * 1.2;
      mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.9;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  let heroVisible = true;
  const heroEl = document.getElementById('home');
  if (heroEl) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 })
      .observe(heroEl);
  }

  const clock = new THREE.Clock();
  let frameId;

  function animate() {
    frameId = requestAnimationFrame(animate);
    if (!heroVisible) return;
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;
    camera.position.x = targetX * 0.55;
    camera.position.y = -targetY * 0.35;
    camera.lookAt(scene.position);
    particles.rotation.y = t * 0.05;
    particles.rotation.x = Math.sin(t * 0.09) * 0.06;
    ico.rotation.y = t * 0.24;
    ico.rotation.x = t * 0.15;
    ico.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    ring.rotation.z = t * 0.04;
    ring.rotation.y = t * 0.025;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
    [geometry, material, geoIco, matIco, geoRing, matRing].forEach(o => o.dispose());
  });
})();
