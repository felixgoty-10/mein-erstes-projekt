// Drehbuch: "Was wäre, wenn niemand mehr arbeiten geht?"
// Jede Einstellung: { at, set, cam:[von, nach], update(lt, u) }
// lt = Sekunden seit Beginn der Einstellung, u = 0..1 Fortschritt.

export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, plaza, room, sofa, bed, shelf, bread, trashBag, bin, tv,
    counter, oven, briefcase, broom, textSprite, signMesh, mat, rng, pop, ramp, ease, clamp, lerp, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const HERO = { shirt: { type: "varsity", number: "13" }, hair: { type: "messy", seed: 11 }, phase: 0 };
  const hero = () => character(HERO);
  const OPA = { shirt: { type: "plaid" }, pants: "#5a4632", hair: { type: "old", color: "#d9d9d9", seed: 4 }, glasses: true, beard: "#e6e6e6", phase: 1.3 };
  const ARZT = { shirt: { type: "coat" }, pants: "#3c4a66", hair: { type: "short", color: "#5a3a22" }, glasses: true, phase: 2.1 };
  const BAECKER = { shirt: { type: "apron" }, pants: "#ece6da", hair: { type: "short", color: "#3a2a1c" }, hat: "chef", beard: "#3a2a1c", phase: 0.7 };
  const EXTRAS = [
    { shirt: { type: "jacket", color: C.denim }, hair: { type: "curly", color: "#5b3a22", seed: 3 }, pants: "#c9b58f", phase: 0.4 },
    { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "short", color: "#1d1d1d" }, skin: C.skinDark, phase: 1.1 },
    { shirt: { type: "tee", color: "#f2b632", stripe: "#2d5fb5" }, hair: { type: "long", color: "#e2c27a" }, pants: "#2d5fb5", phase: 2.4 },
    { shirt: { type: "suit" }, hair: { type: "short", color: "#2a2a2a" }, phase: 0.9 },
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "bun", color: "#2b1d14" }, pants: "#333", phase: 1.7 },
    { shirt: { type: "tee", color: "#7fb3e6" }, hair: { type: "curly", color: "#111", seed: 8 }, skin: C.skinDark, phase: 2.9 },
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" }, hat: "cap", hatColor: "#2d5fb5", phase: 0.2 },
  ];
  const extra = (i) => character(EXTRAS[i % EXTRAS.length]);
  const withBread = (c, arm = "R") => {
    const b = bread(); b.position.set(0, -1.95, 0.55); b.rotation.y = Math.PI / 2;
    (arm === "R" ? c.armR : c.armL).add(b); c.bread = b; return c;
  };

  // ---------------------------------------------------------- Straße (3 Varianten)
  function buildStreet(set, { open = false } = {}) {
    W.add(set, street(160), 0, 0, 0);
    const fz = -14;
    const buero = W.add(set, house({ w: 11, d: 8, h: 9, color: "#efe3c8", flat: true, sign: "BÜRO", signStyle: { bg: "#ffffff", fg: "#2f3f63", border: "#2f3f63" } }), -16, 0, fz);
    W.add(set, house({ w: 9, d: 8, h: 6.5, color: C.pink }), -2, 0, fz);
    W.add(set, house({ w: 10, d: 8, h: 7, color: "#f3e6c9", flat: true, sign: "BÄCKEREI", windows: [-3.2, 3.2], signStyle: { bg: "#fffaf0", fg: "#b8402f", border: "#b8402f" } }), 14, 0, fz);
    W.add(set, house({ w: 10, d: 8, h: 7, color: "#e3eef6", flat: true, sign: "PRAXIS", windows: [-3.2, 3.2], signStyle: { bg: "#ffffff", fg: "#2b7bbd", border: "#2b7bbd" } }), 30, 0, fz);
    W.add(set, house({ w: 9, d: 8, h: 6.5, color: "#b9d7a8", roof: "#7a3b2b" }), 44, 0, fz);
    W.add(set, house({ w: 9, d: 8, h: 6.5, color: "#f0c9a2", roof: C.roofBlue }), -30, 0, fz);
    [[-23, -10], [6.5, -10], [22, -10.5], [37, -10], [-9, -10.3], [52, -10]].forEach(([x, z], i) => W.add(set, tree(0.9 + (i % 2) * 0.15, i + 1), x, 0, z));
    [[-20, 28, -60, 2.2], [5, 34, -70, 2.8], [30, 30, -65, 2.4], [55, 36, -80, 3]].forEach(([x, y, z, s], i) => W.add(set, cloud(s, i + 3), x, y, z));
    const label = (txt, x, color) => { const m = signMesh(txt, 2.6, 0.7, { bg: color, fg: "#ffffff", border: "#ffffff" }); W.add(set, m, x, 2.6, fz + 4.3); return m; };
    if (open) { label("OFFEN", 14, "#2e9e4f"); label("OFFEN", 30, "#2e9e4f"); label("OFFEN", -16, "#2e9e4f"); }
    else { label("GESCHLOSSEN", 14, "#d23b3b"); label("GESCHLOSSEN", 30, "#d23b3b"); label("GESCHLOSSEN", -16, "#d23b3b"); }
    return { buero };
  }

  // 1) Straße – alle gehen nach Hause
  const st = W.set("street", 0, 0);
  buildStreet(st);
  const h1 = W.addChar(st, hero(), -2, -6.6, 0);
  const e1 = W.addChar(st, extra(0), -18.5, -8.5, 0.5);
  const e2 = W.addChar(st, extra(3), -13.5, -8.8, -0.4);
  const e3 = W.addChar(st, extra(4), 7, -7.5, -0.3);
  const cases = [0, 1].map(() => W.add(st, briefcase(), 0, -10, 0));
  const hBakery = W.addChar(st, hero(), 14, -7.2, Math.PI); // vor der Bäckerei, schaut zur Tür
  const hArztTuer = W.addChar(st, hero(), 27.6, -8.4, 2.5);

  // 2) Park – Party
  const pk = W.set("park", 300, 0);
  W.add(pk, plaza(26, 20), 0, 0, -2);
  [[-11, -12], [11, -12], [-13, 2], [13, 0], [0, -16]].forEach(([x, z], i) => W.add(pk, tree(1.1, 20 + i), x, 0, z));
  [[-14, 26, -50, 2.4], [12, 30, -60, 2.8]].forEach(([x, y, z, s], i) => W.add(pk, cloud(s, i + 9), x, y, z));
  const balloons = [];
  const bcol = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ff7eb6"];
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), mat(bcol[i % bcol.length], { roughness: 0.35 }));
    b.scale.y = 1.2; W.add(pk, b, -8 + i * 2, 9, -7 - (i % 3) * 1.5); balloons.push(b);
  }
  const party = [W.addChar(pk, hero(), 0, 0, 0), W.addChar(pk, extra(0), -4.2, -2.5, 0.3), W.addChar(pk, extra(2), 4.2, -2.3, -0.3),
    W.addChar(pk, extra(1), -7.5, -5.5, 0.4), W.addChar(pk, extra(5), 7.5, -5.5, -0.4), W.addChar(pk, extra(6), 0, -7, 0)];

  // 3) Schlafzimmer des Bäckers
  const bd = W.set("bedroom", 600, 0, { interior: true });
  W.add(bd, room({ wall: "#cfe0f1", floor: "#b97a45" }), 0, 0, 0);
  W.add(bd, bed("#e2483e"), 0, 0, -2.5, -Math.PI / 2);
  const baker = W.addChar(bd, character({ ...BAECKER, beard: null }), -2.3, -2.5, 0);
  const blanket = W.add(bd, new S.THREE.Mesh(new S.THREE.BoxGeometry(4.6, 2.5, 3.0), mat("#e2483e")), -0.7, 2.75, -2.1);
  blanket.castShadow = true;
  const zz = [0, 1, 2].map((i) => W.add(bd, textSprite("Z", { size: 1.1 - i * 0.2 }), 0, 0, 0));
  const lamp = W.add(bd, new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), mat("#9b6334")), 3.6, 0.9, -4);
  W.add(bd, new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.9, 16), mat("#ffe7a6", { emissive: "#ffcf60", emissiveIntensity: 0.4 })), 3.6, 2.3, -4);

  // 5) Straße mit Müll
  const tr = W.set("trash", 0, 300);
  buildStreet(tr);
  const bags = [];
  const r = rng(42);
  for (let i = 0; i < 70; i++) {
    const layer = Math.floor(i / 10);
    const b = i % 6 === 5 ? bin(["#2f8f4e", "#2d5fb5", "#8a8a8a"][i % 3]) : trashBag(i);
    const x = -2 + (r() - 0.5) * (9 - layer * 0.7);
    const z = -9.4 + (r() - 0.5) * 3;
    W.add(tr, b, x, 0.3 + layer * 1.15, z, r() * 3);
    b.userData.y = 0.3 + layer * 1.15;
    bags.push(b);
  }
  const h5 = W.addChar(tr, hero(), 5.5, -6.2, -0.5);

  // 6) Supermarkt – leer
  const sm = W.set("market", 900, 0, { interior: true });
  W.add(sm, room({ w: 22, d: 14, h: 9, wall: "#f4f1ea", floor: "#d9d9d9", window: false }), 0, 0, 0);
  const smSign = W.add(sm, signMesh("SUPERMARKT", 9, 1.6, { bg: "#e53b3b", fg: "#ffffff", border: null }), 0, 7, -6.7);
  [-7, 0, 7].forEach((x, i) => W.add(sm, shelf({ stocked: 0.04, seed: 5 + i }), x, 0, -4.8));
  W.add(sm, shelf({ stocked: 0.03, seed: 9 }), -9, 0, 1, Math.PI / 2);
  W.add(sm, shelf({ stocked: 0.0, seed: 12 }), 9, 0, 1, -Math.PI / 2);
  const h6 = W.addChar(sm, hero(), 0, 1.5, 0);

  // 7/14) Wohnzimmer Opa
  const lv = W.set("living", 1200, 0, { interior: true });
  W.add(lv, room({ wall: "#f1dcc0", floor: "#b98250", rug: "#e9a6a0" }), 0, 0, 0);
  W.add(lv, sofa("#c9353a"), 0, 0, -3.8);
  const opa = W.addChar(lv, character(OPA), -1.3, -3.6, 0);
  const opaBlanket = W.add(lv, new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 2.4), mat("#5d8fd6")), -1.3, 2.25, -2.8);
  const h7 = W.addChar(lv, hero(), 3.2, -1.2, -0.6);
  const h14 = withBread(W.addChar(lv, hero(), 2.6, -1.4, -0.9));
  const plant = W.add(lv, tree(0.45, 77), 6.2, 0, -4.5);

  // 10/15) Wohnzimmer Arzt
  const dr = W.set("doctor", 1500, 0, { interior: true });
  W.add(dr, room({ wall: "#d6e9d8", floor: "#a8703f", rug: "#f2d27a" }), 0, 0, 0);
  W.add(dr, sofa("#3d6fb3"), 0, 0, -3.6);
  W.add(dr, tv(), 5.6, 0, 2.2, -2.3);
  const arzt = W.addChar(dr, character(ARZT), 2.6, -3.0, 0);
  const chips = W.add(dr, new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.4), mat("#f2c12e")), 0.2, 3.9, -2.2);
  const arzt2 = W.addChar(dr, character(ARZT), -1.5, 0.5, 0.5);
  const h15 = withBread(W.addChar(dr, hero(), 2.2, 1.4, -1.2));

  // 11) Nahaufnahme Held (Park-Hintergrund, weit weg)
  const cu = W.set("closeup", 300, 120);
  W.add(cu, plaza(30, 30), 0, 0, -6);
  [[-8, -14], [7, -16], [16, -10], [-16, -8]].forEach(([x, z], i) => W.add(cu, tree(1.2, 30 + i), x, 0, z));
  W.add(cu, house({ w: 9, color: C.pink }), -2, 0, -26);
  W.add(cu, house({ w: 9, color: "#f3e6c9", flat: true }), 12, 0, -24);
  W.add(cu, cloud(2.5, 2), 4, 26, -60);
  const h11 = W.addChar(cu, hero(), 0, 0, 0);

  // 12) Helfen – Straße, Hände schütteln
  const hp = W.set("help", 300, 300);
  buildStreet(hp);
  const h12 = W.addChar(hp, hero(), -2.2, -7, 0.5);
  const n12 = W.addChar(hp, extra(4), 2.2, -7, -0.5);
  const n12b = W.addChar(hp, extra(1), -7, -9, 0.3);
  const n12c = W.addChar(hp, extra(2), 6.5, -9.2, -0.3);

  // 13) Backstube
  const bk = W.set("bakery", 1800, 0, { interior: true });
  W.add(bk, room({ wall: "#f6e4c8", floor: "#c08a55", window: true }), 0, 0, 0);
  W.add(bk, oven(), -4.5, 0, -4.4);
  W.add(bk, counter(), 0.8, 0, 0.6);
  const h13 = W.addChar(bk, character({ ...HERO, hat: "chef" }), 1.2, -1.8, 0);
  const loaves = [];
  for (let i = 0; i < 8; i++) { const b = bread(); W.add(bk, b, -2.1 + (i % 4) * 1.35, 3.18 + Math.floor(i / 4) * 0.62, 1.1 - Math.floor(i / 4) * 0.5, 0.15); loaves.push(b); }

  // 16) Morgen – alle arbeiten wieder
  const mo = W.set("morning", 600, 300);
  buildStreet(mo, { open: true });
  const workers = [];
  const wspec = [[-16, -8.2, "sweep"], [-9, -7, "carry"], [-3, -6.8, "wave"], [3.5, -7.4, "sweep"], [10, -7.2, "carry"], [14, -8.6, "bread"], [19, -7, "walk"], [26, -7.4, "carry"], [31, -8.4, "wave"], [-22, -7.4, "walk"]];
  wspec.forEach(([x, z, job], i) => {
    const c = i === 2 ? hero() : (i === 5 ? character(BAECKER) : extra(i));
    if (job === "bread") withBread(c);
    W.addChar(mo, c, x, z, 0);
    if (job === "sweep") { const b = broom(); b.position.set(0, -1.6, 0.6); b.rotation.x = 0.3; c.armR.add(b); }
    if (job === "carry") { const bx = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.2), mat("#c8a06a")); bx.position.set(1.48, 3.0, 1.0); bx.castShadow = true; c.body.add(bx); }
    workers.push({ c, job, x, z });
  });

  // ---------------------------------------------------------- Einstellungen
  const money = (v, warn = false) => [v + " €", warn ? "red" : "white"];
  const tween = (lt, t0, d, a, b) => Math.round(lerp(a, b, ramp(lt, t0, d, ease.out)));

  return [
    { // 1 Hook: Straße, alle verlassen das Büro
      at: 0, set: st,
      cam: [{ pos: [2, 6.2, 16], look: [-2, 4.2, -7], fov: 46 }, { pos: [0, 5.2, 9.5], look: [-2, 4.4, -7], fov: 46 }],
      update(lt) {
        [h1, e1, e2, e3].forEach((c) => c.root.position.y = 0);
        h1.walk(lt, 0.9).face("happy").pill(...money(500)); h1.root.position.x = -4.6 + lt * 1.4;
        h1.root.rotation.y = 1.2;
        e1.walk(lt, 1).face("laugh").pill(...money(800)); e1.root.position.x = -18.5 + lt * 2.4; e1.root.rotation.y = 1.3;
        e2.cheer(lt).face("laugh").pill(...money(350));
        e3.walk(lt, 0.8).face("happy").pill(...money(620)); e3.root.position.x = 9 - lt * 1.6; e3.root.rotation.y = -1.4;
        cases.forEach((cs, i) => {
          const t0 = 0.2 + i * 0.6, k = clamp((lt - t0) / 1.0);
          cs.position.set(-15 + i * 2 + k * (4 + i * 3), 5 + Math.sin(k * Math.PI) * 5 - k * 4.7, -9 + k * 2);
          cs.rotation.z = k * 8; cs.visible = lt > t0;
        });
      },
    },
    { // 2 Tag eins: Party (unter der Tag-1-Karte startet sie schon)
      at: T.w("s2", 0), set: pk,
      cam: [{ pos: [0, 6, 20], look: [0, 4.5, -2], fov: 50 }, { pos: [-3, 5.5, 15], look: [0, 4.5, -2], fov: 50 }],
      update(lt) {
        party.forEach((c, i) => c.cheer(lt + i * 0.37).face(i % 2 ? "laugh" : "happy").pill(...money([480, 760, 300, 910, 150, 520][i])));
        party[0].root.rotation.y = Math.sin(lt * 2) * 0.2;
        balloons.forEach((b, i) => { b.position.y = 9 + Math.sin(lt * 1.5 + i) * 0.4; });
      },
    },
    { // 3 Tag drei: Bäckerei geschlossen
      at: T.s("s3"), set: st,
      cam: [{ pos: [9, 6.2, 7], look: [14, 4.6, -9], fov: 46 }, { pos: [10, 5.8, 4.5], look: [14, 4.6, -9.5], fov: 46 }],
      update(lt) {
        [h1, e1, e2, e3].forEach((c) => c.root.position.y = -50);
        cases.forEach((c) => c.visible = false);
        hBakery.idle(lt).face("worried").pill(...money(tween(lt, 0, 0.6, 500, 320)));
        hBakery.lookAt(Math.sin(lt * 3) * 0.3);
      },
    },
    { // 4 Bäcker schläft
      at: T.w("s3", 2), set: bd,
      cam: [{ pos: [1.2, 5.8, 9], look: [0.8, 3.2, -2.5], fov: 46 }, { pos: [1.6, 5.4, 7], look: [1.2, 3.4, -2.5], fov: 44 }],
      update(lt) {
        baker.lieSide(lt, { arms: false }).face("sleep"); baker.body.position.set(0, 2.75, 0);
        zz.forEach((z, i) => { const k = ((lt * 0.7 + i / 3) % 1); z.position.set(3.4 + k * 1.2, 4.6 + k * 3, -2.2); z.material.opacity = Math.sin(k * Math.PI); });
      },
    },
    { // 5 Kein Brot – Nahaufnahme
      at: T.s("s4"), set: st,
      cam: [{ pos: [14.6, 5.6, 0.5], look: [14, 4.6, -7.2], fov: 42 }, { pos: [14.4, 5.4, -1.0], look: [14, 4.8, -7.2], fov: 42 }],
      update(lt) {
        [h1, e1, e2, e3].forEach((c) => c.root.position.y = -50);
        cases.forEach((c) => c.visible = false);
        hBakery.root.rotation.y = 0; hBakery.idle(lt).face("sad").shrug(ramp(lt, 0, 0.3)).pill(...money(250));
      },
    },
    { // 6 Tag fünf: Müll bis zum Dach
      at: T.s("s5"), set: tr,
      cam: [{ pos: [4, 3.5, 14], look: [-1, 3, -9], fov: 50 }, { pos: [6, 9, 16], look: [-2, 7.5, -10], fov: 50 }],
      update(lt, u) {
        const n = Math.floor(lerp(12, bags.length, ease.out(clamp(u * 1.35))));
        bags.forEach((b, i) => { const k = pop(lt, (i / bags.length) * (T.e("s5") - T.s("s5")) * 0.7, 0.18); b.visible = i < n; b.scale.setScalar(Math.max(0.01, i < 12 ? 1 : k)); });
        h5.handsOnHead(ramp(lt, 0.8, 0.3)).face(lt > 0.8 ? "shock" : "worried").pill(...money(180));
        h5.lookAt(-0.6);
      },
    },
    { // 7 Tag sieben: Supermarkt leer
      at: T.s("s6"), set: sm,
      cam: [{ pos: [0, 6.5, 17], look: [0, 4, -3], fov: 50 }, { pos: [0, 5.5, 11], look: [0, 4.4, -2], fov: 50 }],
      update(lt) {
        const leer = T.w("s6", 5) - T.s("s6");
        const v = tween(lt, 0.2, Math.max(0.3, leer - 0.2), 120, 0);
        h6.idle(lt).face(lt > leer ? "shock" : "worried").pill(...money(v, v === 0));
        if (lt > leer) h6.handsOnHead(ramp(lt, leer, 0.2));
        h6.lookAt(Math.sin(lt * 2.5) * 0.4);
      },
    },
    { // 8 Opa wird krank
      at: T.s("s7"), set: lv,
      cam: [{ pos: [1.2, 6.2, 13.5], look: [0.8, 3.4, -2.5], fov: 46 }, { pos: [1.0, 5.6, 10.5], look: [0.8, 3.6, -2.5], fov: 46 }],
      update(lt) {
        opa.sit().face("sick"); opa.body.position.y = -0.45; opa.idle(lt, 0.5).sit(); opa.body.position.y = -0.45;
        opa.armR.rotation.x = -0.5;
        h7.idle(lt).face("worried").lookAt(-0.4);
        h14.root.visible = false; h7.root.visible = true;
      },
    },
    { // 9 Aber der Arzt? – Praxis geschlossen
      at: T.s("s8"), set: st,
      cam: [{ pos: [31, 5.5, 4], look: [29, 4, -9], fov: 46 }, { pos: [30.5, 4.6, 0.5], look: [29, 3.6, -9.6], fov: 42 }],
      update(lt) {
        [h1, e1, e2, e3].forEach((c) => c.root.position.y = -50);
        cases.forEach((c) => c.visible = false);
        hArztTuer.idle(lt).face("worried");
        hArztTuer.armR.rotation.x = -1.8 + Math.abs(Math.sin(lt * 9)) * 0.4; // klopft
      },
    },
    { // 10 Arzt liegt auf dem Sofa
      at: T.s("s9"), set: dr,
      cam: [{ pos: [0.5, 5.2, 10], look: [0.3, 3.0, -3.3], fov: 46 }, { pos: [0.8, 4.8, 7.5], look: [0.6, 3.2, -3.3], fov: 46 }],
      update(lt) {
        arzt.lieSide(lt).face("smug"); arzt.body.position.set(0, 2.55, 0);
        arzt.root.position.set(-2.8, 0, -3.3); arzt.root.rotation.y = 0;
        chips.visible = true; arzt2.root.visible = false; h15.root.visible = false; arzt.root.visible = true;
      },
    },
    { // 11 Da merke ich …
      at: T.s("s10"), set: cu,
      cam: [{ pos: [0.4, 5.1, 8.0], look: [0, 4.6, 0], fov: 40 }, { pos: [0.1, 5.0, 5.8], look: [0, 4.7, 0], fov: 40 }],
      update(lt) {
        const aha = T.w("s10", 2) - T.s("s10");
        h11.idle(lt, 0.6).face(lt < aha ? "neutral" : (lt < aha + 1.2 ? "wow" : "happy"));
      },
    },
    { // 12 Arbeit heißt, wir helfen uns gegenseitig
      at: T.s("s11"), set: hp,
      cam: [{ pos: [0, 5.5, 9], look: [0, 4, -7], fov: 46 }, { pos: [0, 5.8, 13], look: [0, 4.2, -7], fov: 50 }],
      update(lt) {
        const shake = Math.sin(lt * 14) * 0.15;
        h12.face("happy").reach("R", 0.75); h12.armR.rotation.x += shake; h12.armR.rotation.z = 0.35;
        n12.face("happy").reach("L", 0.75); n12.armL.rotation.x += shake; n12.armL.rotation.z = -0.35;
        n12b.cheer(lt, false).face("laugh"); n12c.wave(lt, "L").face("happy");
      },
    },
    { // 13 Also backe ich Brot
      at: T.s("s12"), set: bk,
      cam: [{ pos: [3.5, 7, 11], look: [0.5, 3.5, -1], fov: 46 }, { pos: [2.5, 6.2, 8.5], look: [0.5, 3.6, -1], fov: 46 }],
      update(lt) {
        h13.idle(lt).face("happy"); h13.armL.rotation.x = -1.0 - Math.abs(Math.sin(lt * 8)) * 0.3; h13.armR.rotation.x = -1.0 - Math.abs(Math.cos(lt * 8)) * 0.3;
        loaves.forEach((b, i) => b.scale.setScalar(Math.max(0.001, pop(lt, 0.15 + i * 0.12, 0.2))));
      },
    },
    { // 14 Für Opa
      at: T.s("s13"), set: lv,
      cam: [{ pos: [0.8, 5.8, 11], look: [0.6, 3.6, -2.4], fov: 44 }, { pos: [0.8, 5.5, 9.5], look: [0.6, 3.7, -2.4], fov: 44 }],
      update(lt) {
        h7.root.visible = false; h14.root.visible = true;
        opa.sit(); opa.body.position.y = -0.45; opa.face(lt > 0.3 ? "laugh" : "sick");
        opa.armR.rotation.x = -1.2 * ramp(lt, 0.2, 0.25);
        h14.face("happy").reach("R", 0.9);
      },
    },
    { // 15 Für den Arzt
      at: T.s("s14"), set: dr,
      cam: [{ pos: [0.6, 5.6, 12.5], look: [0.4, 4.1, 0.6], fov: 44 }, { pos: [0.5, 5.4, 11], look: [0.4, 4.2, 0.8], fov: 44 }],
      update(lt) {
        arzt.root.visible = false; chips.visible = false; arzt2.root.visible = true; h15.root.visible = true;
        arzt2.idle(lt).face(lt > 0.25 ? "laugh" : "wow").reach("L", 0.8 * ramp(lt, 0.1, 0.25));
        h15.face("happy").reach("R", 0.9);
      },
    },
    { // 16 Am nächsten Morgen: alle arbeiten
      at: T.s("s15"), set: mo,
      cam: [{ pos: [2, 5, 12], look: [0, 4, -8], fov: 50 }, { pos: [6, 11, 22], look: [4, 3.5, -8], fov: 52 }],
      update(lt) {
        workers.forEach(({ c, job, x }, i) => {
          const v = tween(lt, 0.2 + i * 0.05, 1.4, 0, [12, 25, 15, 18, 30, 40, 9, 22, 14, 11][i]);
          c.pill(...[`+${v} €`, "green"]);
          if (job === "sweep") { c.idle(lt).face("happy"); c.armR.rotation.x = -0.4 + Math.sin(lt * 6 + i) * 0.35; }
          else if (job === "carry") { c.walk(lt, 0.8).face("happy"); c.armL.rotation.x = c.armR.rotation.x = -1.2; c.root.rotation.y = 1.4; c.root.position.x = x + lt * 1.3; }
          else if (job === "walk") { c.walk(lt, 1).face("happy"); c.root.rotation.y = -1.4; c.root.position.x = x - lt * 1.5; }
          else if (job === "bread") { c.idle(lt).face("laugh").reach("R", 0.8); }
          else { c.wave(lt).face("laugh"); }
        });
      },
    },
    { // 17 Pointe: Bäcker schläft immer noch
      at: T.s("s16"), set: bd,
      cam: [{ pos: [1.6, 5.6, 8], look: [1.2, 3.3, -2.5], fov: 44 }, { pos: [2.2, 4.9, 3.4], look: [2.2, 3.6, -2.5], fov: 40 }],
      update(lt) {
        baker.lieSide(lt, { arms: false }).face("sleep"); baker.body.position.set(0, 2.75, 0);
        zz.forEach((z, i) => { const k = ((lt * 0.7 + i / 3) % 1); z.position.set(3.4 + k * 1.2, 4.6 + k * 3, -2.2); z.material.opacity = Math.sin(k * Math.PI); });
      },
    },
  ];
}
