// runner.js – verbindet Drehbuch (scene.js) mit HyperFrames.
// HyperFrames sucht jedes Frame per GSAP-Timeline an; deren onUpdate ruft render(t).
import * as S from "./stadt3d.js";

export async function boot({ canvas, direct, timing }) {
  const host = window.__stadt;
  try { await document.fonts.load('800 80px "Montserrat"'); await document.fonts.load('900 80px "Montserrat"'); } catch (e) { /* Fallback-Schrift */ }

  const T = makeTiming(timing);
  const W = S.createWorld(canvas);
  const shots = direct(W, S, T).map((s) => ({ ...s }));
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => { s.to = i + 1 < shots.length ? shots[i + 1].at : T.duration; });
  shots[0].at = 0;

  const charsOf = (set) => {
    const list = [];
    set.traverse((o) => { if (o.userData.char) list.push(o.userData.char); });
    return list;
  };

  host.render = (t) => {
    let shot = shots[shots.length - 1];
    for (const s of shots) if (t >= s.at && t < s.to) { shot = s; break; }
    if (!shot.chars) shot.chars = charsOf(shot.set);
    W.show(shot.set);
    shot.chars.forEach((c) => c.reset());
    const lt = t - shot.at, u = (t - shot.at) / Math.max(0.001, shot.to - shot.at);
    if (shot.cam) S.camMove(W, shot.set, shot.cam[0], shot.cam[1], u, shot.ease || S.ease.inOut);
    if (shot.update) shot.update(lt, u, t);
    W.render();
  };
  // Shader einmal kompilieren, dann ist das erste Frame nicht langsamer
  for (const s of shots) { W.show(s.set); }
  W.show(shots[0].set);
  if (W.renderer.compileAsync) await W.renderer.compileAsync(W.scene, W.camera);
  host.render(host.clock.t);
  host.ready();
}

function makeTiming(timing) {
  const byId = Object.fromEntries(timing.sentences.map((s) => [s.id, s]));
  const get = (id) => { const s = byId[id]; if (!s) throw new Error("Satz fehlt: " + id); return s; };
  return {
    duration: timing.videoDuration || timing.duration,
    /** Start des Satzes (minus kleiner Vorlauf, damit der Schnitt vor dem Wort sitzt) */
    s: (id, lead = 0.06) => Math.max(0, get(id).start - lead),
    e: (id) => get(id).end,
    /** Start von Wort i im Satz */
    w: (id, i, lead = 0.04) => Math.max(0, get(id).words[i].start - lead),
    we: (id, i) => get(id).words[i].end,
    sentences: timing.sentences,
  };
}
