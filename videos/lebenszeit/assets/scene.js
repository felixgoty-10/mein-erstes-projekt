// Drehbuch: "In dieser Stadt steht über jedem, wie lange er noch lebt" (Horror)
export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, plaza, room, bed, door, alarmClock, nightstand, signMesh,
    mat, ramp, ease, clamp, lerp, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const LUCA = { shirt: { type: "varsity", number: "13" }, hair: { type: "messy", seed: 11 }, phase: 0 };
  const MUTTER = { shirt: { type: "jacket", color: "#5aa17a", inner: "#f2efe8" }, hair: { type: "bun", color: "#5b3a22" }, pants: "#2d3e66", phase: 1.2 };
  const VATER = { shirt: { type: "jacket", color: C.denim }, hair: { type: "short", color: "#2a1d14" }, glasses: true, pants: "#c9b58f", phase: 2.2 };
  const MIA = { shirt: { type: "tee", color: "#e98bb5", stripe: "#ffffff" }, hair: { type: "long", color: "#6b3e22" }, pants: "#2d5fb5", phase: 0.6 };
  const GESTALT = { shadow: true, hat: "hood", scale: 1.22, phase: 0 };
  const EXTRAS = [
    { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "short", color: "#1d1d1d" }, skin: C.skinDark, phase: 1.1 },
    { shirt: { type: "tee", color: "#f2b632", stripe: "#2d5fb5" }, hair: { type: "curly", color: "#111", seed: 8 }, phase: 2.4 },
    { shirt: { type: "suit" }, hair: { type: "short", color: "#777" }, phase: 0.9 },
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "long", color: "#e2c27a" }, phase: 1.7 },
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" }, hat: "cap", hatColor: "#2d5fb5", phase: 0.2 },
  ];
  const extra = (i) => character(EXTRAS[i % EXTRAS.length]);
  const J = (n) => [`${n} Jahre`, "white"];

  // ---------------------------------------------------------- A) Straße, Tag
  const st = W.set("street", 0, 0);
  W.add(st, street(160), 0, 0, 0);
  [[-22, C.pink, C.roofBlue], [-8, "#f3e6c9", "#7a3b2b"], [6, "#b9d7a8", C.roofBlue], [20, "#f0c9a2", "#7a3b2b"]].forEach(([x, col, roof]) =>
    W.add(st, house({ w: 10, d: 8, h: 6.8, color: col, roof }), x, 0, -15));
  [[-15, -10.5], [-1, -10.2], [13, -10.5], [27, -10]].forEach(([x, z], i) => W.add(st, tree(1, i + 3), x, 0, z));
  [[-18, 30, -70, 2.6], [10, 34, -75, 3]].forEach(([x, y, z, s], i) => W.add(st, cloud(s, i + 2), x, y, z));
  const lucaA = W.addChar(st, character(LUCA), 0, -6.6, 0);
  const mutter = W.addChar(st, character(MUTTER), -3.4, -7.4, 0.15);
  const vater = W.addChar(st, character(VATER), 3.4, -7.4, -0.15);
  const passanten = [[-11, -8.6, 41], [10, -8.2, 7], [-17, -7.6, 52], [16, -9, 70]].map(([x, z, n], i) =>
    ({ c: W.addChar(st, extra(i), x, z, i % 2 ? -1.4 : 1.4), x, n }));

  // ---------------------------------------------------------- B) Lucas Zimmer, Nacht
  const bd = W.set("bedroom", 600, 0, { interior: true, night: true });
  W.add(bd, room({ wall: "#cdd6ea", floor: "#8a5a32", night: true }), 0, 0, 0);
  W.add(bd, bed("#3d6fb3"), 0, 0, -2.5, -Math.PI / 2);
  const lucaBett = W.addChar(bd, character(LUCA), -2.3, -2.5, 0);
  const decke = W.add(bd, new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.5, 3.0), mat("#3d6fb3")), -0.7, 2.75, -2.1);
  decke.castShadow = true;
  W.add(bd, nightstand(), 4.9, 0, -4.1);
  W.add(bd, alarmClock("3:00"), 4.9, 1.8, -3.9, -0.3);
  const tuer = W.add(bd, door(), -6.3, 0, -5.75);
  const lucaTuer = W.addChar(bd, character(LUCA), -6.0, -3.6, Math.PI);
  const gestaltEcke = W.addChar(bd, character(GESTALT), 6.6, -4.9, -0.5);
  const moon = new THREE.PointLight("#9db5ff", 18, 18, 1.6); moon.position.set(-3.5, 5.5, -4.5); bd.add(moon);

  // ---------------------------------------------------------- C) Flur (durchs Schlüsselloch)
  const fl = W.set("hall", 900, 0, { interior: true, night: true });
  W.add(fl, room({ w: 9, d: 34, h: 8, wall: "#b9b1a4", floor: "#6e4a2c", window: false, night: true }), 0, 0, -6);
  [-14, -4, 6].forEach((z) => { W.add(fl, door("#d8d2c4"), -4.35, 0, z, Math.PI / 2); });
  W.add(fl, signMesh("", 1.6, 1.2, { bg: "#7f9a7a", border: "#4a3520" }), 4.3, 4.8, -8, -Math.PI / 2);
  const hallLight = new THREE.PointLight("#9fb3ee", 60, 45, 1.0); hallLight.position.set(0, 7, -6); fl.add(hallLight);

  // ---------------------------------------------------------- D) Elternschlafzimmer, Nacht
  const pz = W.set("parents", 1200, 0, { interior: true, night: true });
  W.add(pz, room({ wall: "#d8cbb8", floor: "#7a4e2c", night: true }), 0, 0, 0);
  const grossBett = W.add(pz, bed("#b8484a"), 0.5, 0, -2.0, 0); grossBett.scale.set(1.75, 1, 1);
  const mamaBett = W.addChar(pz, character(MUTTER), -0.9, -4.3, 0);
  const papaBett = W.addChar(pz, character(VATER), 1.9, -4.3, 0);
  const elternDecke = W.add(pz, new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 4.2), mat("#b8484a")), 0.5, 2.85, -1.6);
  elternDecke.castShadow = true;
  const sitzt = (c) => { c.sit(); c.body.position.y = 0.1; c.armL.rotation.x = c.armR.rotation.x = -0.9; };
  const lucaRennt = W.addChar(pz, character(LUCA), -6, 1.2, Math.PI / 2);
  const moon2 = new THREE.PointLight("#9db5ff", 16, 18, 1.6); moon2.position.set(-2, 6, 0); pz.add(moon2);

  // ---------------------------------------------------------- E) Schulhof, Tag
  const sc = W.set("school", 300, 300);
  W.add(sc, plaza(30, 8), 0, 0, -11); // gepflasterter Streifen nur vor dem Gebäude, sonst Rasen
  W.add(sc, house({ w: 18, d: 9, h: 10, color: C.brick, flat: true, sign: "SCHULE", windows: [-6, 0, 6], signStyle: { bg: "#f4efe6", fg: "#2a2a2a", border: "#2a2a2a" } }), 0, 0, -19);
  [[-15, -12], [15, -12], [-19, 2], [19, 1]].forEach(([x, z], i) => W.add(sc, tree(1.15, 40 + i), x, 0, z));
  [[-14, 30, -70, 2.6], [14, 34, -80, 3]].forEach(([x, y, z, s], i) => W.add(sc, cloud(s, i + 6), x, y, z));
  const schueler = [[-9, -7, 71], [9, -6, 45], [-12, -11, 38], [12, -11.5, 66]].map(([x, z, n], i) =>
    ({ c: W.addChar(sc, extra(i + 1), x, z, i % 2 ? -0.5 : 0.5), n }));
  const mia = W.addChar(sc, character(MIA), 2.6, -4, -0.15);
  const gestalt = W.addChar(sc, character({ ...GESTALT, scale: 1.4 }), 3.9, -6.6, -0.25);
  const lucaHof = W.addChar(sc, character(LUCA), -9, 2.5, 1.4);
  const lucaS = W.addChar(sc, character(LUCA), -4, 3, 0.15);
  const gestalt2 = W.addChar(sc, character(GESTALT), -4.6, 1.2, 0.15);

  const only = (...cs) => (lt) => { [lucaHof, lucaS, gestalt2].forEach((c) => (c.root.visible = cs.includes(c))); };
  const miaPill = (t) => { // Countdown synchron zu "Neun. Acht. Sieben.", danach 1 pro Sekunde
    if (t < T.s("s16")) return J(28);
    let sec = 10;
    [0, 1, 2].forEach((i) => { if (t >= T.w("s16b", i, 0)) sec = 9 - i; });
    if (t >= T.w("s16b", 2, 0)) sec = Math.max(0, 7 - Math.floor(t - T.w("s16b", 2, 0)));
    return [`${sec} Sek.`, "red"];
  };
  const schoolBase = (lt, t, visible) => {
    only(...visible)();
    schueler.forEach(({ c, n }) => c.idle(lt).face("happy").pill(...J(n)));
    mia.idle(lt).face("happy").pill(...miaPill(t));
    gestalt.pill("0", "red"); gestalt.head.rotation.x = 0.45; // schaut auf Mia herab
  };

  // ---------------------------------------------------------- Einstellungen
  return [
    { // s1 Hook: Straße, Zahlen über allen Köpfen
      at: 0, set: st,
      cam: [{ pos: [0, 6.8, 19], look: [0, 4.8, -7], fov: 46 }, { pos: [0, 6.2, 13], look: [0, 5, -7], fov: 46 }],
      update(lt) {
        lucaA.idle(lt).face("happy").pill(...J(63));
        mutter.idle(lt).face("happy").pill(...J(28));
        vater.idle(lt).face("neutral").pill(...J(19));
        passanten.forEach(({ c, x, n }, i) => { c.walk(lt, 0.8).face("neutral").pill(...J(n)); c.root.position.x = x + (i % 2 ? -1 : 1) * lt * 1.4; });
      },
    },
    { // s2 Luca: 63 Jahre
      at: T.s("s2"), set: st,
      cam: [{ pos: [0.3, 6.4, 6.4], look: [0, 4.6, -6.6], fov: 40 }, { pos: [0.2, 6.3, 5.2], look: [0, 4.7, -6.6], fov: 40 }],
      update(lt) { lucaA.idle(lt).face("happy").pill(...J(63)); mutter.pill(...J(28)); vater.pill(...J(19)); },
    },
    { // s3 Mutter: 28 Jahre
      at: T.s("s3"), set: st,
      cam: [{ pos: [-3.2, 6.4, 5.6], look: [-3.4, 4.6, -7.4], fov: 40 }, { pos: [-3.3, 6.3, 4.4], look: [-3.4, 4.7, -7.4], fov: 40 }],
      update(lt) { mutter.idle(lt).face("happy").pill(...J(28)); lucaA.pill(...J(63)); },
    },
    { // s4 Vater: 19 Jahre
      at: T.s("s4"), set: st,
      cam: [{ pos: [3.6, 6.4, 5.6], look: [3.4, 4.6, -7.4], fov: 40 }, { pos: [3.5, 6.3, 4.4], look: [3.4, 4.7, -7.4], fov: 40 }],
      update(lt) { vater.idle(lt).face("neutral").pill(...J(19)); lucaA.pill(...J(63)); },
    },
    { // s4b Niemand weiß, was bei null passiert
      at: T.s("s4b"), set: st,
      cam: [{ pos: [0, 5.5, 11], look: [0, 5.2, -7], fov: 46 }, { pos: [0, 11, 20], look: [0, 4, -7], fov: 48 }],
      update(lt) {
        lucaA.idle(lt).face("neutral").pill(...J(63));
        mutter.idle(lt).face("neutral").pill(...J(28));
        vater.idle(lt).face("neutral").pill(...J(19));
        passanten.forEach(({ c, x, n }, i) => { c.walk(lt + 3, 0.8).face("neutral").pill(...J(n)); c.root.position.x = x + (i % 2 ? -1 : 1) * (lt + 3) * 1.4; });
      },
    },
    { // s5 Nachts, 3 Uhr: Luca wacht auf (Karte 3:00 liegt zuerst darüber)
      at: T.s("s5"), set: bd,
      cam: [{ pos: [1.2, 6, 11], look: [1.6, 3.2, -2.5], fov: 46 }, { pos: [1.8, 5.4, 8.5], look: [2.0, 3.3, -2.5], fov: 44 }],
      update(lt) {
        const auf = T.w("s5", 6) - T.s("s5");
        lucaBett.lieSide(lt, { arms: false }).face(lt < auf ? "sleep" : "wow"); lucaBett.body.position.set(0, 2.75, 0);
        lucaTuer.root.visible = false; gestaltEcke.root.visible = false;
      },
    },
    { // s6 Klopfen an der Tür
      at: T.s("s6"), set: bd,
      cam: [{ pos: [-3.2, 4.6, 4.5], look: [-6.3, 2.8, -5.8], fov: 46 }, { pos: [-4.2, 4.2, 1.5], look: [-6.3, 2.6, -5.8], fov: 44 }],
      update(lt) {
        const k = [0.35, 0.7, 1.05].reduce((acc, t0) => acc + Math.max(0, 1 - Math.abs(lt - t0) / 0.06), 0);
        tuer.userData.leaf.rotation.y = -0.012 * k;
        tuer.userData.leaf.position.z = 0.05 - 0.02 * k;
        lucaTuer.root.visible = false; gestaltEcke.root.visible = false;
        lucaBett.lieSide(lt, { arms: false }).face("worried"); lucaBett.body.position.set(0, 2.75, 0);
      },
    },
    { // s7 Luca schaut durchs Schlüsselloch
      at: T.s("s7"), set: bd,
      cam: [{ pos: [-1.6, 5, -1.2], look: [-6.0, 3.6, -4.6], fov: 44 }, { pos: [-2.6, 4.6, -2.4], look: [-6.0, 3.3, -4.8], fov: 42 }],
      update(lt) {
        lucaTuer.root.visible = true; gestaltEcke.root.visible = false; lucaBett.root.visible = false;
        lucaTuer.idle(lt).face("worried"); lucaTuer.body.rotation.x = 0.35 * ramp(lt, 0.1, 0.4);
        lucaTuer.lookAt(0);
      },
    },
    { // s7/s8 Blick durchs Schlüsselloch: leerer Flur
      at: T.w("s7", 3), set: fl,
      cam: [{ pos: [0, 4.4, 9], look: [0, 3.6, -14], fov: 50 }, { pos: [0.3, 4.3, 7.5], look: [0.2, 3.6, -14], fov: 50 }],
      update() {},
    },
    { // s9 Er dreht sich um …
      at: T.s("s9"), set: bd,
      cam: [{ pos: [-2.6, 5.6, 6.0], look: [-6.1, 3.9, -3.6], fov: 42 }, { pos: [-3.0, 5.5, 4.6], look: [-6.1, 4.0, -3.6], fov: 42 }],
      update(lt) {
        lucaTuer.root.visible = true; gestaltEcke.root.visible = false; lucaBett.root.visible = false;
        const k = ramp(lt, 0.1, 0.7);
        lucaTuer.root.rotation.y = lerp(Math.PI, 0.5, k);
        lucaTuer.idle(lt).face(k < 0.8 ? "worried" : "shock");
      },
    },
    { // s9 … schwarze Gestalt in der Ecke
      at: T.w("s9", 5), set: bd,
      cam: [{ pos: [-0.5, 5.4, 8.5], look: [5.6, 4.0, -4.9], fov: 44 }, { pos: [1.0, 5.4, 6.0], look: [5.8, 4.4, -4.9], fov: 44 }],
      update(lt) {
        lucaTuer.root.visible = false; gestaltEcke.root.visible = true; lucaBett.root.visible = false;
        gestaltEcke.pill("0", "red");
      },
    },
    { // s10 Über ihrem Kopf: 0
      at: T.s("s10"), set: bd,
      cam: [{ pos: [4.2, 6.6, 4.8], look: [6.6, 6.2, -4.9], fov: 40 }, { pos: [4.6, 6.8, 3.2], look: [6.6, 6.6, -4.9], fov: 40 }],
      update(lt) {
        lucaTuer.root.visible = false; gestaltEcke.root.visible = true; lucaBett.root.visible = false;
        gestaltEcke.pill("0", "red"); gestaltEcke.head.rotation.y = Math.sin(lt * 0.8) * 0.06;
      },
    },
    { // s10b Sie bewegt sich nicht. Sie starrt ihn nur an.
      at: T.s("s10b"), set: bd,
      cam: [{ pos: [-3.0, 5.6, 6.5], look: [-5.6, 4.6, -3.6], fov: 42 }, { pos: [-3.6, 5.4, 3.8], look: [-5.7, 4.9, -3.6], fov: 40 }],
      update(lt) {
        lucaTuer.root.visible = true; gestaltEcke.root.visible = false; lucaBett.root.visible = false;
        lucaTuer.root.rotation.y = 0.5; lucaTuer.face("shock"); // erstarrt, kein idle
        lucaTuer.lookAt(0.6);
      },
    },
    { // s11 Luca rennt zu den Eltern
      at: T.s("s11"), set: pz,
      cam: [{ pos: [-0.5, 6.8, 14], look: [-0.8, 3.4, -2], fov: 48 }, { pos: [0, 6.4, 12], look: [-0.5, 3.4, -2], fov: 48 }],
      update(lt) {
        lucaRennt.walk(lt, 1.9).face("shock"); lucaRennt.root.position.x = Math.min(-3.6, -8 + lt * 3.4);
        lucaRennt.root.rotation.y = Math.PI / 2;
        [mamaBett, papaBett].forEach((c, i) => { sitzt(c); c.face("sleep"); c.head.rotation.z = i ? -0.25 : 0.25; });
      },
    },
    { // s12 Sie glauben ihm nicht
      at: T.s("s12"), set: pz,
      cam: [{ pos: [-0.6, 6.0, 9.5], look: [0.2, 3.8, -3.5], fov: 44 }, { pos: [-0.3, 5.8, 8.0], look: [0.3, 3.9, -3.5], fov: 44 }],
      update(lt) {
        lucaRennt.idle(lt).face("worried"); lucaRennt.root.position.set(-4.2, 0, 0.2); lucaRennt.root.rotation.y = 1.0;
        sitzt(mamaBett); mamaBett.face("smug"); mamaBett.head.rotation.y = Math.sin(lt * 7) * 0.25; // Kopfschütteln
        sitzt(papaBett); papaBett.face("happy"); papaBett.shrug(1); papaBett.legL.rotation.x = papaBett.legR.rotation.x = -1.57;
      },
    },
    { // s12b Du hast geträumt.
      at: T.s("s12b"), set: pz,
      cam: [{ pos: [1.9, 6.0, 4.5], look: [1.9, 4.6, -4.3], fov: 40 }, { pos: [1.9, 5.9, 3.4], look: [1.9, 4.7, -4.3], fov: 40 }],
      update(lt) {
        lucaRennt.root.position.set(-4.2, 0, 0.2); lucaRennt.root.rotation.y = 1.0;
        sitzt(mamaBett); mamaBett.face("neutral");
        sitzt(papaBett); papaBett.face("smug"); papaBett.reach("R", 0.5);
      },
    },
    { // s13 Am nächsten Morgen in der Schule
      at: T.s("s13"), set: sc,
      cam: [{ pos: [-1, 7.5, 24], look: [0, 4.8, -5], fov: 46 }, { pos: [0, 6.6, 18], look: [0.5, 5, -5], fov: 46 }],
      update(lt, u, t) {
        schoolBase(lt, t, [lucaHof]);
        lucaHof.walk(lt, 0.9).face(lt > 1.6 ? "shock" : "neutral").pill(...J(63));
        lucaHof.root.position.x = Math.min(-4, -7.5 + lt * 2.0);
        if (lt > 2.5) { lucaHof.walk(0); lucaHof.root.rotation.y = 0.9; }
      },
    },
    { // s14 direkt hinter Mia
      at: T.s("s14"), set: sc,
      cam: [{ pos: [2.4, 6.2, 9], look: [2.7, 5.4, -5], fov: 44 }, { pos: [2.5, 6.0, 6.8], look: [2.7, 5.5, -5], fov: 44 }],
      update(lt, u, t) { schoolBase(lt, t, []); },
    },
    { // s14b Mia lacht und merkt nichts.
      at: T.s("s14b"), set: sc,
      cam: [{ pos: [3.0, 6.0, 7.5], look: [3.0, 5.4, -5], fov: 44 }, { pos: [3.2, 6.1, 6.5], look: [3.1, 5.6, -5], fov: 44 }],
      update(lt, u, t) { schoolBase(lt, t, []); mia.face("laugh"); mia.cheer(lt, false); mia.armL.rotation.z = -0.4; mia.armR.rotation.z = 0.4; },
    },
    { // s15 Mias Zahl: 28 Jahre …
      at: T.s("s15"), set: sc,
      cam: [{ pos: [2.5, 7.2, 10], look: [2.8, 6.0, -4.5], fov: 40 }, { pos: [2.5, 7.1, 8.8], look: [2.8, 6.1, -4.5], fov: 40 }],
      update(lt, u, t) { schoolBase(lt, t, []); },
    },
    { // s16 … nur noch 10 Sekunden
      at: T.s("s16"), set: sc,
      cam: [{ pos: [2.5, 7.1, 8.8], look: [2.8, 6.1, -4.5], fov: 40 }, { pos: [2.5, 7.0, 7.6], look: [2.8, 6.2, -4.5], fov: 38 }],
      update(lt, u, t) { schoolBase(lt, t, []); },
    },
    { // s16b Neun. Acht. Sieben.
      at: T.s("s16b"), set: sc,
      cam: [{ pos: [2.6, 7.8, 6.2], look: [2.7, 7.4, -4.5], fov: 34 }, { pos: [2.6, 7.8, 5.2], look: [2.7, 7.4, -4.5], fov: 32 }],
      update(lt, u, t) { schoolBase(lt, t, []); },
    },
    { // s17 Luca schreit: Mia!
      at: T.s("s17"), set: sc,
      cam: [{ pos: [-2.0, 6.2, 13.5], look: [-3.8, 4.6, 3], fov: 42 }, { pos: [-2.4, 6.0, 12], look: [-3.9, 4.7, 3], fov: 42 }],
      update(lt, u, t) {
        schoolBase(lt, t, [lucaS]);
        lucaS.root.rotation.y = 0.75;
        lucaS.face(lt > 0.3 ? "scream" : "shock").reach("R", ramp(lt, 0.2, 0.25)).pill(...J(63));
        lucaS.armR.rotation.z = 0.2; lucaS.body.position.x = 0;
      },
    },
    { // s18 Die Gestalt dreht sich langsam um
      at: T.s("s18"), set: sc,
      cam: [{ pos: [-3.2, 6.6, 8.5], look: [3.4, 6.0, -6.6], fov: 42 }, { pos: [-2.3, 6.6, 6.2], look: [3.6, 6.4, -6.6], fov: 40 }],
      update(lt, u, t) {
        schoolBase(lt, t, []);
        const k = ease.inOut(clamp(u * 1.1));
        gestalt.root.rotation.y = lerp(-0.1, -0.62, k);
        gestalt.head.rotation.x = lerp(0.45, 0, k);
        gestalt.head.rotation.y = lerp(0, -0.25, ease.inOut(clamp(u * 1.6)));
        mia.face("neutral");
      },
    },
    { // s19 Über Lucas Kopf: 0 Sekunden
      at: T.s("s19"), set: sc,
      cam: [{ pos: [-3.5, 7.2, 14], look: [-4, 5.5, 3], fov: 40 }, { pos: [-3.6, 7.1, 12.5], look: [-4, 5.6, 3], fov: 40 }],
      update(lt, u, t) {
        schoolBase(lt, t, [lucaS]);
        const flip = T.w("s19", 6) - T.s("s19");
        lucaS.root.rotation.y = 0.15;
        lucaS.idle(lt).face(lt > flip ? "shock" : "worried").pill(...(lt > flip ? ["0 Sek.", "red"] : J(63)));
      },
    },
    { // s20 Dann flüstert jemand direkt hinter ihm …
      at: T.s("s20"), set: sc,
      cam: [{ pos: [-3.2, 6.8, 13.5], look: [-4.3, 5.4, 2], fov: 40 }, { pos: [-3.3, 6.7, 12], look: [-4.3, 5.5, 2], fov: 40 }],
      update(lt, u, t) {
        schoolBase(lt, t, [lucaS, gestalt2]); schueler.forEach(({ c }) => c.pill(null));
        lucaS.root.rotation.y = 0.15; lucaS.idle(lt, 0.3).face("shock").pill("0 Sek.", "red");
        gestalt2.root.position.set(-4.7, lerp(-6.5, 0, ease.out(ramp(lt, 0.1, 1.2))), 1.0);
      },
    },
    { // s21 „Du hättest mich letzte Nacht nicht sehen dürfen.“
      at: T.s("s21"), set: sc,
      cam: [{ pos: [-3.4, 6.6, 12.5], look: [-4.9, 5.2, 2], fov: 40 }, { pos: [-3.6, 6.5, 11], look: [-5.0, 5.3, 2], fov: 38 }],
      update(lt, u, t) {
        schoolBase(lt, t, [lucaS, gestalt2]); schueler.forEach(({ c }) => c.pill(null));
        lucaS.root.rotation.y = 0.15; lucaS.idle(lt, 0.2).face("shock").pill("0 Sek.", "red");
        lucaS.head.rotation.y = -0.35 * ramp(lt, 0.6, 0.8); // dreht den Kopf zur Stimme
        gestalt2.root.position.set(lerp(-4.7, -6.3, ramp(lt, 0, 1.5)), 0, lerp(1.0, 1.7, ramp(lt, 0, 1.5)));
        gestalt2.root.rotation.y = 0.35;
        gestalt2.body.rotation.x = 0.12 * ramp(lt, 0, 1.2);
        gestalt2.head.rotation.y = 0.35;
      },
    },
  ];
}
