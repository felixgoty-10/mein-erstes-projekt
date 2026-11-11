// Drehbuch: "In dieser Stadt steht über jedem Kopf, wie viele Menschen heute an ihn gedacht haben" (Herr Brandt)
export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, room, sofa, counter, cake, dog, dogPose, balloon, bench, signMesh,
    mat, ramp, ease, clamp, lerp, pop, rng, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const ICH = { shirt: { type: "varsity", number: "13" }, hair: { type: "messy", seed: 11 }, phase: 0 };
  const BRANDT = { shirt: { type: "plaid", color: "#c9b28a", line: "#6b4a2b" }, hair: { type: "old", color: "#d9d9d9", seed: 4 }, glasses: true, beard: "#e6e6e6", pants: "#5a4632", phase: 1.3 };
  const BM = { shirt: { type: "suit", tie: "#c6262e" }, hair: { type: "short", color: "#8a8a8a" }, hat: null, phase: 2.0 };
  const KIDS = [
    { shirt: { type: "jacket", color: C.denim }, hair: { type: "curly", color: "#5b3a22", seed: 3 }, pants: "#c9b58f" },
    { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "short", color: "#1d1d1d" }, skin: C.skinDark },
    { shirt: { type: "tee", color: "#f2b632", stripe: "#2d5fb5" }, hair: { type: "long", color: "#e2c27a" }, pants: "#2d5fb5" },
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" }, hat: "cap", hatColor: "#2d5fb5" },
    { shirt: { type: "tee", color: "#7fb3e6" }, hair: { type: "bun", color: "#2b1d14" } },
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "long", color: "#3a2a1c" } },
    { shirt: { type: "tee", color: "#ff7eb6" }, hair: { type: "curly", color: "#111", seed: 8 }, skin: C.skinDark },
  ];
  const kid = (i) => character({ ...KIDS[i % KIDS.length], phase: i * 0.6 });
  const N = (n, v = "white") => [String(n), v];

  // ---------------------------------------------------------- A) Straße mit Herrn Brandts Haus
  const st = W.set("street", 0, 0);
  W.add(st, street(160), 0, 0, 0);
  W.add(st, house({ w: 10, d: 8, h: 6.8, color: C.pink }), -14, 0, -15);
  W.add(st, house({ w: 10, d: 8, h: 6.8, color: "#9aa3ad", roof: "#4a4f57", door: "#5a4632" }), 2, 0, -15);
  W.add(st, house({ w: 10, d: 8, h: 6.8, color: "#b9d7a8", roof: "#7a3b2b" }), 18, 0, -15);
  [[-6, -10.5], [10, -10.2], [26, -10.5]].forEach(([x, z], i) => W.add(st, tree(1, i + 3), x, 0, z));
  [[-18, 30, -70, 2.6], [10, 34, -75, 3]].forEach(([x, y, z, s], i) => W.add(st, cloud(s, i + 2), x, y, z));
  W.add(st, bench("#7a5634"), 2, 0, -9.6);
  const brandtBank = W.addChar(st, character(BRANDT), 2, -9.4, 0);
  const ichA = W.addChar(st, character(ICH), -6, -6.4, 0.3);
  const leute = [[-14, -7.2, 0.4, 7], [12, -7.4, -0.4, 12], [20, -8.0, -0.3, 5]].map(([x, z, r, n], i) => ({ c: W.addChar(st, kid(i), x, z, r), x, n }));
  const hund = W.add(st, dog(), 0, 0, -5.4, Math.PI / 2);
  const ichHund = W.addChar(st, character(ICH), 0, -6.6, Math.PI / 2);
  const leine = W.add(st, new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.05), mat("#d23b3b")), 0, 0, 0);
  const sitzt = (c) => { c.sit(); c.body.position.y = 0.1; };

  // ---------------------------------------------------------- B) Herrn Brandts Wohnzimmer
  const wz = W.set("living", 600, 0, { interior: true });
  W.add(wz, room({ wall: "#d9cbb4", floor: "#8a6a4a", rug: "#a8746a" }), 0, 0, 0);
  W.add(wz, sofa("#7a6a5a"), -2, 0, -3.8);
  const brandtWz = W.addChar(wz, character(BRANDT), -2, -3.6, 0.15);
  const ichWz = W.addChar(wz, character(ICH), 2.4, -1.2, -0.7);
  const kuchen = cake(); kuchen.scale.setScalar(0.6); kuchen.position.set(0, -2.1, 0.9); ichWz.armR.add(kuchen);
  const tisch = W.add(wz, counter("#b98250"), 0.5, 0, 1.2); tisch.scale.set(0.5, 0.85, 0.7);
  const briefe = [];
  const r = rng(5);
  for (let i = 0; i < 30; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), mat(["#ffffff", "#fdf2d0", "#e8f1ff", "#ffe3ec"][i % 4]));
    b.position.set(0.5 + (r() - 0.5) * 2.4, 2.3 + Math.floor(i / 6) * 0.07, 1.2 + (r() - 0.5) * 1.0); b.rotation.y = r() * 3; wz.add(b); briefe.push(b);
  }

  // ---------------------------------------------------------- C) Klassenzimmer
  const kl = W.set("class", 900, 0, { interior: true });
  W.add(kl, room({ w: 22, d: 16, h: 9, wall: "#efe6d2", floor: "#b98a5a", window: true }), 0, 0, 0);
  const tafel = signMesh("HERR BRANDT = 0", 8, 2.6, { bg: "#2f5d3a", fg: "#ffffff", border: "#6b4a2b" }); W.add(kl, tafel, 0, 5.4, -7.6);
  const pulte = [], schueler = [];
  [[-5, 2], [0, 2], [5, 2], [-5, 5.5], [0, 5.5], [5, 5.5]].forEach(([x, z], i) => {
    const p = new THREE.Group(); p.add(new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 1.6), mat("#d9b98f"))); p.children[0].position.y = 2.6;
    p.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 0.2), mat("#a0703f"))); p.children[1].position.set(0, 1.3, 0.7);
    const brief = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.7), mat("#ffffff")); brief.position.set(0, 2.73, 0.1); p.add(brief); p.userData.brief = brief;
    W.add(kl, p, x, 0, z - 1.4); pulte.push(p);
    const c = W.addChar(kl, kid(i), x, z, Math.PI); schueler.push(c);
  });
  const ichKl = W.addChar(kl, character(ICH), -3.5, -4.6, 0.2);

  // ---------------------------------------------------------- D) Geburtstag auf der Straße
  const gb = W.set("party", 300, 300);
  W.add(gb, street(160), 0, 0, 6);
  W.add(gb, house({ w: 12, d: 8, h: 6.8, color: "#9aa3ad", roof: "#4a4f57", door: "#5a4632" }), 0, 0, -12);
  W.add(gb, house({ w: 10, d: 8, h: 6.8, color: C.pink }), -14, 0, -12);
  W.add(gb, house({ w: 10, d: 8, h: 6.8, color: "#b9d7a8", roof: "#7a3b2b" }), 14, 0, -12);
  [[-14, 30, -70, 2.6], [12, 34, -80, 3]].forEach(([x, y, z, s], i) => W.add(gb, cloud(s, i + 6), x, y, z));
  const banner = signMesh("ALLES GUTE, HERR BRANDT!", 12, 1.5, { bg: "#fffaf0", fg: "#d23b3b", border: "#d23b3b" }); W.add(gb, banner, 0, 9.6, -7.6);
  const ballons = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ff7eb6", "#e67e22", "#e74c3c", "#3498db"].map((c, i) => W.add(gb, balloon(c), -12 + i * 3, 8.4 + (i % 2) * 0.8, -7.2));
  const torteGb = W.add(gb, cake(), -3.0, 2.3, -4.6);
  const tischGb = new THREE.Mesh(new THREE.BoxGeometry(4, 0.25, 2), mat("#f4f1ea")); tischGb.position.set(-3.0, 2.2, -4.6); gb.add(tischGb);
  [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), mat("#ddd")); l.position.set(-3.0 + x, 1.1, -4.6 + z); gb.add(l); });
  const brandtGb = W.addChar(gb, character(BRANDT), 0, -6.2, 0);
  const ichGb = W.addChar(gb, character(ICH), 3.4, -5.4, -0.4);
  const buergermeister = W.addChar(gb, character(BM), -6.4, -6.0, 0.5);
  const menge = [];
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
    const x = side * (6.5 + (row % 3) * 2.8), z = -7 + Math.floor(row / 3) * 3.2;
    menge.push(W.addChar(gb, kid(i), x, z, side > 0 ? -0.6 : 0.6));
  }
  const hundGb = W.add(gb, dog(), 1.8, 0, -3.6, -0.3);

  // ---------------------------------------------------------- Einstellungen
  const strasse = (lt) => {
    ichHund.root.visible = false; hund.visible = false; leine.visible = false;
    ichA.root.visible = true; brandtBank.root.visible = true;
    leute.forEach(({ c, n }) => { c.root.visible = true; c.idle(lt).face("happy").pill(...N(n)); });
  };
  const brandtSad = (lt) => { sitzt(brandtBank); brandtBank.face("sad"); brandtBank.head.rotation.x = 0.2; brandtBank.pill(...N(0)); };
  const countUp = (lt, t0, d, a, b) => Math.round(lerp(a, b, ease.out(clamp((lt - t0) / d))));
  return [
    { // s1 Hook: Zahlen über allen Köpfen
      at: 0, set: st,
      cam: [{ pos: [-2, 7.4, 21], look: [-2, 4.6, -7], fov: 48 }, { pos: [-3, 6.8, 16], look: [-3, 4.8, -7], fov: 48 }],
      update(lt) { strasse(lt); brandtSad(lt); ichA.idle(lt).face("happy").pill(...N(3)); ichA.root.position.set(-6, 0, -6.4); },
    },
    { // s2 Bei mir meistens eine Drei
      at: T.s("s2"), set: st,
      cam: [{ pos: [-5.22,  7.08,  7.12], look: [-6, 5.0, -6.4], fov: 40 }, { pos: [-5.35,  7.05,  5.82], look: [-6, 5.1, -6.4], fov: 40 }],
      update(lt) { strasse(lt); brandtSad(lt); ichA.root.position.set(-6, 0, -6.4); ichA.idle(lt).face("happy").pill(...N(3)); ichA.wave(lt); },
    },
    { // s3 Herr Brandt: seit Jahren eine Null
      at: T.s("s3"), set: st,
      cam: [{ pos: [2.81,  6.83,  8.02], look: [2, 4.4, -9.4], fov: 40 }, { pos: [2.67,  6.53,  6.26], look: [2, 4.5, -9.4], fov: 40 }],
      update(lt) { strasse(lt); brandtSad(lt); ichA.root.position.set(-6, 0, -6.4); ichA.pill(...N(3)); },
    },
    { // s4 Er wohnt allein, niemand besucht ihn (Leute gehen vorbei)
      at: T.s("s4"), set: st,
      cam: [{ pos: [2, 7.6, 18], look: [2, 4.0, -8], fov: 48 }, { pos: [2, 8.4, 21], look: [2, 4.0, -8], fov: 48 }],
      update(lt) {
        strasse(lt); brandtSad(lt); ichA.root.visible = false;
        leute.forEach(({ c, x, n }, i) => { c.walk(lt, 0.9).face("neutral").pill(...N(n)); c.root.rotation.y = i % 2 ? -1.5 : 1.5; c.root.position.x = (i % 2 ? 12 : -12) + (i % 2 ? -1 : 1) * lt * 2.4; c.root.position.z = -6.6; });
      },
    },
    { // s4b Nicht mal an seinem Geburtstag
      at: T.s("s4b"), set: st,
      cam: [{ pos: [2.67,  6.53,  6.26], look: [2, 4.5, -9.4], fov: 40 }, { pos: [2.54,  6.25,  4.64], look: [2, 4.5, -9.4], fov: 38 }],
      update(lt) { strasse(lt); brandtSad(lt); leute.forEach(({ c }) => (c.root.visible = false)); ichA.root.visible = false; },
    },
    { // s5 Montag: ich bringe einen Kuchen
      at: T.s("s5"), set: wz,
      cam: [{ pos: [0.5, 6.8, 15], look: [0.4, 3.8, -2.2], fov: 44 }, { pos: [0.5, 6.4, 13], look: [0.4, 4.0, -2.2], fov: 44 }],
      update(lt, u) {
        briefe.forEach((b) => (b.visible = false)); kuchen.visible = true;
        brandtWz.sit(); brandtWz.body.position.y = -0.45; brandtWz.face("neutral").pill(...N(0));
        ichWz.walk(lt, 0.8).face("happy").reach("R", 0.85); ichWz.root.position.set(lerp(5.5, 1.8, ease.out(clamp(u * 1.3))), 0, -1.2);
        if (u > 0.75) ichWz.walk(0); ichWz.reach("R", 0.85);
      },
    },
    { // s6 Seine Null wird zu einer Eins
      at: T.s("s6"), set: wz,
      cam: [{ pos: [-1.4,  8.2,  13.8], look: [-2, 5.2, -3.6], fov: 40 }, { pos: [-1.55,  8.15,  12.3], look: [-2, 5.3, -3.6], fov: 40 }],
      update(lt) {
        briefe.forEach((b) => (b.visible = false)); kuchen.visible = true; ichWz.root.position.set(1.8, 0, -1.2); ichWz.reach("R", 0.85);
        brandtWz.sit(); brandtWz.body.position.y = -0.45;
        const eins = T.w("s6", 4) - T.s("s6");
        brandtWz.face("wow").pill(...(lt > eins ? N(1, "green") : N(0)));
      },
    },
    { // s7 Er lächelt zum ersten Mal
      at: T.s("s7"), set: wz,
      cam: [{ pos: [-1.52,  7.36,  13.04], look: [-2, 4.8, -3.6], fov: 40 }, { pos: [-1.68,  7.14,  11.44], look: [-2, 4.9, -3.6], fov: 38 }],
      update(lt) {
        briefe.forEach((b) => (b.visible = false)); kuchen.visible = true; ichWz.root.position.set(1.8, 0, -1.2);
        brandtWz.sit(); brandtWz.body.position.y = -0.45; brandtWz.face(lt > 0.4 ? "happy" : "wow").pill(...N(1, "green"));
      },
    },
    { // s8 Dienstag: mit seinem Hund spazieren
      at: T.s("s8"), set: st,
      cam: [{ pos: [-6, 6.6, 13], look: [-6, 3.8, -6], fov: 46 }, { pos: [6, 6.6, 13], look: [6, 3.8, -6], fov: 46 }], ease: ease.linear,
      update(lt, u) {
        ichA.root.visible = false; leute.forEach(({ c }) => (c.root.visible = false));
        ichHund.root.visible = true; hund.visible = true; leine.visible = true;
        const x = lerp(-9, 5, u);
        ichHund.walk(lt, 0.9).face("happy").pill(...N(3)); ichHund.root.position.set(x, 0, -6.6);
        hund.position.set(x + 2.4, 0, -5.4); hund.rotation.y = Math.PI / 2; dogPose(hund, lt, 1);
        leine.position.set(x + 1.1, 2.4, -5.6); leine.scale.x = 2.2; leine.rotation.z = -0.35;
        brandtBank.stand = false; brandtBank.idle(lt).face("happy").wave(lt).pill(...N(2, "green")); brandtBank.root.position.set(2, 0, -9.4);
      },
    },
    { // s9 Mittwoch: Ich erzähle meiner Klasse von ihm
      at: T.s("s9"), set: kl,
      cam: [{ pos: [0, 7.6, 20], look: [0, 4.4, -3], fov: 48 }, { pos: [-1, 7.2, 17], look: [-1, 4.6, -3], fov: 48 }],
      update(lt) {
        ichKl.idle(lt).face("happy").pill(...N(3)); ichKl.wave(lt, "L"); ichKl.armR.rotation.x = -0.9;
        schueler.forEach((c, i) => { c.sit(); c.body.position.y = -0.45; c.face(i % 2 ? "worried" : "sad"); c.root.rotation.y = Math.PI; });
        pulte.forEach((p) => (p.userData.brief.visible = false));
      },
    },
    { // s10 Donnerstag: Wir schreiben Briefe
      at: T.s("s10"), set: kl,
      cam: [{ pos: [12.6,  10.84,  18.8], look: [0, 3.0, 2], fov: 48 }, { pos: [9.8,  10.0,  15.8], look: [0, 3.0, 2.5], fov: 48 }],
      update(lt) {
        ichKl.root.visible = false;
        schueler.forEach((c, i) => { c.sit(); c.body.position.y = -0.45; c.face("happy"); c.root.rotation.y = Math.PI; c.reach("R", 0.75); c.armR.rotation.x += Math.sin(lt * 9 + i) * 0.08; });
        pulte.forEach((p, i) => { p.userData.brief.visible = true; p.userData.brief.scale.setScalar(Math.max(0.01, pop(lt, 0.2 + i * 0.12, 0.2))); });
      },
    },
    { // s10b Dreißig Briefe in einem Briefkasten
      at: T.s("s10b"), set: wz,
      cam: [{ pos: [1.2, 7.6, 9.5], look: [0.5, 2.6, 1.2], fov: 42 }, { pos: [1.0, 7.0, 8.0], look: [0.5, 2.6, 1.2], fov: 40 }],
      update(lt) {
        kuchen.visible = false; ichWz.root.visible = false;
        briefe.forEach((b, i) => { b.visible = true; b.scale.setScalar(Math.max(0.01, pop(lt, i * 0.045, 0.15))); });
        brandtWz.sit(); brandtWz.body.position.y = -0.45; brandtWz.face("wow").pill(...N(countUp(lt, 0, 1.4, 2, 28), "green"));
      },
    },
    { // s11 Freitag: 28 über seinem Kopf
      at: T.s("s11"), set: wz,
      cam: [{ pos: [-1.4,  8.2,  13.8], look: [-2, 5.2, -3.6], fov: 40 }, { pos: [-1.55,  8.15,  12.3], look: [-2, 5.3, -3.6], fov: 40 }],
      update(lt) {
        kuchen.visible = false; ichWz.root.visible = false; briefe.forEach((b) => { b.visible = true; b.scale.setScalar(1); });
        brandtWz.sit(); brandtWz.body.position.y = -0.45; brandtWz.face("laugh").pill(...N(28, "green"));
        brandtWz.reach("R", 0.6);
      },
    },
    { // s12 Samstag: Geburtstag, er wird 80 (Karte zuerst)
      at: T.s("s12"), set: gb,
      cam: [{ pos: [0, 7.4, 13], look: [0, 4.6, -6], fov: 46 }, { pos: [0, 7.0, 11], look: [0, 4.8, -6], fov: 46 }],
      update(lt, u, t) {
        menge.forEach((c) => (c.root.visible = false)); buergermeister.root.visible = false; ichGb.root.visible = true; hundGb.visible = true;
        brandtGb.idle(lt).face("wow").pill(...N(31, "green")); ichGb.cheer(lt).face("laugh").pill(...N(3)); dogPose(hundGb, lt, 0);
        ballons.forEach((b, i) => (b.position.y = 8.4 + (i % 2) * 0.8 + Math.sin(lt * 1.4 + i) * 0.35));
      },
    },
    { // s13 Die ganze Straße kommt
      at: T.s("s13"), set: gb,
      cam: [{ pos: [0, 9, 24], look: [0, 4.2, -3], fov: 50 }, { pos: [0, 8, 20], look: [0, 4.4, -3], fov: 50 }],
      update(lt, u) {
        buergermeister.root.visible = false; hundGb.visible = true; dogPose(hundGb, lt, 0);
        menge.forEach((c, i) => { c.root.visible = true; const k = clamp(u * 1.6 - i * 0.05); c.walk(lt + i, 0.9 * (k < 1 ? 1 : 0)).face("happy"); c.root.position.z = lerp(12, -7 + Math.floor(Math.floor(i / 2) / 3) * 3.2, ease.out(k)); });
        brandtGb.idle(lt).face("wow").pill(...N(countUp(lt, 0.3, 2.4, 31, 48), "green")); ichGb.cheer(lt).face("laugh");
        ballons.forEach((b, i) => (b.position.y = 8.4 + (i % 2) * 0.8 + Math.sin(lt * 1.4 + i) * 0.35));
      },
    },
    { // s13b Sogar der Bürgermeister
      at: T.s("s13b"), set: gb,
      cam: [{ pos: [-2.58,  7.92,  18.64], look: [-1.8, 4.8, -5.8], fov: 44 }, { pos: [-2.58,  7.63,  16.69], look: [-1.8, 4.9, -5.8], fov: 44 }],
      update(lt) {
        menge.forEach((c, i) => { c.root.visible = true;  c.cheer(lt + i, false).face("happy"); });
        buergermeister.root.visible = true; buergermeister.idle(lt).face("happy").pill(...N(5120)); buergermeister.reach("L", 0.8);
        brandtGb.idle(lt).face("wow").pill(...N(49, "green")); brandtGb.reach("R", 0.8); dogPose(hundGb, lt, 0);
      },
    },
    { // s14 Seine Zahl wurde immer größer
      at: T.s("s14"), set: gb,
      cam: [{ pos: [0.64,  8.56,  18.92], look: [0, 6.0, -6.2], fov: 40 }, { pos: [0.64,  8.5,  17.48], look: [0, 6.1, -6.2], fov: 40 }],
      update(lt) {
        menge.forEach((c, i) => { c.root.visible = true;  c.cheer(lt + i).face("laugh"); });
        buergermeister.root.visible = true; buergermeister.cheer(lt).face("laugh");
        brandtGb.idle(lt).face("happy").pill(...N(countUp(lt, 0, 1.6, 49, 50), "green")); dogPose(hundGb, lt, 0);
      },
    },
    { // s15 Fünfzig. Hundert. Zweihundert!
      at: T.s("s15"), set: gb,
      cam: [{ pos: [0.64,  8.5,  17.48], look: [0, 6.1, -6.2], fov: 40 }, { pos: [0.64,  8.64,  15.56], look: [0, 6.4, -6.2], fov: 38 }],
      update(lt, u, t) {
        menge.forEach((c, i) => { c.root.visible = true;  c.cheer(lt + i).face("laugh"); });
        buergermeister.root.visible = true; buergermeister.cheer(lt).face("laugh"); dogPose(hundGb, lt, 0);
        let n = 50;
        if (t >= T.w("s15", 1, 0)) n = 100;
        if (t >= T.w("s15", 2, 0)) n = Math.round(lerp(150, 213, ease.out(clamp((t - T.w("s15", 2, 0)) / 0.8))));
        brandtGb.idle(lt).face("wow").pill(...N(n, "green"));
      },
    },
    { // s16 Er weint – vor Freude
      at: T.s("s16"), set: gb,
      cam: [{ pos: [0.51,  7.72,  17.6], look: [0, 5.0, -6.2], fov: 40 }, { pos: [0.51,  7.55,  15.9], look: [0, 5.0, -6.2], fov: 38 }],
      update(lt) {
        menge.forEach((c) => (c.root.visible = false)); buergermeister.root.visible = false;
        brandtGb.idle(lt, 0.5).face(lt > 1.3 ? "joy" : "sad").pill(...N(213, "green")); brandtGb.armL.rotation.x = -0.7 * ramp(lt, 1.0, 0.4);
      },
    },
    { // s17 Und meine Zahl?
      at: T.s("s17"), set: gb,
      cam: [{ pos: [4.36,  8.08,  14.76], look: [3.4, 5.2, -5.4], fov: 40 }, { pos: [4.36,  8.02,  13.48], look: [3.4, 5.3, -5.4], fov: 40 }],
      update(lt) { menge.forEach((c) => (c.root.visible = false)); buergermeister.root.visible = false; ichGb.root.rotation.y = -0.1; ichGb.idle(lt).face("wow").pill(...N(3)); ichGb.head.rotation.x = -0.25; },
    },
    { // s18 Seit Samstag steht da eine Vier
      at: T.s("s18"), set: gb,
      cam: [{ pos: [4.36,  8.02,  13.48], look: [3.4, 5.3, -5.4], fov: 40 }, { pos: [4.36,  7.96,  12.2], look: [3.4, 5.4, -5.4], fov: 38 }],
      update(lt) {
        menge.forEach((c) => (c.root.visible = false)); buergermeister.root.visible = false; ichGb.root.rotation.y = -0.1;
        const vier = T.w("s18", 5) - T.s("s18");
        ichGb.idle(lt).face(lt > vier ? "laugh" : "wow").pill(...(lt > vier ? N(4, "green") : N(3)));
      },
    },
    { // s19 Mama, Papa, Oma. Und Herr Brandt. (beide zusammen)
      at: T.s("s19"), set: gb,
      cam: [{ pos: [1.8, 7.4, 13], look: [1.7, 4.8, -5.8], fov: 44 }, { pos: [1.8, 7.0, 11], look: [1.7, 5.0, -5.8], fov: 42 }],
      update(lt) {
        menge.forEach((c, i) => { c.root.visible = true;  c.idle(lt + i).face("happy"); });
        buergermeister.root.visible = false;
        ichGb.root.rotation.y = -0.5; ichGb.face("laugh").pill(...N(4, "green")); ichGb.armL.rotation.z = -1.0;
        brandtGb.root.rotation.y = 0.5; brandtGb.face("joy").pill(...N(213, "green")); brandtGb.armR.rotation.z = 1.0;
        dogPose(hundGb, lt, 0);
      },
    },
  ];
}
