/* Pechaclicker — pixel art dessiné en code (sprites mis en cache). Remplaçable par des PNG (ex. SpriteCook). */
'use strict';
const SW = 480, SH = 270, HORIZON = 150, WATER = 166;
let X = null; // contexte courant de dessin de sprite
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const prev = X; X = c.getContext('2d'); X.imageSmoothingEnabled = false; fn(w, h); X = prev; return c; }
function R(x, y, w, h, c) { X.fillStyle = c; X.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function D(cx, cy, r, c) { X.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.5)); X.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } }
function E(cx, cy, rx, ry, c) { X.fillStyle = c; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.01)))); X.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } }
function TRI(x1, y1, x2, y2, x3, y3, c) {
  X.fillStyle = c; const ys = [y1, y2, y3], y0 = Math.floor(Math.min(...ys)), y9 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y9; y++) {
    const xs = []; const P = [[x1, y1], [x2, y2], [x3, y3]];
    for (let i = 0; i < 3; i++) { const a = P[i], b = P[(i + 1) % 3]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    if (xs.length > 1) { const l = Math.min(...xs), r = Math.max(...xs); X.fillRect(Math.round(l), y, Math.max(1, Math.round(r - l)), 1); }
  }
}
function LN(x0, y0, x1, y1, c, w) { X.fillStyle = c; w = w || 1; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (let n = 0; n < 2000; n++) { X.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; } return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function lerpCol(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const f = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t); return '#' + [16, 8, 0].map(s => f(s).toString(16).padStart(2, '0')).join(''); }
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* ------------------------------------------------------------------ POISSONS */
const _fishCache = {};
function fishSprite(f) {
  if (_fishCache[f.id]) return _fishCache[f.id];
  return _fishCache[f.id] = mk(28, 18, () => {
    const c = f.body, b = f.belly, a = f.acc, dk = shade(c, -0.35);
    const cx = 15, cy = 9;
    const dims = [[9, 5], [7, 7], [11, 3], [10, 4]][f.shape];
    const rx = dims[0], ry = dims[1];
    TRI(cx - rx + 1, cy, cx - rx - 5, cy - (f.shape === 3 ? 6 : 5), cx - rx - 5, cy + (f.shape === 3 ? 6 : 5), a); // queue
    if (f.shape === 3) { TRI(cx - 2, cy - ry, cx + 4, cy - ry - 5, cx + 7, cy - ry + 1, a); TRI(cx - 2, cy + ry, cx + 4, cy + ry + 5, cx + 7, cy + ry - 1, a); }
    else TRI(cx - 3, cy - ry + 1, cx + 3, cy - ry - 4, cx + 5, cy - ry + 1, a); // dorsale
    E(cx, cy, rx, ry, c);
    E(cx, cy + Math.ceil(ry / 2), rx - 1, Math.ceil(ry / 2), b);
    R(cx - 2, cy - ry + 1, 1, ry * 2 - 2, shade(a, -0.1)); R(cx + 1, cy - ry + 1, 1, ry * 2 - 3, a);
    D(cx + rx - 3, cy - 1, 2, '#ffffff'); R(cx + rx - 3, cy - 1, 2, 2, '#10131c');
    R(cx + rx - 1, cy + 2, 2, 1, dk);
    if (f.rar >= 3) { R(cx - 6, cy - ry - 2, 1, 1, '#ffffff'); R(cx + 5, cy + ry + 1, 1, 1, '#ffffff'); }
  });
}

/* ------------------------------------------------------------------ DAUPHINS */
const DOLPHIN_PAL = [
  { body: '#4a9fe8', belly: '#d6efff', acc: '#2f6fb8' }, { body: '#e89ac4', belly: '#ffe3f0', acc: '#b8689a' },
  { body: '#6aa860', belly: '#d6efb8', acc: '#3a7040' }, { body: '#9ac8e8', belly: '#ffffff', acc: '#5a98c0' },
  { body: '#c8b8f0', belly: '#ffffff', acc: '#8a78c8' }, { body: '#2fb8c8', belly: '#c8f4f0', acc: '#177a8a' },
];
function dolphinDraw(p, o) { // 56x32, regarde à droite
  o = o || {}; const { body, belly, acc } = p;
  TRI(8, 14, 0, 5, 1, 12, acc); TRI(8, 17, 0, 26, 1, 19, acc); // nageoire caudale
  E(12, 16, 7, 4, body);
  E(28, 16, 19, 9, body);
  TRI(22, 8, 30, -1 + (o.fin || 0), 33, 9, acc); // dorsale
  E(46, 14, 8, 6, body);
  R(46, 15, 10, 3, body); R(52, 17, 3, 2, shade(body, -0.2)); // rostre
  E(28, 21, 17, 4, belly); E(44, 19, 8, 3, belly);
  TRI(30, 22, 24, 30, 36, 25, acc); // nageoire pectorale
  D(46, 11, 2, '#ffffff'); R(46, 11, 2, 2, o.eye || '#0b1020');
  R(51, 18, 4, 1, shade(body, -0.35));
  R(20, 14, 12, 1, shade(body, 0.25));
}
function dolphinSprite(i, o) { const key = 'd' + i + JSON.stringify(o || {}); return _fishCache[key] || (_fishCache[key] = mk(58, 34, () => { X.translate(1, 1); dolphinDraw(o && o.pal ? o.pal : DOLPHIN_PAL[i], o); X.setTransform(1, 0, 0, 1, 0, 0); })); }

/* ------------------------------------------------------------------ BOSS (96x96, regardent à gauche) */
function eyesAt(cx, cy, gap, r, col) { D(cx - gap, cy, r, '#fff'); D(cx + gap, cy, r, '#fff'); D(cx - gap, cy, Math.max(1, r - 2), col || '#10131c'); D(cx + gap, cy, Math.max(1, r - 2), col || '#10131c'); }
const BOSS_DRAW = {
  requin() { E(50, 54, 42, 21, '#4a1f4a'); E(50, 62, 36, 10, '#e8d0e0'); TRI(48, 36, 70, 36, 62, 8, '#3a1438'); TRI(88, 54, 96, 30, 96, 76, '#3a1438'); TRI(20, 40, 28, 28, 34, 40, '#ff3a3a'); TRI(32, 40, 40, 30, 44, 41, '#ff3a3a');
    R(8, 58, 36, 3, '#10131c'); for (let i = 0; i < 8; i++) TRI(9 + i * 4.5, 58, 12 + i * 4.5, 58, 10.5 + i * 4.5, 65, '#ffffff'); D(26, 48, 4, '#ff2a2a'); D(26, 48, 2, '#ffe14a'); LN(18, 42, 34, 46, '#10131c', 2); TRI(46, 62, 56, 74, 62, 62, '#3a1438'); },
  poulpe() { E(48, 34, 28, 24, '#8a3ab8'); E(40, 26, 12, 8, '#a85ad8'); eyesAt(38, 38, 10, 6, '#10131c'); LN(30, 30, 44, 34, '#10131c', 2); R(36, 50, 24, 3, '#5a1f88');
    for (let k = 0; k < 7; k++) for (let j = 0; j < 9; j++) D(14 + k * 11 + Math.sin(j * 0.8 + k) * 5, 54 + j * 4.6, Math.max(2, 5 - j * 0.35), j % 3 ? '#8a3ab8' : '#c890f0'); },
  meduse() { E(48, 38, 32, 28, '#ff8ad0'); X.clearRect(0, 40, 96, 60); E(48, 36, 18, 11, '#ffc8ec'); for (let k = 0; k < 8; k++) for (let j = 0; j < 26; j++) R(18 + k * 8 + Math.sin(j * 0.45 + k) * 3, 40 + j * 2, 3, 2, j < 20 ? '#ffb0e4' : '#ff8ad0');
    D(36, 32, 3, '#10131c'); D(60, 32, 3, '#10131c'); R(44, 40, 8, 2, '#10131c'); for (const [x, y] of [[26, 22], [66, 24], [48, 14]]) D(x, y, 2, '#fff'); },
  chateau() { const sand = '#e8c878', dk = '#c8a050', lt = '#f4dc9c'; R(16, 46, 64, 40, sand); R(60, 46, 20, 40, dk); R(8, 30, 20, 56, sand); R(68, 30, 20, 56, sand); R(76, 30, 12, 56, dk); R(34, 18, 28, 68, sand); R(52, 18, 10, 68, dk);
    for (const [x, w, y] of [[8, 20, 30], [68, 20, 30], [34, 28, 18]]) for (let i = 0; i < w; i += 6) R(x + i, y - 5, 4, 5, sand);
    R(46, 4, 2, 14, '#6a4020'); TRI(48, 4, 48, 12, 62, 8, '#e8302f'); R(40, 30, 6, 6, '#10131c'); R(52, 30, 6, 6, '#10131c'); R(40, 31, 6, 2, '#ff3a3a'); R(52, 31, 6, 2, '#ff3a3a'); R(38, 42, 22, 3, '#10131c');
    E(48, 86, 10, 14, '#10131c'); R(38, 76, 20, 12, '#10131c'); R(18, 56, 4, 6, '#10131c'); R(14, 40, 4, 6, '#10131c'); R(74, 40, 4, 6, '#10131c'); R(60, 70, 8, 6, '#6a4020');
    for (let i = 0; i < 20; i++) R(12 + (i * 37) % 70, 30 + (i * 53) % 54, 2, 1, lt); TRI(70, 80, 94, 80, 90, 94, '#ffd24a'); R(72, 80, 20, 5, '#ffb02e'); },
  vache() { const w = '#f4f4f4'; E(48, 50, 36, 22, w); for (const [x, y, rx, ry] of [[36, 44, 8, 6], [60, 56, 9, 7], [70, 42, 6, 5], [48, 62, 6, 4]]) E(x, y, rx, ry, '#1a1a22'); E(18, 46, 15, 14, w); E(10, 54, 9, 7, '#ffb0b8'); D(8, 54, 1, '#c8707a'); D(13, 54, 1, '#c8707a');
    TRI(18, 36, 14, 24, 22, 34, '#e8e0c8'); TRI(28, 36, 32, 24, 34, 36, '#e8e0c8'); D(20, 42, 3, '#fff'); D(20, 42, 1, '#10131c'); LN(14, 38, 26, 40, '#10131c', 1);
    for (const x of [28, 40, 62, 74]) { R(x, 66, 6, 16, w); R(x, 78, 6, 4, '#10131c'); } E(50, 72, 8, 4, '#ffb0b8'); LN(84, 40, 92, 62, '#1a1a22', 2); D(93, 64, 3, '#1a1a22'); for (const [x, y] of [[2, 60], [-2, 66], [4, 70]]) D(Math.max(2, x + 4), y, 2, '#ffffff'); },
  numero6() { E(48, 62, 28, 32, '#161626'); E(48, 62, 22, 28, '#1f1f36'); E(48, 32, 20, 20, '#161626'); E(48, 36, 13, 13, '#05050a'); D(42, 36, 3, '#ff3a3a'); D(54, 36, 3, '#ff3a3a'); X.fillStyle = '#fff'; X.font = 'bold 34px monospace'; X.textAlign = 'center'; X.fillText('6', 48, 76); X.strokeStyle = '#ff3a3a'; X.lineWidth = 2; X.strokeRect(34, 52, 28, 28); },
  sorciere() { E(48, 80, 30, 10, '#3a2a5a'); TRI(20, 90, 76, 90, 48, 50, '#3a2a6a'); E(48, 46, 14, 12, '#8ad07a'); E(48, 32, 28, 6, '#2a1a4a'); TRI(30, 32, 66, 32, 54, 2, '#3a2a6a'); R(34, 28, 28, 4, '#ffb02e'); TRI(48, 44, 54, 56, 44, 52, '#6ab05a'); eyesAt(48, 42, 6, 3, '#10131c'); LN(40, 54, 56, 54, '#10131c', 1); D(42, 53, 1, '#10131c');
    E(74, 76, 14, 12, '#161620'); R(60, 70, 28, 4, '#2a2a38'); E(74, 66, 12, 4, '#4aff6a'); D(70, 58, 3, '#7aff8a'); D(78, 54, 2, '#7aff8a'); LN(8, 88, 38, 70, '#8a5a2f', 2); },
  esquimau() { E(48, 84, 34, 8, '#d8f0ff'); E(48, 62, 28, 26, '#3a6ac8'); E(48, 64, 24, 22, '#4a7ad8'); E(48, 38, 20, 20, '#f0f0f0'); E(48, 40, 13, 13, '#f2c9a0'); eyesAt(48, 38, 6, 2, '#10131c'); R(44, 46, 8, 2, '#c8553a'); R(30, 64, 36, 4, '#e8e8e8'); D(48, 58, 3, '#ffd24a');
    LN(20, 70, 8, 40, '#8a5a2f', 2); LN(8, 40, 8, 82, '#cfeaff', 1); E(14, 86, 8, 3, '#0a3a6a'); },
  cacamille() { E(48, 80, 36, 12, '#6a4020'); E(48, 62, 28, 12, '#7a4a28'); E(48, 46, 19, 10, '#8a5630'); TRI(36, 40, 60, 40, 50, 24, '#8a5630'); for (const [x, y] of [[28, 78], [66, 66]]) E(x, y, 6, 2, '#9a6a40'); eyesAt(48, 62, 9, 5, '#10131c'); LN(38, 72, 58, 72, '#10131c', 2);
    R(38, 18, 20, 8, '#ffd24a'); for (let i = 0; i < 4; i++) TRI(38 + i * 6, 18, 42 + i * 6, 18, 40 + i * 6, 8, '#ffd24a'); D(48, 12, 2, '#e8302f'); for (const x of [8, 88]) for (let j = 0; j < 14; j++) R(x + Math.sin(j) * 3, 40 + j * 3, 2, 3, '#7ad04a'); },
  nuagedauphin() { for (const [x, y, r] of [[22, 70, 14], [40, 76, 16], [60, 72, 16], [76, 66, 12], [48, 64, 14]]) D(x, y, r, '#f4f8ff'); for (const [x, y, r] of [[30, 76, 8], [58, 78, 8]]) D(x, y, r, '#cfe0ff'); X.save(); X.translate(94, 6); X.scale(-1.5, 1.5); X.drawImage(dolphinSprite(0, Object.assign({ pal: { body: '#bcd4ff', belly: '#ffffff', acc: '#7aa0e0' } }, {})), 0, 0); X.restore(); },
  meca() { X.save(); X.translate(94, 8); X.scale(-1.5, 1.5); X.drawImage(dolphinSprite(0, Object.assign({ pal: { body: '#8a96a6', belly: '#c8d0da', acc: '#566070' } }, { eye: '#ff2a2a' })), 0, 0); X.restore(); for (const [x, y] of [[40, 40], [60, 44], [30, 56], [50, 58], [70, 52]]) { D(x, y, 2, '#3a4250'); } LN(26, 44, 66, 44, '#566070', 1); LN(30, 56, 78, 56, '#566070', 1); D(26, 44, 5, '#ff2a2a'); D(26, 44, 2, '#ffd0d0'); R(50, 18, 2, 10, '#566070'); D(51, 16, 3, '#ff2a2a'); TRI(80, 70, 90, 86, 74, 86, '#ffb02e'); TRI(80, 74, 86, 84, 76, 84, '#ffe14a'); },
  roi() { TRI(80, 20, 96, 90, 50, 90, '#a82f3a'); X.save(); X.translate(94, 8); X.scale(-1.6, 1.6); X.drawImage(dolphinSprite(0, Object.assign({ pal: { body: '#3a7ad8', belly: '#cfe4ff', acc: '#1f4aa8' } }, {})), 0, 0); X.restore();
    R(20, 4, 24, 6, '#ffd24a'); for (let i = 0; i < 4; i++) TRI(20 + i * 6, 4, 24 + i * 6, 4, 22 + i * 6, -2, '#ffd24a'); D(32, 7, 2, '#e8302f'); LN(10, 86, 22, 38, '#ffd24a', 2); for (const x of [-2, 4, 10]) TRI(10 + x, 38, 14 + x, 38, 12 + x, 28, '#ffd24a'); R(12, 32, 12, 3, '#ffd24a'); },
};
function bossSprite(id) { return _fishCache['b' + id] || (_fishCache['b' + id] = mk(96, 96, () => { X.imageSmoothingEnabled = false; BOSS_DRAW[id](); })); }
function bossSpriteFor(b) { return bossSprite(b.base ? b.base.id : b.id); }

/* ------------------------------------------------------------------ PÊCHEUR */
function hatDraw(h, c, cx, cy) {
  switch (h) {
    case 'cap': E(cx, cy - 4, 6, 4, c); R(cx - 1, cy - 4, 9, 2, shade(c, -0.25)); break;
    case 'pirate': E(cx, cy - 4, 8, 4, c); R(cx - 7, cy - 2, 14, 2, c); D(cx, cy - 5, 2, '#ffffff'); break;
    case 'viking': E(cx, cy - 4, 6, 4, c); TRI(cx - 6, cy - 4, cx - 10, cy - 11, cx - 4, cy - 6, '#f0e8d0'); TRI(cx + 6, cy - 4, cx + 10, cy - 11, cx + 4, cy - 6, '#f0e8d0'); break;
    case 'helmet': E(cx, cy - 3, 7, 6, c); R(cx - 1, cy - 1, 8, 3, '#0b1020'); R(cx - 6, cy + 1, 12, 1, shade(c, -0.3)); break;
    case 'crown': R(cx - 5, cy - 7, 10, 4, c); for (let i = 0; i < 3; i++) TRI(cx - 5 + i * 4, cy - 7, cx - 2 + i * 4, cy - 7, cx - 3.5 + i * 4, cy - 11, c); D(cx, cy - 6, 1, '#e8302f'); break;
    case 'wizard': TRI(cx - 8, cy - 2, cx + 8, cy - 2, cx + 2, cy - 17, c); R(cx - 8, cy - 3, 16, 2, shade(c, -0.25)); D(cx + 1, cy - 9, 1, '#ffd24a'); break;
    case 'bandana': R(cx - 6, cy - 5, 12, 3, c); TRI(cx + 5, cy - 4, cx + 9, cy - 1, cx + 5, cy - 1, c); break;
    case 'cowboy': E(cx, cy - 4, 5, 4, c); R(cx - 9, cy - 2, 18, 2, shade(c, -0.2)); break;
    case 'chef': R(cx - 5, cy - 6, 10, 6, c); D(cx - 4, cy - 8, 3, c); D(cx + 4, cy - 8, 3, c); D(cx, cy - 10, 3, c); break;
    case 'horns': TRI(cx - 6, cy - 3, cx - 9, cy - 11, cx - 2, cy - 5, c); TRI(cx + 6, cy - 3, cx + 9, cy - 11, cx + 2, cy - 5, c); break;
    case 'hood': E(cx, cy - 2, 8, 7, c); R(cx - 5, cy - 1, 10, 7, '#0b0f1a'); break;
    case 'mask': R(cx - 6, cy - 1, 12, 3, c); E(cx, cy - 4, 6, 4, c); break;
    case 'goggles': R(cx - 6, cy - 2, 12, 4, c); D(cx - 3, cy, 2, '#a8e8ff'); D(cx + 3, cy, 2, '#a8e8ff'); break;
    case 'halo': E(cx, cy - 9, 6, 1, c); break;
    case 'clown': D(cx - 7, cy - 4, 3, '#ff3a3a'); D(cx + 7, cy - 4, 3, '#ff3a3a'); E(cx, cy - 5, 4, 3, '#4aa3ff'); break;
    case 'antenna': R(cx, cy - 11, 1, 6, c); D(cx, cy - 12, 2, '#ff3a3a'); E(cx, cy - 3, 6, 3, c); break;
  }
}
function fishermanSprite(sk, pants) {
  const key = 'f' + sk.id + (pants ? 'p' : '');
  if (_fishCache[key]) return _fishCache[key];
  return _fishCache[key] = mk(40, 46, () => {
    const cx = 18, k = sk.kc, sh = sk.sc;
    if (sk.x === 'cape') { R(cx - 9, 17, 6, 22, sk.hc); R(cx - 11, 30, 4, 10, shade(sk.hc, -0.2)); }
    if (sk.x === 'tail') { TRI(cx - 8, 34, cx - 18, 40, cx - 8, 40, sk.sc); }
    // jambes
    if (pants) { R(cx - 5, 30, 4, 12, '#2f5ac8'); R(cx + 1, 30, 4, 12, '#2f5ac8'); } else { R(cx - 5, 32, 4, 9, k); R(cx + 1, 32, 4, 9, k); R(cx - 6, 28, 12, 6, '#f2f2f2'); for (let i = 0; i < 6; i++) R(cx - 6 + i * 2 + 1, 28 + (i % 2) * 2, 1, 2, '#e8302f'); }
    R(cx - 6, 41, 5, 3, '#4a3a2a'); R(cx + 1, 41, 6, 3, '#4a3a2a');
    // torse + bras
    R(cx - 5, 15, 11, 14, sh); R(cx - 5, 15, 3, 14, shade(sh, -0.15)); R(cx + 5, 17, 9, 4, sh); R(cx + 13, 16, 4, 5, k); R(cx - 7, 17, 3, 11, shade(sh, -0.1)); R(cx - 7, 27, 3, 3, k);
    if (sk.x === 'rainbow') for (let i = 0; i < 7; i++) R(cx - 5, 15 + i * 2, 11, 2, ['#ff3a3a', '#ff9a2e', '#ffe14a', '#4aff6a', '#4aa3ff', '#7a4aff', '#ff4ac8'][i]);
    // tête
    D(cx, 9, 6, k); R(cx + 1, 8, 2, 2, '#10131c'); R(cx + 4, 8, 2, 2, '#10131c'); R(cx + 2, 12, 4, 1, shade(k, -0.4));
    if (sk.x === 'beard') { R(cx - 5, 12, 11, 5, sk.hc === '#ffffff' ? '#cccccc' : '#8a6a4a'); R(cx + 1, 11, 4, 1, '#8a6a4a'); }
    if (sk.x === 'patch') { R(cx + 1, 7, 3, 3, '#10131c'); LN(cx - 5, 5, cx + 6, 8, '#10131c', 1); }
    if (sk.x === 'mask2') R(cx - 5, 11, 11, 3, '#6a2a2a');
    if (sk.x === 'nose') D(cx + 5, 11, 2, '#ff3a3a');
    if (sk.x === 'stitch') { LN(cx - 4, 6, cx + 4, 12, '#10131c', 1); }
    hatDraw(sk.hat, sk.hc, cx, 6);
  });
}

/* ------------------------------------------------------------------ DÉCORS */
const SKY = [
  ['#5aa8f0', '#cdeeff'], ['#ff9a5a', '#ffe8b0'], ['#4a6a52', '#b4c490'], ['#8ac4ec', '#f0faff'], ['#6a4ac8', '#ffb4dc'], ['#12082e', '#6a2a9a'],
];
const SEA = [['#3a9ad9', '#1a4f8a'], ['#2fc0cc', '#0f6a80'], ['#3a5a3a', '#16301f'], ['#5ab0d8', '#24608f'], ['#f0e6ff', '#c8b0f0'], ['#1fa0b8', '#082f50']];
function band(c1, c2, y0, y1, step) { for (let y = y0; y < y1; y += step) R(0, y, SW, step, lerpCol(c1, c2, (y - y0) / Math.max(1, y1 - y0 - 1))); }
function cloudPuff(x, y, s, c) { D(x, y, 5 * s, c); D(x + 7 * s, y + 1, 6 * s, c); D(x + 14 * s, y, 5 * s, c); R(x - 4 * s, y, 22 * s, 5 * s, c); }
const BG_DRAW = [
  /* plaines */ () => { D(390, 46, 22, '#fff2a8'); D(390, 46, 15, '#ffe14a'); for (const [x, r, c] of [[80, 70, '#5aa850'], [250, 90, '#6ab85a'], [420, 80, '#5aa850']]) E(x, HORIZON + 6, r, 22, c);
      R(60, 118, 6, 28, '#e8e0d0'); TRI(56, 118, 70, 118, 63, 106, '#c8553a'); LN(52, 108, 74, 128, '#6a4020', 1); LN(74, 108, 52, 128, '#6a4020', 1);
      for (const x of [170, 330, 440]) { R(x, 128, 4, 20, '#6a4020'); D(x + 2, 122, 11, '#3a8a3a'); D(x - 4, 128, 7, '#4aa04a'); }
      R(0, HORIZON - 2, SW, 8, '#6ab85a'); for (let i = 0; i < 30; i++) R((i * 61) % SW, HORIZON + 1 + (i * 7) % 5, 2, 2, ['#ffffff', '#ffd24a', '#ff7aa8'][i % 3]); },
  /* plage */ () => { D(260, 130, 34, '#ffd68a'); D(260, 130, 24, '#ff9a4a'); R(0, 130, SW, 30, SEA[1][0]); E(70, HORIZON + 10, 110, 22, '#f0d890'); E(400, HORIZON + 12, 120, 20, '#e8c878'); R(0, HORIZON + 2, SW, 10, '#f0d890');
      for (const x of [380]) { for (let j = 0; j < 14; j++) R(x + Math.sin(j / 4) * 6, 150 - j * 5, 5, 6, '#8a5a2f'); for (let a = 0; a < 7; a++) { const an = -Math.PI / 2 + (a - 3) * 0.55; LN(x + 6, 80, x + 6 + Math.cos(an) * 26, 82 + Math.sin(an) * 14 + 8, a % 2 ? '#3a9a3a' : '#2a7a2a', 3); } D(x + 4, 82, 3, '#6a4020'); D(x + 9, 83, 3, '#6a4020'); }
      for (const [x, y] of [[110, 140], [180, 144]]) { TRI(x, y, x + 10, y, x + 5, y - 12, '#e8c878'); } },
  /* marais */ () => { D(120, 50, 20, '#d8e8b8'); D(114, 46, 18, '#b8c898'); band('#6a8a62', '#a8b88a', 0, 0, 1); R(0, HORIZON - 4, SW, 10, '#2f4a2a'); E(240, HORIZON + 4, 200, 14, '#2a4226');
      for (const x of [40, 190, 300, 450]) { R(x, 92, 5, 58, '#241a14'); LN(x + 2, 100, x - 18, 76, '#241a14', 3); LN(x + 3, 108, x + 22, 82, '#241a14', 3); LN(x - 16, 78, x - 20, 66, '#241a14', 2); }
      for (const x of [110, 380]) { R(x, 96, 22, 56, '#4a4a4a'); R(x + 22, 108, 12, 44, '#3a3a3a'); for (let i = 0; i < 22; i += 6) R(x + i, 90, 4, 6, '#4a4a4a'); R(x + 8, 114, 6, 10, '#10131c'); }
      for (let i = 0; i < 4; i++) { X.globalAlpha = 0.18; R(0, 112 + i * 14, SW, 10, '#dff0d0'); X.globalAlpha = 1; } },
  /* glacière */ () => { D(110, 46, 16, '#ffffff'); X.globalAlpha = 0.4; for (let i = 0; i < 4; i++) E(250 + i * 30, 40 + i * 6, 120, 8, ['#7affd0', '#7ac8ff', '#c8a0ff', '#7affd0'][i]); X.globalAlpha = 1;
      E(60, HORIZON + 6, 120, 20, '#e8f4ff'); E(380, HORIZON + 8, 150, 26, '#ffffff'); for (const [x, h, w] of [[190, 44, 26], [310, 58, 34], [250, 30, 18]]) { TRI(x - w, HORIZON, x + w, HORIZON, x, HORIZON - h, '#cfeaff'); TRI(x, HORIZON - h, x + w, HORIZON, x + 4, HORIZON, '#a8d4f0'); }
      for (const x of [20, 430]) { TRI(x, HORIZON - 4, x + 14, HORIZON - 4, x + 7, HORIZON - 40, '#2a5a4a'); TRI(x - 2, HORIZON - 18, x + 16, HORIZON - 18, x + 7, HORIZON - 52, '#3a7a5a'); R(x, HORIZON - 52, 14, 4, '#ffffff'); } },
  /* nuages */ () => { D(380, 70, 26, '#fff2c8'); D(380, 70, 18, '#ffe48a'); for (let i = 0; i < 5; i++) { X.strokeStyle = ['#ff6a8a', '#ffb04a', '#ffe14a', '#6ad46a', '#6aa8ff'][i]; X.lineWidth = 3; X.beginPath(); X.arc(140, HORIZON + 6, 90 - i * 4, Math.PI, 2 * Math.PI); X.stroke(); }
      cloudPuff(40, 60, 2, '#ffffff'); cloudPuff(220, 40, 2, '#fff0f8'); cloudPuff(330, 100, 2, '#ffffff'); for (const [x, y] of [[420, 120], [30, 128]]) { E(x, y + 8, 32, 8, '#e8e0ff'); cloudPuff(x - 12, y - 4, 2, '#ffffff'); R(x - 2, y - 20, 3, 14, '#a88ad8'); } },
  /* cité */ () => { D(400, 52, 26, '#e8d8ff'); D(392, 48, 22, '#c8b0f0'); for (let i = 0; i < 40; i++) R((i * 97) % SW, (i * 53) % 90, 1, 1, '#ffffff');
      const r = rng(5); for (let x = 0; x < SW; x += 24) { const h = 30 + r() * 70, w = 16 + r() * 8, c = ['#2a3a8a', '#4a2a8a', '#1f5a9a'][Math.floor(r() * 3)]; R(x, HORIZON - h, w, h + 6, c); E(x + w / 2, HORIZON - h, w / 2, 8, shade(c, 0.15)); R(x + w / 2, HORIZON - h - 12, 1, 12, '#ffd24a'); for (let k = 0; k < h; k += 8) for (let j = 4; j < w - 3; j += 7) if (r() > 0.4) R(x + j, HORIZON - h + 6 + k, 3, 4, ['#4cffd9', '#ff4ac8', '#ffe14a'][Math.floor(r() * 3)]); } },
];
const DOCK = [
  ['#9a6a38', '#6a4524'], ['#b08a50', '#7a5a30'], ['#5a4a38', '#3a2e22'], ['#d8ecf8', '#a8cce0'], ['#ffffff', '#d8d0f0'], ['#6a7a9a', '#3a4a6a'],
];
const _bgCache = {};
function bgFor(w) {
  if (_bgCache[w]) return _bgCache[w];
  return _bgCache[w] = mk(SW, SH, () => {
    band(SKY[w][0], SKY[w][1], 0, HORIZON, 6);
    BG_DRAW[w]();
    band(SEA[w][0], SEA[w][1], HORIZON + (w === 2 ? 0 : 0), SH, 6);
    if (w === 0 || w === 1 || w === 2) { /* reflet du bord */ R(0, HORIZON, SW, 3, shade(SEA[w][0], 0.2)); }
    if (w === 4) { for (const [x, y] of [[90, 200], [250, 220], [380, 190], [440, 236]]) cloudPuff(x, y, 2, '#ffffff'); }
    // ponton
    const d = DOCK[w]; R(0, 174, 150, 7, d[0]); R(0, 181, 150, 4, d[1]); for (let x = 8; x < 150; x += 16) R(x, 174, 1, 7, d[1]); R(148, 174, 4, 11, d[1]);
    for (const x of [14, 68, 126]) { R(x, 185, 7, 36, d[1]); R(x, 185, 2, 36, shade(d[1], -0.2)); }
    X.globalAlpha = 0.25; R(0, 221, 150, 5, '#000'); X.globalAlpha = 1;
  });
}
const TREASURE_POS = [[420, 134], [60, 142], [250, 146], [330, 140], [150, 108], [455, 186]];

/* ------------------------------------------------------------------ SCÈNE ANIMÉE */
const Scene = {
  t: 0, world: 0, bob: 0, cast: 0, shake: 0, flash: 0, shakeBoss: 0,
  fly: [], floaters: [], parts: [], clouds: [], dolphin: { t: 6, x: 0, active: false }, bird: { x: -20, y: 40 },
  resetWorld(w) { this.world = w; this.parts = []; this.clouds = [{ x: 30, y: 24, s: 2 }, { x: 200, y: 52, s: 1 }, { x: 360, y: 20, s: 2 }]; },
  cast_() { this.cast = 1; },
  addFloater(txt, x, y, col, big) { this.floaters.push({ txt, x, y, vy: -26, life: 1.1, age: 0, col: col || '#fff', big }); if (this.floaters.length > 40) this.floaters.shift(); },
  catchFish(f, crit) {
    this.cast = 1; this.fly.push({ f, t: 0, sx: 250 + (Math.random() - 0.5) * 40, sy: 184 }); if (this.fly.length > 12) this.fly.shift();
    for (let i = 0; i < 6; i++) this.parts.push({ x: 250, y: 186, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 50, l: 0.6, c: '#dff6ff' });
  },
  update(dt) {
    this.t += dt; this.bob = Math.sin(this.t * 2.2) * 2; if (this.cast > 0) this.cast = Math.max(0, this.cast - dt * 2.2);
    this.shake = Math.max(0, this.shake - dt * 4); this.flash = Math.max(0, this.flash - dt * 4); this.shakeBoss = Math.max(0, this.shakeBoss - dt * 5);
    for (const c of this.clouds) { c.x += 3 * dt * c.s * 0.5; if (c.x > SW + 30) c.x = -40; }
    for (const f of this.fly) f.t += dt * 1.6; this.fly = this.fly.filter(f => f.t < 1);
    for (const f of this.floaters) { f.age += dt; f.y += f.vy * dt; f.vy *= 0.97; } this.floaters = this.floaters.filter(f => f.age < f.life);
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; if (!(p.snow || p.bub || p.fire)) p.vy += 140 * dt; p.l -= dt; } this.parts = this.parts.filter(p => p.l > 0);
    const w = this.world, r = Math.random;
    if (w === 3 && this.parts.length < 90 && r() < 0.6) this.parts.push({ x: r() * SW, y: -4, vx: -8 + r() * 6, vy: 18 + r() * 14, l: 14, c: '#ffffff', snow: 1, g: 0 });
    if (w === 5 && r() < 0.15) this.parts.push({ x: r() * SW, y: SH, vx: 0, vy: -20 - r() * 20, l: 8, c: '#a8f0ff', bub: 1 });
    if (w === 2 && r() < 0.05) this.parts.push({ x: r() * SW, y: 120 + r() * 50, vx: 4, vy: -3, l: 3, c: '#e8ff7a', fire: 1 });
    const d = this.dolphin; d.t -= dt; if (d.t <= 0 && !d.active) { d.active = true; d.p = 0; d.x = 300 + r() * 120; d.dir = r() < 0.5 ? 1 : -1; } if (d.active) { d.p += dt * 0.9; if (d.p >= 1) { d.active = false; d.t = 5 + r() * 8; } }
    const b = this.bird; b.x += 22 * dt; if (b.x > SW + 20) { b.x = -30; b.y = 30 + r() * 50; }
  },
  draw(ctx, S, boss) {
    ctx.imageSmoothingEnabled = false; const w = this.world, t = this.t;
    ctx.save(); if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake * 4, (Math.random() - 0.5) * this.shake * 4);
    ctx.drawImage(bgFor(w), 0, 0);
    // nuages animés
    if (w !== 5 && w !== 2) for (const c of this.clouds) { ctx.fillStyle = w === 1 ? '#ffe0b8' : '#ffffff'; ctx.globalAlpha = 0.85; const p = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }; ctx.globalAlpha = 1; for (let i = 0; i < 3; i++) { ctx.fillRect(Math.round(c.x + i * 9 * c.s), Math.round(c.y - i % 2 * 3 * c.s), Math.round(14 * c.s), Math.round(6 * c.s)); } }
    if (w === 1) { const b = this.bird, y = b.y + Math.sin(b.x / 12) * 4; ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(b.x), Math.round(y), 6, 1); ctx.fillRect(Math.round(b.x) - 2, Math.round(y) - 1, 3, 1); ctx.fillRect(Math.round(b.x) + 5, Math.round(y) - 1, 3, 1); }
    // vagues
    ctx.globalAlpha = 0.55; ctx.fillStyle = shade(SEA[w][0], 0.45);
    for (let row = 0; row < 16; row++) { const y = HORIZON + 6 + row * row * 0.55 + row * 3, sp = 6 + row * 2.2; for (let k = 0; k < 9; k++) { const x = ((k * 71 + row * 37 + t * sp) % (SW + 40)) - 20; ctx.fillRect(Math.round(x), Math.round(y + Math.sin(t * 2 + k + row) * 0.6), 6 + row, 1); } }
    ctx.globalAlpha = 1;
    // aurore / reflets
    // dauphin du monde
    const dl = this.dolphin; if (dl.active) { const p = dl.p, x = dl.x + (p - 0.5) * 120 * dl.dir, y = WATER + 4 - Math.sin(p * Math.PI) * 52, ang = Math.cos(p * Math.PI) * -0.9 * dl.dir; ctx.save(); ctx.translate(x, y); ctx.rotate(ang * 0.5); ctx.scale(dl.dir > 0 ? 1 : -1, 1); ctx.drawImage(dolphinSprite(w), -29, -17); ctx.restore(); if (p < 0.12 || p > 0.88) { ctx.fillStyle = '#e8f8ff'; ctx.fillRect(Math.round(x) - 6, WATER + 3, 14, 2); } }
    // trésor caché
    if (!S.treasures[w]) { const [tx, ty] = TREASURE_POS[w], k = (Math.sin(t * 3 + w) + 1) / 2; ctx.fillStyle = `rgba(255,240,150,${0.15 + k * 0.8})`; ctx.fillRect(tx - 1, ty - 4, 2, 9); ctx.fillRect(tx - 4, ty - 1, 9, 2); }
    // bouchon + ligne
    const bx = 250, by = 184 + this.bob + (this.cast > 0 ? Math.sin(this.cast * 9) * 3 : 0);
    const sk = SKINS.find(k => k.id === S.skin) || SKINS[0], fs = fishermanSprite(sk, hasPants(S));
    const fx = 92, fy = 132 + (this.cast > 0.5 ? -1 : 0), hx = fx + 17 + 13 + 4, hy = fy + 16;
    const ang = -0.95 + (this.cast > 0 ? Math.sin((1 - this.cast) * Math.PI) * -0.7 : 0), tipx = hx + Math.cos(ang) * 44, tipy = hy + Math.sin(ang) * 44;
    ctx.drawImage(fs, fx, fy);
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(Math.round(tipx), Math.round(tipy)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(tipx), Math.round(tipy)); ctx.quadraticCurveTo((tipx + bx) / 2, Math.max(tipy, by) + 14, bx, by - 3); ctx.stroke();
    ctx.fillStyle = '#e8302f'; ctx.fillRect(bx - 2, Math.round(by) - 4, 5, 3); ctx.fillStyle = '#fff'; ctx.fillRect(bx - 2, Math.round(by) - 1, 5, 3);
    ctx.fillStyle = 'rgba(220,245,255,0.7)'; ctx.fillRect(bx - 6, WATER + 19 + Math.round(this.bob), 13, 1);
    // poissons qui volent vers le pêcheur
    for (const f of this.fly) { const e = f.t, x = f.sx + (hx + 4 - f.sx) * e, y = f.sy + (hy - 6 - f.sy) * e - Math.sin(e * Math.PI) * 60; const spr = fishSprite(f.f); ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(-e * 2.2); ctx.scale(-1, 1); ctx.drawImage(spr, -14, -9); ctx.restore(); }
    // boss
    if (boss) {
      const f = boss, spr = bossSpriteFor(f.boss), sc = 2.6, bx2 = 330 + (this.shakeBoss > 0 ? (Math.random() - 0.5) * 8 : 0), by2 = 70 + Math.sin(t * 2) * 5;
      ctx.save(); if (this.flash > 0) ctx.filter = 'brightness(2.2)'; ctx.drawImage(spr, Math.round(bx2 - 48 * sc / 2), Math.round(by2), Math.round(96 * sc / 2), Math.round(96 * sc / 2)); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#000'; ctx.fillRect(bx2 - 50, by2 + 128, 100, 4); ctx.restore();
    }
    // particules
    for (const p of this.parts) { ctx.globalAlpha = Math.min(1, p.l); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.snow ? 2 : 1, p.snow ? 2 : 1); } ctx.globalAlpha = 1;
    // textes flottants
    ctx.textAlign = 'center'; for (const f of this.floaters) { ctx.globalAlpha = Math.min(1, (f.life - f.age) * 2); ctx.font = (f.big ? 'bold 14px ' : 'bold 10px ') + 'monospace'; ctx.fillStyle = '#10131c'; ctx.fillText(f.txt, Math.round(f.x) + 1, Math.round(f.y) + 1); ctx.fillStyle = f.col; ctx.fillText(f.txt, Math.round(f.x), Math.round(f.y)); } ctx.globalAlpha = 1;
    ctx.restore();
  },
};
/* aperçus (data URL) pour l'interface */
const _urlCache = {};
function dataUrl(key, make) { return _urlCache[key] || (_urlCache[key] = make().toDataURL()); }
const fishUrl = f => dataUrl('f' + f.id, () => fishSprite(f));
const skinUrl = (sk, pants) => dataUrl('s' + sk.id + (pants ? 'p' : ''), () => fishermanSprite(sk, pants));
const bossUrl = b => dataUrl('b' + (b.base ? b.base.id : b.id), () => bossSpriteFor(b));
const dolphinUrl = w => dataUrl('dol' + w, () => dolphinSprite(w));
