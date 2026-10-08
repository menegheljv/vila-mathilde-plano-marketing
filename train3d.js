/* Trem 3D da capa e do fechamento. Usa three.js (global THREE). */
(function () {
  if (!window.THREE) return;
  var W = 1280, H = 640, BG = 0x14291c;
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  var canvas = renderer.domElement;
  canvas.style.cssText = 'width:100%;height:100%;display:block';

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 16, 44);
  var cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1b3a28, 0.95));
  var sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(-6, 10, 9); scene.add(sun);
  var rim = new THREE.DirectionalLight(0x9fd4a4, 0.55); rim.position.set(9, 3, -6); scene.add(rim);

  function M(c, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.15 }, o || {})); }
  var mat = {
    green: M(0x6fb27c), cream: M(0xffffff), dark: M(0x0e2217, { roughness: 0.7 }),
    brass: M(0xc8323c, { metalness: 0.6, roughness: 0.35 }), steel: M(0xe9efe6, { metalness: 0.7, roughness: 0.3 }),
    wood: M(0xc8323c, { roughness: 0.9 }), roof: M(0x2f5d3a), glass: M(0x0b1f14, { roughness: 0.2, metalness: 0.4 }),
    light: M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.9 })
  };

  function box(w, h, d, m, x, y, z, p) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); (p || train).add(o); return o; }
  function cylX(rt, rb, h, m, x, y, z, p, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 40), m); o.rotation.z = Math.PI / 2; o.position.set(x, y, z); (p || train).add(o); return o; }
  function cylY(rt, rb, h, m, x, y, z, p) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32), m); o.position.set(x, y, z); (p || train).add(o); return o; }

  var train = new THREE.Group(); scene.add(train);

  /* corpo da locomotiva */
  box(6.0, 0.28, 1.3, mat.dark, 0, 0.95, 0);
  cylX(0.78, 0.78, 3.6, mat.green, 0.9, 1.95, 0);
  cylX(0.8, 0.8, 0.65, mat.dark, 3.02, 1.95, 0);
  cylX(0.72, 0.72, 0.06, mat.steel, 3.37, 1.95, 0);
  var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), mat.light); lamp.position.set(3.42, 1.95, 0); train.add(lamp);
  cylY(0.2, 0.23, 0.8, mat.dark, 2.9, 3.15, 0);
  cylY(0.38, 0.2, 0.28, mat.dark, 2.9, 3.65, 0);
  var dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.brass); dome.position.set(1.25, 2.7, 0); train.add(dome);
  var sand = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.brass); sand.position.set(0.15, 2.7, 0); train.add(sand);
  [-0.4, 0.9, 2.2].forEach(function (x) { cylX(0.8, 0.8, 0.08, mat.brass, x, 1.95, 0); });
  /* cabine */
  box(1.8, 1.9, 1.7, mat.cream, -2.0, 2.05, 0);
  box(2.1, 0.14, 2.0, mat.roof, -2.0, 3.07, 0);
  [-1, 1].forEach(function (s) { box(0.6, 0.55, 0.04, mat.glass, -2.0, 2.45, s * 0.86); box(0.5, 0.5, 0.04, mat.glass, -1.2 - 0.2, 2.45, s * 0.86); });
  /* limpa-trilhos */
  var pilot = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.1, 4), mat.dark); pilot.rotation.z = -Math.PI / 2; pilot.rotation.x = Math.PI / 4; pilot.position.set(3.85, 0.8, 0); train.add(pilot);
  /* cilindros de vapor */
  [-1, 1].forEach(function (s) { cylX(0.16, 0.16, 0.8, mat.steel, 2.4, 1.0, s * 0.9); });
  /* tender */
  box(2.4, 0.2, 1.3, mat.dark, -4.6, 0.95, 0);
  box(2.4, 1.2, 1.6, mat.roof, -4.6, 1.65, 0);
  var coal = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat.dark); coal.scale.set(1.35, 0.55, 0.95); coal.position.set(-4.6, 2.25, 0); train.add(coal);
  box(0.9, 0.08, 0.08, mat.steel, -3.2, 1.0, 0);

  /* rodas */
  var wheels = [];
  function makeWheel(r, x, z, y) {
    var g = new THREE.Group(); g.position.set(x, y, z);
    var tire = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 12, 40), mat.steel); g.add(tire);
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.04, r - 0.04, 0.07, 40), mat.dark); disc.rotation.x = Math.PI / 2; g.add(disc);
    for (var i = 0; i < 6; i++) { var sp = new THREE.Mesh(new THREE.BoxGeometry(2 * (r - 0.06), 0.07, 0.1), mat.steel); sp.rotation.z = i * Math.PI / 6; g.add(sp); }
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 20), mat.brass); hub.rotation.x = Math.PI / 2; g.add(hub);
    train.add(g); wheels.push({ g: g, r: r, ph: z > 0 ? 0 : Math.PI / 2 }); return g;
  }
  var DR = 0.62, ZS = 0.74;
  var near = [], far = [];
  [-0.9, 0.35, 1.6].forEach(function (x) { near.push(makeWheel(DR, x, ZS, DR)); far.push(makeWheel(DR, x, -ZS, DR)); });
  [-5.1, -4.1].forEach(function (x) { makeWheel(0.4, x, ZS, 0.4); makeWheel(0.4, x, -ZS, 0.4); });
  var rodN = box(1.25 * 1 + 0.2, 0.09, 0.07, mat.steel, 0, 0, ZS + 0.12);
  var rodF = box(1.25 + 0.2, 0.09, 0.07, mat.steel, 0, 0, -ZS - 0.12);
  var rodNL = box(1.25 + 0.2, 0.09, 0.07, mat.steel, 0, 0, ZS + 0.12);
  var rodFL = box(1.25 + 0.2, 0.09, 0.07, mat.steel, 0, 0, -ZS - 0.12);

  train.scale.setScalar(0.8);

  /* trilhos */
  var track = new THREE.Group(); scene.add(track);
  [-1, 1].forEach(function (s) { var rl = new THREE.Mesh(new THREE.BoxGeometry(90, 0.1, 0.12), mat.steel); rl.position.set(0, -0.05, s * ZS * 0.8); track.add(rl); });
  for (var i = -45; i <= 45; i += 0.95) { var sl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 2.3), mat.wood); sl.position.set(i, -0.15, 0); track.add(sl); }
  /* os trilhos acompanham a escala do trem: bitola 0.8 */

  /* fumaça */
  var cv = document.createElement('canvas'); cv.width = cv.height = 64;
  var cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 2, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
  var tex = new THREE.CanvasTexture(cv), puffs = [];
  for (var k = 0; k < 18; k++) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: 0xe9efe6, opacity: 0 }));
    scene.add(sp); puffs.push({ s: sp, o: k / 18, z: (Math.random() - 0.5) * 0.4 });
  }

  var START = -24, FINAL = 4.2, T_ARRIVE = 5.4, t0 = 0, raf = 0, host = null, mx = 0, lastX = START;
  window.addEventListener('mousemove', function (e) { mx = (e.clientX / innerWidth - 0.5) * 2; });
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var t = (now - t0) / 1000, p = Math.min(t / T_ARRIVE, 1);
    var x = START + (FINAL - START) * ease(p);
    train.position.set(x, 0, 0);
    var moving = p < 1, speed = moving ? Math.max(0.15, 1 - ease(p) * 0.0) : 0;
    wheels.forEach(function (w) { w.g.rotation.z = -(x / (w.r * 0.8)) + w.ph; });
    /* bielas seguem o pino da roda do meio */
    function rod(rodMesh, wheelGroup, w, sgn) {
      var th = wheelGroup.rotation.z, rr = 0.34;
      var lx = wheelGroup.position.x + Math.cos(th) * rr, ly = wheelGroup.position.y + Math.sin(th) * rr;
      rodMesh.position.set(lx, ly, wheelGroup.position.z + sgn * 0.12);
    }
    rod(rodN, near[1], 0, 1); rod(rodF, far[1], 0, -1);
    rodNL.position.copy(rodN.position); rodFL.position.copy(rodF.position);
    rodNL.visible = rodFL.visible = false;
    /* fumaça */
    var drift = moving ? 1 : 0.35;
    var chim = new THREE.Vector3(2.9, 3.85, 0).multiplyScalar(0.8).add(train.position);
    puffs.forEach(function (q) {
      var a = ((t * (moving ? 0.55 : 0.28)) + q.o) % 1;
      q.s.position.set(chim.x - a * 4.2 * drift, chim.y + a * 2.2, q.z);
      var sc = (0.5 + a * 2.4); q.s.scale.set(sc, sc, 1);
      q.s.material.opacity = 0.55 * Math.pow(1 - a, 1.4);
    });
    /* câmera */
    var sway = Math.sin(t * 0.22) * 0.9;
    cam.position.set(8.4 + sway + mx * 0.8, 3.0 + Math.sin(t * 0.18) * 0.15, 13.6);
    cam.lookAt(3.0, 2.5, 0);
    renderer.render(scene, cam);
  }

  window.T3 = {
    show: function (slide, isCover) {
      if (!isCover) { if (raf) cancelAnimationFrame(raf); raf = 0; if (canvas.parentNode) canvas.parentNode.removeChild(canvas); return; }
      host = slide.querySelector('.stage3d'); if (!host) return;
      host.appendChild(canvas);
      document.body.classList.add('has3d');
      if (raf) cancelAnimationFrame(raf);
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    }
  };
  document.body.classList.add('has3d');
})();
