// Drehbuch: "In dieser Stadt steht über jedem, wie viele echte Freunde er hat"
export default function direct(W, S, T) {
  const { character, house, tree, cloud, street, plaza, room, bed, nightstand, bench, mat, ramp, ease, clamp, lerp, C } = S;
  const THREE = S.THREE;

  // ---------------------------------------------------------- Besetzung
  const ICH = { shirt: { type: "varsity", number: "13" }, hair: { type: "messy", seed: 11 }, phase: 0 };
  const MAEDCHEN = { shirt: { type: "jacket", color: "#5b3a7a", inner: "#1d1d22" }, hair: { type: "long", color: "#141418" }, pants: "#1d1d22", phase: 0.8 };
  const JUNGE = { shirt: { type: "hoodie", color: "#7a7f88" }, hair: { type: "curly", color: "#5b3a22", seed: 5 }, pants: "#3a3f4a", phase: 1.6 };
  const EXTRAS = [
    { shirt: { type: "jacket", color: C.denim }, hair: { type: "curly", color: "#5b3a22", seed: 3 }, pants: "#c9b58f", phase: 0.4 },
    { shirt: { type: "hoodie", color: "#3f9a55" }, hair: { type: "short", color: "#1d1d1d" }, skin: C.skinDark, phase: 1.1 },
    { shirt: { type: "tee", color: "#f2b632", stripe: "#2d5fb5" }, hair: { type: "long", color: "#e2c27a" }, pants: "#2d5fb5", phase: 2.4 },
    { shirt: { type: "hoodie", color: "#e67e22" }, hair: { type: "short", color: "#a0522d" }, hat: "cap", hatColor: "#2d5fb5", phase: 0.2 },
    { shirt: { type: "tee", color: "#7fb3e6" }, hair: { type: "bun", color: "#2b1d14" }, phase: 2.9 },
    { shirt: { type: "jacket", color: "#c0392b", inner: "#222" }, hair: { type: "short", color: "#2a2a2a" }, phase: 1.7 },
  ];
  const extra = (i) => character(EXTRAS[i % EXTRAS.length]);
  const F = (n, warn = false) => [n === 1 ? "1 Freund" : `${n} Freunde`, warn ? "red" : "white"];

  // ---------------------------------------------------------- A) Straße
  const st = W.set("street", 0, 0);
  W.add(st, street(160), 0, 0, 0);
  [[-22, C.pink, C.roofBlue], [-8, "#f3e6c9", "#7a3b2b"], [6, "#b9d7a8", C.roofBlue], [20, "#f0c9a2", "#7a3b2b"]].forEach(([x, col, roof]) =>
    W.add(st, house({ w: 10, d: 8, h: 6.8, color: col, roof }), x, 0, -15));
  [[-15, -10.5], [-1, -10.2], [13, -10.5]].forEach(([x, z], i) => W.add(st, tree(1, i + 3), x, 0, z));
  [[-18, 30, -70, 2.6], [10, 34, -75, 3]].forEach(([x, y, z, s], i) => W.add(st, cloud(s, i + 2), x, y, z));
  const ichA = W.addChar(st, character(ICH), 0, -6.4, 0);
  const freundeA = [[-4.2, -7.4, 0.35, 15], [4.2, -7.4, -0.35, 9], [-7.6, -8.6, 0.5, 22], [7.6, -8.6, -0.5, 11]].map(([x, z, r, n], i) =>
    ({ c: W.addChar(st, extra(i), x, z, r), n }));

  // ---------------------------------------------------------- B) Schlafzimmer, Morgen
  const bd = W.set("bedroom", 600, 0, { interior: true });
  W.add(bd, room({ wall: "#cfe0f1", floor: "#b97a45" }), 0, 0, 0);
  W.add(bd, bed("#e2483e"), 0, 0, -2.5, -Math.PI / 2);
  const ichBett = W.addChar(bd, character(ICH), -2.3, -2.5, 0);
  const decke = W.add(bd, new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.5, 3.0), mat("#e2483e")), -0.7, 2.75, -2.1);
  decke.castShadow = true;
  W.add(bd, nightstand(), 4.9, 0, -4.1);
  const ichSteht = W.addChar(bd, character(ICH), -4.6, 0.8, 0.35);

  // ---------------------------------------------------------- C) Schulhof
  const sc = W.set("school", 300, 300);
  W.add(sc, plaza(30, 8), 0, 0, -11);
  W.add(sc, house({ w: 18, d: 9, h: 10, color: C.brick, flat: true, sign: "SCHULE", windows: [-6, 0, 6], signStyle: { bg: "#f4efe6", fg: "#2a2a2a", border: "#2a2a2a" } }), 0, 0, -19);
  [[-15, -12], [15, -12], [-19, 2], [19, 1]].forEach(([x, z], i) => W.add(sc, tree(1.15, 40 + i), x, 0, z));
  [[-14, 30, -70, 2.6], [14, 34, -80, 3]].forEach(([x, y, z, s], i) => W.add(sc, cloud(s, i + 6), x, y, z));
  W.add(sc, bench(), 9, 0, -3, -0.4);
  const gruppe = [[3, -6, 0.3, 15], [5.6, -5.4, -0.4, 9], [4.2, -8, 0.1, 22], [6.8, -7.6, -0.3, 11]].map(([x, z, r, n], i) =>
    ({ c: W.addChar(sc, extra(i), x, z, r), x, z, r, n }));
  const ichHof = W.addChar(sc, character(ICH), -6, 2, 0.9);
  const ichNah = W.addChar(sc, character(ICH), -1.8, 1.5, 0.9);
  const maedchen = W.addChar(sc, character(MAEDCHEN), 1.8, 1.5, -0.9);
  const junge = W.addChar(sc, character(JUNGE), 9.1, -2.8, -0.4);
  const sammlung = [[7.2, -7.2, 15], [10.4, -7.8, 13], [12.8, -6.2, 11]].map(([x, z], i) => W.addChar(sc, extra(i + 3), x, z, -0.3));
  const schueler = [[-11, -6, 31], [-13, -9.5, 18], [-12.5, 3, 6]].map(([x, z, n], i) => ({ c: W.addChar(sc, extra(i + 1), x, z, i ? -0.5 : 0.5), n }));

  // Wer in welcher Einstellung zu sehen ist
  const scCast = [ichHof, ichNah, maedchen, junge, ...sammlung, ...gruppe.map((g) => g.c)];
  const show = (...cs) => scCast.forEach((c) => (c.root.visible = cs.includes(c)));
  const hofBase = (lt) => schueler.forEach(({ c, n }) => c.idle(lt).face("neutral").pill(...F(n)));
  const ichPill = (t) => {
    if (t < T.w("s11", 9, 0)) return F(1);
    return F(0, true);
  };
  const jungeSitzt = (lt) => {
    junge.sit(); junge.body.position.y = 0.1; junge.face("sad"); junge.armL.rotation.x = junge.armR.rotation.x = -0.7;
    junge.head.rotation.x = 0.25; junge.pill(...F(1));
  };
  const allesGruppe = (lt, face = "happy") => gruppe.forEach(({ c, n }) => c.idle(lt).face(face).pill(...F(n)));

  // ---------------------------------------------------------- Einstellungen
  // k > 1 zieht die Kamera entlang der Blickrichtung zurück (weiterer Bildausschnitt)
  const far = (c, f) => ({ ...c, pos: c.look.map((l, i) => l + (c.pos[i] - l) * f) });
  const finish = (shots) => shots.map((sh) => (sh.k ? { ...sh, cam: sh.cam.map((c) => far(c, sh.k)) } : sh));
  return finish([
    { // s1 Hook: Straße, Zahlen über den Köpfen
      at: 0, set: st,
      cam: [{ pos: [0, 6.6, 19], look: [0, 4.8, -7], fov: 46 }, { pos: [0, 6.2, 14], look: [0, 5, -7], fov: 46 }],
      update(lt) {
        ichA.idle(lt).face("happy").pill(...F(12));
        freundeA.forEach(({ c, n }) => c.idle(lt).face("happy").pill(...F(n)));
      },
    },
    { // s2 Über meinem Kopf: 12 (Karte liegt darüber)
      at: T.s("s2"), set: st,
      cam: [{ pos: [0.3, 6.4, 6.4], look: [0, 4.6, -6.4], fov: 40 }, { pos: [0.2, 6.3, 5.2], look: [0, 4.7, -6.4], fov: 40 }],
      update(lt) { ichA.idle(lt).face("happy").pill(...F(12)); freundeA.forEach(({ c, n }) => c.pill(...F(n))); },
    },
    { // s3 beliebt – alle jubeln mit mir
      at: T.s("s3"), set: st,
      cam: [{ pos: [-2, 6.2, 13], look: [0, 4.6, -7], fov: 46 }, { pos: [2, 6, 12], look: [0, 4.6, -7], fov: 46 }],
      update(lt) {
        ichA.cheer(lt).face("laugh").pill(...F(12));
        freundeA.forEach(({ c, n }, i) => c.cheer(lt + i * 0.4).face(i % 2 ? "laugh" : "happy").pill(...F(n)));
      },
    },
    { // s4 Eines Morgens wachte ich auf
      at: T.s("s4"), set: bd,
      cam: [{ pos: [1.2, 6, 11], look: [1.6, 3.2, -2.5], fov: 46 }, { pos: [1.8, 5.4, 8.5], look: [2.0, 3.3, -2.5], fov: 44 }],
      update(lt) {
        const auf = T.w("s4", 3) - T.s("s4");
        ichSteht.root.visible = false;
        ichBett.lieSide(lt, { arms: false }).face(lt < auf ? "sleep" : "neutral"); ichBett.body.position.set(0, 2.75, 0);
      },
    },
    { // s5 Meine Zahl ist auf 1 gesunken
      k: 1.6, at: T.s("s5"), set: bd,
      cam: [{ pos: [-3.6, 6.8, 7.5], look: [-4.6, 5.6, 0.8], fov: 40 }, { pos: [-3.8, 6.9, 6.3], look: [-4.6, 5.9, 0.8], fov: 40 }],
      update(lt) {
        ichBett.root.visible = false; decke.visible = true;
        const eins = T.w("s5", 4) - T.s("s5");
        const n = Math.max(1, Math.round(lerp(12, 1, ease.in(clamp(lt / Math.max(0.3, eins))))));
        ichSteht.idle(lt).face(n > 1 ? "worried" : "shock").pill(...F(n));
        ichSteht.lookAt(0); ichSteht.head.rotation.x = -0.25; // schaut nach oben
      },
    },
    { // s6 Ich fragte meine Freunde
      at: T.s("s6"), set: st,
      cam: [{ pos: [-1, 6, 12], look: [0, 4.6, -7], fov: 46 }, { pos: [-0.5, 5.8, 10], look: [0, 4.7, -7], fov: 46 }],
      update(lt) {
        ichA.idle(lt).face("worried").pill(...F(1)); ichA.shrug(0.8);
        freundeA.forEach(({ c, n }) => c.idle(lt).face("neutral").pill(...F(n)));
      },
    },
    { // s7 alles normal (sie grinsen)
      at: T.s("s7"), set: st,
      cam: [{ pos: [3.6, 6.3, 5.6], look: [4.2, 4.7, -7.4], fov: 42 }, { pos: [3.0, 6.2, 5.0], look: [3.2, 4.8, -7.4], fov: 46 }],
      update(lt) {
        ichA.idle(lt).face("worried").pill(...F(1));
        freundeA.forEach(({ c, n }) => { c.idle(lt).face("smug").shrug(1).pill(...F(n)); });
      },
    },
    { // s8 In der Schule will ich mit ihnen reden
      at: T.s("s8"), set: sc,
      cam: [{ pos: [-1, 7.2, 22], look: [1, 4.6, -5], fov: 46 }, { pos: [0, 6.6, 17], look: [1.5, 4.8, -5], fov: 46 }],
      update(lt) {
        show(ichHof, ...gruppe.map((g) => g.c)); hofBase(lt);
        allesGruppe(lt, "laugh");
        ichHof.walk(lt, 0.9).face("neutral").pill(...F(1)); ichHof.root.position.x = Math.min(-0.5, -6 + lt * 2.2);
        ichHof.root.position.z = 2 - Math.min(3.5, lt * 1.4); ichHof.root.rotation.y = 2.2;
        if (lt > 2.4) ichHof.wave(lt);
      },
    },
    { // s9 plötzlich ignorieren mich alle (drehen sich weg)
      at: T.s("s9"), set: sc,
      cam: [{ pos: [1.5, 6.6, 15], look: [2.2, 4.6, -4], fov: 46 }, { pos: [1.8, 6.4, 13.5], look: [2.4, 4.7, -4], fov: 46 }],
      update(lt) {
        show(ichHof, ...gruppe.map((g) => g.c)); hofBase(lt);
        ichHof.root.position.set(-0.5, 0, -1.5); ichHof.root.rotation.y = 2.2; ichHof.idle(lt).face("sad").pill(...F(1));
        gruppe.forEach(({ c, r, n }, i) => { c.idle(lt).face("neutral").pill(...F(n)); c.root.rotation.y = lerp(r, r + Math.PI, ease.inOut(ramp(lt, 0.2 + i * 0.12, 0.5))); });
      },
    },
    { // s9b sie laufen an mir vorbei
      at: T.s("s9b"), set: sc,
      cam: [{ pos: [-0.5, 6.4, 13], look: [-0.5, 4.5, -2], fov: 46 }, { pos: [-0.3, 6.3, 11.5], look: [-0.5, 4.6, -2], fov: 46 }],
      update(lt) {
        show(ichHof, ...gruppe.map((g) => g.c)); hofBase(lt);
        ichHof.root.position.set(-0.5, 0, -1.5); ichHof.root.rotation.y = 0.2; ichHof.idle(lt).face("sad").pill(...F(1));
        gruppe.forEach(({ c, n }, i) => {
          c.walk(lt + i, 1).face("neutral").pill(...F(n));
          c.root.rotation.y = -1.45; c.root.position.set(5 + i * 1.6 - lt * 3.0, 0, -0.4 - i * 1.3);
        });
      },
    },
    { // s10 Nur ein Mädchen spricht noch mit mir
      k: 1.3, at: T.s("s10"), set: sc,
      cam: [{ pos: [0, 6.0, 13], look: [0, 4.5, 1.5], fov: 44 }, { pos: [0, 5.9, 11.5], look: [0, 4.6, 1.5], fov: 44 }],
      update(lt) {
        show(ichNah, maedchen); hofBase(lt);
        ichNah.idle(lt).face(lt > 1.0 ? "happy" : "sad").pill(...F(1));
        maedchen.walk(lt, 0.8).face("happy").pill(...F(1));
        maedchen.root.position.x = Math.max(1.8, 6 - lt * 2.4);
        if (lt > 1.8) { maedchen.walk(0); maedchen.wave(lt, "L"); }
      },
    },
    { // s11 Am nächsten Tag: 0 über meinem Kopf
      k: 1.5, at: T.s("s11"), set: sc,
      cam: [{ pos: [-1.0, 7.0, 9.5], look: [-1.8, 5.2, 1.5], fov: 40 }, { pos: [-1.2, 7.0, 8.3], look: [-1.8, 5.4, 1.5], fov: 40 }],
      update(lt, u, t) {
        show(ichNah); hofBase(lt);
        ichNah.root.rotation.y = 0.15;
        ichNah.idle(lt).face(t >= T.w("s11", 9, 0) ? "shock" : "worried").pill(...ichPill(t));
      },
    },
    { // s11b Kein einziger Freund mehr (allein auf dem Hof)
      at: T.s("s11b"), set: sc,
      cam: [{ pos: [-1.8, 9, 20], look: [-1.8, 3.5, 1.5], fov: 46 }, { pos: [-1.8, 12, 26], look: [-1.8, 3, 1.5], fov: 48 }],
      update(lt, u, t) {
        show(ichNah, ...gruppe.map((g) => g.c)); hofBase(lt); allesGruppe(lt, "laugh");
        ichNah.root.rotation.y = 0.15; ichNah.idle(lt, 0.3).face("sad").pill(...F(0, true));
      },
    },
    { // s12 Ich frage sie, warum sie noch mit mir redet
      k: 1.25, at: T.s("s12"), set: sc,
      cam: [{ pos: [0, 6.0, 12], look: [0, 4.5, 1.5], fov: 44 }, { pos: [0, 5.9, 10.5], look: [0, 4.6, 1.5], fov: 44 }],
      update(lt) {
        show(ichNah, maedchen); hofBase(lt);
        ichNah.idle(lt).face("worried").shrug(0.7).pill(...F(0, true));
        maedchen.idle(lt).face("neutral").pill(...F(1));
      },
    },
    { // s13 Sie lächelte
      k: 1.55, at: T.s("s13"), set: sc,
      cam: [{ pos: [-3.2, 5.8, 9.0], look: [1.8, 5.0, 1.5], fov: 36 }, { pos: [-2.8, 5.8, 8.2], look: [1.8, 5.1, 1.5], fov: 36 }],
      update(lt) {
        show(ichNah, maedchen); hofBase(lt);
        maedchen.idle(lt).face(lt > 0.3 ? "happy" : "neutral");
        ichNah.pill(...F(0, true));
      },
    },
    { // s14 „Weil ich deine einzige echte Freundin bin.“
      k: 1.55, at: T.s("s14"), set: sc,
      cam: [{ pos: [-2.8, 5.8, 8.2], look: [1.8, 5.1, 1.5], fov: 36 }, { pos: [-2.3, 5.7, 7.3], look: [1.8, 5.2, 1.5], fov: 34 }],
      update(lt) { show(ichNah, maedchen); hofBase(lt); maedchen.idle(lt, 0.4).face("smug"); },
    },
    { // s15 Ich schaue auf ihren Kopf (Kamera kippt nach oben)
      k: 1.6, at: T.s("s15"), set: sc,
      cam: [{ pos: [-2.8, 5.8, 8.6], look: [1.8, 5.1, 1.5], fov: 36 }, { pos: [-2.8, 7.4, 8.6], look: [1.8, 7.0, 1.5], fov: 36 }],
      update(lt) { show(ichNah, maedchen); hofBase(lt); maedchen.idle(lt, 0.4).face("happy").pill(...F(1)); },
    },
    { // s16 Dort stand eine 1
      k: 1.75, at: T.s("s16"), set: sc,
      cam: [{ pos: [-2.2, 7.4, 8.0], look: [1.8, 7.0, 1.5], fov: 32 }, { pos: [-1.8, 7.4, 7.3], look: [1.8, 7.0, 1.5], fov: 30 }],
      update(lt) { show(ichNah, maedchen); hofBase(lt); maedchen.idle(lt, 0.4).face("happy").pill(...F(1)); },
    },
    { // s16b Ich dachte, ich bin ihr einziger Freund
      k: 1.35, at: T.s("s16b"), set: sc,
      cam: [{ pos: [-1.0, 6.8, 9.5], look: [-1.8, 5.0, 1.5], fov: 40 }, { pos: [-1.2, 6.8, 8.4], look: [-1.8, 5.2, 1.5], fov: 40 }],
      update(lt) { show(ichNah); hofBase(lt); ichNah.root.rotation.y = 0.3; ichNah.idle(lt).face("happy").pill(...F(0, true)); },
    },
    { // s17 Ich lächle und will mich bedanken
      k: 1.3, at: T.s("s17"), set: sc,
      cam: [{ pos: [0, 6.0, 11.5], look: [0, 4.6, 1.5], fov: 44 }, { pos: [0, 5.9, 10.2], look: [0, 4.7, 1.5], fov: 44 }],
      update(lt) {
        show(ichNah, maedchen); hofBase(lt);
        ichNah.idle(lt).face("happy").reach("R", ramp(lt, 0.4, 0.4)).pill(...F(0, true));
        maedchen.idle(lt).face("happy").pill(...F(1));
      },
    },
    { // s18 Sie dreht sich um und geht zu einem anderen Jungen
      at: T.s("s18"), set: sc,
      cam: [{ pos: [-2, 6.8, 14], look: [3.5, 4.4, -1], fov: 46 }, { pos: [-1, 6.8, 13], look: [5.5, 4.4, -2], fov: 46 }],
      update(lt, u) {
        show(ichNah, maedchen, junge); hofBase(lt); jungeSitzt(lt);
        ichNah.idle(lt).face("worried").pill(...F(0, true)); ichNah.reach("R", 1 - ramp(lt, 0, 0.6));
        const turn = ramp(lt, 0, 0.5), go = ease.inOut(clamp((lt - 0.5) / 2.4));
        maedchen.root.rotation.y = lerp(-0.9, 2.2, turn);
        maedchen.root.position.set(lerp(1.8, 7.3, go), 0, lerp(1.5, -1.6, go));
        if (go > 0 && go < 1) maedchen.walk(lt, 1); else maedchen.idle(lt);
        maedchen.face("happy").pill(...F(1));
      },
    },
    { // s19 Über seinem Kopf: ebenfalls 1
      at: T.s("s19"), set: sc,
      cam: [{ pos: [13.5, 6.4, 6.5], look: [9.0, 4.8, -2.8], fov: 42 }, { pos: [12.8, 6.6, 5.2], look: [9.0, 5.2, -2.8], fov: 40 }],
      update(lt) {
        show(maedchen, junge); hofBase(lt); jungeSitzt(lt);
        maedchen.root.position.set(7.3, 0, -1.6); maedchen.root.rotation.y = 2.4; maedchen.idle(lt).face("happy").pill(...F(1));
      },
    },
    { // s20 In diesem Moment verstand ich
      k: 1.4, at: T.s("s20"), set: sc,
      cam: [{ pos: [-1.0, 6.8, 9.5], look: [-1.8, 5.0, 1.5], fov: 40 }, { pos: [-1.2, 6.8, 8.2], look: [-1.8, 5.2, 1.5], fov: 40 }],
      update(lt) { show(ichNah); hofBase(lt); ichNah.root.rotation.y = 0.5; ichNah.idle(lt, 0.3).face("shock").pill(...F(0, true)); },
    },
    { // s21 Sie war nicht meine Freundin (sie schaut zurück und grinst)
      k: 1.3, at: T.s("s21"), set: sc,
      cam: [{ pos: [3.5, 6.2, 9], look: [7.8, 4.8, -2.4], fov: 42 }, { pos: [4.5, 6.0, 7], look: [7.8, 5.0, -2.4], fov: 40 }],
      update(lt) {
        show(maedchen, junge); hofBase(lt); jungeSitzt(lt);
        maedchen.root.position.set(7.3, 0, -1.6); maedchen.root.rotation.y = lerp(2.4, 0.2, ease.inOut(ramp(lt, 0.1, 0.6)));
        maedchen.idle(lt, 0.3).face("smug").pill(...F(1)); maedchen.reach("L", 0.6);
      },
    },
    { // s22 Sie sammelte Menschen, die niemanden mehr hatten
      at: T.s("s22"), set: sc,
      cam: [{ pos: [4.5, 6.8, 13], look: [9, 4.6, -4], fov: 46 }, { pos: [5.5, 6.3, 8], look: [8.2, 5.0, -3], fov: 42 }],
      update(lt) {
        show(maedchen, junge, ...sammlung); hofBase(lt); jungeSitzt(lt);
        maedchen.root.position.set(7.3, 0, -1.6); maedchen.root.rotation.y = 0.2;
        maedchen.idle(lt, 0.2).face("smug").reach("L", 0.6).pill(...F(1));
        sammlung.forEach((c, i) => { c.idle(lt + i).face("sad").pill(...F(1)); c.head.rotation.x = 0.2; });
      },
    },
  ]);
}
