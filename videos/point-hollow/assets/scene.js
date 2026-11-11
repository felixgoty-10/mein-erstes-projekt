// Drehbuch: "In dieser Stadt hasst mich jeder wegen meiner Hautfarbe" (Point Hollow)
export default function direct(W, S, T) {
  const { character, house, tree, street, plaza, room, sofa, signMesh, pine, snowGround, snowfall, snowfallAt, schoolBus,
    busStop, stream, fallenLog, frozenFall, streetLamp, cafeteriaTable, mat, ramp, ease, clamp, lerp, rng, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const DARK = "#6b4226";
  const ICH = { shirt: { type: "varsity", number: "13" }, hair: { type: "curly", color: "#111", seed: 11 }, skin: DARK, phase: 0 };
  const ICH_W = { ...ICH, hat: "beanie", hatColor: "#2e7d32", hatColor2: "#f4f1ea" };
  const OMA = { shirt: { type: "plaid", color: "#e9c46a", line: "#8a5a2b" }, hair: { type: "bun", color: "#cfcfcf" }, glasses: true, skin: DARK, pants: "#5a4632", phase: 1.2 };
  const VATER = { shirt: { type: "jacket", color: "#7a4a2a", inner: "#f2efe8" }, hair: { type: "short", color: "#111" }, skin: DARK, beard: "#111", pants: "#2d3e66", phase: 2.0 };
  const LUIS = { shirt: { type: "jacket", color: "#2d5fb5", inner: "#f2efe8" }, hair: { type: "short", color: "#e2c27a" }, pants: "#333", phase: 0.7 };
  const LUIS_W = { ...LUIS, hat: "beanie", hatColor: "#8a8f98", hatColor2: "#d9d9d9" };
  const LEHRER = { shirt: { type: "jacket", color: "#5a4632", inner: "#d9d3c6" }, hair: { type: "short", color: "#6b6b6b" }, glasses: true, beard: "#6b6b6b", pants: "#3a3a40", phase: 1.5 };
  const KIDS = [
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" } },
    { shirt: { type: "tee", color: "#f2b632", stripe: "#2d5fb5" }, hair: { type: "long", color: "#e2c27a" }, pants: "#2d5fb5" },
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "bun", color: "#5b3a22" } },
    { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "curly", color: "#5b3a22", seed: 3 } },
    { shirt: { type: "tee", color: "#7fb3e6" }, hair: { type: "long", color: "#3a2a1c" } },
    { shirt: { type: "jacket", color: "#9b59b6", inner: "#f2efe8" }, hair: { type: "short", color: "#2a2a2a" } },
    { shirt: { type: "hoodie", color: "#d23b3b" }, hair: { type: "curly", color: "#e2c27a", seed: 9 } },
  ];
  const kid = (i, winter = false) => character({ ...KIDS[i % KIDS.length], phase: i * 0.7, ...(winter ? { hat: "beanie", hatColor: ["#3498db", "#e74c3c", "#f1c40f", "#9b59b6"][i % 4] } : {}) });

  // ---------------------------------------------------------- A) Stadt (Herbst)
  const st = W.set("town", 0, 0);
  W.add(st, street(160), 0, 0, 0);
  [[-24, C.pink, C.roofBlue], [-10, "#f3e6c9", "#7a3b2b"], [4, "#b9d7a8", C.roofBlue], [18, "#f0c9a2", "#7a3b2b"], [32, "#cfe0f1", C.roofBlue]].forEach(([x, col, roof]) =>
    W.add(st, house({ w: 10, d: 8, h: 6.8, color: col, roof }), x, 0, -15));
  [[-17, -10.5], [-3, -10.2], [11, -10.5], [25, -10.2]].forEach(([x, z], i) => { const t = tree(1, i + 3); t.children.slice(1).forEach((m) => (m.material = mat(["#d9822b", "#c0392b", "#e0a526"][i % 3]))); W.add(st, t, x, 0, z); });
  const ortsschild = new THREE.Group();
  [-1.4, 1.4].forEach((x) => { const pf = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.18), mat("#8a8f98")); pf.position.set(x, 2.1, 0); ortsschild.add(pf); });
  const os = signMesh("POINT HOLLOW", 3.6, 1.1, { bg: "#f6d33c", fg: "#1d1d22", border: "#1d1d22" }); os.position.y = 3.7; ortsschild.add(os);
  W.add(st, ortsschild, -32, 0, -7.5, 0.3);
  const ichA = W.addChar(st, character(ICH), -6, -6.6, Math.PI / 2);
  const omaA = W.addChar(st, character(OMA), 4.6, -9.6, 0.1);
  const vaterA = W.addChar(st, character(VATER), 8.0, -9.6, -0.1);
  const ichHaus = W.addChar(st, character(ICH), 6.3, -8.6, 0);
  const nachbarn = [[-14, -10.6, 0.3], [-7.5, -10.8, 0.1], [12, -10.6, -0.2], [20, -10.8, -0.3]].map(([x, z, r], i) => ({ c: W.addChar(st, kid(i + 2), x, z, r), x, z, r }));

  // ---------------------------------------------------------- B) Zuhause
  const hm = W.set("home", 600, 0, { interior: true });
  W.add(hm, room({ wall: "#e9cfa8", floor: "#a8703f", rug: "#c0392b" }), 0, 0, 0);
  W.add(hm, sofa("#5a7d4a"), 0, 0, -3.8);
  const omaH = W.addChar(hm, character(OMA), -1.4, -3.6, 0.15);
  const ichH = W.addChar(hm, character(ICH), 1.4, -3.6, -0.15);
  const vaterH = W.addChar(hm, character(VATER), 4.6, -1.6, -0.6);

  // ---------------------------------------------------------- C) Kantine
  const kt = W.set("cafeteria", 900, 0, { interior: true });
  W.add(kt, room({ w: 22, d: 14, h: 9, wall: "#f1ebe1", floor: "#cfd6dc", window: true }), 0, 0, 0);
  W.add(kt, cafeteriaTable(), 0, 0, -1.5);
  W.add(kt, cafeteriaTable(), 0, 0, -8.5);
  const ichK = W.addChar(kt, character(ICH), 0, -3.4, 0);
  const tablett = W.add(kt, new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 1.0), mat("#c0392b")), 0, 2.4, -2.2);
  const tischKids = [[-2.6, -3.4, 0], [2.6, -3.4, 0], [-4.8, -3.4, 0], [4.8, -3.4, 0], [-5.2, 0.4, Math.PI]].map(([x, z, r], i) => ({ c: W.addChar(kt, kid(i), x, z, r), x, z, r }));

  // ---------------------------------------------------------- D) Sportplatz
  const sp = W.set("sport", 300, 300);
  W.add(sp, plaza(30, 22), 0, 0, -4);
  [[-15, -14], [15, -14]].forEach(([x, z], i) => W.add(sp, tree(1.1, 30 + i), x, 0, z));
  const teamA = [-9, -6.5, -4].map((x, i) => W.addChar(sp, kid(i), x, -6, 0.3));
  const teamB = [4, 6.5, 9].map((x, i) => W.addChar(sp, kid(i + 3), x, -6, -0.3));
  const ichSp = W.addChar(sp, character(ICH), 0, -1.5, 0);

  // ---------------------------------------------------------- E) Bushaltestelle
  const bs = W.set("busstop", 0, 300);
  W.add(bs, street(220), 0, 0, 0);
  [[-20, -12], [-6, -13], [8, -12], [22, -13]].forEach(([x, z], i) => W.add(bs, pine(1.1, false, i), x, 0, z));
  W.add(bs, busStop(), 2.2, 0, -5.6);
  const ichBus = W.addChar(bs, character(ICH), 0, -6.4, 0);
  const bus = W.add(bs, schoolBus(), -40, 0, -1.6, Math.PI / 2);
  const busKids = [0, 1, 2].map((i) => { const k = kid(i); k.root.scale.setScalar(0.5); return k; });

  // ---------------------------------------------------------- F/G) Waldweg (Tag / Dämmerung)
  function wald(set, { night = false, snow = false } = {}) {
    if (snow) W.add(set, snowGround(160, 120), 0, 0, 0);
    const r = rng(night ? 21 : 7);
    for (let i = 0; i < 26; i++) {
      const x = -40 + i * 3.2 + r() * 2, z = -(5 + r() * 12);
      W.add(set, pine(0.9 + r() * 0.5, snow, i), x, 0, z);
    }
    const path = new THREE.Mesh(new THREE.PlaneGeometry(90, 2.6), new THREE.MeshStandardMaterial({ color: snow ? "#e2e8ef" : "#a07b4f", roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    path.rotation.x = -Math.PI / 2; path.position.set(0, 0.07, 0); set.add(path);
    W.add(set, fallenLog(), -6, 0, 0, Math.PI / 2);
    W.add(set, stream(30), 8, 0, 0, Math.PI / 2);
  }
  const wt = W.set("forestDay", 0, 600); wald(wt);
  const ichWald = W.addChar(wt, character(ICH), -16, 0, Math.PI / 2);
  const wn = W.set("forestDusk", 300, 600, { night: true }); wald(wn, { night: true });
  const ichDunkel = W.addChar(wn, character(ICH), -16, 0, Math.PI / 2);
  const wnLight = new THREE.PointLight("#b3c6ff", 60, 60, 1.0); wnLight.position.set(0, 10, 8); wn.add(wnLight);

  // ---------------------------------------------------------- H) Gefrorener Wasserfall
  const wf = W.set("waterfall", 600, 600);
  W.add(wf, snowGround(160, 120), 0, 0, 0);
  W.add(wf, frozenFall(), 0, 0, -14);
  for (let i = 0; i < 12; i++) W.add(wf, pine(1.1, true, 40 + i), -26 + i * 4.8, 0, -8 - (i % 3) * 3);
  const klasse = [];
  const lehrerWf = W.addChar(wf, character(LEHRER), -5, -3, 0.4);
  const luisWf = W.addChar(wf, character(LUIS_W), 2.4, -3.4, -0.2);
  for (let i = 0; i < 6; i++) klasse.push(W.addChar(wf, kid(i, true), -2.5 + i * 2.6 - (i > 2 ? 0 : 6), -1 - (i % 2) * 2.2, (i % 2 ? -0.2 : 0.2)));
  const ichWf = W.addChar(wf, character(ICH_W), 9.5, 0.8, -0.4);

  // ---------------------------------------------------------- I) Schneesturm (Abend → Nacht)
  const sd = W.set("stormDay", 900, 600);
  wald(sd, { snow: true });
  const flockenTag = snowfall(1800, 46, 24, 30, 3); sd.add(flockenTag);
  const sn = W.set("stormNight", 1200, 600, { night: true });
  wald(sn, { night: true, snow: true });
  const flockenNacht = snowfall(2200, 46, 24, 30, 4); sn.add(flockenNacht);
  const snLight = new THREE.PointLight("#8fa6e6", 14, 40, 1.2); snLight.position.set(0, 9, 8); sn.add(snLight);
  const gruppeTag = [], gruppeNacht = [];
  const pos = [[-3, -1.6], [-0.4, -2.8], [2.2, -1.4], [4.6, -2.6], [-5.6, -3.0], [7, -1.2]];
  pos.forEach(([x, z], i) => { gruppeTag.push(W.addChar(sd, kid(i, true), x, z, 0)); gruppeNacht.push(W.addChar(sn, kid(i, true), x, z, 0)); });
  const lehrerSd = W.addChar(sd, character(LEHRER), -8, -1.4, 0.4), lehrerSn = W.addChar(sn, character(LEHRER), -8, -1.4, 0.4);
  const luisSd = W.addChar(sd, character(LUIS_W), 9.4, -2.4, -0.4), luisSn = W.addChar(sn, character(LUIS_W), 9.4, -2.4, -0.4);
  const ichSd = W.addChar(sd, character(ICH_W), 0.8, 1.6, 0), ichSn = W.addChar(sn, character(ICH_W), 0.8, 1.6, 0);
  [lehrerSn, ...gruppeNacht].forEach((c) => { const ph = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.1), mat("#111")); ph.position.set(0, -1.95, 0.5); c.armR.add(ph); });

  // ---------------------------------------------------------- J) Die Kette im Dunkeln
  const kc = W.set("chain", 1500, 600, { night: true });
  wald(kc, { night: true, snow: true });
  const flockenKette = snowfall(2200, 70, 24, 30, 8); kc.add(flockenKette);
  const kcLight = new THREE.PointLight("#8fa6e6", 16, 50, 1.1); kcLight.position.set(0, 10, 8); kc.add(kcLight);
  const kette = [character(ICH_W), character(LUIS_W)];
  for (let i = 0; i < 8; i++) kette.push(kid(i, true));
  kette.push(character(LEHRER));
  kette.forEach((c, i) => W.addChar(kc, c, 0, 0, Math.PI / 2));

  // ---------------------------------------------------------- K) Stadtrand mit Laterne
  const sr = W.set("townEdge", 1800, 600, { night: true });
  W.add(sr, snowGround(160, 120), 0, 0, 0);
  W.add(sr, street(120), 0, 0, -4);
  [[-14, C.pink], [0, "#f3e6c9"], [14, "#cfe0f1"]].forEach(([x, col]) => {
    const h = house({ w: 10, d: 8, h: 6.6, color: col, roof: "#f4f7fb" }); W.add(sr, h, x, 0, -18);
  });
  const laterne = W.add(sr, streetLamp(60), 1.5, 0, 1.5);
  const flockenStadt = snowfall(1200, 40, 20, 24, 9); sr.add(flockenStadt);
  const reihe = [character(ICH_W), character(LUIS_W)];
  for (let i = 0; i < 6; i++) reihe.push(kid(i, true));
  reihe.push(character(LEHRER));
  reihe.forEach((c) => W.addChar(sr, c, 0, 0, Math.PI / 2));
  const srLight = new THREE.PointLight("#8fa6e6", 10, 40, 1.2); srLight.position.set(-10, 9, 8); sr.add(srLight);
  const srFront = new THREE.PointLight("#ffd9a0", 22, 22, 1.2); srFront.position.set(6, 5, 9); sr.add(srFront);

  // ---------------------------------------------------------- Hilfen
  // Kette entlang +x: Anführer bei x0, alle 2.9 hinter einander; jeder hält die Hand des Vorderen
  const kettePose = (list, x0, z0, lt, { walk = 0.7, slip = -1 } = {}) => {
    list.forEach((c, i) => {
      c.root.position.set(x0 - i * 2.9, 0, z0); c.root.rotation.y = Math.PI / 2;
      if (walk) c.walk(lt + i * 0.13, walk); else c.idle(lt + i);
      if (i > 0) { c.armL.rotation.x = -1.65 * 0.58; }           // Hand nach vorne
      if (i < list.length - 1) { c.armL.rotation.x = i > 0 ? c.armL.rotation.x : 0; c.armR.rotation.x = 0.9; } // hintere Hand zurück
      if (i === slip) { c.body.rotation.z = 0.0; c.body.rotation.x = 0.0; }
    });
  };
  const handHalten = (vorne, hinten) => { vorne.armL.rotation.x = 0.9; hinten.armL.rotation.x = -0.95; };
  const flocken = (pts, t, wind, speed = 1) => snowfallAt(pts, t, wind, speed);

  // ---------------------------------------------------------- Einstellungen
  return [
    { // s1 Hook: Ich gehe durch die Stadt, alle starren
      at: 0, set: st,
      cam: [{ pos: [-7, 7.2, 16], look: [-6, 4.6, -7.5], fov: 46 }, { pos: [0, 7.0, 15], look: [0, 4.6, -7.5], fov: 46 }],
      update(lt, u) {
        omaA.root.visible = vaterA.root.visible = ichHaus.root.visible = false;
        ichA.walk(lt, 0.7).face("sad"); ichA.root.position.x = lerp(-7, 1, u);
        nachbarn.forEach(({ c }) => { c.idle(lt).face("neutral"); c.lookAt(lerp(-0.5, 0.5, u)); });
      },
    },
    { // s2 Einzige schwarze Familie in Point Hollow
      at: T.s("s2"), set: st,
      cam: [{ pos: [6.3, 6.4, 6], look: [6.3, 4.4, -9.4], fov: 46 }, { pos: [6.3, 6.2, 4.5], look: [6.3, 4.5, -9.4], fov: 46 }],
      update(lt) {
        ichA.root.visible = false; omaA.root.visible = vaterA.root.visible = ichHaus.root.visible = true;
        omaA.idle(lt).face("happy"); vaterA.idle(lt).face("neutral"); ichHaus.idle(lt).face("neutral");
        nachbarn.forEach(({ c }) => (c.root.visible = false));
      },
    },
    { // s3 Noch nie jemand so jemanden wie mich gesehen (Nachbarn ängstlich)
      at: T.s("s3"), set: st,
      cam: [{ pos: [16, 7.4, 12], look: [16, 4.6, -10.7], fov: 52 }, { pos: [16, 7.2, 9.5], look: [16, 4.7, -10.7], fov: 52 }],
      update(lt) {
        ichA.root.visible = false; omaA.root.visible = vaterA.root.visible = ichHaus.root.visible = false;
        nachbarn.forEach(({ c, r }, i) => { c.root.visible = true; c.idle(lt).face(i % 2 ? "worried" : "shock"); c.root.rotation.y = r; });
      },
    },
    { // s4 Oma: Menschen haben Angst vor dem Unbekannten
      at: T.s("s4"), set: hm,
      cam: [{ pos: [0, 6.0, 11], look: [0, 3.6, -3.6], fov: 44 }, { pos: [-0.5, 5.6, 9], look: [-0.4, 3.8, -3.6], fov: 44 }],
      update(lt) {
        vaterH.root.visible = false;
        omaH.sit(); omaH.body.position.y = -0.45; omaH.face("happy"); omaH.armL.rotation.z = 0.0; omaH.armR.rotation.z = 1.1;
        ichH.sit(); ichH.body.position.y = -0.45; ichH.face("sad"); ichH.lookAt(0.3);
      },
    },
    { // s5 In der Kantine stehen alle auf
      at: T.s("s5"), set: kt,
      cam: [{ pos: [0, 7.6, 16], look: [0, 3.4, -3.4], fov: 46 }, { pos: [0, 7.2, 13.5], look: [0, 3.6, -3.4], fov: 46 }],
      update(lt, u) {
        ichK.sit(); ichK.body.position.y = -0.55; ichK.face("sad");
        tischKids.forEach(({ c, x, z, r }, i) => {
          const go = clamp((u - 0.25 - i * 0.05) * 2.2);
          if (go <= 0) { c.sit(); c.body.position.y = -0.55; c.face("neutral"); c.root.position.set(x, 0, z); c.root.rotation.y = r; }
          else { c.walk(lt, 1).face("neutral"); c.root.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2; c.root.position.set(x + Math.sign(x || 1) * go * 9, 0, z); }
        });
      },
    },
    { // s6 In Sport wählt mich niemand
      at: T.s("s6"), set: sp,
      cam: [{ pos: [0, 7, 15], look: [0, 4.2, -4], fov: 48 }, { pos: [0, 6.6, 12], look: [0, 4.4, -3], fov: 48 }],
      update(lt) {
        [...teamA, ...teamB].forEach((c, i) => c.cheer(lt + i * 0.3, false).face("laugh"));
        ichSp.idle(lt).face("sad"); ichSp.head.rotation.x = 0.2;
      },
    },
    { // s7 Der Schulbus fährt vorbei
      at: T.s("s7"), set: bs,
      cam: [{ pos: [3, 5.4, 11], look: [0, 3.6, -5], fov: 48 }, { pos: [3.5, 5.4, 10], look: [0, 3.8, -5], fov: 48 }],
      update(lt, u) {
        ichBus.idle(lt).face(u > 0.5 ? "sad" : "neutral"); ichBus.reach("R", u < 0.5 ? ramp(lt, 0.3, 0.4) : 0.5); ichBus.root.rotation.y = 0;
        bus.position.set(lerp(-34, 40, ease.inOut(clamp((u - 0.15) * 1.3))), 0, -1.6); bus.rotation.set(0, Math.PI / 2, 0);
        ichBus.lookAt(lerp(-0.8, 0.8, clamp((u - 0.2) * 1.5)));
      },
    },
    { // s8 Also bin ich jeden Tag gelaufen
      at: T.s("s8"), set: bs,
      cam: [{ pos: [-2, 5.6, 12], look: [1, 3.8, -6.4], fov: 48 }, { pos: [2, 5.6, 12], look: [4, 3.8, -6.4], fov: 48 }],
      update(lt) { bus.position.set(60, 0, -1.6); ichBus.walk(lt, 0.8).face("neutral"); ichBus.root.rotation.y = Math.PI / 2; ichBus.root.position.x = lt * 1.6; },
    },
    { // s9 Durch den Wald
      at: T.s("s9"), set: wt,
      cam: [{ pos: [-18, 6.4, 15], look: [-14, 3.6, 0], fov: 48 }, { pos: [-12, 6.4, 15], look: [-10, 3.6, 0], fov: 48 }],
      update(lt, u) { ichWald.walk(lt, 0.8).face("neutral"); ichWald.root.position.set(lerp(-15, -10, u), 0, 0); },
    },
    { // s10 Über den umgefallenen Baum
      at: T.s("s10"), set: wt,
      cam: [{ pos: [-7, 5.6, 14], look: [-6, 2.8, 0], fov: 46 }, { pos: [-5, 5.6, 13.5], look: [-5, 2.8, 0], fov: 46 }],
      update(lt, u) {
        const x = lerp(-9.5, -2.5, u); ichWald.root.position.set(x, 0, 0); ichWald.walk(lt, 0.8).face("happy");
        const k = clamp(1 - Math.abs(x + 6) / 1.6); ichWald.body.position.y = Math.sin(k * Math.PI / 2) * 1.3;
      },
    },
    { // s11 Über die Steine im Bach
      at: T.s("s11"), set: wt,
      cam: [{ pos: [7, 5.6, 14], look: [8, 2.6, 0], fov: 46 }, { pos: [9, 5.6, 13.5], look: [9, 2.6, 0], fov: 46 }],
      update(lt, u) {
        const x = lerp(5.5, 11, u); ichWald.root.position.set(x, 0, 0); ichWald.walk(lt, 0.6).face("happy");
        ichWald.body.position.y = Math.abs(Math.sin(u * Math.PI * 3)) * 0.6;
      },
    },
    { // s12 Im Winter wird es schnell dunkel
      at: T.s("s12"), set: wn,
      cam: [{ pos: [-13, 9, 20], look: [-14, 2.8, 0], fov: 48 }, { pos: [-13, 6.8, 15], look: [-13, 3.2, 0], fov: 48 }],
      update(lt, u) { ichDunkel.walk(lt, 0.7).face("worried"); ichDunkel.root.position.set(lerp(-16, -12, u), 0, 0); },
    },
    { // s13 Oft im Dunkeln nach Hause
      at: T.s("s13"), set: wn,
      cam: [{ pos: [-6, 6, 15], look: [-6, 3.4, 0], fov: 46 }, { pos: [-4, 6, 15], look: [-4, 3.4, 0], fov: 46 }],
      update(lt, u) {
        const x = lerp(-8.5, -3, u); ichDunkel.root.position.set(x, 0, 0); ichDunkel.walk(lt, 0.7).face("neutral");
        const k = clamp(1 - Math.abs(x + 6) / 1.6); ichDunkel.body.position.y = Math.sin(k * Math.PI / 2) * 1.3;
      },
    },
    { // s14 Mit geschlossenen Augen
      at: T.s("s14"), set: wn,
      cam: [{ pos: [9.5, 6.4, 12.5], look: [8, 4.4, 0], fov: 40 }, { pos: [9.3, 6.4, 11.2], look: [8, 4.5, 0], fov: 40 }],
      update(lt, u) { ichDunkel.root.position.set(lerp(6, 10, u), 0, 0); ichDunkel.walk(lt, 0.5).face("sleep"); ichDunkel.body.position.y = Math.abs(Math.sin(u * Math.PI * 3)) * 0.5; },
    },
    { // s15 Vater: Eines Tages werden sie merken, wer du bist
      at: T.s("s15"), set: hm,
      cam: [{ pos: [3, 6.4, 11], look: [3, 4.2, -2.6], fov: 44 }, { pos: [3, 6.2, 9.6], look: [3, 4.3, -2.6], fov: 44 }],
      update(lt) {
        omaH.root.visible = false;
        ichH.sit(); ichH.body.position.y = -0.45; ichH.face(lt > 2 ? "happy" : "sad"); ichH.lookAt(0.5);
        vaterH.root.position.set(4.2, 0, -1.9); vaterH.root.rotation.y = -0.9; vaterH.idle(lt).face("happy"); vaterH.reach("L", 0.7);
      },
    },
    { // s16 Dezember: Ausflug zum gefrorenen Wasserfall (Karte zuerst)
      at: T.s("s16"), set: wf,
      cam: [{ pos: [2, 8, 22], look: [0, 6, -10], fov: 50 }, { pos: [2, 7, 17], look: [0, 6.5, -10], fov: 50 }],
      update(lt) {
        lehrerWf.idle(lt).face("happy"); lehrerWf.root.rotation.y = 0.4;
        luisWf.idle(lt).face("laugh"); klasse.forEach((c, i) => { c.idle(lt + i).face(i % 2 ? "wow" : "happy"); c.root.rotation.y = Math.PI + (i % 2 ? 0.2 : -0.2); });
        ichWf.idle(lt).face("wow"); ichWf.root.rotation.y = Math.PI - 0.4;
      },
    },
    { // s17 Auf dem Rückweg fängt es an zu schneien
      at: T.s("s17"), set: sd,
      cam: [{ pos: [0.0,  7.12,  19.8], look: [0, 4, -1], fov: 48 }, { pos: [0.0,  6.8,  17.2], look: [0, 4.2, -1], fov: 48 }],
      update(lt, u, t) {
        flocken(flockenTag, t, 0.5, 0.6);
        [...gruppeTag, lehrerSd, luisSd].forEach((c, i) => { c.walk(lt + i * 0.3, 0.6).face("neutral"); c.root.rotation.y = Math.PI / 2; });
        ichSd.walk(lt, 0.6).face("worried"); ichSd.root.rotation.y = Math.PI / 2; ichSd.lookAt(-0.6);
      },
    },
    { // s18 So heftig, dass der Weg verschwindet
      at: T.s("s18"), set: sd,
      cam: [{ pos: [-2, 7, 17], look: [0, 3.6, -1], fov: 50 }, { pos: [2, 7.4, 18], look: [0, 3.4, -1], fov: 50 }],
      update(lt, u, t) {
        flocken(flockenTag, t, 4 + u * 4, 1.4);
        [...gruppeTag, lehrerSd, luisSd].forEach((c, i) => { c.idle(lt + i).face("worried"); c.root.rotation.y = Math.PI / 2 + Math.sin(lt * 2 + i) * 0.6; c.handsOnHead(0.3); });
        ichSd.idle(lt).face("worried"); ichSd.root.rotation.y = 0.3;
      },
    },
    { // s19 Die Sonne geht unter
      at: T.s("s19"), set: sn,
      cam: [{ pos: [0, 12, 22], look: [0, 6, -10], fov: 50 }, { pos: [0, 7, 16], look: [0, 4, -1], fov: 50 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 6, 1.4);
        [...gruppeNacht, lehrerSn, luisSn].forEach((c, i) => { c.idle(lt + i).face("worried"); c.root.rotation.y = Math.sin(i) * 0.8; });
        ichSn.idle(lt).face("worried");
      },
    },
    { // s20 Alle Handys leer
      at: T.s("s20"), set: sn,
      cam: [{ pos: [-6.0,  6.8,  14.2], look: [-7.2, 4.4, -1.4], fov: 42 }, { pos: [-6.2,  6.6,  12.7], look: [-7.4, 4.5, -1.4], fov: 42 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 6, 1.4);
        lehrerSn.idle(lt).face("worried"); lehrerSn.reach("R", 0.85); lehrerSn.root.rotation.y = 0.3;
        gruppeNacht.forEach((c, i) => { c.idle(lt + i).face("sad"); c.reach("R", 0.8); }); ichSn.face("worried");
      },
    },
    { // s21 So dunkel, dass wir unsere Hände nicht sehen
      at: T.s("s21"), set: sn,
      cam: [{ pos: [0.8,  5.96,  10.24], look: [0.8, 3.4, 1.6], fov: 44 }, { pos: [0.8,  5.76,  8.64], look: [0.8, 3.2, 1.6], fov: 44 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 7, 1.5);
        ichSn.idle(lt).face("worried"); ichSn.reach("R", 0.6); ichSn.reach("L", 0.6); ichSn.head.rotation.x = 0.35;
      },
    },
    { // s22 Kinder weinen, Wind wird stärker
      at: T.s("s22"), set: sn,
      cam: [{ pos: [-1, 6.4, 12], look: [0, 3.8, -2], fov: 46 }, { pos: [0, 6.2, 10.5], look: [0, 3.9, -2], fov: 46 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 10, 1.8);
        gruppeNacht.forEach((c, i) => { c.idle(lt * 2 + i).face("sad"); c.handsOnHead(0.5); c.root.rotation.y = Math.sin(lt * 4 + i) * 0.15; });
        lehrerSn.face("worried"); ichSn.face("worried");
      },
    },
    { // s23 Ich kenne den Weg
      at: T.s("s23"), set: sn,
      cam: [{ pos: [1.55,  6.1,  11.47], look: [0.8, 4.6, 1.6], fov: 40 }, { pos: [1.43,  6.07,  10.35], look: [0.8, 4.7, 1.6], fov: 40 }],
      update(lt, u, t) { flocken(flockenNacht, t, 9, 1.6); ichSn.idle(lt).face("neutral"); ichSn.root.rotation.y = 0; },
    },
    { // s24 Wir folgen ihm nicht, sagt Luis
      at: T.s("s24"), set: sn,
      cam: [{ pos: [8.2,  6.4,  11.7], look: [9.4, 4.6, -2.4], fov: 40 }, { pos: [8.35,  6.35,  10.5], look: [9.4, 4.7, -2.4], fov: 40 }],
      update(lt, u, t) { flocken(flockenNacht, t, 9, 1.6); luisSn.idle(lt).face("smug"); luisSn.shrug(0.6); luisSn.root.rotation.y = -0.4; },
    },
    { // s25 Luis hatte nie ein nettes Wort
      at: T.s("s25"), set: sn,
      cam: [{ pos: [8.35,  6.35,  10.5], look: [9.4, 4.7, -2.4], fov: 40 }, { pos: [8.5,  6.3,  9.3], look: [9.4, 4.8, -2.4], fov: 40 }],
      update(lt, u, t) { flocken(flockenNacht, t, 9, 1.6); luisSn.idle(lt).face("neutral"); luisSn.root.rotation.y = -0.4; },
    },
    { // s26 Niemand sonst wusste, wo wir waren
      at: T.s("s26"), set: sn,
      cam: [{ pos: [0, 9, 18], look: [0, 3, -2], fov: 50 }, { pos: [0, 10, 20], look: [0, 3, -2], fov: 50 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 10, 1.8);
        [...gruppeNacht, lehrerSn, luisSn].forEach((c, i) => { c.idle(lt + i).face("worried"); c.root.rotation.y = Math.sin(i * 2) * 1.2; });
        ichSn.idle(lt).face("neutral");
      },
    },
    { // s27 Keiner sieht, wer ich bin – nur meine Stimme
      at: T.s("s27"), set: sn,
      cam: [{ pos: [0.8,  4.8,  12.0], look: [0.8, 4.0, 1.6], fov: 40 }, { pos: [0.8,  4.8,  10.5], look: [0.8, 4.1, 1.6], fov: 40 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 9, 1.6);
        snLight.intensity = 3; ichSn.idle(lt).face("neutral");
      },
    },
    { // s28 Alle Hände halten und mir folgen!
      at: T.s("s28"), set: sn,
      cam: [{ pos: [3.2, 5.6, 9.5], look: [0.8, 4.0, 1.6], fov: 42 }, { pos: [3.0, 5.6, 8.6], look: [0.8, 4.1, 1.6], fov: 42 }],
      update(lt, u, t) {
        flocken(flockenNacht, t, 9, 1.6); snLight.intensity = 14;
        ichSn.root.rotation.y = Math.PI / 2; ichSn.face("neutral"); ichSn.armL.rotation.x = 0.9 * ramp(lt, 0.2, 0.4);
      },
    },
    { // s29 Und das taten sie (Kette bildet sich)
      at: T.s("s29"), set: kc,
      cam: [{ pos: [-26, 7, 20], look: [-30, 3.4, 0], fov: 50 }, { pos: [-24, 7, 19], look: [-30, 3.4, 0], fov: 50 }],
      update(lt, u, t) { flocken(flockenKette, t, 7, 1.4); kettePose(kette, -18, 0, lt, { walk: 0 }); kette.forEach((c, i) => c.face(i === 0 ? "neutral" : "worried")); },
    },
    { // s30 Ich sage laut, was kommt: Baum, Steine
      at: T.s("s30"), set: kc,
      cam: [{ pos: [-16, 8, 25], look: [-14, 3.0, 0], fov: 50 }, { pos: [2, 8, 25], look: [2, 3.0, 0], fov: 50 }], ease: ease.linear,
      update(lt, u, t) {
        flocken(flockenKette, t, 7, 1.4);
        const x0 = lerp(-7, 12, u);
        kettePose(kette, x0, 0, lt);
        kette.forEach((c, i) => {
          const x = c.root.position.x; const k = clamp(1 - Math.abs(x + 6) / 1.6); c.body.position.y = Math.sin(k * Math.PI / 2) * 1.2;
          if (Math.abs(x - 8) < 1.8) c.body.position.y = 0.35;
          c.face(i === 0 ? "neutral" : "worried");
        });
      },
    },
    { // s31 Ein Junge rutscht aus – die Reihe zieht ihn hoch
      at: T.s("s31"), set: kc,
      cam: [{ pos: [6, 7, 20], look: [8, 2.6, 0], fov: 48 }, { pos: [7, 7, 19], look: [8.5, 2.8, 0], fov: 48 }],
      update(lt, u, t) {
        flocken(flockenKette, t, 7, 1.4);
        kettePose(kette, 8 + 2.9 * 3, 0, lt, { walk: 0 });
        const j = kette[3]; const fall = Math.sin(clamp(u * 1.6) * Math.PI);
        j.body.rotation.z = 0.9 * fall; j.body.position.y = -0.6 * fall; j.face(fall > 0.3 ? "shock" : "worried");
        [kette[2], kette[4]].forEach((c) => c.face("worried"));
      },
    },
    { // s32 20 Kinder und ein Lehrer, niemand ließ los
      at: T.s("s32"), set: kc,
      cam: [{ pos: [0, 12, 26], look: [0, 2.6, 0], fov: 50 }, { pos: [6, 11, 24], look: [4, 2.6, 0], fov: 50 }],
      update(lt, u, t) { flocken(flockenKette, t, 6, 1.2); kettePose(kette, lerp(14, 20, u), 0, lt); kette.forEach((c) => c.face("neutral")); },
    },
    { // s33 Nach einer Stunde: Lichter der Stadt
      at: T.s("s33"), set: sr,
      cam: [{ pos: [-10, 8, 28], look: [-8, 4, -8], fov: 50 }, { pos: [-8, 8.5, 26], look: [-6, 4.5, -8], fov: 50 }],
      update(lt, u, t) { flocken(flockenStadt, t, 2, 0.8); kettePose(reihe, lerp(-6, -2, u), 2.5, lt); reihe.forEach((c) => c.face("wow")); },
    },
    { // s34 Unter der ersten Laterne sehen alle wieder
      at: T.s("s34"), set: sr,
      cam: [{ pos: [0, 8, 18], look: [0, 4, 1.5], fov: 48 }, { pos: [0, 7, 15], look: [0, 4.2, 1.5], fov: 48 }],
      update(lt, u, t) { flocken(flockenStadt, t, 2, 0.8); kettePose(reihe, lerp(2, 6, ease.out(u)), 1.6, lt, { walk: u < 0.8 ? 0.6 : 0 }); reihe.forEach((c) => c.face("happy")); },
    },
    { // s35 Jeder schaut, wessen Hand er hält
      at: T.s("s35"), set: sr,
      cam: [{ pos: [2, 6.6, 13], look: [1, 3.6, 1.6], fov: 46 }, { pos: [2, 6.4, 11.5], look: [1, 3.8, 1.6], fov: 46 }],
      update(lt, u, t) {
        flocken(flockenStadt, t, 2, 0.8); kettePose(reihe, 6, 1.6, lt, { walk: 0 });
        reihe.forEach((c, i) => { c.head.rotation.x = 0.35; c.lookAt(i % 2 ? 0.5 : -0.5); c.face(i % 2 ? "wow" : "neutral"); });
      },
    },
    { // s36 Luis direkt hinter mir, seine Hand in meiner
      at: T.s("s36"), set: sr,
      cam: [{ pos: [7, 5.8, 19], look: [4.6, 3.6, 1.6], fov: 40 }, { pos: [6.6, 5.6, 17.2], look: [4.6, 3.6, 1.6], fov: 40 }],
      update(lt, u, t) {
        flocken(flockenStadt, t, 2, 0.8); kettePose(reihe, 6, 1.6, lt, { walk: 0 });
        reihe.slice(2).forEach((c) => (c.root.visible = false));
        const [ich, luis] = reihe; luis.root.position.x = 6 - 2.9; ich.root.rotation.y = luis.root.rotation.y = Math.PI / 2 - 0.45;
        handHalten(ich, luis); ich.face("neutral"); luis.face("wow"); luis.head.rotation.x = 0.3; ich.lookAt(-0.5);
      },
    },
    { // s37 Er schaut auf unsere Hände und drückt sie fester
      at: T.s("s37"), set: sr,
      cam: [{ pos: [6.6, 5.6, 17.2], look: [4.6, 3.6, 1.6], fov: 40 }, { pos: [6.2, 5.2, 15.0], look: [4.6, 3.5, 1.6], fov: 38 }],
      update(lt, u, t) {
        flocken(flockenStadt, t, 2, 0.8); kettePose(reihe, 6, 1.6, lt, { walk: 0 });
        reihe.slice(2).forEach((c) => (c.root.visible = false));
        const [ich, luis] = reihe; luis.root.position.x = 6 - 2.9; ich.root.rotation.y = luis.root.rotation.y = Math.PI / 2 - 0.45;
        handHalten(ich, luis);
        const sq = Math.max(0, Math.sin(clamp((lt - 1.2) / 0.6) * Math.PI));
        ich.armL.rotation.x += sq * 0.06; luis.armL.rotation.x -= sq * 0.06;
        luis.head.rotation.x = 0.3; luis.face(lt > 1.2 ? "happy" : "neutral"); ich.face(lt > 1.6 ? "happy" : "neutral"); ich.lookAt(-0.5);
      },
    },
  ];
}
