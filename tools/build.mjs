#!/usr/bin/env node
// Baut aus video.json + assets/timing.json + assets/scene.js die HyperFrames-Komposition index.html.
// Aufruf: node tools/build.mjs videos/<slug>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proj = path.resolve(process.argv[2] || ".");
const spec = JSON.parse(fs.readFileSync(path.join(proj, "video.json"), "utf8"));
const timing = JSON.parse(fs.readFileSync(path.join(proj, "assets", "timing.json"), "utf8"));
const W = 1080, H = 1920;
const D = +(timing.duration).toFixed(2);
timing.videoDuration = D;

// ---------- Engine + Bibliotheken ins Projekt kopieren (gitignored)
const cp = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
const A = (p) => path.join(proj, "assets", p);
for (const f of fs.readdirSync(path.join(ROOT, "engine"))) cp(path.join(ROOT, "engine", f), A("engine/" + f));
cp(path.join(ROOT, "node_modules/three/build/three.module.js"), A("vendor/three.module.js"));
cp(path.join(ROOT, "node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js"), A("vendor/addons/geometries/RoundedBoxGeometry.js"));
cp(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), A("vendor/gsap.min.js"));

// ---------- Helfer
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f2 = (x) => (+x).toFixed(3).replace(/\.?0+$/, "");
const sent = Object.fromEntries(timing.sentences.map((s) => [s.id, s]));
const at = ([id, w]) => {
  if (id === "END") return D;
  const s = sent[id];
  if (w === "end") return s.end;
  return s.words[w].start - 0.04;
};

// ---------- Untertitel: genau EIN Wort, durchgehend sichtbar
const words = timing.sentences.flatMap((s) => s.words.map((w) => ({ ...w, sid: s.id })));
const caps = words.map((w, i) => {
  const start = i === 0 ? Math.max(0.0, w.start - 0.1) : w.start;
  const next = i + 1 < words.length ? words[i + 1].start : Math.min(D, w.end + 0.6);
  const text = w.text.replace(/[.,:;!?„“"»«]/g, "");
  return { id: `w${i}`, text, start, dur: Math.max(0.08, next - start) };
});

// ---------- Overlays (Karte, Schild)
const overlays = (spec.overlays || []).map((o, i) => ({ ...o, id: `ov${i}`, start: at(o.from), end: at(o.to) }));

const capHtml = caps.map((c) =>
  `      <div id="${c.id}" class="clip cap" data-start="${f2(c.start)}" data-duration="${f2(c.dur)}" data-track-index="5"><span>${esc(c.text)}</span></div>`).join("\n");

const ovHtml = overlays.map((o) => {
  const dur = f2(o.end - o.start);
  if (o.type === "card") return `      <div id="${o.id}" class="clip card-bg" data-start="${f2(o.start)}" data-duration="${dur}" data-track-index="3">
        <div class="card"><div class="card-head">${esc(o.header)}</div><div class="card-val">${esc(o.value)}</div></div>
      </div>`;
  if (o.type === "keyhole") return `      <div id="${o.id}" class="clip keyhole" data-start="${f2(o.start)}" data-duration="${dur}" data-track-index="3"><div class="keyhole-mask"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><mask id="${o.id}-m"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="540" cy="820" r="230" fill="#000"/><polygon points="430,930 650,930 760,1420 320,1420" fill="#000"/></mask></defs><rect x="-1000" y="-1000" width="${W + 2000}" height="${H + 2000}" fill="#000" mask="url(#${o.id}-m)"/></svg></div></div>`;
  if (o.type === "flash") return `      <div id="${o.id}" class="clip flash" data-start="${f2(o.start)}" data-duration="${dur}" data-track-index="3"><div class="flash-fill" style="background:${esc(o.color || "#d10000")}"></div></div>`;
  return `      <div id="${o.id}" class="clip sign" data-start="${f2(o.start)}" data-duration="${dur}" data-track-index="4"><div class="sign-box">${esc(o.text)}</div></div>`;
}).join("\n");

const ovJs = overlays.map((o) => {
  const d = o.end - o.start;
  if (o.type === "card") return `      tl.fromTo("#${o.id} .card", { scale: 0.6, rotation: -8, opacity: 0 }, { scale: 1, rotation: -3, opacity: 1, duration: 0.28, ease: "back.out(2.2)" }, ${f2(o.start)});`;
  if (o.type === "keyhole") return `      tl.fromTo("#${o.id} .keyhole-mask", { scale: 1.6 }, { scale: 1, duration: 0.35, ease: "power2.out" }, ${f2(o.start)});`;
  if (o.type === "flash") return o.hold
    ? `      tl.fromTo("#${o.id} .flash-fill", { opacity: 0 }, { opacity: ${o.opacity ?? 1}, duration: ${o.fade ?? 0.4}, ease: "power1.in" }, ${f2(o.start)});`
    : `      tl.fromTo("#${o.id} .flash-fill", { opacity: ${o.opacity ?? 0.6} }, { opacity: 0, duration: ${f2(Math.max(0.1, d - 0.02))}, ease: "power2.out" }, ${f2(o.start)});`;
  return `      tl.fromTo("#${o.id} .sign-box", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.5)" }, ${f2(o.start)});
      tl.to("#${o.id} .sign-box", { scale: 0.85, opacity: 0, duration: 0.12, ease: "power2.in" }, ${f2(o.start + d - 0.13)});`;
}).join("\n");

const capJs = caps.map((c) =>
  `      tl.fromTo("#${c.id} span", { scale: 0.72 }, { scale: 1, duration: 0.14, ease: "back.out(3)" }, ${f2(c.start)});`).join("\n");

const music = fs.existsSync(A("music.wav"));
const sfx = fs.existsSync(A("pop.wav"));
const sfxHtml = sfx ? overlays.map((o, i) => (o.type === "keyhole" || o.type === "flash") ? "" :
  `      <audio id="sfx${i}" class="clip" src="assets/pop.wav" data-start="${f2(o.start)}" data-duration="0.4" data-volume="0.55" data-track-index="9"></audio>`).join("\n") : "";

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(spec.title)}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script type="importmap">
      { "imports": { "three": "./assets/vendor/three.module.js", "three/addons/": "./assets/vendor/addons/" } }
    </script>
    <style>
      html, body { margin: 0; padding: 0; background: #000; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #8cc8f0; font-family: "Montserrat", sans-serif; }
      #world { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
      /* Ein-Wort-Untertitel: weiß, extra fett, schwarze Kontur, ~65 % Bildhöhe */
      .cap { position: absolute; left: 0; width: ${W}px; top: 1150px; height: 160px; text-align: center; z-index: 50; overflow: visible; }
      .cap span { display: inline-block; font-family: "Montserrat", sans-serif; font-weight: 900; font-size: 92px; line-height: 160px;
        color: #fff; -webkit-text-stroke: 14px #111; paint-order: stroke fill; letter-spacing: -1px;
        text-shadow: 0 7px 0 rgba(0,0,0,0.35); transform-origin: 50% 60%; }
      /* Infokarte auf Cremegrund */
      .card-bg { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; background: #f3e9dc; z-index: 40; }
      .card { position: absolute; left: 190px; top: 560px; width: 700px; border-radius: 34px; background: #fff; overflow: hidden;
        box-shadow: 0 30px 60px rgba(60,40,20,0.25); }
      .card-head { background: #e23b3b; color: #fff; font-weight: 900; font-size: 64px; text-align: center; padding: 26px 0 22px; letter-spacing: 2px; }
      .card-val { color: #151515; font-weight: 900; font-size: 210px; text-align: center; line-height: 1; padding: 40px 0 56px; }
      /* Blick durchs Schlüsselloch: schwarzer Rahmen mit Schlüsselloch-Ausschnitt */
      .keyhole { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; z-index: 40; overflow: hidden; }
      .keyhole-mask { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 540px 900px; }
      .keyhole-mask svg { display: block; }
      .flash { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; z-index: 39; }
      .flash-fill { position: absolute; inset: 0; mix-blend-mode: normal; }
      /* Schild oben mit Schlüsselsatz */
      .sign { position: absolute; left: 0; top: 250px; width: ${W}px; height: 160px; text-align: center; z-index: 45; }
      .sign-box { display: inline-block; background: #fff; color: #111; border: 7px solid #111; border-radius: 30px; padding: 16px 40px;
        font-weight: 900; font-size: 60px; letter-spacing: 1px; box-shadow: 0 10px 0 rgba(0,0,0,0.25); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${D}" data-width="${W}" data-height="${H}">
      <canvas id="world" class="clip" width="${W}" height="${H}" data-start="0" data-duration="${D}" data-track-index="1" data-track-kind="graphics"></canvas>
${ovHtml}
${capHtml}
      <audio id="voice" class="clip" src="assets/voice.wav" data-start="0" data-duration="${D}" data-volume="1" data-track-index="7"></audio>
${music ? `      <audio id="music" class="clip" src="assets/music.wav" data-start="0" data-duration="${D}" data-volume="${spec.music?.volume ?? 0.22}" data-fade-out="1" data-track-index="8"></audio>` : ""}
${sfxHtml}
    </div>
    <script id="timing" type="application/json">${JSON.stringify(timing)}</script>
    <script>
      (function () {
        var duration = ${D};
        var clock = { t: 0 };
        var host = { clock: clock, render: null };
        window.__stadt = host;
        window.__hf = window.__hf || {};
        window.__hf.buildReady = window.__hf.buildReady || {};
        window.__hf.buildReady["main"] = new Promise(function (resolve) { host.ready = resolve; });
        var tl = gsap.timeline({ paused: true });
        tl.to(clock, { t: duration, duration: duration, ease: "none", onUpdate: function () { if (host.render) host.render(clock.t); } }, 0);
${capJs}
${ovJs}
        window.__timelines = window.__timelines || {};
        window.__timelines["main"] = tl;
      })();
    </script>
    <script type="module">
      import { boot } from "./assets/engine/runner.js";
      import direct from "./assets/scene.js";
      const timing = JSON.parse(document.getElementById("timing").textContent);
      boot({ canvas: document.getElementById("world"), direct, timing });
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(proj, "index.html"), html);
console.log(`index.html: ${D}s, ${caps.length} Untertitel, ${overlays.length} Overlays`);
