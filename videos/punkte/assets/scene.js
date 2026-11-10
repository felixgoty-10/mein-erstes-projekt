// Drehbuch: "In dieser Stadt bezahlt man mit Punkten für gute Taten"
export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, room, bed, sofa, tv, shelf, counter, bread, broom, signMesh,
    dog, dogPose, ivStand, cake, flower, fence, wateringCan, balloon, mat, ramp, ease, clamp, lerp, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const ICH = { shirt: { type: "varsity", number: "13" }, hair: { type: "messy", seed: 11 }, phase: 0 };
  const MAMA = { shirt: { type: "jacket", color: "#5aa17a", inner: "#f2efe8" }, hair: { type: "bun", color: "#5b3a22" }, pants: "#2d3e66", phase: 1.2 };
  const PAPA = { shirt: { type: "jacket", color: C.denim }, hair: { type: "short", color: "#2a1d14" }, glasses: true, pants: "#c9b58f", phase: 2.2 };
  const OMA = { shirt: { type: "plaid", color: "#efd9e4", line: "#9a5b7a" }, hair: { type: "bun", color: "#d6d6d6" }, glasses: true, pants: "#6b5a7a", phase: 0.5 };
  const NACHBAR = { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "short", color: "#1d1d1d" }, skin: C.skinDark, phase: 1.1 };
  const NETT = { shirt: { type: "tee", color: "#f2b632", stripe: "#ffffff" }, hair: { type: "long", color: "#e2c27a" }, pants: "#2d5fb5", phase: 2.4 };
  const GEMEIN = { shirt: { type: "hoodie", color: "#2b2d33" }, hair: { type: "short", color: "#111" }, hat: "cap", hatColor: "#111", pants: "#333", phase: 0.9 };
  const KASSE = { shirt: { type: "apron", color: "#d23b3b" }, hair: { type: "curly", color: "#5b3a22", seed: 4 }, phase: 1.7 };
  const ARZT = { shirt: { type: "coat" }, pants: "#3c4a66", hair: { type: "bun", color: "#2b1d14" }, phase: 2.1 };
  const EXTRAS = [
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "curly", color: "#111", seed: 8 }, phase: 0.3 },
    { shirt: { type: "tee", color: "#7fb3e6" }, hair: { type: "bun", color: "#2b1d14" }, phase: 2.9 },
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" }, phase: 0.2 },
  ];
  const P = (n, v = "white") => [`${n.toLocaleString("de-DE")} Punkte`, v];
  const cnt = (lt, t0, d, a, b) => Math.round(lerp(a, b, ease.out(ramp(lt, t0, d, (u) => u))));
  const tag = (c) => { c.root.userData.cast = true; return c; };

  // ---------------------------------------------------------- A) Straße mit Supermarkt
  const st = W.set("street", 0, 0);
  W.add(st, street(160), 0, 0, 0);
  W.add(st, house({ w: 9, d: 8, h: 6.8, color: C.pink }), -14, 0, -15);
  W.add(st, house({ w: 9, d: 8, h: 6.8, color: "#b9d7a8", roof: "#7a3b2b" }), -2, 0, -15);
  W.add(st, house({ w: 13, d: 9, h: 8, color: "#f3e6c9", flat: true, sign: "SUPERMARKT", windows: [-4, 4], signStyle: { bg: "#e53b3b", fg: "#ffffff", border: null } }), 12, 0, -15);
  [[-8, -10.5], [4.5, -10.2], [21, -10.5]].forEach(([x, z], i) => W.add(st, tree(1, i + 3), x, 0, z));
  [[-18, 30, -70, 2.6], [10, 34, -75, 3]].forEach(([x, y, z, s], i) => W.add(st, cloud(s, i + 2), x, y, z));
  const ichA = W.addChar(st, character(ICH), -1, -6.6, 0.2);
  const passA = [[-6, -7.6, 0.4, 740], [5, -7.2, -0.4, 1250], [10, -8.4, -0.3, 95]].map(([x, z, r, n], i) =>
    ({ c: W.addChar(st, character(EXTRAS[i]), x, z, r), x, n }));

  // ---------------------------------------------------------- B) Supermarkt innen
  const sm = W.set("market", 900, 0, { interior: true });
  W.add(sm, room({ w: 22, d: 14, h: 9, wall: "#f4f1ea", floor: "#d9d9d9", window: false }), 0, 0, 0);
  W.add(sm, signMesh("SUPERMARKT", 9, 1.6, { bg: "#e53b3b", fg: "#ffffff", border: null }), 0, 7, -6.7);
  [-7, 0, 7].forEach((x, i) => W.add(sm, shelf({ stocked: 0.85, seed: 5 + i }), x, 0, -4.8));
  W.add(sm, counter("#d9b98f"), 5, 0, 1.5);
  W.add(sm, signMesh("BRÖTCHEN = 2 PUNKTE", 4.4, 0.8, { bg: "#fffaf0", fg: "#b8402f", border: "#b8402f" }), 5, 3.6, 0.45);
  const kasse = W.addChar(sm, character(KASSE), 5, -0.4, 0);
  const nett = W.addChar(sm, character(NETT), -3, 2.5, 0.5);
  const nettBrot = bread(); nettBrot.position.set(0, -1.95, 0.55); nettBrot.rotation.y = Math.PI / 2; nett.armR.add(nettBrot);
  const gemein = W.addChar(sm, character(GEMEIN), 4.6, 3.6, Math.PI);
  const theke = W.add(sm, bread(), 5, 2.95, 1.8);

  // ---------------------------------------------------------- C) Krankenzimmer
  const kh = W.set("hospital", 600, 0, { interior: true });
  W.add(kh, room({ wall: "#e9f1f5", floor: "#cfd6dc" }), 0, 0, 0);
  W.add(kh, bed("#7fb3e6"), 0, 0, -2.5, -Math.PI / 2);
  const mamaBett = W.addChar(kh, character(MAMA), -2.3, -2.5, 0);
  const decke = W.add(kh, new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.5, 3.0), mat("#7fb3e6")), -0.7, 2.75, -2.1);
  decke.castShadow = true;
  W.add(kh, ivStand(), 4.8, 0, -3.6);
  const papaKH = W.addChar(kh, character(PAPA), -4.6, 0.6, 0.4);
  const ichKH = W.addChar(kh, character(ICH), -1.6, 1.4, 0.2);

  // ---------------------------------------------------------- D) Omas Wohnzimmer
  const om = W.set("oma", 1200, 0, { interior: true });
  W.add(om, room({ wall: "#f1dcc0", floor: "#b98250", rug: "#c9a0dc" }), 0, 0, 0);
  W.add(om, sofa("#8a5a9a"), -3, 0, -3.8);
  W.add(om, tv(), 4.2, 0, -3.2, -0.5);
  const tvAus = W.add(om, new THREE.Mesh(new THREE.BoxGeometry(3.35, 1.85, 0.05), new THREE.MeshBasicMaterial({ color: "#0d0d10" })), 0, 0, 0);
  tvAus.position.set(4.2 + Math.sin(-0.5) * 0.15, 2.5, -3.2 + Math.cos(-0.5) * 0.15); tvAus.rotation.y = -0.5;
  const oma = W.addChar(om, character(OMA), -3, -3.6, 0);
  const ichOma = W.addChar(om, character(ICH), 2.4, -1.4, 1.9);

  // ---------------------------------------------------------- E) Gassi gehen
  const gs = W.set("walk", 0, 300);
  W.add(gs, street(200), 0, 0, 0);
  [[-30, C.pink], [-16, "#f0c9a2"], [-2, "#b9d7a8"], [12, "#f3e6c9"], [26, C.pink], [40, "#cfe0f1"]].forEach(([x, col], i) =>
    W.add(gs, house({ w: 9, d: 8, h: 6.6, color: col, roof: i % 2 ? "#7a3b2b" : C.roofBlue }), x, 0, -15));
  [-23, -9, 5, 19, 33].forEach((x, i) => W.add(gs, tree(1, 10 + i), x, 0, -10.4));
  [[-10, 30, -70, 2.6], [20, 34, -75, 3]].forEach(([x, y, z, s], i) => W.add(gs, cloud(s, i + 5), x, y, z));
  const ichGassi = W.addChar(gs, character(ICH), 0, -6.4, Math.PI / 2);
  const hund = W.add(gs, dog(), 0, 0, -5.2, Math.PI / 2);
  const leine = W.add(gs, new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.05), mat("#d23b3b")), 0, 0, 0);
  const nachbarTuer = W.addChar(gs, character(NACHBAR), -2.6, -10.2, 0.3);

  // ---------------------------------------------------------- F) Garten (+ Party)
  const gt = W.set("garden", 300, 300);
  W.add(gt, house({ w: 12, d: 9, h: 7, color: "#f3e6c9", roof: "#7a3b2b" }), 0, 0, -17);
  W.add(gt, fence(34), 0, 0, -11);
  const beet = W.add(gt, new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 3), mat("#6b4a2b")), -6, 0.2, -6);
  for (let i = 0; i < 12; i++) W.add(gt, flower(["#e74c3c", "#f1c40f", "#9b59b6", "#ff7eb6"][i % 4]), -10 + (i % 6) * 1.6, 0.4, -6.9 + Math.floor(i / 6) * 1.6);
  [[-14, -9], [14, -9], [16, 2]].forEach(([x, z], i) => W.add(gt, tree(1.1, 50 + i), x, 0, z));
  [[-14, 30, -70, 2.6], [12, 34, -80, 3]].forEach(([x, y, z, s], i) => W.add(gt, cloud(s, i + 8), x, y, z));
  const papaGarten = W.addChar(gt, character(PAPA), -5.5, -3.6, 0.3);
  const rechen = broom(); rechen.position.set(0, -1.6, 0.6); rechen.rotation.x = 0.3; papaGarten.armR.add(rechen);
  const ichGarten = W.addChar(gt, character(ICH), 1.5, -2.6, -0.4);
  const kanne = wateringCan(); kanne.position.set(0, -2.0, 0.5); ichGarten.armR.add(kanne);
  const party = new THREE.Group(); gt.add(party);
  const tisch = new THREE.Group(); tisch.add(new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 2.4), mat("#f4f1ea"))); tisch.children[0].position.y = 2.2;
  [[-2.2, -1], [2.2, -1], [-2.2, 1], [2.2, 1]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), mat("#ddd")); l.position.set(x, 1.1, z); tisch.add(l); });
  tisch.position.set(4.5, 0, -5); party.add(tisch);
  const torte = cake(); torte.position.set(4.5, 2.33, -5); party.add(torte);
  const ballons = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ff7eb6", "#e67e22"].map((c, i) => {
    const b = balloon(c); b.position.set(-9 + i * 3, 8.5 + (i % 2) * 0.8, -9.5); party.add(b); return b;
  });
  const banner = signMesh("WILLKOMMEN ZU HAUSE, MAMA!", 12, 1.5, { bg: "#fffaf0", fg: "#d23b3b", border: "#d23b3b" });
  banner.position.set(0, 9.6, -11.2); party.add(banner);
  const feier = [
    tag(W.addChar(gt, character(MAMA), 0.5, -2.4, 0)), tag(W.addChar(gt, character(ICH), 3.4, -1.0, -0.5)),
    tag(W.addChar(gt, character(PAPA), -2.6, -3.0, 0.3)), tag(W.addChar(gt, character(OMA), -5.6, -4.4, 0.4)),
    tag(W.addChar(gt, character(NACHBAR), 7.6, -3.6, -0.4)),
  ];
  const [mamaF, ichF, papaF, omaF, nachbarF] = feier;
  const stueck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), mat("#f2a7c3")); stueck.position.set(0, -1.95, 0.6); mamaF.armR.add(stueck);
  const hundParty = W.add(gt, dog(), 6.2, 0, -0.6, -0.6);
  const gartenCast = [papaGarten, ichGarten];
  const gartenModus = (partyAn) => {
    party.visible = partyAn; hundParty.visible = partyAn;
    feier.forEach((c) => (c.root.visible = partyAn)); gartenCast.forEach((c) => (c.root.visible = !partyAn));
  };

  // ---------------------------------------------------------- G) Krankenhaus-Kasse
  const kk = W.set("reception", 1500, 0, { interior: true });
  W.add(kk, room({ w: 20, wall: "#e9f1f5", floor: "#cfd6dc", window: false }), 0, 0, 0);
  W.add(kk, signMesh("KRANKENHAUS · KASSE", 9, 1.4, { bg: "#ffffff", fg: "#d23b3b", border: "#d23b3b" }), 0, 6.6, -5.7);
  W.add(kk, counter("#cfe0f1"), 0, 0, -2.2);
  const arzt = W.addChar(kk, character(ARZT), 0, -4.2, 0);
  const ichKasse = W.addChar(kk, character(ICH), 0.4, 1.8, Math.PI);

  // ---------------------------------------------------------- H) Krankenhaus außen
  const ka = W.set("hospitalExt", 300, 600);
  W.add(ka, street(160), 0, 0, 8);
  W.add(ka, house({ w: 20, d: 10, h: 10, color: "#f4f7f9", flat: true, sign: "KRANKENHAUS", windows: [-7, -3.5, 3.5, 7], signStyle: { bg: "#ffffff", fg: "#d23b3b", border: "#d23b3b" } }), 0, 0, -14);
  [[-14, -8], [14, -8]].forEach(([x, z], i) => W.add(ka, tree(1.1, 60 + i), x, 0, z));
  W.add(ka, cloud(2.8, 4), 6, 32, -70);
  const mamaRaus = W.addChar(ka, character(MAMA), 0, -8.5, 0);
  const papaRaus = W.addChar(ka, character(PAPA), -3.6, -5.5, 0.6);
  const ichRaus = W.addChar(ka, character(ICH), 3.6, -5.5, -0.6);

  // ---------------------------------------------------------- Einstellungen
  const geld = (lt) => passA.forEach(({ c, n }) => c.idle(lt).face("happy").pill(...P(n)));
  return [
    { // s1 Hook: Straße, Punkte über den Köpfen
      at: 0, set: st,
      cam: [{ pos: [1, 6.6, 18], look: [1, 4.8, -7], fov: 46 }, { pos: [0, 6.2, 13], look: [0, 5, -7], fov: 46 }],
      update(lt) {
        ichA.idle(lt).face("happy").pill(...P(100));
        passA.forEach(({ c, x, n }, i) => { c.walk(lt, 0.8).face("happy").pill(...P(n)); c.root.position.x = x + (i % 2 ? -1 : 1) * lt * 1.1; c.root.rotation.y = i % 2 ? -1.4 : 1.4; });
      },
    },
    { // s2 Im Supermarkt bezahlt man mit Punkten
      at: T.s("s2"), set: sm,
      cam: [{ pos: [0, 7, 19], look: [0, 4, -2], fov: 50 }, { pos: [1, 6.4, 15], look: [1, 4.2, -1], fov: 50 }],
      update(lt) {
        kasse.idle(lt).face("happy").pill(...P(870)); gemein.root.visible = false;
        nett.walk(lt, 0.8).face("happy").pill(...P(3200)); nett.root.position.x = -6 + lt * 1.6; nett.root.rotation.y = 1.4;
      },
    },
    { // s3 Wer nett ist, ist reich
      at: T.s("s3"), set: sm,
      cam: [{ pos: [-1.5, 6.6, 15], look: [-1.5, 5.0, 2.5], fov: 40 }, { pos: [-1.5, 6.6, 13.5], look: [-1.5, 5.2, 2.5], fov: 40 }],
      update(lt) {
        kasse.idle(lt).face("happy"); gemein.root.visible = false;
        nett.root.position.set(-1.5, 0, 2.5); nett.root.rotation.y = 0.1;
        nett.idle(lt).face("laugh").reach("R", 0.7).pill(...P(3200 + cnt(lt, 0.2, 0.5, 0, 50)));
      },
    },
    { // s4 Wer gemein ist, bekommt nicht mal ein Brötchen
      at: T.s("s4"), set: sm,
      cam: [{ pos: [8.4, 6.6, -5.6], look: [4.4, 4.4, 3.4], fov: 44 }, { pos: [8.2, 6.5, -4.8], look: [4.4, 4.5, 3.4], fov: 44 }],
      update(lt) {
        nett.root.visible = false; gemein.root.visible = true;
        gemein.root.rotation.y = 2.54;
        gemein.idle(lt).face(lt > 1.0 ? "sad" : "smug").pill(...P(0, "red")); gemein.reach("R", 0.6 * (1 - ramp(lt, 1.0, 0.3)));
        kasse.idle(lt).face("neutral"); kasse.head.rotation.y = Math.sin(lt * 7) * 0.3 * ramp(lt, 0.4, 0.2);
      },
    },
    { // s5 Mama im Krankenhaus
      at: T.s("s5"), set: kh,
      cam: [{ pos: [0.5, 6.4, 14], look: [0.5, 3.4, -2.5], fov: 46 }, { pos: [1, 5.8, 11.5], look: [1, 3.4, -2.5], fov: 46 }],
      update(lt) {
        mamaBett.lieSide(lt, { arms: false }).face("sick"); mamaBett.body.position.set(0, 2.75, 0);
        papaKH.idle(lt).face("sad"); ichKH.idle(lt).face("sad").lookAt(0.4);
      },
    },
    { // s6 (Karte „500 P“) Kamera auf Mama
      at: T.s("s6"), set: kh,
      cam: [{ pos: [2.6, 5.4, 6], look: [2.4, 3.4, -2.5], fov: 42 }, { pos: [2.6, 5.2, 5], look: [2.4, 3.4, -2.5], fov: 42 }],
      update(lt) { mamaBett.lieSide(lt, { arms: false }).face("sick"); mamaBett.body.position.set(0, 2.75, 0); papaKH.root.visible = false; },
    },
    { // s7 Wir können nicht bezahlen
      at: T.s("s7"), set: kh,
      cam: [{ pos: [-3, 6.2, 13], look: [-3, 4.6, 1], fov: 44 }, { pos: [-3, 6.0, 11.5], look: [-3, 4.7, 1], fov: 44 }],
      update(lt) {
        mamaBett.lieSide(lt, { arms: false }).face("sleep"); mamaBett.body.position.set(0, 2.75, 0);
        papaKH.idle(lt).face("sad").shrug(0.8).pill(...P(60)); ichKH.idle(lt).face("sad").pill(...P(100));
      },
    },
    { // s8 Ich hatte nur hundert
      at: T.s("s8"), set: kh,
      cam: [{ pos: [-1.2, 6.6, 12], look: [-1.6, 5.1, 1.4], fov: 40 }, { pos: [-1.3, 6.6, 10.8], look: [-1.6, 5.2, 1.4], fov: 40 }],
      update(lt) { papaKH.root.visible = false; ichKH.root.rotation.y = 0.1; ichKH.idle(lt).face("sad").pill(...P(100)); },
    },
    { // s8b Mir fehlten 400 Punkte
      at: T.s("s8b"), set: kh,
      cam: [{ pos: [-1.3, 6.6, 10.8], look: [-1.6, 5.2, 1.4], fov: 40 }, { pos: [-1.4, 6.6, 9.8], look: [-1.6, 5.3, 1.4], fov: 40 }],
      update(lt) { papaKH.root.visible = false; ichKH.root.rotation.y = 0.1; ichKH.idle(lt).face("worried").pill(...P(100)); },
    },
    { // s9 Montag: Omas Fernseher
      at: T.s("s9"), set: om,
      cam: [{ pos: [0.5, 6.6, 14], look: [0.5, 3.6, -2.5], fov: 46 }, { pos: [1.2, 6.2, 12], look: [1.2, 3.6, -2.5], fov: 46 }],
      update(lt, u) {
        oma.sit(); oma.body.position.y = -0.45; oma.face(u > 0.85 ? "laugh" : "neutral");
        ichOma.root.rotation.y = 1.9; ichOma.face("happy").reach("L", 0.8); ichOma.armL.rotation.x += Math.sin(lt * 8) * 0.12;
        tvAus.visible = u < 0.88;
      },
    },
    { // s10 Hundert Punkte! (100 → 200)
      at: T.s("s10"), set: om,
      cam: [{ pos: [3.0, 6.6, 10.5], look: [2.4, 5.1, -1.4], fov: 40 }, { pos: [3.0, 6.6, 9.5], look: [2.4, 5.2, -1.4], fov: 40 }],
      update(lt) {
        tvAus.visible = false; oma.sit(); oma.body.position.y = -0.45; oma.face("laugh");
        ichOma.root.rotation.y = 0.2; ichOma.cheer(lt).face("laugh").pill(...P(cnt(lt, 0.05, 0.5, 100, 200), "green"));
      },
    },
    { // s11 Dienstag: mit dem Hund der Nachbarn (Kamera fährt mit)
      at: T.s("s11"), set: gs,
      cam: [{ pos: [-5, 6.4, 12], look: [-5, 4.0, -6], fov: 46 }, { pos: [4, 6.4, 12], look: [4, 4.0, -6], fov: 46 }],
      ease: ease.linear,
      update(lt, u) {
        const x = lerp(-7, 6, u);
        ichGassi.walk(lt, 0.9).face("happy").pill(...P(200)); ichGassi.root.position.x = x;
        hund.position.x = x + 2.4; dogPose(hund, lt, 1);
        leine.position.set(x + 1.1, 2.4, -5.4); leine.scale.x = 2.2; leine.rotation.z = -0.35;
        nachbarTuer.wave(lt).face("happy");
      },
    },
    { // s12 Hundert Punkte! (200 → 300)
      at: T.s("s12"), set: gs,
      cam: [{ pos: [7.6, 6.6, 6], look: [6.2, 5.0, -6.4], fov: 40 }, { pos: [7.4, 6.6, 5], look: [6.2, 5.1, -6.4], fov: 40 }],
      update(lt) {
        ichGassi.root.position.x = 6; ichGassi.root.rotation.y = 0.2; ichGassi.cheer(lt).face("laugh").pill(...P(cnt(lt, 0.05, 0.5, 200, 300), "green"));
        hund.position.x = 8.6; hund.rotation.y = -0.6; dogPose(hund, lt, 0); leine.visible = false;
      },
    },
    { // s13 Mittwoch: Gartenarbeit mit Papa
      at: T.s("s13"), set: gt,
      cam: [{ pos: [-1, 7.2, 17], look: [-1.5, 4, -4], fov: 48 }, { pos: [-1, 6.6, 14], look: [-1.5, 4.2, -4], fov: 48 }],
      update(lt) {
        gartenModus(false);
        papaGarten.idle(lt).face("happy"); papaGarten.armR.rotation.x = -0.4 + Math.sin(lt * 5) * 0.4;
        ichGarten.idle(lt).face("happy").reach("R", 0.6).pill(...P(300)); ichGarten.root.position.x = 1.5 - Math.sin(lt * 0.8) * 1.5;
      },
    },
    { // s14 Zweihundert Punkte! (300 → 500)
      at: T.s("s14"), set: gt,
      cam: [{ pos: [2.2, 6.6, 9.5], look: [1.5, 5.1, -2.6], fov: 40 }, { pos: [2.2, 6.6, 8.5], look: [1.5, 5.2, -2.6], fov: 40 }],
      update(lt) {
        gartenModus(false); ichGarten.root.position.x = 1.5; ichGarten.root.rotation.y = 0;
        ichGarten.cheer(lt).face("laugh").pill(...P(cnt(lt, 0.05, 0.7, 300, 500), "green"));
      },
    },
    { // s15 Genug Punkte für Mamas Behandlung
      at: T.s("s15"), set: gt,
      cam: [{ pos: [-1, 6.6, 15], look: [-1.5, 4.4, -3], fov: 46 }, { pos: [-1, 6.4, 13], look: [-1.5, 4.6, -3], fov: 46 }],
      update(lt) {
        gartenModus(false); ichGarten.root.position.x = 1.5; ichGarten.root.rotation.y = -0.4;
        ichGarten.cheer(lt).face("laugh").pill(...P(500, "green"));
        papaGarten.cheer(lt + 0.5).face("laugh");
      },
    },
    { // s16 Ich ging sofort zum Krankenhaus und habe bezahlt
      at: T.s("s16"), set: kk,
      cam: [{ pos: [3, 6.4, 15], look: [0, 4.2, -1.5], fov: 46 }, { pos: [2, 6.2, 12.5], look: [0, 4.4, -1.5], fov: 46 }],
      update(lt, u) {
        arzt.idle(lt).face("happy");
        ichKasse.walk(lt, 1).face("happy").pill(...P(500)); ichKasse.root.position.z = lerp(6, 0.4, ease.out(clamp(u * 1.3)));
        ichKasse.root.rotation.y = Math.PI;
        if (u > 0.75) { ichKasse.walk(0); ichKasse.reach("R", 0.8); }
      },
    },
    { // s17 Danach hatte ich null Punkte (500 → 0)
      at: T.s("s17"), set: kk,
      cam: [{ pos: [3.4, 6.6, 12.5], look: [0.4, 5.0, 0.4], fov: 40 }, { pos: [3.2, 6.6, 11.3], look: [0.4, 5.1, 0.4], fov: 40 }],
      update(lt) {
        arzt.idle(lt).face("happy");
        ichKasse.root.position.z = 0.4; ichKasse.root.rotation.y = 0.3;
        const n = cnt(lt, 0.1, 1.0, 500, 0);
        ichKasse.idle(lt).face("neutral").pill(...P(n, n === 0 ? "red" : "white"));
      },
    },
    { // s18 Aber das war mir egal
      at: T.s("s18"), set: kk,
      cam: [{ pos: [3.2, 6.6, 11.3], look: [0.4, 5.1, 0.4], fov: 40 }, { pos: [3.0, 6.6, 10.3], look: [0.4, 5.2, 0.4], fov: 40 }],
      update(lt) {
        arzt.idle(lt).face("happy"); ichKasse.root.position.z = 0.4; ichKasse.root.rotation.y = 0.3;
        ichKasse.idle(lt).face("laugh").pill(...P(0, "red"));
      },
    },
    { // s19 Zwei Wochen später: Mama kommt raus
      at: T.s("s19"), set: ka,
      cam: [{ pos: [0, 6.6, 15], look: [0, 4.6, -7], fov: 46 }, { pos: [0, 6.2, 11], look: [0, 4.8, -7], fov: 46 }],
      update(lt, u) {
        mamaRaus.walk(lt, 0.8).face("laugh"); mamaRaus.root.position.z = lerp(-9.2, -6.4, ease.out(clamp(u * 1.2)));
        if (u > 0.8) mamaRaus.walk(0);
        papaRaus.cheer(lt).face("laugh"); ichRaus.cheer(lt + 0.3).face("laugh").pill(...P(0, "red"));
      },
    },
    { // s20 Riesige Party
      at: T.s("s20"), set: gt,
      cam: [{ pos: [1, 8, 20], look: [1, 4.6, -4], fov: 48 }, { pos: [1.5, 7, 15], look: [1.5, 4.8, -4], fov: 48 }],
      update(lt) {
        gartenModus(true);
        feier.forEach((c, i) => c.cheer(lt + i * 0.37).face(i % 2 ? "laugh" : "happy"));
        stueck.visible = false; dogPose(hundParty, lt, 0);
        ballons.forEach((b, i) => (b.position.y = 8.5 + (i % 2) * 0.8 + Math.sin(lt * 1.4 + i) * 0.35));
      },
    },
    { // s21 Mama gibt mir das erste Stück Kuchen
      at: T.s("s21"), set: gt,
      cam: [{ pos: [2, 6.2, 11.5], look: [2, 4.6, -1.7], fov: 44 }, { pos: [2, 6.1, 10.3], look: [2, 4.7, -1.7], fov: 44 }],
      update(lt) {
        gartenModus(true); stueck.visible = true; dogPose(hundParty, lt, 0);
        mamaF.root.rotation.y = 0.9; mamaF.idle(lt).face("laugh").reach("R", ramp(lt, 0.2, 0.4));
        ichF.root.rotation.y = -0.9; ichF.idle(lt).face("happy").reach("L", ramp(lt, 0.7, 0.3)).pill(...P(0, "red"));
        [papaF, omaF, nachbarF].forEach((c) => c.idle(lt).face("happy"));
      },
    },
    { // s22 Plus zehn Punkte (Pointe)
      at: T.s("s22"), set: gt,
      cam: [{ pos: [4.6, 6.8, 9.8], look: [3.4, 5.2, -1.0], fov: 40 }, { pos: [4.4, 6.8, 8.6], look: [3.4, 5.3, -1.0], fov: 40 }],
      update(lt) {
        gartenModus(true); stueck.visible = true; dogPose(hundParty, lt, 0);
        mamaF.root.rotation.y = 0.9; mamaF.idle(lt).face("laugh");
        ichF.root.rotation.y = -0.3; ichF.cheer(lt).face("laugh").pill(...P(cnt(lt, 0.05, 0.4, 0, 10), "green"));
      },
    },
  ];
}
