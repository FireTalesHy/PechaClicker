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

function outlineCanvas(c, col) { // contour sombre façon Pechadophin : toute case vide voisine d'un pixel plein devient sombre
  const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data; g.fillStyle = col || '#14182c';
  const sol = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!sol(x, y) && (sol(x - 1, y) || sol(x + 1, y) || sol(x, y - 1) || sol(x, y + 1))) g.fillRect(x, y, 1, 1);
  return c;
}
function flipH(c) { return mk(c.width, c.height, () => { X.translate(c.width, 0); X.scale(-1, 1); X.drawImage(c, 0, 0); }); }
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
    outlineCanvas(X.canvas);
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
const WORLD_DOLPHIN = () => [PD.DOLB, PD.DOLP, PD.DOLR, PD.DOLB_I, PD.DOLP_I, PD.DOLR_I];
function dolphinSprite(i) { return WORLD_DOLPHIN()[i]; }

/* ------------------------------------------------------------------ BOSS (96x96, regardent à gauche) */
function eyesAt(cx, cy, gap, r, col) { D(cx - gap, cy, r, '#fff'); D(cx + gap, cy, r, '#fff'); D(cx - gap, cy, Math.max(1, r - 2), col || '#10131c'); D(cx + gap, cy, Math.max(1, r - 2), col || '#10131c'); }
function bigDolphin(pal, x, y) { const d = PD.spr(PD.DOL, pal, true); X.save(); X.translate(x + d.width * 4, y); X.scale(-4, 4); X.drawImage(d, 0, 0); X.restore(); }
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
  nuagedauphin() { for (const [x, y, r] of [[22, 76, 14], [40, 82, 16], [60, 78, 16], [76, 72, 12], [48, 70, 14]]) D(x, y, r, '#f4f8ff'); for (const [x, y, r] of [[30, 82, 8], [58, 84, 8]]) D(x, y, r, '#cfe0ff'); bigDolphin({ D: '#6a8ed8', d: '#bcd4ff', l: '#ffffff', e: '#14182c' }, 8, 14); },
  meca() { bigDolphin({ D: '#4a5568', d: '#8a96a6', l: '#c8d0da', e: '#ff2a2a' }, 8, 24); R(30, 40, 22, 6, '#14182c'); R(32, 41, 18, 3, '#9aa6ba'); R(33, 43, 6, 1, '#ff3b2f'); R(38, 32, 2, 8, '#14182c'); D(39, 30, 3, '#ff3b2f'); for (const [x, y] of [[40, 58], [56, 56], [48, 62]]) R(x, y, 2, 2, '#14182c'); TRI(74, 78, 84, 94, 66, 94, '#ffb02e'); TRI(74, 82, 80, 92, 68, 92, '#ffe14a'); },
  roi() { TRI(76, 24, 96, 94, 40, 94, '#a82f3a'); TRI(80, 40, 96, 94, 60, 94, '#c8404a'); bigDolphin({ D: '#2a6fb0', d: '#4aa8e8', l: '#d6f1ff', e: '#14182c' }, 8, 26); X.drawImage(PD.CROWN, 18, 14, 33, 21); LN(10, 94, 20, 44, '#ffd24a', 2); for (const x of [-3, 3, 9]) TRI(10 + x, 44, 14 + x, 44, 12 + x, 34, '#ffd24a'); R(11, 38, 12, 3, '#ffd24a'); },
};
const BOSS_REAL = { requin: () => flipH(PD.SHARK), poulpe: () => PD.OCTO_N, meduse: () => PD.JELLY };
const BOSS_SCALE = { requin: 4, poulpe: 2, meduse: 6 };   // échelle d'affichage entière (pixels nets) ; 2 par défaut
function bossSprite(id) {
  if (_fishCache['b' + id]) return _fishCache['b' + id];
  if (BOSS_REAL[id]) return _fishCache['b' + id] = BOSS_REAL[id]();
  return _fishCache['b' + id] = mk(96, 96, () => { X.imageSmoothingEnabled = false; BOSS_DRAW[id](); outlineCanvas(X.canvas); });
}
function bossSpriteFor(b) { return bossSprite(b.base ? b.base.id : b.id); }
const bossScale = b => BOSS_SCALE[b.base ? b.base.id : b.id] || 2;

/* ------------------------------------------------------------------ PÊCHEUR */
/* Pêcheur : sprites 16×16 de Pechadophin (idle / a / b / jump). Sans le pantalon tant que les 10 morceaux ne sont pas réunis. */
function pdSkin(id) { return PD.SKINS.find(s => s.id === id) || PD.SKINS[0]; }
function skinSprite(id, pants, frame) { const sp = pdSkin(id).spr[frame || 'idle']; return pants ? sp : PD.noPants(sp); }
function skinRod(id) { const r = pdSkin(id).rod; return /^#/.test(r || '') ? r : '#ff9a3c'; }

/* ------------------------------------------------------------------ DÉCORS */
const SKY = [
  ['#5aa8f0', '#cdeeff'], ['#ff9a5a', '#ffe8b0'], ['#4a6a52', '#b4c490'], ['#8ac4ec', '#f0faff'], ['#6a4ac8', '#ffb4dc'], ['#12082e', '#6a2a9a'],
];
const SEA = [['#3a9ad9', '#1a4f8a'], ['#2fc0cc', '#0f6a80'], ['#3a5a3a', '#16301f'], ['#5ab0d8', '#24608f'], ['#f0e6ff', '#c8b0f0'], ['#1fa0b8', '#082f50']];
function band(c1, c2, y0, y1, step) { for (let y = y0; y < y1; y += step) R(0, y, SW, step, lerpCol(c1, c2, (y - y0) / Math.max(1, y1 - y0 - 1))); }
const _cl = {};
function cloudSprite(s, warm) { // nuage arrondi : blanc, reflet en haut, ombre bleutée en bas
  const k = s + '_' + warm; if (_cl[k]) return _cl[k];
  return _cl[k] = mk(34 * s, 20 * s, () => { const m = (x, y, r, c) => D(Math.round(x * s), Math.round(y * s), Math.round(r * s), c), sh = warm ? '#e8b898' : '#b8cde4', bd = warm ? '#fff0dc' : '#ffffff';
    m(8, 13, 7, sh); m(17, 12, 9, sh); m(26, 14, 7, sh); R(6 * s, 14 * s, 22 * s, 6 * s, sh);
    m(8, 11, 7, bd); m(16, 9, 9, bd); m(26, 12, 7, bd); R(6 * s, 12 * s, 22 * s, 5 * s, bd); m(14, 6, 3, '#ffffff'); }); }
function cloudPuff(x, y, s, c) { D(x, y + 2 * s, 5 * s, '#c4d6ea'); D(x + 7 * s, y + 3 * s, 6 * s, '#c4d6ea'); D(x + 14 * s, y + 2 * s, 5 * s, '#c4d6ea'); R(x - 4 * s, y + 2 * s, 22 * s, 5 * s, '#c4d6ea'); D(x, y, 5 * s, c); D(x + 7 * s, y + 1, 6 * s, c); D(x + 14 * s, y, 5 * s, c); R(x - 4 * s, y, 22 * s, 5 * s, c); }
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
    if (w !== 5 && w !== 2) for (const c of this.clouds) ctx.drawImage(cloudSprite(c.s, w === 1 ? 1 : 0), Math.round(c.x), Math.round(c.y));
    if (w === 1) { const b = this.bird, y = b.y + Math.sin(b.x / 12) * 4; ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(b.x), Math.round(y), 6, 1); ctx.fillRect(Math.round(b.x) - 2, Math.round(y) - 1, 3, 1); ctx.fillRect(Math.round(b.x) + 5, Math.round(y) - 1, 3, 1); }
    // vagues
    ctx.globalAlpha = 0.55; ctx.fillStyle = shade(SEA[w][0], 0.45);
    for (let row = 0; row < 16; row++) { const y = HORIZON + 6 + row * row * 0.55 + row * 3, sp = 6 + row * 2.2; for (let k = 0; k < 9; k++) { const x = ((k * 71 + row * 37 + t * sp) % (SW + 40)) - 20; ctx.fillRect(Math.round(x), Math.round(y + Math.sin(t * 2 + k + row) * 0.6), 6 + row, 1); } }
    ctx.globalAlpha = 1;
    // aurore / reflets
    // dauphin du monde
    const dl = this.dolphin; if (dl.active) { const p = dl.p, x = dl.x + (p - 0.5) * 120 * dl.dir, y = WATER + 4 - Math.sin(p * Math.PI) * 52, ang = Math.cos(p * Math.PI) * -0.9 * dl.dir; ctx.save(); ctx.translate(x, y); ctx.rotate(ang * 0.5); ctx.scale(dl.dir > 0 ? 1 : -1, 1); const ds = dolphinSprite(w); ctx.drawImage(ds, -ds.width * 1.5, -ds.height * 1.5, ds.width * 3, ds.height * 3); ctx.restore(); if (p < 0.12 || p > 0.88) { ctx.fillStyle = '#e8f8ff'; ctx.fillRect(Math.round(x) - 6, WATER + 3, 14, 2); } }
    // trésor caché
    if (!S.treasures[w]) { const [tx, ty] = TREASURE_POS[w], k = (Math.sin(t * 3 + w) + 1) / 2; ctx.fillStyle = `rgba(255,240,150,${0.15 + k * 0.8})`; ctx.fillRect(tx - 1, ty - 4, 2, 9); ctx.fillRect(tx - 4, ty - 1, 9, 2); }
    // bouchon + ligne
    const bx = 250, by = 184 + this.bob + (this.cast > 0 ? Math.sin(this.cast * 9) * 3 : 0);
    const fs = skinSprite(S.skin, hasPants(S), this.cast > 0.45 ? 'a' : 'idle'), rod = skinRod(S.skin);
    const fx = 90, fy = 174 - 48 - (this.cast > 0.7 ? 2 : 0) + (Math.sin(this.t * 2.4) > 0.2 && this.cast <= 0 ? 0 : 0), hx = fx + 42, hy = fy + 28;
    const ang = -0.95 + (this.cast > 0 ? Math.sin((1 - this.cast) * Math.PI) * -0.7 : 0), tipx = hx + Math.cos(ang) * 50, tipy = hy + Math.sin(ang) * 50;
    ctx.fillStyle = 'rgba(10,14,30,0.3)'; ctx.fillRect(fx + 8, 173, 30, 3);
    ctx.drawImage(fs, fx, fy, 48, 48);
    ctx.strokeStyle = '#14182c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(Math.round(tipx), Math.round(tipy)); ctx.stroke();
    ctx.strokeStyle = rod; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(Math.round(tipx), Math.round(tipy)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(tipx), Math.round(tipy)); ctx.quadraticCurveTo((tipx + bx) / 2, Math.max(tipy, by) + 14, bx, by - 3); ctx.stroke();
    ctx.fillStyle = '#e8302f'; ctx.fillRect(bx - 2, Math.round(by) - 4, 5, 3); ctx.fillStyle = '#fff'; ctx.fillRect(bx - 2, Math.round(by) - 1, 5, 3);
    ctx.fillStyle = 'rgba(220,245,255,0.7)'; ctx.fillRect(bx - 6, WATER + 19 + Math.round(this.bob), 13, 1);
    // poissons qui volent vers le pêcheur
    for (const f of this.fly) { const e = f.t, x = f.sx + (hx + 4 - f.sx) * e, y = f.sy + (hy - 6 - f.sy) * e - Math.sin(e * Math.PI) * 60; const spr = fishSprite(f.f); ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(-e * 2.2); ctx.scale(-1, 1); ctx.drawImage(spr, -14, -9); ctx.restore(); }
    // boss
    if (boss) {
      const spr = bossSpriteFor(boss.boss), sc = bossScale(boss.boss), w2 = spr.width * sc, h2 = spr.height * sc, hover = (boss.boss.base || boss.boss).id === 'meduse' || (boss.boss.base || boss.boss).id === 'nuagedauphin' ? 22 : 0;
      const bx2 = Math.min(360, SW - w2 / 2 - 6) + (this.shakeBoss > 0 ? (Math.random() - 0.5) * 8 : 0), by2 = 198 - h2 - hover + Math.sin(t * 2) * 4;
      ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000'; ctx.fillRect(Math.round(bx2 - w2 / 2 + 8), 196, Math.round(w2 - 16), 5); ctx.restore();
      ctx.save(); if (this.flash > 0) ctx.filter = 'brightness(2.2)'; ctx.drawImage(spr, Math.round(bx2 - w2 / 2), Math.round(by2), w2, h2); ctx.restore();
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
const skinUrl = (sk, pants) => dataUrl('s' + sk.id + (pants ? 'p' : ''), () => skinSprite(sk.id, pants));
const bossUrl = b => dataUrl('b' + (b.base ? b.base.id : b.id), () => bossSpriteFor(b));
const dolphinUrl = w => dataUrl('dol' + w, () => dolphinSprite(w));
