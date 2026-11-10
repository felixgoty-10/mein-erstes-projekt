// Drehbuch: "In dieser Stadt steht über jedem Kopf sein Beruf" (Chef & Rettungssanitäter)
export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, plaza, room, sofa, counter, signMesh, car, carLights, phone,
    stringLights, mat, ramp, ease, clamp, lerp, pop, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const CHEF = { shirt: { type: "suit", tie: "#c6262e" }, hair: { type: "short", color: "#2a1d14" }, pants: "#1f1f24", phase: 0.3 };
  const ANWALT = { shirt: { type: "suit", color: "#4f5560", tie: "#2b5fb5" }, hair: { type: "short", color: "#8a8a8a" }, glasses: true, pants: "#4f5560", phase: 1.1 };
  const INFLU = { shirt: { type: "jacket", color: "#f28cc0", inner: "#ffffff" }, hair: { type: "long", color: "#e8cf8a" }, pants: "#f4f1ea", phase: 2.0 };
  const INVESTOR = { shirt: { type: "suit", color: "#22305a", tie: "#d4a72c" }, hair: { type: "curly", color: "#5b3a22", seed: 6 }, pants: "#22305a", phase: 1.6 };
  const SANI = { shirt: { type: "paramedic" }, hair: { type: "messy", seed: 11 }, pants: "#1f2a44", shoes: "#111", phase: 0 };
  const P = (t, v = "white") => [t, v];
  const handyAnsOhr = (c, arm = "R") => {
    const a = arm === "R" ? c.armR : c.armL;
    a.rotation.x = -2.5; a.rotation.z = arm === "R" ? 0.55 : -0.55;
  };
  const mitHandy = (c, arm = "R") => { const ph = phone(); ph.position.set(0, -1.95, 0.5); (arm === "R" ? c.armR : c.armL).add(ph); return ph; };

  // ---------------------------------------------------------- A/B) Party-Terrasse (Tag / Nacht)
  function terrasse(set, night) {
    W.add(set, plaza(34, 22), 0, 0, -3);
    W.add(set, house({ w: 24, d: 9, h: 9, color: "#f4f1ea", flat: true, windows: [-8, -3, 3, 8], trim: "#d9d3c6" }), 0, 0, -18);
    [[-15, -10], [15, -10], [-17, 4], [17, 3]].forEach(([x, z], i) => W.add(set, tree(1.15, 70 + i), x, 0, z));
    if (!night) [[-14, 30, -70, 2.6], [12, 34, -80, 3]].forEach(([x, y, z, s], i) => W.add(set, cloud(s, i + 3), x, y, z));
    const l1 = stringLights(26, 1.2, 18); l1.position.set(0, 8.2, -8); set.add(l1);
    W.add(set, sofa("#2d2d33"), -6, 0, -7);
    W.add(set, sofa("#2d2d33"), 6, 0, -7);
    const tisch = new THREE.Group();
    tisch.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.8), mat("#f4f1ea"))); tisch.children[0].position.y = 2.1;
    tisch.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 2.0, 10), mat("#bbb"))); tisch.children[1].position.y = 1.0;
    for (let i = 0; i < 4; i++) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.45, 10), mat(["#f2c12e", "#e74c3c", "#f2c12e", "#9b59b6"][i], { roughness: 0.2 })); gl.position.set(-1 + i * 0.65, 2.42, (i % 2) * 0.4 - 0.2); tisch.add(gl); }
    W.add(set, tisch, 0.6, 0, -4.6);
    if (night) { const lamp = new THREE.PointLight("#ffcf7a", 30, 30, 1.2); lamp.position.set(0, 7, -4); set.add(lamp); }
    return tisch;
  }
  const pt = W.set("party", 0, 0);
  const tischA = terrasse(pt, false);
  const karte = signMesh("0138913 Max", 1.6, 0.6, { bg: "#ffffff", fg: "#d8342c", border: "#d8342c" });
  karte.rotation.x = -Math.PI / 2; W.add(pt, karte, 1.6, 2.22, -4.1);
  karte.rotation.x = -Math.PI / 2;
  const chefA = W.addChar(pt, character(CHEF), -1.4, -2.0, 0.1);
  const anwaltA = W.addChar(pt, character(ANWALT), -4.8, -3.0, 0.4);
  const influA = W.addChar(pt, character(INFLU), 2.6, -2.4, -0.3); mitHandy(influA);
  const investorA = W.addChar(pt, character(INVESTOR), 5.6, -3.4, -0.5);
  const saniA = W.addChar(pt, character(SANI), 12, 1.5, -1.4);
  const gruppeA = [chefA, anwaltA, influA, investorA];
  const pills = new Map([[chefA, "CEO"], [anwaltA, "Anwalt"], [influA, "Influencerin"], [investorA, "Investor"]]);
  const gruppePills = () => gruppeA.forEach((c) => c.pill(...P(pills.get(c))));

  const pn = W.set("partyNight", 300, 0, { night: true });
  terrasse(pn, true);
  const nacht = [[-1.4, -2.0, 0.1, CHEF, "CEO"], [-4.8, -3.0, 0.4, ANWALT, "Anwalt"], [2.6, -2.4, -0.3, INFLU, "Influencerin"], [5.6, -3.4, -0.5, INVESTOR, "Investor"]]
    .map(([x, z, r, o, p]) => ({ c: W.addChar(pn, character(o), x, z, r), p }));

  // ---------------------------------------------------------- C) Landstraße, Nacht (Fahrt + Unfall + Rettung)
  const rd = W.set("road", 0, 300, { night: true });
  W.add(rd, street(240), 0, 0, 0);
  for (let i = 0; i < 12; i++) W.add(rd, tree(1.1, 80 + i), -60 + i * 11, 0, -11 - (i % 2) * 2);
  const fahrt = W.add(rd, car({ color: "#1f1f24" }), -20, 0, -1.8, Math.PI / 2);
  const wrack = W.add(rd, car({ color: "#1f1f24" }), 8, 0, -8.2, 2.2);
  wrack.rotation.z = 0.28; wrack.position.y = 0.3;
  const rauch = [0, 1, 2, 3].map((i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), new THREE.MeshBasicMaterial({ color: "#8a8f98", transparent: true, opacity: 0.4, depthWrite: false })); rd.add(m); return m; });
  const chefWrack = W.addChar(rd, character(CHEF), 5.2, -5.4, 0.3); mitHandy(chefWrack);
  const rtw = W.add(rd, car({ color: "#f7f7f2", ambulance: true }), 30, 0, 1.8, -Math.PI / 2);
  const saniRd = W.addChar(rd, character(SANI), 12, 0.5, -2.2);
  const decke = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.3), mat("#d9b23c", { metalness: 0.6, roughness: 0.3 }));
  decke.position.set(0, 3.0, 0); chefWrack.body.add(decke);
  const rdLight = new THREE.PointLight("#9db5ff", 25, 40, 1.2); rdLight.position.set(6, 9, -2); rd.add(rdLight);
  const rdFill = new THREE.PointLight("#c9d6ff", 35, 22, 1.2); rdFill.position.set(4, 6, 2); rd.add(rdFill);
  const blauLicht = new THREE.PointLight("#3a6bff", 0, 25, 1.4); blauLicht.position.set(14, 5, 2); rd.add(blauLicht);

  const unfallBasis = () => {
    chefWrack.root.position.set(5.2, 0, -5.4); chefWrack.root.rotation.y = 0.3;
    saniRd.root.position.set(12, 0, 0.5); saniRd.root.rotation.y = -2.2;
    rtw.position.set(15, 0, 1.8); rtw.rotation.set(0, -Math.PI / 2, 0);
    fahrt.position.set(-20, 0, -1.8); fahrt.rotation.set(0, Math.PI / 2, 0);
  };

  // ---------------------------------------------------------- D) Wohnungen der "Freunde"
  const homes = [["anwaltHome", "#bcd0e6", "#6b4a2b", ANWALT], ["influHome", "#f5c6dc", "#c98b4f", INFLU], ["invHome", "#d9d9d9", "#8a8f98", INVESTOR]].map(([n, wall, floor, o], i) => {
    const s = W.set(n, 900 + i * 300, 300, { interior: true });
    W.add(s, room({ wall, floor }), 0, 0, 0);
    if (i === 0) W.add(s, sofa("#3d6fb3"), 0, 0, -3.8);
    if (i === 1) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 8, 32), new THREE.MeshBasicMaterial({ color: "#ffffff" })); ring.position.set(2.6, 5, -1); s.add(ring); }
    if (i === 2) { W.add(s, counter("#3a3f4a"), 0, 0, -1.2); const lap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.08), mat("#c9ced6", { emissive: "#6fa8ff", emissiveIntensity: 0.3 })); lap.position.set(-1.2, 3.3, -1.0); lap.rotation.x = -0.2; s.add(lap); }
    const c = W.addChar(s, character(o), i === 0 ? 0 : 0.2, i === 0 ? -3.6 : (i === 2 ? -3.2 : -0.8), 0); mitHandy(c);
    return { s, c };
  });

  // ---------------------------------------------------------- E) Finale: Party am Tag, zusammen auf dem Sofa
  const fn = W.set("finale", 0, 600);
  terrasse(fn, false);
  const chefF = W.addChar(fn, character(CHEF), -7.3, -6.6, 0.15);
  const saniF = W.addChar(fn, character(SANI), -4.7, -6.6, -0.15);
  const rest = [[2.6, -2.4, -0.4, INFLU, "Influencerin"], [5.6, -3.0, -0.5, INVESTOR, "Investor"], [0.0, -2.2, -0.2, ANWALT, "Anwalt"]]
    .map(([x, z, r, o, p]) => ({ c: W.addChar(fn, character(o), x, z, r), p }));
  const sitztSofa = (c) => { c.sit(); c.body.position.y = -0.05; };

  // ---------------------------------------------------------- Einstellungen
  const party = (lt) => {
    gruppePills();
    chefA.idle(lt).face("smug"); anwaltA.idle(lt).face("happy"); investorA.idle(lt).face("laugh");
    influA.idle(lt).face("happy"); influA.reach("R", 0.9); influA.armR.rotation.z = 0.2;
  };
  return [
    { // s1 Hook: Party, Berufe über den Köpfen
      at: 0, set: pt,
      cam: [{ pos: [1, 7.4, 21], look: [1, 4.6, -4], fov: 46 }, { pos: [0.5, 6.6, 15], look: [0.5, 4.8, -4], fov: 46 }],
      update(lt) { party(lt); saniA.root.visible = false; },
    },
    { // s2 Ich bin der Chef
      at: T.s("s2"), set: pt,
      cam: [{ pos: [-1.0, 6.6, 10.5], look: [-1.4, 4.7, -2.0], fov: 40 }, { pos: [-1.1, 6.6, 9.3], look: [-1.4, 4.8, -2.0], fov: 40 }],
      update(lt) { party(lt); saniA.root.visible = false; chefA.root.rotation.y = 0.1; },
    },
    { // s3 nur wichtige Leute
      at: T.s("s3"), set: pt,
      cam: [{ pos: [-3, 7, 15], look: [0.5, 4.6, -3], fov: 46 }, { pos: [3, 7, 15], look: [0.5, 4.6, -3], fov: 46 }],
      update(lt) { party(lt); saniA.root.visible = false; gruppeA.forEach((c, i) => c.face(i % 2 ? "laugh" : "smug")); },
    },
    { // s4a Ein Anwalt
      at: T.s("s4"), set: pt,
      cam: [{ pos: [-4.0, 6.8, 10.0], look: [-4.8, 4.6, -3.0], fov: 40 }, { pos: [-4.1, 6.8, 9.2], look: [-4.8, 4.7, -3.0], fov: 40 }],
      update(lt) { party(lt); saniA.root.visible = false; anwaltA.face("smug"); },
    },
    { // s4b Eine Influencerin
      at: T.w("s4", 2), set: pt,
      cam: [{ pos: [2.0, 6.8, 10.0], look: [2.6, 4.6, -2.4], fov: 40 }, { pos: [2.0, 6.8, 9.2], look: [2.6, 4.7, -2.4], fov: 40 }],
      update(lt) { party(lt); saniA.root.visible = false; influA.face("laugh"); },
    },
    { // s4c Ein Investor
      at: T.w("s4", 4), set: pt,
      cam: [{ pos: [4.6, 6.8, 9.6], look: [5.6, 4.6, -3.4], fov: 40 }, { pos: [4.7, 6.8, 8.8], look: [5.6, 4.7, -3.4], fov: 40 }],
      update(lt) { party(lt); saniA.root.visible = false; investorA.face("smug"); },
    },
    { // s5 Dann kam ein Rettungssanitäter
      at: T.s("s5"), set: pt,
      cam: [{ pos: [5, 7, 17], look: [5, 4.6, -1], fov: 46 }, { pos: [6, 6.8, 15], look: [6.5, 4.6, -0.5], fov: 46 }],
      update(lt, u) {
        party(lt);
        saniA.walk(lt, 0.9).face("happy").pill(...P("Rettungssanitäter")); saniA.root.position.x = lerp(13, 8.5, ease.out(clamp(u * 1.2)));
        if (u > 0.85) { saniA.walk(0); saniA.wave(lt); }
      },
    },
    { // s6 Er fragte, ob er sich setzen darf
      at: T.s("s6"), set: pt,
      cam: [{ pos: [10.6, 6.8, 13.5], look: [8.5, 4.6, 1.5], fov: 40 }, { pos: [10.4, 6.8, 12.3], look: [8.5, 4.7, 1.5], fov: 40 }],
      update(lt) {
        party(lt); saniA.root.position.x = 8.5; saniA.root.rotation.y = -0.9;
        saniA.idle(lt).face("happy").shrug(0.6).pill(...P("Rettungssanitäter"));
      },
    },
    { // s7 Ich sagte: Nein.
      at: T.s("s7"), set: pt,
      cam: [{ pos: [-0.2, 6.6, 10], look: [-1.4, 4.7, -2.0], fov: 40 }, { pos: [-0.3, 6.6, 9.0], look: [-1.4, 4.8, -2.0], fov: 40 }],
      update(lt) {
        party(lt); chefA.root.rotation.y = 0.7; chefA.face("smug").reach("R", 0.85); chefA.armR.rotation.z = 0.1;
        chefA.head.rotation.y = Math.sin(lt * 6) * 0.2 * ramp(lt, 0.4, 0.2);
        saniA.root.visible = false;
      },
    },
    { // s8 Er ging traurig weg
      at: T.s("s8"), set: pt,
      cam: [{ pos: [6, 6.6, 15], look: [8, 4.4, 0], fov: 46 }, { pos: [6, 6.6, 14], look: [10, 4.4, 0.5], fov: 46 }],
      update(lt) {
        party(lt); chefA.face("smug");
        saniA.walk(lt, 0.6).face("sad").pill(...P("Rettungssanitäter")); saniA.root.rotation.y = 1.5; saniA.root.position.x = 8.5 + lt * 1.6;
      },
    },
    { // s9 Seine Nummer liegt auf dem Tisch
      at: T.s("s9"), set: pt,
      cam: [{ pos: [1.6, 5.0, -1.2], look: [1.6, 2.2, -4.1], fov: 40 }, { pos: [1.6, 4.4, -2.0], look: [1.6, 2.2, -4.1], fov: 38 }],
      update(lt) { party(lt); saniA.root.visible = false; gruppeA.forEach((c) => (c.root.visible = false)); },
    },
    { // s10 Am Abend verabschieden sich alle
      at: T.s("s10"), set: pn,
      cam: [{ pos: [1, 7, 17], look: [1, 4.6, -3], fov: 46 }, { pos: [0.5, 6.6, 14], look: [0.5, 4.8, -3], fov: 46 }],
      update(lt) { nacht.forEach(({ c, p }, i) => { c.wave(lt + i * 0.3, i % 2 ? "L" : "R").face("happy").pill(...P(p)); }); },
    },
    { // s11 Ich fuhr allein nach Hause (Karte 23:47 zuerst)
      at: T.s("s11"), set: rd,
      cam: [{ pos: [-14, 5, 10], look: [-10, 1.8, -1.8], fov: 46 }, { pos: [-2, 5, 10], look: [2, 1.8, -1.8], fov: 46 }], ease: ease.linear,
      update(lt, u) {
        unfallBasis();
        fahrt.visible = true; wrack.visible = false; rtw.visible = false; saniRd.root.visible = false; chefWrack.root.visible = false;
        rauch.forEach((r) => (r.visible = false)); blauLicht.intensity = 0;
        fahrt.position.set(lerp(-14, 2, u), 0, -1.8); fahrt.rotation.set(0, Math.PI / 2, 0);
        fahrt.userData.wheels.forEach((w) => (w.rotation.x = lt * 8));
      },
    },
    { // s12 Dann krachte es (Schlenker + weißer Blitz + Wackeln)
      at: T.s("s12"), set: rd,
      cam: [{ pos: [0, 5, 10], look: [4, 1.8, -2.5], fov: 46 }, { pos: [1, 5, 10], look: [6, 1.8, -4], fov: 46 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = true; wrack.visible = false; rtw.visible = false; saniRd.root.visible = false; chefWrack.root.visible = false;
        rauch.forEach((r) => (r.visible = false)); blauLicht.intensity = 0;
        const k = ease.in(clamp(lt / 0.7));
        fahrt.position.set(lerp(2, 7.5, k), 0, lerp(-1.8, -7.5, k)); fahrt.rotation.set(0, lerp(Math.PI / 2, 2.2, k), 0.28 * k);
        const sh = Math.max(0, 1 - Math.abs(lt - 0.7) / 0.5) * 0.35;
        W.camera.position.x += Math.sin(lt * 60) * sh; W.camera.position.y += Math.cos(lt * 47) * sh;
      },
    },
    { // s13 Auto im Graben, eingeklemmt
      at: T.s("s13"), set: rd,
      cam: [{ pos: [1, 7, 12], look: [7, 2.8, -7], fov: 46 }, { pos: [2.2, 6.6, 7.0], look: [6.2, 3.4, -6.0], fov: 44 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = false; saniRd.root.visible = false; chefWrack.root.visible = true;
        carLights(wrack, lt, { hazard: true }); blauLicht.intensity = 0; decke.visible = false;
        rauch.forEach((r, i) => { const k = (lt * 0.4 + i / 4) % 1; r.visible = true; r.position.set(9.6 + k * 0.8, 2.2 + k * 3, -6.6); r.scale.setScalar(0.6 + k); r.material.opacity = 0.45 * (1 - k); });
        chefWrack.sit(); chefWrack.face("worried"); chefWrack.armL.rotation.x = -0.6; chefWrack.pill(...P("CEO"));
      },
    },
    { // s14a Ich rief den Anwalt an
      at: T.s("s14"), set: rd,
      cam: [{ pos: [2.2, 6.6, 7.0], look: [6.2, 3.4, -6.0], fov: 44 }, { pos: [2.6, 6.4, 5.8], look: [6.0, 3.5, -6.0], fov: 44 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = false; saniRd.root.visible = false; decke.visible = false; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); chefWrack.sit(); chefWrack.face("worried"); handyAnsOhr(chefWrack);
      },
    },
    { // s14b Anwalt: Zu kalt draußen
      at: T.w("s14", 4), set: homes[0].s,
      cam: [{ pos: [0.5, 6.0, 9.5], look: [0, 3.8, -3.6], fov: 42 }, { pos: [0.5, 5.9, 8.5], look: [0, 3.9, -3.6], fov: 42 }],
      update(lt) { const c = homes[0].c; c.sit(); c.body.position.y = -0.45; c.face("smug"); handyAnsOhr(c); },
    },
    { // s15 Influencerin: Ich bin gerade live
      at: T.s("s15"), set: homes[1].s,
      cam: [{ pos: [0.6, 6.2, 10], look: [0.2, 4.6, -0.8], fov: 42 }, { pos: [0.6, 6.1, 9], look: [0.2, 4.7, -0.8], fov: 42 }],
      update(lt) { const c = homes[1].c; c.idle(lt).face("laugh").reach("R", 1.05); c.armR.rotation.z = 0.3; c.wave(lt, "L"); },
    },
    { // s16 Investor: Lohnt sich nicht
      at: T.s("s16"), set: homes[2].s,
      cam: [{ pos: [0.8, 6.4, 10.5], look: [0.2, 4.6, -3.2], fov: 42 }, { pos: [0.8, 6.3, 9.5], look: [0.2, 4.7, -3.2], fov: 42 }],
      update(lt) { const c = homes[2].c; c.idle(lt).face("smug"); handyAnsOhr(c); c.armL.rotation.z = -0.5; c.armL.rotation.x = -0.4; },
    },
    { // s17 Nur noch eine Nummer
      at: T.s("s17"), set: rd,
      cam: [{ pos: [2.2, 6.6, 7.0], look: [6.2, 3.4, -6.0], fov: 44 }, { pos: [2.6, 6.4, 5.8], look: [6.0, 3.5, -6.0], fov: 44 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = false; saniRd.root.visible = false; decke.visible = false; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); chefWrack.sit(); chefWrack.face("sad"); chefWrack.armR.rotation.x = -1.1;
        chefWrack.head.rotation.x = 0.25;
      },
    },
    { // s18 Die vom Rettungssanitäter (er ruft an)
      at: T.s("s18"), set: rd,
      cam: [{ pos: [2.2, 6.6, 7.0], look: [6.2, 3.4, -6.0], fov: 44 }, { pos: [2.6, 6.4, 5.8], look: [6.0, 3.5, -6.0], fov: 44 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = false; saniRd.root.visible = false; decke.visible = false; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); chefWrack.sit(); chefWrack.face("worried"); handyAnsOhr(chefWrack);
      },
    },
    { // s19 Fünf Minuten später war er da (Blaulicht)
      at: T.s("s19"), set: rd,
      cam: [{ pos: [5, 7.4, 18], look: [11, 3, -2], fov: 50 }, { pos: [6, 7.2, 16.5], look: [10.5, 3.2, -2.5], fov: 50 }],
      update(lt, u) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = true; chefWrack.root.visible = true; decke.visible = false; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); carLights(rtw, lt, { blue: true });
        blauLicht.intensity = Math.floor(lt * 6) % 2 ? 30 : 4;
        const k = ease.out(clamp(u * 1.4)); rtw.position.x = lerp(34, 15, k);
        rtw.userData.wheels.forEach((w) => (w.rotation.x = -k * 20));
        saniRd.root.visible = u > 0.65; saniRd.walk(lt, 1.8).face("worried").pill(...P("Rettungssanitäter"));
        saniRd.root.position.set(lerp(12.5, 8.4, clamp((u - 0.65) / 0.35)), 0, lerp(0.8, -3.4, clamp((u - 0.65) / 0.35))); saniRd.root.rotation.y = -2.3;
        chefWrack.sit(); chefWrack.face("wow");
      },
    },
    { // s20a Er zog mich aus dem Auto …
      at: T.s("s20"), set: rd,
      cam: [{ pos: [3.0, 7.0, 10.5], look: [6.6, 3.8, -4.4], fov: 44 }, { pos: [3.3, 6.9, 9.5], look: [6.6, 3.9, -4.4], fov: 44 }],
      update(lt, u) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = true; saniRd.root.visible = true; decke.visible = false; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); carLights(rtw, lt, { blue: true }); blauLicht.intensity = Math.floor(lt * 6) % 2 ? 30 : 4;
        saniRd.root.position.set(7.4, 0, -3.6); saniRd.root.rotation.y = -2.1; saniRd.face("worried").reach("R", 1).reach("L", 1).pill(...P("Rettungssanitäter"));
        const up = ease.inOut(ramp(lt, 0.3, 0.8));
        chefWrack.sit(); chefWrack.body.position.y = lerp(-0.95, 0, up); chefWrack.legL.rotation.x = chefWrack.legR.rotation.x = lerp(-1.57, 0, up);
        chefWrack.root.rotation.y = 0.9; chefWrack.reach("R", 0.9).reach("L", 0.9).face(up > 0.6 ? "sad" : "worried");
      },
    },
    { // s20b … und blieb die ganze Nacht bei mir
      at: T.w("s20", 6), set: rd,
      cam: [{ pos: [10.5, 7.8, 27], look: [11, 3.2, 3.5], fov: 42 }, { pos: [10.4, 7.5, 24.5], look: [10.8, 3.3, 3.5], fov: 42 }],
      update(lt) {
        unfallBasis();
        fahrt.visible = false; wrack.visible = true; rtw.visible = true; saniRd.root.visible = true; decke.visible = true; rauch.forEach((r) => (r.visible = false));
        carLights(wrack, lt, { hazard: true }); carLights(rtw, lt, { blue: true }); blauLicht.intensity = Math.floor(lt * 3) % 2 ? 18 : 6;
        chefWrack.root.position.set(8.4, 0, 6.2); chefWrack.root.rotation.y = 0.15; chefWrack.sit(); chefWrack.body.position.y = -0.6; chefWrack.face("sad");
        saniRd.root.position.set(10.6, 0, 6.2); saniRd.root.rotation.y = -0.15; saniRd.sit(); saniRd.body.position.y = -0.6; saniRd.face("happy");
        saniRd.armR.rotation.set(0, 0, 0); saniRd.armL.rotation.z = -1.25; saniRd.pill(...P("Rettungssanitäter"));
      },
    },
    { // s21 Heute sitzt er auf jeder Party neben mir
      at: T.s("s21"), set: fn,
      cam: [{ pos: [-3, 7, 14], look: [-4, 4, -5], fov: 46 }, { pos: [-4.5, 6.6, 10], look: [-6, 4.2, -6], fov: 44 }],
      update(lt) {
        sitztSofa(chefF); sitztSofa(saniF);
        chefF.face("laugh").pill(...P("CEO")); saniF.face("laugh").pill(...P("Rettungssanitäter"));
        chefF.armR.rotation.z = 1.2; saniF.armL.rotation.z = -1.2;
        rest.forEach(({ c, p }, i) => c.idle(lt + i).face("neutral").pill(...P(p)));
      },
    },
    { // s22 Über seinem Kopf steht für mich etwas anderes → „Bester Freund“
      at: T.s("s22"), set: fn,
      cam: [{ pos: [-4.2, 7.4, 6.8], look: [-4.7, 5.4, -6.6], fov: 40 }, { pos: [-4.3, 7.4, 5.8], look: [-4.7, 5.5, -6.6], fov: 40 }],
      update(lt, u, t) {
        sitztSofa(chefF); sitztSofa(saniF); chefF.face("laugh"); chefF.armR.rotation.z = 1.2; saniF.armL.rotation.z = -1.2;
        const flip = T.w("s22", 7) - T.s("s22");
        saniF.face("laugh").pill(...(lt > flip ? P("Bester Freund", "green") : P("Rettungssanitäter")));
        rest.forEach(({ c }) => (c.root.visible = false));
      },
    },
  ];
}
