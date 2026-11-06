// Shared Sky 3D aircraft models (display only). Smooth lathe fuselages, bevelled extruded wings, tube booms,
// motor pods, translucent motion-blur rotor discs and nav lights. Unit: wingspan about 1; x forward, y up, z right.
// Each model returns { body, disc, lights } BufferGeometries with vertex colours (body/lights) and uvs (disc).
var SKY3D = (function () {
  function Kit() { this.b = []; this.d = []; this.l = []; }
  Kit.prototype.add = function (list, g, col, pos, rot, scl) {
    g = g.index ? g.toNonIndexed() : g.clone(); var m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0, 'YZX'));
    m.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q, new THREE.Vector3(scl ? scl[0] : 1, scl ? scl[1] : 1, scl ? scl[2] : 1)); g.applyMatrix4(m);
    if (!g.attributes.normal) g.computeVertexNormals(); list.push([g, col]); return this; };
  Kit.prototype.body = function (g, c, p, r, s) { return this.add(this.b, g, c, p, r, s); };
  Kit.prototype.disc = function (rad, p, r) { var g = new THREE.CircleGeometry(rad, 24); g.rotateX(-Math.PI / 2); return this.add(this.d, g, [1, 1, 1], p, r); };
  Kit.prototype.light = function (c, p, rad) { return this.add(this.l, new THREE.SphereGeometry(rad || 0.018, 8, 6), c, p); };
  // smooth body of revolution along +x: prof = [[x, radius], ...] from tail to nose
  Kit.prototype.lathe = function (prof, c, p, s) { var pts = prof.map(function (q) { return new THREE.Vector2(Math.max(0.0005, q[1]), q[0]); }), g = new THREE.LatheGeometry(pts, 20); g.rotateZ(-Math.PI / 2); return this.body(g, c, p, null, s); };
  // tapered, swept wing with rounded (bevelled) edges, lying flat; span along z
  Kit.prototype.wing = function (span, rc, tc, sweep, th, c, p, rot) { var h = span / 2, sh = new THREE.Shape();
    sh.moveTo(rc / 2, 0); sh.lineTo(rc / 2 - sweep, h - tc * 0.3); sh.quadraticCurveTo(rc / 2 - sweep - tc * 0.1, h, rc / 2 - sweep - tc * 0.55, h); sh.lineTo(rc / 2 - sweep - tc, h - tc * 0.15);
    sh.lineTo(-rc / 2, 0); sh.lineTo(rc / 2 - sweep - tc, -h + tc * 0.15); sh.lineTo(rc / 2 - sweep - tc * 0.55, -h); sh.quadraticCurveTo(rc / 2 - sweep - tc * 0.1, -h, rc / 2 - sweep, -h + tc * 0.3); sh.lineTo(rc / 2, 0);
    var g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: true, bevelThickness: th * 0.6, bevelSize: th * 0.7, bevelSegments: 3, curveSegments: 8 }); g.rotateX(Math.PI / 2); g.translate(0, th / 2, 0); return this.body(g, c, p, rot); };
  Kit.prototype.tube = function (a, b, r, c) { var A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), L = A.distanceTo(B), g = new THREE.CylinderGeometry(r, r, L, 10, 1);
    var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); var mid = A.add(B).multiplyScalar(0.5); g.translate(mid.x, mid.y, mid.z);
    this.b.push([g.toNonIndexed(), c]); var s1 = new THREE.SphereGeometry(r, 10, 6); s1.translate(a[0], a[1], a[2]); this.b.push([s1.toNonIndexed(), c]); var s2 = new THREE.SphereGeometry(r, 10, 6); s2.translate(b[0], b[1], b[2]); this.b.push([s2.toNonIndexed(), c]); return this; };
  Kit.prototype.motor = function (p, r, h, c) { var g = new THREE.CylinderGeometry(r * 0.8, r, h, 12); return this.body(g, c, p); };
  function merge(list, withUv) { var pos = [], nor = [], col = [], uv = [];
    list.forEach(function (it) { var g = it[0], c = it[1], P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : null;
      for (var i = 0; i < P.length; i++) { pos.push(P[i]); nor.push(N[i]); } for (var j = 0; j < P.length / 3; j++) { col.push(c[0], c[1], c[2]); if (withUv) { uv.push(U ? U[j * 2] : 0, U ? U[j * 2 + 1] : 0); } } });
    var G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); if (withUv) G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return G; }
  Kit.prototype.done = function () { return { body: merge(this.b), disc: merge(this.d, true), lights: merge(this.l) }; };
  function k(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }
  var RED = [1, 0.18, 0.18], GRN = [0.25, 1, 0.5], WHT = [1, 1, 1], GLASS = [0.05, 0.08, 0.13], MET = [0.55, 0.6, 0.68];
  // Wing (Alphabet): high wing, two long booms with 12 small lift rotors, twin tail fins
  function wing(c) { var K = new Kit(), dk = k(c, 0.55);
    K.lathe([[-0.24, 0.0], [-0.2, 0.03], [-0.05, 0.055], [0.12, 0.055], [0.22, 0.035], [0.26, 0.0]], c, [0, 0, 0], [1, 0.9, 1]);
    K.wing(1.0, 0.16, 0.09, 0.03, 0.012, c, [0.04, 0.045, 0]);
    [-0.2, 0.2].forEach(function (z) { K.tube([-0.46, 0.035, z], [0.42, 0.035, z], 0.014, dk);
      for (var i = 0; i < 6; i++) { var x = -0.4 + i * 0.16; if (Math.abs(x - 0.04) < 0.05) continue; K.motor([x, 0.055, z], 0.016, 0.03, MET); K.disc(0.07, [x, 0.074, z]); }
      K.wing(0.12, 0.09, 0.05, 0.03, 0.008, c, [-0.42, 0.09, z], [Math.PI / 2, 0, 0]); });
    K.light(RED, [0.06, 0.05, -0.5]); K.light(GRN, [0.06, 0.05, 0.5]); K.light(WHT, [-0.47, 0.06, 0], 0.014); return K.done(); }
  // Zipline P2: long fuselage, straight wing, V-tail, four lift rotors on booms, pusher prop
  function zip(c) { var K = new Kit(), dk = k(c, 0.55);
    K.lathe([[-0.38, 0.0], [-0.34, 0.025], [-0.15, 0.06], [0.2, 0.065], [0.33, 0.045], [0.4, 0.0]], c, [0, 0, 0], [1, 0.95, 1]);
    K.lathe([[0.18, 0.0], [0.23, 0.035], [0.31, 0.03], [0.36, 0.0]], GLASS, [0, 0.035, 0], [1, 0.6, 0.8]);
    K.wing(1.08, 0.15, 0.1, 0.02, 0.013, c, [0.06, 0.05, 0]);
    K.wing(0.2, 0.09, 0.05, 0.04, 0.008, c, [-0.32, 0.1, 0.08], [0.6, 0, 0]); K.wing(0.2, 0.09, 0.05, 0.04, 0.008, c, [-0.32, 0.1, -0.08], [-0.6, 0, 0]);
    [-0.27, 0.27].forEach(function (z) { K.tube([-0.3, 0.04, z], [0.36, 0.04, z], 0.015, dk); [-0.3, 0.36].forEach(function (x) { K.motor([x, 0.06, z], 0.02, 0.035, MET); K.disc(0.1, [x, 0.08, z]); }); });
    K.disc(0.08, [-0.42, 0, 0], [0, 0, Math.PI / 2]);
    K.light(RED, [0.06, 0.06, -0.55]); K.light(GRN, [0.06, 0.06, 0.55]); K.light(WHT, [-0.38, 0.03, 0], 0.014); return K.done(); }
  // Amazon MK30: compact pod inside a hexagonal shroud with six rotors
  function amz(c) { var K = new Kit(), dk = k(c, 0.6);
    K.lathe([[-0.17, 0.0], [-0.12, 0.06], [0.04, 0.09], [0.14, 0.06], [0.19, 0.0]], c, [0, 0, 0], [1, 0.85, 1]);
    K.lathe([[0.06, 0.0], [0.1, 0.045], [0.15, 0.03], [0.18, 0.0]], GLASS, [0, 0.04, 0], [1, 0.7, 0.9]);
    var ring = new THREE.TorusGeometry(0.5, 0.028, 8, 6); ring.rotateX(Math.PI / 2); ring.rotateY(Math.PI / 6); K.body(ring, c, [0, 0.02, 0], null, [1, 1.6, 1]);
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2, x = Math.cos(a) * 0.31, z = Math.sin(a) * 0.31; K.tube([Math.cos(a) * 0.08, 0.02, Math.sin(a) * 0.08], [Math.cos(a) * 0.46, 0.02, Math.sin(a) * 0.46], 0.011, dk);
      K.motor([x, 0.04, z], 0.022, 0.035, MET); K.disc(0.13, [x, 0.062, z]); }
    K.light(WHT, [0.2, 0.03, 0], 0.016); K.light(RED, [0, 0.04, -0.52]); K.light(GRN, [0, 0.04, 0.52]); return K.done(); }
  // Air taxi (Joby-style tilt-rotor): cabin fuselage with glass canopy, wing with four nacelles, V-tail with two
  function evtol(c) { var K = new Kit(), dk = k(c, 0.5);
    K.lathe([[-0.34, 0.0], [-0.3, 0.025], [-0.12, 0.07], [0.12, 0.085], [0.25, 0.07], [0.32, 0.035], [0.35, 0.0]], c, [0, 0, 0], [1, 0.85, 0.9]);
    K.lathe([[0.08, 0.0], [0.14, 0.055], [0.26, 0.045], [0.32, 0.0]], GLASS, [0, 0.035, 0], [1, 0.7, 0.85]);
    K.wing(1.0, 0.13, 0.08, 0.01, 0.014, c, [0.03, 0.06, 0], [0, 0, 0]);
    K.wing(0.3, 0.09, 0.06, 0.04, 0.01, c, [-0.28, 0.12, 0.12], [0.5, 0, 0]); K.wing(0.3, 0.09, 0.06, 0.04, 0.01, c, [-0.28, 0.12, -0.12], [-0.5, 0, 0]);
    [[0.08, 0.065, -0.2], [0.08, 0.065, 0.2], [0.06, 0.065, -0.41], [0.06, 0.065, 0.41], [-0.3, 0.19, -0.24], [-0.3, 0.19, 0.24]].forEach(function (p) {
      K.lathe([[-0.08, 0.0], [-0.06, 0.02], [0.05, 0.022], [0.09, 0.0]], dk, p); K.motor([p[0] + 0.05, p[1] + 0.02, p[2]], 0.012, 0.03, MET); K.disc(0.1, [p[0] + 0.05, p[1] + 0.04, p[2]]); });
    K.light(RED, [0.04, 0.07, -0.51]); K.light(GRN, [0.04, 0.07, 0.51]); return K.done(); }
  // rotor motion-blur texture: soft disc with faint blade streaks
  var tex = null; function discTexture() { if (tex) return tex; var cv = document.createElement('canvas'); cv.width = cv.height = 128; var x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 6, 64, 64, 63);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.25, 'rgba(255,255,255,0.12)'); g.addColorStop(0.85, 'rgba(255,255,255,0.2)'); g.addColorStop(0.97, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 63, 0, 7); x.fill(); x.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 2; i++) { var a = i * Math.PI; x.save(); x.translate(64, 64); x.rotate(a); var lg = x.createLinearGradient(0, 0, 62, 0); lg.addColorStop(0, 'rgba(255,255,255,0.5)'); lg.addColorStop(1, 'rgba(255,255,255,0.05)'); x.fillStyle = lg; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 62, -0.32, 0.05); x.closePath(); x.fill(); x.restore(); }
    tex = new THREE.CanvasTexture(cv); tex.center.set(0.5, 0.5); return tex; }
  function materials() { return { body: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.45, roughness: 0.32 }),
    disc: new THREE.MeshBasicMaterial({ map: discTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xdfe9fa, opacity: 0.85, side: THREE.DoubleSide }),
    lights: new THREE.MeshBasicMaterial({ vertexColors: true }) }; }
  function addLights(scene) { scene.add(new THREE.HemisphereLight(0xa9c8ff, 0x1a1420, 0.75)); var d = new THREE.DirectionalLight(0xffffff, 0.95); d.position.set(0.4, 1, 0.3); scene.add(d); var d2 = new THREE.DirectionalLight(0xffb98a, 0.45); d2.position.set(-0.6, 0.3, -0.5); scene.add(d2); }
  return { wing: wing, zip: zip, amz: amz, evtol: evtol, materials: materials, addLights: addLights, discTexture: discTexture };
})();
