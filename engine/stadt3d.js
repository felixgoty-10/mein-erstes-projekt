// stadt3d.js – Baukasten für die 3D-Kleinstadt im "In dieser Stadt…"-Stil.
// Blockige Figuren, Pastellhäuser, Sprechpillen über den Köpfen.
// Alles ist eine reine Funktion der Zeit: world.render(t) zeichnet Frame t.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export { THREE };

// ---------------------------------------------------------------- Hilfen
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = {
  linear: (u) => u,
  inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  out: (u) => 1 - Math.pow(1 - u, 3),
  in: (u) => u * u * u,
  back: (u) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
};
/** Sprung von 0→1 im Fenster [t0, t0+d] mit Überschwinger. */
export const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : t > t0 + d ? 1 : ease.back((t - t0) / d));
export const ramp = (t, t0, d, e = ease.inOut) => e(clamp((t - t0) / d));

const FONT = '"Montserrat", "Poppins", "Arial Black", sans-serif';

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...opts }));
  }
  return matCache.get(key);
}
function box(w, h, d, material, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
}
function rbox(w, h, d, r, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- Farben
export const C = {
  skin: "#f1d1a8", skinDark: "#c98f5e", sky: "#8cc8f0", grass: "#78c850",
  road: "#4d4f55", line: "#f3cd3a", walk: "#c9c9c9", red: "#d8333a",
  pink: "#e8a9a0", roofBlue: "#2f3f63", beige: "#efe1c4", brick: "#c4573f",
  white: "#f7f4ee", black: "#1d1d22", denim: "#3f6fb3", wood: "#b9773f",
};

// ---------------------------------------------------------------- Gesichter
// Ausdrücke: neutral, happy, laugh, sad, shock, worried, sleep, sick, smug, wow
const faceCache = new Map();
function faceTex(expr) {
  if (faceCache.has(expr)) return faceCache.get(expr);
  const tex = canvasTex(256, 256, (g) => {
    g.lineCap = "round"; g.lineJoin = "round";
    const ink = "#1b1b1f";
    const eye = (x, y, rx, ry, look = 0) => {
      g.fillStyle = ink; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x - rx * 0.3 + look, y - ry * 0.35, rx * 0.32, ry * 0.28, 0, 0, Math.PI * 2); g.fill();
    };
    const closed = (x, y, w, up = false) => {
      g.strokeStyle = ink; g.lineWidth = 9; g.beginPath();
      if (up) g.arc(x, y + 8, w, Math.PI * 1.15, Math.PI * 1.85); else g.arc(x, y - 8, w, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
    };
    const brow = (x, y, a, w = 34) => {
      g.strokeStyle = ink; g.lineWidth = 10; g.beginPath();
      g.moveTo(x - w / 2 * Math.cos(a), y - w / 2 * Math.sin(a)); g.lineTo(x + w / 2 * Math.cos(a), y + w / 2 * Math.sin(a)); g.stroke();
    };
    const L = 88, R = 168, Y = 112;
    switch (expr) {
      case "happy":
        closed(L, Y, 20, true); closed(R, Y, 20, true);
        g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.arc(128, 160, 30, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
        break;
      case "laugh":
        closed(L, Y, 20, true); closed(R, Y, 20, true);
        g.fillStyle = ink; g.beginPath(); g.moveTo(88, 158); g.quadraticCurveTo(128, 222, 168, 158); g.closePath(); g.fill();
        g.fillStyle = "#e0545a"; g.beginPath(); g.ellipse(128, 190, 18, 9, 0, 0, Math.PI * 2); g.fill();
        break;
      case "sad":
        eye(L, Y + 6, 13, 17); eye(R, Y + 6, 13, 17);
        brow(L, 78, -0.35); brow(R, 78, 0.35);
        g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.arc(128, 196, 24, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke();
        break;
      case "worried":
        eye(L, Y, 14, 19); eye(R, Y, 14, 19);
        brow(L, 74, -0.4); brow(R, 74, 0.4);
        g.strokeStyle = ink; g.lineWidth = 8; g.beginPath(); g.moveTo(104, 176);
        g.quadraticCurveTo(116, 166, 128, 176); g.quadraticCurveTo(140, 186, 152, 176); g.stroke();
        break;
      case "shock":
        g.fillStyle = "#fff"; g.strokeStyle = ink; g.lineWidth = 6;
        [L, R].forEach((x) => { g.beginPath(); g.ellipse(x, Y, 24, 28, 0, 0, Math.PI * 2); g.fill(); g.stroke(); });
        g.fillStyle = ink; [L, R].forEach((x) => { g.beginPath(); g.arc(x, Y + 4, 9, 0, Math.PI * 2); g.fill(); });
        brow(L, 66, -0.15); brow(R, 66, 0.15);
        g.fillStyle = ink; g.beginPath(); g.ellipse(128, 185, 15, 20, 0, 0, Math.PI * 2); g.fill();
        break;
      case "wow":
        eye(L, Y, 16, 22); eye(R, Y, 16, 22);
        brow(L, 70, -0.12); brow(R, 70, 0.12);
        g.fillStyle = ink; g.beginPath(); g.ellipse(128, 180, 11, 14, 0, 0, Math.PI * 2); g.fill();
        break;
      case "sleep":
        closed(L, Y + 6, 18); closed(R, Y + 6, 18);
        g.fillStyle = ink; g.beginPath(); g.ellipse(128, 176, 9, 7, 0, 0, Math.PI * 2); g.fill();
        break;
      case "sick":
        g.strokeStyle = ink; g.lineWidth = 9;
        [L, R].forEach((x) => { g.beginPath(); g.moveTo(x - 18, Y + 4); g.lineTo(x + 18, Y + 4); g.stroke(); });
        brow(L, 82, -0.3); brow(R, 82, 0.3);
        g.lineWidth = 8; g.beginPath(); g.moveTo(100, 180);
        for (let i = 0; i <= 4; i++) g.lineTo(100 + i * 14, 180 + (i % 2 ? -8 : 8));
        g.stroke();
        g.fillStyle = "rgba(120,190,90,0.35)"; g.beginPath(); g.ellipse(128, 150, 90, 30, 0, 0, Math.PI * 2); g.fill();
        break;
      case "eyes": { // nur leuchtende Augen (schwarze Gestalt)
        g.shadowColor = "#ffffff"; g.shadowBlur = 18; g.fillStyle = "#f4f6ff";
        [L, R].forEach((x) => { g.beginPath(); g.ellipse(x, Y + 6, 15, 8, 0, 0, Math.PI * 2); g.fill(); });
        g.shadowBlur = 0;
        break;
      }
      case "scream":
        g.fillStyle = "#fff"; g.strokeStyle = ink; g.lineWidth = 6;
        [L, R].forEach((x) => { g.beginPath(); g.ellipse(x, Y - 4, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke(); });
        g.fillStyle = ink; [L, R].forEach((x) => { g.beginPath(); g.arc(x, Y, 7, 0, Math.PI * 2); g.fill(); });
        brow(L, 58, 0.3); brow(R, 58, -0.3);
        g.fillStyle = ink; g.beginPath(); g.ellipse(128, 190, 30, 36, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#e0545a"; g.beginPath(); g.ellipse(128, 208, 18, 12, 0, 0, Math.PI * 2); g.fill();
        break;
      case "smug":
        g.fillStyle = ink;
        [L, R].forEach((x) => { g.beginPath(); g.ellipse(x, Y + 4, 14, 10, 0, 0, Math.PI * 2); g.fill(); });
        g.fillStyle = C.skin; [L, R].forEach((x) => g.fillRect(x - 20, Y - 12, 40, 12));
        g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.moveTo(104, 172); g.quadraticCurveTo(140, 186, 158, 164); g.stroke();
        break;
      default: // neutral
        eye(L, Y, 14, 19); eye(R, Y, 14, 19);
        g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.moveTo(110, 176); g.quadraticCurveTo(128, 184, 146, 176); g.stroke();
    }
  });
  faceCache.set(expr, tex);
  return tex;
}

// ---------------------------------------------------------------- Kleidung
function shirtTex(style) {
  return canvasTex(256, 256, (g, w, h) => {
    const fill = (c) => { g.fillStyle = c; g.fillRect(0, 0, w, h); };
    switch (style.type) {
      case "varsity": {
        fill(style.color || C.red);
        g.fillStyle = "#f3f0ea"; g.fillRect(96, 0, 64, h);           // Shirt
        g.fillStyle = "#fff"; g.fillRect(84, 0, 12, h); g.fillRect(160, 0, 12, h); // Leiste
        g.fillStyle = "#fff"; g.font = `900 78px ${FONT}`; g.textAlign = "center";
        g.strokeStyle = "#b02228"; g.lineWidth = 6;
        g.strokeText(style.number || "13", 212, 92); g.fillText(style.number || "13", 212, 92);
        g.fillStyle = "#fff"; g.fillRect(0, 228, w, 10); g.fillRect(0, 244, w, 6);
        break;
      }
      case "suit":
        fill(style.color || "#1f1f24");
        g.fillStyle = "#fafafa"; g.beginPath(); g.moveTo(92, 0); g.lineTo(164, 0); g.lineTo(128, 150); g.closePath(); g.fill();
        g.fillStyle = style.tie || "#c6262e"; g.beginPath(); g.moveTo(120, 8); g.lineTo(136, 8); g.lineTo(142, 120); g.lineTo(128, 140); g.lineTo(114, 120); g.closePath(); g.fill();
        break;
      case "coat":
        fill("#f6f7f8");
        g.fillStyle = "#9cc7e8"; g.beginPath(); g.moveTo(98, 0); g.lineTo(158, 0); g.lineTo(128, 120); g.closePath(); g.fill();
        g.strokeStyle = "#cfd5da"; g.lineWidth = 5; g.beginPath(); g.moveTo(128, 120); g.lineTo(128, h); g.stroke();
        g.strokeStyle = "#333"; g.lineWidth = 7; g.beginPath(); g.moveTo(96, 10); g.quadraticCurveTo(80, 120, 120, 150); g.stroke();
        g.fillStyle = "#888"; g.beginPath(); g.arc(122, 152, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#e33"; g.fillRect(176, 60, 40, 12); g.fillRect(190, 46, 12, 40);
        break;
      case "apron":
        fill("#fbfbf8");
        g.fillStyle = style.color || "#e7d3ae"; g.fillRect(56, 70, 144, 186);
        g.strokeStyle = style.color || "#e7d3ae"; g.lineWidth = 10; g.beginPath(); g.moveTo(70, 70); g.lineTo(90, 0); g.moveTo(186, 70); g.lineTo(166, 0); g.stroke();
        g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(92, 150, 72, 50);
        break;
      case "plaid": {
        fill(style.color || "#e9d9b8");
        g.globalAlpha = 0.5;
        for (let i = 0; i < 256; i += 42) {
          g.fillStyle = style.line || "#9a6b3b"; g.fillRect(i, 0, 12, h); g.fillRect(0, i, w, 12);
          g.fillStyle = "#7a3b2b"; g.fillRect(i + 22, 0, 4, h); g.fillRect(0, i + 22, w, 4);
        }
        g.globalAlpha = 1;
        g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(124, 0, 8, h);
        break;
      }
      case "jacket":
        fill(style.color || C.denim);
        g.fillStyle = style.inner || "#f2efe8"; g.fillRect(100, 0, 56, h);
        g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(40, 70, 40, 6); g.fillRect(176, 70, 40, 6);
        break;
      case "paramedic": // Rettungsdienst: rot, gelbe Reflexstreifen
        fill("#d8342c");
        g.fillStyle = "#f4d23a"; g.fillRect(0, 150, w, 22); g.fillStyle = "#e9eef2"; g.fillRect(0, 156, w, 10);
        g.fillStyle = "#f4d23a"; g.fillRect(0, 205, w, 16);
        g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, h); g.stroke();
        g.fillStyle = "#ffffff"; g.fillRect(176, 52, 46, 14); g.fillRect(192, 36, 14, 46);
        break;
      case "hoodie":
        fill(style.color || "#5aa65a");
        g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(70, 160, 116, 60);
        g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.moveTo(110, 0); g.lineTo(110, 60); g.moveTo(146, 0); g.lineTo(146, 60); g.stroke();
        break;
      default: // tee
        fill(style.color || "#f2b632");
        if (style.stripe) { g.fillStyle = style.stripe; g.fillRect(0, 100, w, 34); }
    }
  });
}

// ---------------------------------------------------------------- Figuren
/**
 * Erstellt eine blockige Figur.
 * opts: { shirt:{type,color,...}, sleeve, pants, shoes, skin, hair:{type,color}, hat, glasses, beard, scale }
 */
export function character(opts = {}) {
  const o = { skin: C.skin, pants: "#22242b", shoes: "#151518", sleeve: null, scale: 1, ...opts };
  const shirt = o.shirt || { type: "tee" };
  const sleeveColor = o.sleeve || shirt.color || (shirt.type === "coat" || shirt.type === "apron" ? "#fbfbf8" : shirt.type === "suit" ? "#1f1f24" : shirt.type === "plaid" ? "#e3cfa8" : C.red);
  const root = new THREE.Group();
  const body = new THREE.Group(); // wird für Hüpfen/Liegen bewegt
  root.add(body);
  const skinM = mat(o.skin);

  // Beine (Drehpunkt Hüfte)
  const mkLeg = (x) => {
    const p = new THREE.Group(); p.position.set(x, 2, 0);
    p.add(box(0.96, 1.75, 1, mat(o.pants), 0, -0.875 + 0.0, 0));
    p.add(box(0.98, 0.28, 1.08, mat(o.shoes), 0, -1.86, 0.04));
    body.add(p); return p;
  };
  const legL = mkLeg(-0.5), legR = mkLeg(0.5);

  // Torso
  const torsoTex = shirtTex(shirt);
  const side = mat(sleeveColor === "#fbfbf8" ? "#f2f2ee" : (shirt.color || sleeveColor));
  const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), [side, side, side, side,
    new THREE.MeshStandardMaterial({ map: torsoTex, roughness: 0.8 }), side]);
  torso.position.y = 3; torso.castShadow = true; torso.receiveShadow = true;
  body.add(torso);

  // Arme (Drehpunkt Schulter)
  const mkArm = (x) => {
    const p = new THREE.Group(); p.position.set(x, 3.85, 0);
    const sleeve = box(0.94, 1.55, 0.98, mat(sleeveColor), 0, -0.72, 0);
    p.add(sleeve);
    if (shirt.type === "varsity") {
      p.add(box(0.96, 0.1, 1.0, mat("#ffffff"), 0, -1.22, 0, false));
      p.add(box(0.96, 0.06, 1.0, mat("#ffffff"), 0, -1.36, 0, false));
    }
    p.add(box(0.9, 0.42, 0.94, skinM, 0, -1.7, 0));
    body.add(p); return p;
  };
  const armL = mkArm(-1.48), armR = mkArm(1.48);

  // Kopf
  const HEAD_Y = 4.86;
  const head = new THREE.Group(); head.position.y = HEAD_Y; head.scale.setScalar(1.38);
  head.add(rbox(1.3, 1.24, 1.24, 0.16, skinM, 0, 0, 0));
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex("neutral"), transparent: true, depthWrite: false });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), faceMat);
  face.position.set(0, -0.02, 0.625);
  head.add(face);
  body.add(head);

  // Haare / Hüte
  const hair = o.hair || { type: "none" };
  const hm = mat(hair.color || "#18181c", { flatShading: true, roughness: 0.9 });
  const r = rng(hair.seed || 7);
  if (hair.type === "messy" || hair.type === "curly") {
    const n = hair.type === "messy" ? 34 : 26;
    const s0 = hair.type === "messy" ? 0.36 : 0.3;
    for (let i = 0; i < n; i++) {
      const g = new THREE.Mesh(new THREE.IcosahedronGeometry(s0 * (0.75 + r() * 0.5), 0), hm);
      const a = r() * Math.PI * 2;
      const top = i < n * 0.6;
      if (top) g.position.set((r() - 0.5) * 1.35, 0.62 + r() * 0.22, (r() - 0.62) * 1.25);
      else g.position.set(Math.cos(a) * 0.66, 0.3 + r() * 0.35, -0.25 - Math.abs(Math.sin(a)) * 0.42);
      g.rotation.set(r() * 3, r() * 3, r() * 3);
      g.castShadow = true;
      head.add(g);
    }
    if (hair.type === "messy") { // Pony
      for (let i = 0; i < 6; i++) {
        const g = new THREE.Mesh(new THREE.TetrahedronGeometry(0.3 + r() * 0.1, 0), hm);
        g.position.set(-0.5 + i * 0.2, 0.5 + r() * 0.06, 0.52); g.rotation.set(r() * 3, r() * 3, r() * 3);
        head.add(g);
      }
    }
  } else if (hair.type === "short") {
    head.add(rbox(1.38, 0.34, 1.32, 0.12, hm, 0, 0.6, -0.02));
    head.add(box(1.38, 0.7, 0.3, hm, 0, 0.25, -0.55));
  } else if (hair.type === "old") { // grauer Kranz
    for (let i = 0; i < 14; i++) {
      const g = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26 + r() * 0.08, 0), hm);
      const side = i % 2 ? 1 : -1;
      g.position.set(side * (0.62 + r() * 0.08), 0.15 + r() * 0.45, -0.45 + r() * 0.75);
      head.add(g);
    }
  } else if (hair.type === "bun") {
    head.add(rbox(1.4, 0.4, 1.34, 0.14, hm, 0, 0.58, -0.02));
    head.add(box(1.4, 1.0, 0.36, hm, 0, 0.12, -0.52));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), hm); b.position.set(0, 0.85, -0.45); head.add(b);
  } else if (hair.type === "long") {
    head.add(rbox(1.42, 0.4, 1.36, 0.14, hm, 0, 0.58, -0.02));
    head.add(box(1.46, 1.8, 0.42, hm, 0, -0.25, -0.52));
    head.add(box(0.3, 1.4, 1.0, hm, -0.7, -0.05, -0.1)); head.add(box(0.3, 1.4, 1.0, hm, 0.7, -0.05, -0.1));
  }
  if (o.hat === "hood") {
    const hm2 = mat(o.hoodColor || "#0b0b10");
    head.add(rbox(1.5, 0.5, 1.5, 0.2, hm2, 0, 0.62, -0.02));
    head.add(rbox(1.5, 1.4, 0.4, 0.15, hm2, 0, 0.05, -0.62));
    head.add(rbox(0.22, 1.3, 1.4, 0.1, hm2, -0.72, 0.05, 0)); head.add(rbox(0.22, 1.3, 1.4, 0.1, hm2, 0.72, 0.05, 0));
  }
  if (o.hat === "beanie") {
    const bm = mat(o.hatColor || "#c0392b");
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), bm);
    cap.scale.set(1.0, 0.75, 0.98); cap.position.y = 0.5; head.add(cap);
    head.add(box(1.46, 0.28, 1.4, mat(o.hatColor2 || "#f4f1ea"), 0, 0.52, 0));
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(o.hatColor2 || "#f4f1ea")); pom.position.y = 1.12; head.add(pom);
  }
  if (o.hat === "chef") {
    head.add(box(1.36, 0.36, 1.32, mat("#ffffff"), 0, 0.78, 0));
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 12), mat("#ffffff"));
    puff.scale.set(1, 0.72, 1); puff.position.y = 1.32; puff.castShadow = true; head.add(puff);
  } else if (o.hat === "cap") {
    head.add(rbox(1.38, 0.42, 1.34, 0.14, mat(o.hatColor || "#d33"), 0, 0.68, 0));
    head.add(box(1.1, 0.1, 0.6, mat(o.hatColor || "#d33"), 0, 0.5, 0.86));
  } else if (o.hat === "sleep") {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.66, 1.3, 16), mat("#5a7fd6"));
    cone.position.set(0, 1.18, -0.05); cone.rotation.z = -0.5; head.add(cone);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat("#ffffff")); b.position.set(0.55, 1.52, -0.05); head.add(b);
  }
  if (o.glasses) {
    const gm = mat("#222");
    [-0.3, 0.3].forEach((x) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 6, 16), gm);
      ring.position.set(x, 0.08, 0.66); head.add(ring);
    });
    head.add(box(0.2, 0.04, 0.04, gm, 0, 0.1, 0.66, false));
  }
  if (o.beard) {
    head.add(box(0.7, 0.14, 0.1, mat(o.beard), 0, -0.24, 0.66, false));
  }
  if (o.blanket) { /* Decke wird im Set gebaut */ }

  if (o.shadow) { // schwarze Gestalt: alles tiefschwarz, nur die Augen leuchten
    const dark = new THREE.MeshStandardMaterial({ color: "#07070a", roughness: 1, metalness: 0 });
    root.traverse((m) => { if (m.isMesh && m !== face) m.material = dark; });
  }
  root.scale.setScalar(o.scale);
  root.traverse((m) => { if (m.isMesh) m.receiveShadow = true; });

  const c = {
    root, body, head, armL, armR, legL, legR, torso, faceMat, opts: o,
    expr: "neutral", pillSprite: null, pillKey: "", headTop: 6.35 + (o.hat === "chef" ? 1.5 : 0),
    /** Grundpose – jedes Frame zuerst aufrufen */
    reset() {
      body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
      head.rotation.set(0, 0, 0); head.position.y = HEAD_Y;
      [armL, armR, legL, legR].forEach((p) => { p.rotation.set(0, 0, 0); p.visible = true; });
      root.visible = true;
      this.face(o.shadow ? "eyes" : "neutral"); this.pill(null);
      return this;
    },
    at(x, z, rotY = 0) { root.position.set(x, root.position.y, z); root.rotation.y = rotY; return this; },
    face(expr) {
      if (expr !== this.expr) { faceMat.map = faceTex(expr); faceMat.needsUpdate = true; this.expr = expr; }
      return this;
    },
    idle(t, amp = 1) {
      const s = Math.sin(t * 2.2 + (o.phase || 0));
      torso.scale.y = 1 + s * 0.012 * amp;
      head.position.y = HEAD_Y + s * 0.025 * amp;
      armL.rotation.z = -0.04 - s * 0.02; armR.rotation.z = 0.04 + s * 0.02;
      head.rotation.y = Math.sin(t * 0.7 + (o.phase || 0)) * 0.08 * amp;
      return this;
    },
    walk(t, speed = 1) {
      const p = t * 7.5 * speed + (o.phase || 0);
      const s = Math.sin(p);
      legL.rotation.x = s * 0.7; legR.rotation.x = -s * 0.7;
      armL.rotation.x = -s * 0.6; armR.rotation.x = s * 0.6;
      body.position.y = Math.abs(Math.cos(p)) * 0.16;
      head.rotation.y = 0;
      return this;
    },
    cheer(t, hop = true) {
      const p = t * 9 + (o.phase || 0);
      const s = Math.sin(p);
      armL.rotation.z = -2.6 - s * 0.25; armR.rotation.z = 2.6 + s * 0.25;
      armL.rotation.x = armR.rotation.x = 0;
      if (hop) body.position.y = Math.max(0, Math.sin(p)) * 0.7;
      return this;
    },
    wave(t, arm = "R") {
      const a = arm === "R" ? armR : armL, sg = arm === "R" ? 1 : -1;
      a.rotation.z = sg * (2.5 + Math.sin(t * 12) * 0.35);
      return this;
    },
    reach(arm = "R", amount = 1) { // Arm nach vorne (etwas geben)
      const a = arm === "R" ? armR : armL;
      a.rotation.x = -1.45 * amount;
      return this;
    },
    shrug(u = 1) {
      armL.rotation.z = -0.6 * u; armR.rotation.z = 0.6 * u; armL.rotation.x = armR.rotation.x = -0.5 * u;
      head.rotation.z = 0.12 * u; return this;
    },
    handsOnHead(u = 1) {
      armL.rotation.z = -2.75 * u; armR.rotation.z = 2.75 * u; armL.rotation.x = armR.rotation.x = -0.35 * u; return this;
    },
    sit() {
      legL.rotation.x = legR.rotation.x = -1.57;
      body.position.y = -0.95; body.position.z = 0;
      return this;
    },
    lie(t = 0) { // liegt auf dem Rücken: Füße bei +z, Kopf bei -z, Gesicht nach oben
      body.rotation.x = -Math.PI / 2;
      torso.scale.y = 1 + Math.sin(t * 1.6) * 0.03;
      return this;
    },
    lieSide(t = 0, { arms = true } = {}) { // liegt auf der Seite, Kopf bei +x, Gesicht aufrecht zur Kamera
      body.rotation.z = -Math.PI / 2;
      head.rotation.z = Math.PI / 2;
      armL.visible = armR.visible = arms;
      torso.scale.y = 1 + Math.sin(t * 1.6) * 0.03;
      return this;
    },
    lookAt(dx) { head.rotation.y = dx; return this; },
    pill(text, variant = "white") {
      const key = text == null ? "" : text + "|" + variant;
      if (key === this.pillKey) return this;
      this.pillKey = key;
      if (!text) { if (this.pillSprite) this.pillSprite.visible = false; return this; }
      if (!this.pillSprite) {
        this.pillSprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
        this.pillSprite.renderOrder = 10;
        root.add(this.pillSprite);
      }
      const { tex, aspect } = pillTex(text, variant);
      this.pillSprite.material.map = tex; this.pillSprite.material.needsUpdate = true;
      this.pillSprite.scale.set(0.95 * aspect / o.scale, 0.95 / o.scale, 1);
      this.pillSprite.position.set(0, this.headTop + 0.75, 0);
      this.pillSprite.visible = true;
      return this;
    },
  };
  return c;
}

// ---------------------------------------------------------------- Pillen über dem Kopf
const pillCache = new Map();
export function pillTex(text, variant = "white") {
  const key = text + "|" + variant;
  if (pillCache.has(key)) return pillCache.get(key);
  const H = 150, pad = 46, fs = 92;
  const meas = document.createElement("canvas").getContext("2d");
  meas.font = `800 ${fs}px ${FONT}`;
  const W = Math.ceil(meas.measureText(text).width + pad * 2 + 16);
  const colors = {
    white: ["#ffffff", "#111111", "#111111"],
    red: ["#e53b3b", "#111111", "#ffffff"],
    green: ["#3fbf5a", "#111111", "#ffffff"],
  }[variant] || ["#ffffff", "#111", "#111"];
  const tex = canvasTex(W, H + 16, (g) => {
    g.fillStyle = "rgba(0,0,0,0.25)"; rrect(g, 8, 14, W - 16, H - 8, (H - 8) / 2); g.fill();
    g.fillStyle = colors[0]; g.strokeStyle = colors[1]; g.lineWidth = 9;
    rrect(g, 8, 6, W - 16, H - 12, (H - 12) / 2); g.fill(); g.stroke();
    g.fillStyle = colors[2]; g.font = `800 ${fs}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, W / 2, H / 2 + 4);
  });
  const v = { tex, aspect: W / (H + 16) };
  pillCache.set(key, v);
  return v;
}

/** Freistehendes Text-Sprite (z. B. "Z" beim Schlafen). */
export function textSprite(text, { color = "#ffffff", stroke = "#1b1b1f", size = 1 } = {}) {
  const tex = canvasTex(256, 256, (g) => {
    g.font = `900 190px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 18; g.strokeStyle = stroke; g.strokeText(text, 128, 140);
    g.fillStyle = color; g.fillText(text, 128, 140);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(size, size, 1); s.renderOrder = 11;
  return s;
}

// ---------------------------------------------------------------- Umgebung
export function signTex(text, { bg = "#fdf7ea", fg = "#2a2a2a", w = 512, h = 128, border = "#2a2a2a", font = 900 } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (border) { g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
    g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
    let fs = h * 0.62; g.font = `${font} ${fs}px ${FONT}`;
    while (g.measureText(text).width > w * 0.86) { fs -= 2; g.font = `${font} ${fs}px ${FONT}`; }
    g.fillText(text, w / 2, h / 2 + 3);
  });
}
export function signMesh(text, w, h, opts = {}) {
  const tex = signTex(text, { w: 512, h: Math.round(512 * h / w), ...opts });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), [mat("#ddd"), mat("#ddd"), mat("#ddd"), mat("#ddd"),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), mat("#ddd")]);
  m.castShadow = true;
  return m;
}

function windowMesh(w, h, frame = "#fffaf0", night = false) {
  const g = new THREE.Group();
  g.add(box(w + 0.3, h + 0.3, 0.12, mat(frame), 0, 0, 0, false));
  g.add(box(w, h, 0.14, night ? mat("#1b2a55", { emissive: "#30508f", emissiveIntensity: 0.6 }) : mat("#f6e9a8", { emissive: "#6b5a1e", emissiveIntensity: 0.15 }), 0, 0, 0.02, false));
  g.add(box(0.12, h, 0.18, mat(frame), 0, 0, 0.03, false));
  return g;
}

/** Haus mit Satteldach. opts: {w,d,h,color,roof,sign,door,flat} */
export function house(opts = {}) {
  const o = { w: 9, d: 8, h: 6.5, color: C.pink, roof: C.roofBlue, door: "#8b3a2e", flat: false, ...opts };
  const g = new THREE.Group();
  g.add(box(o.w, o.h, o.d, mat(o.color), 0, o.h / 2, 0));
  if (o.flat) {
    g.add(box(o.w + 0.4, 0.5, o.d + 0.4, mat(o.trim || "#e9e2d6"), 0, o.h + 0.25, 0));
  } else {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(o.w, o.d) * 0.78, o.h * 0.62, 4, 1), mat(o.roof, { flatShading: true }));
    roof.rotation.y = Math.PI / 4; roof.scale.set(o.w / Math.max(o.w, o.d), 1, o.d / Math.max(o.w, o.d));
    roof.position.y = o.h + o.h * 0.31; roof.castShadow = true; g.add(roof);
  }
  const fz = o.d / 2 + 0.06;
  const door = box(1.8, 3.1, 0.2, mat(o.door), o.doorX ?? 0, 1.55, fz);
  g.add(door);
  const wy = o.h > 7 ? [3.1, o.h - 2] : [o.h * 0.62];
  const wxs = o.windows || [-o.w * 0.3, o.w * 0.3];
  wy.forEach((y) => wxs.forEach((x) => { const wm = windowMesh(1.7, 1.5); wm.position.set(x, y, fz); g.add(wm); }));
  if (o.sign) {
    const s = signMesh(o.sign, Math.min(o.w * 0.8, 7.5), 1.3, o.signStyle || { bg: "#fffaf0", fg: "#c4372f", border: "#c4372f" });
    s.position.set(0, o.h - 0.9 + (o.flat ? 0.2 : 0), fz + 0.1); g.add(s);
  }
  g.userData.doorZ = fz;
  return g;
}

export function tree(s = 1, seed = 3) {
  const g = new THREE.Group();
  g.add(box(0.7 * s, 3 * s, 0.7 * s, mat("#7a4e2d"), 0, 1.5 * s, 0));
  const r = rng(seed);
  const lm = mat("#4fb648");
  [[0, 4.2, 0, 1.9], [0.9, 3.6, 0.2, 1.3], [-0.9, 3.7, -0.1, 1.35], [0.1, 5.3, 0, 1.3]].forEach(([x, y, z, rad]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(rad * s * (0.9 + r() * 0.2), 18, 14), lm);
    m.position.set(x * s, y * s, z * s); m.castShadow = true; g.add(m);
  });
  return g;
}

export function cloud(s = 1, seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const m = new THREE.MeshBasicMaterial({ color: "#ffffff", fog: false });
  for (let i = 0; i < 5; i++) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry((1.4 + r()) * s, 14, 10), m);
    sp.position.set((i - 2) * 1.5 * s, (r() * 0.8) * s, 0); sp.scale.y = 0.75; g.add(sp);
  }
  return g;
}

function checkerTex(a = "#d7d7d7", b = "#ececec", n = 8) {
  const t = canvasTex(256, 256, (g) => {
    const s = 256 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; // weich gefiltert: kein Flimmern bei Kamerafahrten
  return t;
}
function woodTex(base = "#c98b4f") {
  const t = canvasTex(256, 256, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 32) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, i, 256, 3); }
    const r = rng(9); for (let i = 0; i < 12; i++) { g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(r() * 256, Math.floor(r() * 8) * 32 + 6, 60 + r() * 80, 20); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Straße entlang x mit Gehweg auf +z-Seite. */
export function street(len = 120) {
  const g = new THREE.Group();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(len, 9), mat(C.road));
  road.material = new THREE.MeshStandardMaterial({ color: C.road, roughness: 0.78, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.05, 0); road.receiveShadow = true; g.add(road);
  for (let x = -len / 2; x < len / 2; x += 6) g.add(box(3, 0.04, 0.35, mat(C.line), x, 0.08, 0, false));
  g.add(box(len, 0.35, 4, mat(C.walk), 0, 0.17, 6.5));
  g.add(box(len, 0.35, 4, mat(C.walk), 0, 0.17, -6.5));
  return g;
}
export function plaza(w = 40, d = 40) {
  const t = checkerTex(); t.repeat.set(w / 8, d / 8);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({
    map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.06; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); // Gruppe, damit W.add die Höhe über dem Rasen nicht überschreibt
  return g;
}

/** Innenraum: Boden + Rück- und Seitenwand, offen zur Kamera (+z). */
export function room({ w = 16, d = 12, h = 8, wall = "#efe1c4", floor = "#c98b4f", rug = null, window: win = true, night = false } = {}) {
  const g = new THREE.Group();
  const ft = woodTex(floor); ft.repeat.set(w / 6, d / 6);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.85 }));
  f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
  g.add(box(w, h, 0.4, mat(wall), 0, h / 2, -d / 2));
  g.add(box(0.4, h, d, mat(wall), -w / 2, h / 2, 0));
  g.add(box(0.4, h, d, mat(wall), w / 2, h / 2, 0));
  g.add(box(w, 0.4, 0.5, mat("#ffffff"), 0, 0.2, -d / 2 + 0.2));
  if (win) {
    const wm = windowMesh(3, 2.4, "#ffffff", night); wm.position.set(-w * 0.22, h * 0.55, -d / 2 + 0.25); g.add(wm);
    const pic = box(1.8, 1.4, 0.1, mat("#7fae7a"), w * 0.25, h * 0.6, -d / 2 + 0.25); g.add(pic);
    g.add(box(2.1, 1.7, 0.08, mat("#6b4a2b"), w * 0.25, h * 0.6, -d / 2 + 0.22));
  }
  if (rug) { const r = box(w * 0.5, 0.04, d * 0.4, mat(rug), 0, 0.03, d * 0.05, false); g.add(r); }
  return g;
}

export function sofa(color = "#c9353a") {
  const g = new THREE.Group();
  const m = mat(color);
  g.add(rbox(6, 1.2, 2.4, 0.2, m, 0, 0.9, 0));
  g.add(rbox(6, 2.2, 0.7, 0.2, m, 0, 2.0, -0.95));
  g.add(rbox(0.7, 1.9, 2.4, 0.2, m, -3.1, 1.3, 0));
  g.add(rbox(0.7, 1.9, 2.4, 0.2, m, 3.1, 1.3, 0));
  return g;
}
export function bed(color = "#e2483e") {
  const g = new THREE.Group();
  g.add(box(4.2, 1, 7.5, mat("#9b6334"), 0, 0.5, 0));
  g.add(box(4, 0.6, 7.2, mat("#ffffff"), 0, 1.3, 0));
  g.add(box(4.3, 0.5, 4.6, mat(color), 0, 1.6, 1.2));
  g.add(rbox(2.6, 0.6, 1.4, 0.25, mat("#ffffff"), 0, 1.8, -2.7));
  g.add(box(4.2, 2.6, 0.4, mat("#9b6334"), 0, 1.3, -3.7));
  return g;
}
export function shelf({ stocked = 0, colors = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#e67e22"], seed = 2 } = {}) {
  const g = new THREE.Group();
  const wm = mat("#e8e8e8");
  g.add(box(6, 5, 0.3, wm, 0, 2.5, -0.85));
  [0.3, 1.6, 2.9, 4.2].forEach((y) => g.add(box(6, 0.18, 1.8, wm, 0, y, 0)));
  g.add(box(0.2, 5, 1.8, wm, -3, 2.5, 0)); g.add(box(0.2, 5, 1.8, wm, 3, 2.5, 0));
  const r = rng(seed);
  [0.39, 1.69, 2.99].forEach((y) => {
    for (let x = -2.6; x < 2.7; x += 0.62) {
      if (r() > stocked) continue;
      const hh = 0.6 + r() * 0.5;
      g.add(box(0.5, hh, 0.7, mat(colors[Math.floor(r() * colors.length)]), x, y + hh / 2, 0.1));
    }
  });
  return g;
}
export function bread() {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 6, 12), mat("#c9873f"));
  m.rotation.z = Math.PI / 2; m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  for (let i = -1; i <= 1; i++) { const c = box(0.08, 0.06, 0.4, mat("#f0d29a"), i * 0.28, 0.3, 0, false); c.rotation.y = 0.4; g.add(c); }
  return g;
}
export function trashBag(seed = 1) {
  const r = rng(seed);
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), mat(r() > 0.5 ? "#2b2d33" : "#3b3f47", { flatShading: true, roughness: 0.5 }));
  m.scale.set(1, 0.85 + r() * 0.3, 1); m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  const knot = box(0.25, 0.3, 0.25, mat("#2b2d33"), 0, 0.72, 0); g.add(knot);
  return g;
}
export function bin(color = "#2f8f4e") {
  const g = new THREE.Group();
  g.add(box(1.4, 2, 1.4, mat(color), 0, 1, 0));
  g.add(box(1.5, 0.2, 1.5, mat(color), 0, 2.1, 0));
  return g;
}
export function tv() {
  const g = new THREE.Group();
  g.add(box(3, 1.3, 1.2, mat("#7a5634"), 0, 0.65, 0));
  g.add(box(3.6, 2.1, 0.2, mat("#18181c"), 0, 2.5, 0));
  g.add(box(3.3, 1.8, 0.05, mat("#3d7fd6", { emissive: "#3d7fd6", emissiveIntensity: 0.6 }), 0, 2.5, 0.12, false));
  return g;
}
export function counter(color = "#d9b98f") {
  const g = new THREE.Group();
  g.add(box(7, 2.6, 2, mat(color), 0, 1.3, 0));
  g.add(box(7.3, 0.25, 2.3, mat("#f4efe6"), 0, 2.72, 0));
  return g;
}
export function oven() {
  const g = new THREE.Group();
  g.add(box(4, 4, 2.4, mat("#b94a36"), 0, 2, 0));
  const arch = box(2.4, 1.6, 0.2, mat("#2a1a14"), 0, 2.2, 1.21, false); g.add(arch);
  g.add(box(2.4, 1.4, 0.1, mat("#ff8a2a", { emissive: "#ff6a00", emissiveIntensity: 0.9 }), 0, 2.15, 1.25, false));
  g.add(box(1, 2.5, 1, mat("#8a8a8a"), 1, 5.2, -0.4));
  return g;
}
/** Tür mit Rahmen, Klinke und Schlüsselloch. Drehpunkt an der Scharnierseite (links). */
export function door(color = "#f4f1ea") {
  const g = new THREE.Group();
  g.add(box(2.7, 4.6, 0.3, mat("#d9d3c6"), 0, 2.3, -0.05));
  const leaf = new THREE.Group(); leaf.position.set(-1.1, 0, 0.05);
  leaf.add(box(2.2, 4.2, 0.18, mat(color), 1.1, 2.1, 0));
  leaf.add(box(1.6, 1.4, 0.04, mat("#e6e1d6"), 1.1, 3.0, 0.1, false));
  leaf.add(box(1.6, 1.4, 0.04, mat("#e6e1d6"), 1.1, 1.2, 0.1, false));
  leaf.add(box(0.34, 0.12, 0.2, mat("#c9a33a", { metalness: 0.6, roughness: 0.35 }), 1.9, 2.1, 0.16));
  leaf.add(box(0.07, 0.18, 0.03, mat("#111"), 1.92, 1.88, 0.11, false));
  g.add(leaf); g.userData.leaf = leaf;
  return g;
}
/** Wecker mit leuchtender Uhrzeit. */
export function alarmClock(text = "3:00") {
  const g = new THREE.Group();
  g.add(rbox(1.2, 0.7, 0.5, 0.12, mat("#2a2a30"), 0, 0.35, 0));
  const tex = canvasTex(256, 128, (c) => {
    c.fillStyle = "#120707"; c.fillRect(0, 0, 256, 128);
    c.fillStyle = "#ff3b30"; c.shadowColor = "#ff3b30"; c.shadowBlur = 16;
    c.font = `900 92px ${FONT}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 128, 68);
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, 0.36, 0.26); g.add(face);
  return g;
}
export function nightstand() {
  const g = new THREE.Group();
  g.add(box(1.8, 1.8, 1.6, mat("#8a5a32"), 0, 0.9, 0));
  g.add(box(1.5, 0.1, 0.05, mat("#c9a33a"), 0, 1.2, 0.82, false));
  return g;
}
/** Parkbank (Sitzhöhe ≈ 1.6, Sitzfläche bei z 0, Lehne hinten). */
export function bench(color = "#a8683a") {
  const g = new THREE.Group();
  g.add(box(5, 0.25, 1.4, mat(color), 0, 1.5, 0));
  g.add(box(5, 1.1, 0.22, mat(color), 0, 2.4, -0.62));
  [-2.2, 2.2].forEach((x) => { g.add(box(0.22, 1.5, 1.2, mat("#3a3a40"), x, 0.75, 0)); g.add(box(0.22, 1.2, 0.2, mat("#3a3a40"), x, 2.2, -0.62)); });
  return g;
}
/** Blockiger Hund. userData: legs[4], tail, head – im Drehbuch animieren (dogWalk). Schaut nach +z. */
export function dog(color = "#c98b4f", spot = "#7a4e2d") {
  const g = new THREE.Group();
  const m = mat(color), d = mat(spot);
  g.add(rbox(1.2, 1.0, 2.2, 0.15, m, 0, 1.25, 0));
  const head = new THREE.Group(); head.position.set(0, 1.9, 1.15);
  head.add(rbox(1.0, 0.9, 0.95, 0.15, m, 0, 0, 0));
  head.add(rbox(0.6, 0.45, 0.5, 0.1, mat("#e8c79a"), 0, -0.18, 0.55));
  head.add(box(0.22, 0.16, 0.12, mat("#1b1b1f"), 0, -0.02, 0.82, false));
  [-0.27, 0.27].forEach((x) => head.add(box(0.14, 0.18, 0.05, mat("#1b1b1f"), x, 0.16, 0.48, false)));
  [-0.5, 0.5].forEach((x) => { const e = box(0.26, 0.6, 0.4, d, x, 0.25, -0.1); e.rotation.z = x > 0 ? -0.25 : 0.25; head.add(e); });
  g.add(head);
  const legs = [[-0.38, 0.75], [0.38, 0.75], [-0.38, -0.75], [0.38, -0.75]].map(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0.85, z);
    p.add(box(0.34, 0.85, 0.34, m, 0, -0.42, 0)); g.add(p); return p;
  });
  const tail = new THREE.Group(); tail.position.set(0, 1.6, -1.1);
  const tm = box(0.18, 0.18, 0.8, d, 0, 0.25, -0.3); tm.rotation.x = 0.7; tail.add(tm); g.add(tail);
  g.add(box(1.24, 0.2, 0.3, mat("#d23b3b"), 0, 1.7, 0.95, false)); // Halsband
  g.userData = { legs, tail, head };
  return g;
}
/** Hund animieren: walk 0..1 (Laufen), Schwanz wedelt immer. */
export function dogPose(dg, t, walk = 0) {
  const { legs, tail, head } = dg.userData;
  const s = Math.sin(t * 11);
  legs.forEach((l, i) => (l.rotation.x = walk * 0.6 * s * (i === 0 || i === 3 ? 1 : -1)));
  tail.rotation.y = Math.sin(t * 16) * 0.6;
  head.rotation.x = Math.sin(t * 3) * 0.08;
}
export function ivStand() {
  const g = new THREE.Group();
  g.add(box(0.9, 0.08, 0.9, mat("#8a8f98"), 0, 0.05, 0));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), mat("#b9bec7", { metalness: 0.5, roughness: 0.3 })));
  g.children[1].position.y = 2.6;
  g.add(box(0.9, 0.06, 0.06, mat("#b9bec7"), 0, 5.1, 0));
  g.add(rbox(0.55, 0.8, 0.22, 0.08, mat("#dff1ff", { transparent: true, opacity: 0.85 }), 0.3, 4.6, 0));
  return g;
}
export function cake() {
  const g = new THREE.Group();
  const layer = (r, h, y, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat(c)); m.position.y = y; m.castShadow = true; g.add(m); };
  layer(1.3, 0.7, 0.35, "#f3d7a6"); layer(1.32, 0.12, 0.74, "#ffffff"); layer(0.95, 0.6, 1.1, "#f2a7c3"); layer(0.97, 0.1, 1.44, "#ffffff");
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 6), mat(["#e74c3c", "#3498db", "#f1c40f"][i % 3]));
    c.position.set(Math.cos(a) * 0.55, 1.7, Math.sin(a) * 0.55); g.add(c);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffb02e" }));
    f.position.set(Math.cos(a) * 0.55, 1.98, Math.sin(a) * 0.55); g.add(f);
  }
  return g;
}
export function flower(color = "#e74c3c") {
  const g = new THREE.Group();
  g.add(box(0.08, 0.9, 0.08, mat("#3f8f3a"), 0, 0.45, 0, false));
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat(color)); h.position.y = 0.95; g.add(h);
  const c = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat("#f6d33c")); c.position.set(0, 0.97, 0.15); g.add(c);
  return g;
}
export function fence(len = 20) {
  const g = new THREE.Group();
  for (let x = -len / 2; x <= len / 2; x += 1.2) g.add(box(0.3, 1.8, 0.2, mat("#f4f1ea"), x, 0.9, 0));
  g.add(box(len + 0.4, 0.2, 0.15, mat("#f4f1ea"), 0, 1.3, 0.08)); g.add(box(len + 0.4, 0.2, 0.15, mat("#f4f1ea"), 0, 0.6, 0.08));
  return g;
}
export function wateringCan() {
  const g = new THREE.Group();
  g.add(rbox(0.8, 0.7, 0.5, 0.1, mat("#2e9e4f"), 0, 0, 0));
  const sp = box(0.12, 0.12, 0.8, mat("#2e9e4f"), 0, 0.15, 0.5); sp.rotation.x = -0.6; g.add(sp);
  return g;
}
export function balloon(color = "#e74c3c") {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), mat(color, { roughness: 0.35 })); b.scale.y = 1.2; b.position.y = 0;
  g.add(b); g.add(box(0.03, 2.5, 0.03, mat("#ffffff"), 0, -2.1, 0, false));
  return g;
}
/** Blockiges Auto (Front nach +z). opts: {color, ambulance}. userData: {wheels, hazard[], blue[]} */
export function car({ color = "#2f3f63", ambulance = false } = {}) {
  const g = new THREE.Group();
  const L = ambulance ? 7.2 : 6, Wd = 3, body = mat(color);
  g.add(rbox(Wd, 1.3, L, 0.25, body, 0, 1.25, 0));
  if (ambulance) {
    g.add(rbox(Wd, 2.4, 4.4, 0.2, body, 0, 2.8, -1.3));
    g.add(box(Wd + 0.04, 0.35, 4.4, mat("#d8342c"), 0, 2.4, -1.3, false));
    g.add(box(Wd + 0.04, 0.12, 7.0, mat("#f4d23a"), 0, 1.55, 0, false));
    const t = signTex("RETTUNGSDIENST", { bg: "#ffffff", fg: "#d8342c", border: null, w: 512, h: 96 });
    [-1, 1].forEach((sd) => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.6), new THREE.MeshBasicMaterial({ map: tex2(t) })); pl.position.set(sd * (Wd / 2 + 0.03), 3.3, -1.3); pl.rotation.y = sd * Math.PI / 2; g.add(pl); });
  }
  const cab = rbox(Wd - 0.2, 1.2, 2.6, 0.25, body, 0, 2.45, ambulance ? 2.0 : -0.3);
  g.add(cab);
  const glass = mat("#9fc3e6", { roughness: 0.2, metalness: 0.2 });
  g.add(box(Wd - 0.5, 0.85, 0.08, glass, 0, 2.5, (ambulance ? 2.0 : -0.3) + 1.31, false));
  [-1, 1].forEach((sd) => g.add(box(0.08, 0.8, 1.9, glass, sd * (Wd / 2 - 0.08), 2.5, ambulance ? 2.0 : -0.3, false)));
  const wheels = [];
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 16), mat("#1b1b1f"));
    w.rotation.z = Math.PI / 2; w.position.set(sx * (Wd / 2), 0.62, sz * (L / 2 - 1.2)); g.add(w); wheels.push(w);
  });
  const head = new THREE.MeshStandardMaterial({ color: "#fff6d6", emissive: "#fff2c0", emissiveIntensity: 1.2 });
  [-0.95, 0.95].forEach((x) => g.add(box(0.6, 0.3, 0.08, head, x, 1.35, L / 2 + 0.01, false)));
  const hazard = [-1.2, 1.2].map((x) => { const m = new THREE.MeshStandardMaterial({ color: "#ff9a1a", emissive: "#ff7a00", emissiveIntensity: 0 }); g.add(box(0.4, 0.25, 0.08, m, x, 1.35, -L / 2 - 0.01, false)); return m; });
  const blue = [];
  if (ambulance) [-0.7, 0.7].forEach((x) => { const m = new THREE.MeshStandardMaterial({ color: "#2a5cff", emissive: "#2a6bff", emissiveIntensity: 0 }); g.add(box(0.6, 0.3, 0.5, m, x, 4.15, -1.0, false)); blue.push(m); });
  g.userData = { wheels, hazard, blue };
  return g;
}
function tex2(t) { return t; }
/** Warnblinker / Blaulicht schalten (t in Sekunden). */
export function carLights(c, t, { hazard = false, blue = false } = {}) {
  const on = Math.floor(t * 2.2) % 2 === 0;
  c.userData.hazard.forEach((m) => (m.emissiveIntensity = hazard && on ? 2.5 : 0));
  c.userData.blue.forEach((m, i) => (m.emissiveIntensity = blue && (Math.floor(t * 6) + i) % 2 === 0 ? 3 : 0.1));
}
export function phone() {
  const g = new THREE.Group();
  g.add(rbox(0.42, 0.8, 0.1, 0.05, mat("#16161a"), 0, 0, 0));
  g.add(box(0.34, 0.66, 0.02, mat("#6fa8ff", { emissive: "#3b7bff", emissiveIntensity: 0.6 }), 0, 0, 0.06, false));
  return g;
}
/** Lichterkette zwischen zwei Punkten (Set-Koordinaten). */
export function stringLights(len = 16, sag = 1.2, n = 14) {
  const g = new THREE.Group();
  const cols = ["#ffd56b", "#ff8fb1", "#8fd3ff", "#b6ff8f"];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = -len / 2 + u * len, y = -Math.sin(u * Math.PI) * sag;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
    b.position.set(x, y, 0); g.add(b);
    if (i < n) { const seg = box(len / n, 0.03, 0.03, mat("#333"), x + len / n / 2, (y - Math.sin((u + 1 / n) * Math.PI) * sag) / 2, 0, false); g.add(seg); }
  }
  return g;
}
/** Tanne, optional verschneit. */
export function pine(s = 1, snow = false, seed = 1) {
  const g = new THREE.Group();
  g.add(box(0.5 * s, 1.6 * s, 0.5 * s, mat("#5a3a22"), 0, 0.8 * s, 0));
  const r = rng(seed);
  [[2.2, 2.4, 1.6], [1.75, 2.1, 3.0], [1.25, 1.8, 4.3]].forEach(([rad, h, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(rad * s * (0.9 + r() * 0.2), h * s, 8), mat("#2f6b3a", { flatShading: true }));
    c.position.y = y * s; c.castShadow = true; g.add(c);
    if (snow) { const w = new THREE.Mesh(new THREE.ConeGeometry(rad * s * 0.62, h * s * 0.42, 8), mat("#f4f7fb", { flatShading: true })); w.position.y = y * s + h * s * 0.3; g.add(w); }
  });
  return g;
}
/** Schneeboden (liegt über dem Rasen). */
export function snowGround(w = 120, d = 120) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: "#eef3f8", roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.04; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
/** Fallender Schnee als Partikel – reine Funktion der Zeit: snowfallAt(obj, t, wind). */
export function snowfall(n = 1500, w = 40, h = 22, d = 30, seed = 5) {
  const r = rng(seed);
  const base = new Float32Array(n * 3), pos = new Float32Array(n * 3), spd = new Float32Array(n);
  for (let i = 0; i < n; i++) { base[i * 3] = (r() - 0.5) * w; base[i * 3 + 1] = r() * h; base[i * 3 + 2] = (r() - 0.5) * d; spd[i] = 1.2 + r() * 1.6; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", map: dot, size: 0.11, transparent: true, opacity: 0.95, depthWrite: false, alphaTest: 0.02 }));
  pts.userData = { base, spd, n, w, h };
  return pts;
}
export function snowfallAt(pts, t, wind = 0, speed = 1) {
  const { base, spd, n, w, h } = pts.userData; const p = pts.geometry.attributes.position.array;
  for (let i = 0; i < n; i++) {
    const fall = (base[i * 3 + 1] - t * spd[i] * speed) % h;
    p[i * 3 + 1] = fall < 0 ? fall + h : fall;
    let x = base[i * 3] + t * wind * (0.6 + spd[i] * 0.3) + Math.sin(t * 1.3 + i) * 0.3;
    x = ((x + w / 2) % w + w) % w - w / 2; p[i * 3] = x; p[i * 3 + 2] = base[i * 3 + 2];
  }
  pts.geometry.attributes.position.needsUpdate = true;
}
export function schoolBus() {
  const g = new THREE.Group();
  const y = mat("#f2b632");
  g.add(rbox(3.2, 3.2, 11, 0.3, y, 0, 2.1, 0));
  g.add(box(3.24, 0.25, 11.02, mat("#1d1d22"), 0, 1.3, 0, false));
  for (let i = 0; i < 6; i++) [-1, 1].forEach((sd) => g.add(box(0.06, 1.0, 1.2, mat("#9fc3e6", { roughness: 0.2 }), sd * 1.62, 2.8, -4 + i * 1.5, false)));
  g.add(box(2.6, 1.0, 0.06, mat("#9fc3e6"), 0, 2.8, 5.51, false));
  const t = signTex("SCHULBUS", { bg: "#f2b632", fg: "#1d1d22", border: null, w: 512, h: 96 });
  const busSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), new THREE.MeshBasicMaterial({ map: t })); busSign.position.set(0, 3.55, 5.52); g.add(busSign);
  [[-1, 3.6], [1, 3.6], [-1, -3.6], [1, -3.6]].forEach(([sx, sz]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16), mat("#1b1b1f")); w.rotation.z = Math.PI / 2; w.position.set(sx * 1.6, 0.7, sz); g.add(w); });
  return g;
}
export function busStop() {
  const g = new THREE.Group();
  g.add(box(0.15, 3.6, 0.15, mat("#8a8f98"), 0, 1.8, 0));
  const s = signMesh("H", 0.9, 0.9, { bg: "#f6d33c", fg: "#2e7d32", border: "#2e7d32" }); s.position.set(0, 3.7, 0.05); g.add(s);
  return g;
}
/** Bach (entlang x) mit Trittsteinen. */
export function stream(len = 30) {
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.PlaneGeometry(len, 3.4), new THREE.MeshStandardMaterial({ color: "#5b9bd5", roughness: 0.25, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  w.rotation.x = -Math.PI / 2; w.position.y = 0.06; g.add(w);
  [-1.1, 0, 1.1].forEach((z, i) => { const st = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), mat("#8a8f98", { flatShading: true })); st.scale.y = 0.45; st.position.set((i - 1) * 0.4, 0.18, z); st.castShadow = true; g.add(st); });
  return g;
}
export function fallenLog() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 7, 12), mat("#6b4a2b"));
  m.rotation.z = Math.PI / 2; m.position.y = 0.55; m.castShadow = true; g.add(m);
  [-3.5, 3.5].forEach((x) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.55, 12), mat("#c9a06a")); e.position.set(x, 0.55, 0); e.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(e); });
  return g;
}
/** Gefrorener Wasserfall an einer Felswand. */
export function frozenFall() {
  const g = new THREE.Group();
  const rock = mat("#6e7480", { flatShading: true });
  [[-5, 5, 8], [0, 7, 10], [5, 5.5, 8]].forEach(([x, h, w]) => g.add(box(w, h * 2, 3, rock, x, h, -1.5)));
  const ice = mat("#cfe9ff", { roughness: 0.15, metalness: 0.1, emissive: "#9fd3ff", emissiveIntensity: 0.15 });
  const r = rng(12);
  for (let i = 0; i < 14; i++) { const len = 4 + r() * 8; const c = new THREE.Mesh(new THREE.ConeGeometry(0.35 + r() * 0.3, len, 6), ice); c.rotation.x = Math.PI; c.position.set(-2.2 + i * 0.32, 13 - len / 2, 0.2); g.add(c); }
  g.add(box(5.5, 0.6, 3.5, ice, 0, 0.3, 1.2));
  return g;
}
/** Straßenlaterne mit warmem Licht (userData.light). */
export function streetLamp(intensity = 40) {
  const g = new THREE.Group();
  g.add(box(0.25, 7, 0.25, mat("#2a2a30"), 0, 3.5, 0));
  g.add(box(1.6, 0.2, 0.25, mat("#2a2a30"), 0.7, 7, 0));
  g.add(box(0.8, 0.4, 0.6, new THREE.MeshStandardMaterial({ color: "#fff1c9", emissive: "#ffd27a", emissiveIntensity: 2 }), 1.4, 6.75, 0, false));
  const l = new THREE.PointLight("#ffcf7a", intensity, 20, 1.3); l.position.set(1.4, 6.3, 0); g.add(l);
  g.userData.light = l;
  return g;
}
export function cafeteriaTable() {
  const g = new THREE.Group();
  g.add(box(7, 0.25, 2.4, mat("#d9d3c6"), 0, 2.2, 0));
  [-3, 3].forEach((x) => g.add(box(0.3, 2.2, 1.8, mat("#8a8f98"), x, 1.1, 0)));
  [-1.9, 1.9].forEach((z) => g.add(box(7, 0.2, 0.8, mat("#8a8f98"), 0, 1.4, z)));
  return g;
}
export function briefcase() {
  const g = new THREE.Group();
  g.add(box(1.1, 0.8, 0.3, mat("#5a3a20"), 0, 0, 0));
  g.add(box(0.4, 0.12, 0.1, mat("#2a2a2a"), 0, 0.46, 0));
  return g;
}
export function broom() {
  const g = new THREE.Group();
  g.add(box(0.12, 3.2, 0.12, mat("#a0703f"), 0, 1.6, 0));
  g.add(box(0.9, 0.5, 0.35, mat("#e3c25c"), 0, 0.1, 0));
  return g;
}

// ---------------------------------------------------------------- Welt / Renderer
export function createWorld(canvas, { width = 1080, height = 1920 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const sky = canvasTex(4, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#4fa8ea"); gr.addColorStop(0.6, "#9fd3f5"); gr.addColorStop(1, "#d8eefb");
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  });
  scene.background = sky;
  scene.fog = new THREE.Fog("#cfe8f8", 70, 190);

  const hemi = new THREE.HemisphereLight("#dff1ff", "#8a9a6a", 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff3df", 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight("#cfe4ff", 0.45);
  fill.position.set(-30, 20, -10); scene.add(fill);

  const nightBg = new THREE.Color("#0b1020");
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.3, 400);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), mat(C.grass));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
  scene.add(ground);

  const sets = [];
  const world = {
    THREE, scene, camera, renderer, sun, sets,
    /** Ein Set ist eine Gruppe an einer Weltposition; nur das aktive Set ist sichtbar. */
    set(name, x = 0, z = 0, { interior = false, night = false } = {}) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.name = name; g.userData.interior = interior; g.userData.night = night;
      scene.add(g); sets.push(g); return g;
    },
    add(set, obj, x = 0, y = 0, z = 0, rotY = 0) {
      obj.position.set(x, y, z); obj.rotation.y = rotY; set.add(obj); return obj;
    },
    addChar(set, c, x = 0, z = 0, rotY = 0) { c.at(x, z, rotY); c.root.userData.char = c; set.add(c.root); return c; },
    /** Kamera in Set-Koordinaten setzen. */
    cam(set, pos, look, fov = 48) {
      const o = set.position;
      camera.position.set(o.x + pos[0], pos[1], o.z + pos[2]);
      camera.lookAt(o.x + look[0], look[1], o.z + look[2]);
      if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    },
    show(active) {
      sets.forEach((s) => (s.visible = s === active));
      const o = active.position;
      sun.position.set(o.x + 22, 40, o.z + 26);
      sun.target.position.set(o.x, 0, o.z);
      ground.visible = !active.userData.interior;
      const night = active.userData.night;
      if (night) { // Mondlicht: kühl, dunkel, aber Figuren bleiben lesbar
        scene.background = nightBg; scene.fog.color.set("#0c1226"); scene.fog.near = 25; scene.fog.far = 90;
        hemi.color.set("#5b6fa8"); hemi.groundColor.set("#141826"); hemi.intensity = 0.55;
        sun.color.set("#a9bfff"); sun.intensity = 1.1; fill.intensity = 0.12;
        renderer.toneMappingExposure = 1.0;
      } else {
        scene.background = active.userData.interior ? new THREE.Color("#efe1c4") : sky;
        scene.fog.color.set("#cfe8f8"); scene.fog.near = 70; scene.fog.far = 190;
        hemi.color.set("#dff1ff"); hemi.groundColor.set("#8a9a6a"); hemi.intensity = 1.25;
        sun.color.set("#fff3df"); sun.intensity = 2.3; fill.intensity = 0.45;
        renderer.toneMappingExposure = 1.12;
      }
    },
    render() { renderer.render(scene, camera); },
  };
  return world;
}

/**
 * Kamerafahrt zwischen zwei Einstellungen.
 * a/b: {pos:[x,y,z], look:[x,y,z], fov}
 */
export function camMove(world, set, a, b, u, e = ease.inOut) {
  const k = e(clamp(u));
  const P = a.pos.map((v, i) => lerp(v, (b || a).pos[i], k));
  const L = a.look.map((v, i) => lerp(v, (b || a).look[i], k));
  world.cam(set, P, L, lerp(a.fov || 48, (b || a).fov || a.fov || 48, k));
}
