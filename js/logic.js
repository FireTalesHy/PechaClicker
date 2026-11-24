/* Pechaclicker — logique de jeu pure (sans DOM) */
'use strict';
const SAVE_KEY = 'pechaclicker.save';
const GROWTH = 1.15;
const OFFLINE_CAP = 8 * 3600;
const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc'];

/* ------------------------------------------------------------------ ÉTAT */
function newState() {
  return {
    v: 1, lang: 'fr', t0: Date.now(), last: Date.now(), play: 0,
    fish: 0, perles: 0, souls: 0, soulsEarned: 0, prestiges: 0,
    run: { fish: 0, clicks: 0, t: 0 },
    b: BLD.map(() => 0), up: {}, sup: {},
    wp: { owned: { canne: true }, lv: { canne: 0 }, eq: 'canne' },
    world: 0, unlocked: 1, beaten: {}, anarchy: 0, ending: false,
    dex: {}, skins: { default: { own: true, frag: 0 } }, skin: 'default', treasures: {},
    ach: {}, quests: [], nth: 0,
    st: { clicks: 0, fishTotal: 0, bought: 0, events: 0, crits: 0, species: 0, crates: 0, bossWins: 0, upgrades: 0, pants: 0, bottles: 0, quests: 0, maxCps: 0, treasures: 0 },
    buffs: [], hist: [], seen: {}, opt: { vol: 0.5, mute: false, buyN: 1, hints: true },
    rt: newRt(),
  };
}
function newRt() { return { events: [], nextEvt: 40, fight: null, c: null, d: true, histT: 0, achT: 0 }; }

/* ------------------------------------------------------------------ CALCUL DES STATS */
function calc(s) {
  const bm = BLD.map(() => 1);
  let gp = 0, cm = 1, cc = 0, crit = 0.03, critm = 5, ev = 0, dur = 0, perle = 0, off = 0.5;
  let start = 0, startb = 0, auto = 0, bosshp = 0, dexb = 0, gm = 1, soulg = 0;
  for (const id in s.up) {
    const e = UP_BY_ID[id] && UP_BY_ID[id].eff; if (!e) continue;
    switch (e.k) {
      case 'bm': bm[e.i] *= e.v; break; case 'g': gp += e.v; break; case 'cm': cm *= e.v; break; case 'cc': cc += e.v; break;
      case 'crit': crit += e.v; break; case 'critm': critm += e.v; break; case 'event': ev += e.v; break;
      case 'dur': dur += e.v; break; case 'perle': perle += e.v; break; case 'off': off += e.v; break;
    }
  }
  for (const id in s.sup) {
    const e = SOUL_UP.find(x => x.id === id).eff;
    switch (e.k) {
      case 'cm': cm *= e.v; break; case 'start': start += e.v; break; case 'startb': startb += e.v; break;
      case 'dur': dur += e.v; break; case 'crit': crit += e.v; break; case 'perle': perle += e.v; break; case 'off': off += e.v; break;
      case 'auto': auto += e.v; break; case 'bosshp': bosshp += e.v; break; case 'dexb': dexb += e.v; break;
      case 'gm': gm *= e.v; break; case 'soulg': soulg += e.v; break;
    }
  }
  const wd = WEAPONS.find(w => w.id === s.wp.eq), wl = s.wp.lv[s.wp.eq] || 0, ws = wd.s;
  const world = WORLDS[s.world].mod;
  const achPct = 0.005 * Object.keys(s.ach).length;
  let skinPct = 0;
  for (const id in s.skins) if (s.skins[id].own) { const k = SKINS.find(x => x.id === id); if (k) skinPct += SKIN_BONUS[k.rar]; }
  let dexPct = 0;
  for (let w = 0; w < 6; w++) {
    let all = true;
    for (let i = 0; i < 6; i++) { const f = FISH[w * 6 + i], n = s.dex[f.id] || 0; if (n >= 25) dexPct += 0.01; if (!n) all = false; }
    if (all) dexPct += 0.05;
  }
  dexPct *= 1 + dexb;
  const bossPct = 0.10 * Object.keys(s.beaten).length;
  const soulPct = SOUL_PCT * s.soulsEarned;
  const G = (1 + gp) * (1 + achPct) * (1 + skinPct) * (1 + dexPct) * (1 + bossPct) * (1 + soulPct) * gm * (1 + (world.all || 0)) * (1 + (ws.all || 0) * wl);
  let raw = 0;
  for (let i = 0; i < BLD.length; i++) raw += s.b[i] * BLD[i].cps * bm[i];
  const cps = raw * (1 + (ws.cps || 0) * wl) * (1 + (world.prod || 0)) * G;
  const clickBase = cm * wd.m * (1 + (world.click || 0));
  const click = clickBase + cps * (cc + (ws.clickCps || 0) * wl);
  const c = {
    cps, click, G, bm, auto, pm: (1 + (ws.cps || 0) * wl) * (1 + (world.prod || 0)) * G, start, startb, crit: Math.min(0.8, crit + (ws.crit || 0) * wl + (world.crit || 0)),
    critm: critm + (ws.critM || 0) * wl, dbl: (ws.dbl || 0) * wl,
    nth: ws.nth || 0, nthM: (ws.nthM || 0) + (ws.nthL || 0) * wl,
    evRate: 1 + ev + (ws.event || 0) * wl + (world.event || 0), dur: 1 + dur,
    perle: perle + (ws.perle || 0) * wl + (world.perle || 0), off: Math.min(2, off),
    bossHp: Math.max(0.2, 1 - bosshp), bossDmg: 1 + (ws.boss || 0) * wl, rare: (ws.rare || 0) * wl,
    soulg, skinPct, dexPct, bossPct, achPct, soulPct,
  };
  if (cps > s.st.maxCps) s.st.maxCps = cps;
  return c;
}
function C(s) { const r = s.rt; if (!r.c || r.d) { r.c = calc(s); r.d = false; } return r.c; }
function dirty(s) { s.rt.d = true; }
function calcRef(s) { return C(s); }
function buffMult(s, k) { let m = 1; for (const b of s.buffs) if (b.k === k && b.end > s.play) m *= b.m; return m; }
const cpsNow = s => C(s).cps * buffMult(s, 'prod');
const clickNow = s => C(s).click * buffMult(s, 'click');

/* ------------------------------------------------------------------ GAINS */
function addFish(s, x) { if (!(x > 0)) return; s.fish += x; s.run.fish += x; s.st.fishTotal += x; }
const cost1 = (i, owned) => Math.floor(BLD[i].cost * Math.pow(GROWTH, owned));
function costN(i, owned, n) { return Math.floor(BLD[i].cost * Math.pow(GROWTH, owned) * (Math.pow(GROWTH, n) - 1) / (GROWTH - 1)); }
function maxAfford(s, i) {
  const base = BLD[i].cost * Math.pow(GROWTH, s.b[i]);
  if (s.fish < base) return 0;
  return Math.max(0, Math.floor(Math.log(1 + s.fish * (GROWTH - 1) / base) / Math.log(GROWTH)));
}
function buyBuilding(s, i, n) {
  if (n === Infinity || n === 'max') n = maxAfford(s, i);
  if (n < 1) return 0;
  while (n > 0 && costN(i, s.b[i], n) > s.fish) n--;
  if (n < 1) return 0;
  s.fish -= costN(i, s.b[i], n); s.b[i] += n; s.st.bought += n; dirty(s); return n;
}
function upAvailable(s, u) {
  if (s.up[u.id]) return false;
  const r = u.req;
  return r.b !== undefined ? s.b[r.b] >= r.n : s.run.fish >= r.f;
}
function buyUpgrade(s, id) {
  const u = UP_BY_ID[id];
  if (!u || s.up[id] || s.fish < u.cost || !upAvailable(s, u)) return false;
  s.fish -= u.cost; s.up[id] = 1; s.st.upgrades++; dirty(s); return true;
}
/* armes */
function buyWeapon(s, id) { const w = WEAPONS.find(x => x.id === id); if (!w || s.wp.owned[id] || s.fish < w.cost) return false; s.fish -= w.cost; s.wp.owned[id] = true; s.wp.lv[id] = 0; dirty(s); return true; }
function weaponUpCost(s, id) { const w = WEAPONS.find(x => x.id === id); return Math.max(200, w.cost * 0.6) * Math.pow(2.2, s.wp.lv[id] || 0); }
function upgradeWeapon(s, id) {
  if (!s.wp.owned[id]) return false; const lv = s.wp.lv[id] || 0; if (lv >= WEAPON_MAXLV) return false;
  const c = weaponUpCost(s, id); if (s.fish < c) return false; s.fish -= c; s.wp.lv[id] = lv + 1; dirty(s); return true;
}
function equipWeapon(s, id) { if (!s.wp.owned[id]) return false; s.wp.eq = id; dirty(s); return true; }
function soulBuy(s, id) { const u = SOUL_UP.find(x => x.id === id); if (!u || s.sup[id] || s.souls < u.cost) return false; s.souls -= u.cost; s.sup[id] = 1; dirty(s); return true; }

/* ------------------------------------------------------------------ CLIC / PRISE */
function pickFish(s, rnd) {
  const c = C(s), list = FISH.slice(s.world * 6, s.world * 6 + 6);
  const ws = list.map((f, i) => f.wt * (i >= 2 ? 1 + c.rare * 10 : 1));
  let r = rnd() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 6; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
  return list[0];
}
const PERLE_P = [0, 0, 0.004, 0.03, 0.12, 0.6];
function clickCatch(s, rnd) {
  rnd = rnd || Math.random;
  const c = C(s); let v = clickNow(s);
  s.st.clicks++; s.run.clicks++;
  const out = { crit: false, dbl: false, nth: false, perle: 0, fish: null, gain: 0, newSpecies: false };
  if (c.nth) { s.nth++; if (s.nth % c.nth === 0) { v *= c.nthM; out.nth = true; } }
  if (rnd() < c.crit) { v *= c.critm; out.crit = true; s.st.crits++; }
  if (rnd() < c.dbl) { v *= 2; out.dbl = true; }
  const f = pickFish(s, rnd); out.fish = f; v *= f.mult;
  if (!s.dex[f.id]) { out.newSpecies = true; s.st.species++; s.dex[f.id] = 0; dirty(s); }
  s.dex[f.id]++;
  if (s.dex[f.id] === 25) dirty(s);
  addFish(s, v); out.gain = v;
  if (rnd() < PERLE_P[f.i] * (1 + c.perle)) { s.perles++; out.perle = 1; }
  return out;
}

/* ------------------------------------------------------------------ BOSS */
function nextBossIdx(s) { for (let i = 0; i < BOSSES.length; i++) if (!s.beaten[BOSSES[i].id]) return i; return -1; }
function anarchyBoss(s) {
  const n = s.anarchy, base = BOSSES[n % BOSSES.length];
  return { id: 'anar' + n, w: n % 6, th: 3e21 * Math.pow(8, n + 1), n: L('Anarchie · ' + base.n.fr + ' ' + (n + 1), 'Anarchy · ' + base.n.en + ' ' + (n + 1)), base, pre: base.pre, post: L('Un autre tombe. Un plus gros arrive.', 'One falls. A bigger one comes.') };
}
function currentBoss(s) { const i = nextBossIdx(s); if (i >= 0) return { b: BOSSES[i], idx: i, anar: false }; if (s.ending || s.beaten[BOSSES[11].id]) return { b: anarchyBoss(s), idx: 12 + s.anarchy, anar: true }; return null; }
function canFight(s) { const b = currentBoss(s); return !!b && !s.rt.fight && s.run.fish >= b.b.th; }
function startFight(s) {
  if (!canFight(s)) return false;
  const cb = currentBoss(s), max = bossHp(cb.b.th) * C(s).bossHp;
  s.rt.fight = { idx: cb.idx, anar: cb.anar, boss: cb.b, hp: max, max, t: BOSS_TIME, hits: 0 };
  return true;
}
function fightClick(s, rnd) {
  const f = s.rt.fight; if (!f) return null; rnd = rnd || Math.random;
  const c = C(s); let d = clickNow(s) * c.bossDmg, crit = false;
  if (rnd() < c.crit) { d *= c.critm; crit = true; }
  f.hp -= d; f.hits++; s.st.clicks++; s.run.clicks++;
  return { dmg: d, crit, res: f.hp <= 0 ? winBoss(s) : null };
}
function fightTick(s, dt) {
  const f = s.rt.fight; if (!f) return null; const c = C(s);
  f.hp -= (0.3 * cpsNow(s) + c.auto * clickNow(s)) * c.bossDmg * dt;
  f.t -= dt;
  if (f.hp <= 0) return winBoss(s);
  if (f.t <= 0) { s.rt.fight = null; return 'lose'; }
  return null;
}
function winBoss(s) {
  const f = s.rt.fight; s.rt.fight = null; if (!f) return null;
  const b = f.boss, reward = { perles: f.anar ? 5 : 3 + Math.floor(f.idx / 2), fish: Math.max(100, cpsNow(s) * 600), boss: b, anar: f.anar, newWorld: -1, ending: false };
  s.perles += reward.perles; addFish(s, reward.fish); s.st.bossWins++;
  if (f.anar) s.anarchy++; else {
    s.beaten[b.id] = 1;
    if (f.idx % 2 === 1 && s.unlocked < 6) { s.unlocked = Math.max(s.unlocked, b.w + 2); reward.newWorld = s.unlocked - 1; s.world = reward.newWorld; }
    if (f.idx === 11 && !s.ending) { s.ending = true; reward.ending = true; }
  }
  dirty(s); return 'win:' + JSON.stringify({ perles: reward.perles, newWorld: reward.newWorld, ending: reward.ending, id: b.id, fish: reward.fish });
}
function setWorld(s, w) { if (w >= 0 && w < s.unlocked && !s.rt.fight) { s.world = w; dirty(s); return true; } return false; }

/* ------------------------------------------------------------------ ÉVÉNEMENTS */
function pickEvent(rnd) { const tot = EVENTS.reduce((a, e) => a + e.w, 0); let r = rnd() * tot; for (const e of EVENTS) { r -= e.w; if (r <= 0) return e; } return EVENTS[0]; }
function spawnEvent(s, rnd) {
  rnd = rnd || Math.random; const e = pickEvent(rnd);
  const ev = { id: e.id, x: 0.12 + rnd() * 0.76, y: 0.12 + rnd() * 0.5, life: 14, age: 0 };
  s.rt.events.push(ev); return ev;
}
function clickEvent(s, ev, rnd) {
  rnd = rnd || Math.random; const c = C(s), def = EVENTS.find(e => e.id === ev.id);
  s.rt.events = s.rt.events.filter(x => x !== ev); s.st.events++;
  const out = { def, text: '', perles: 0, fish: 0 };
  const dur = def.dur * c.dur;
  switch (def.id) {
    case 'shoal': s.buffs.push({ k: 'prod', m: 7, end: s.play + dur, id: 'shoal' }); out.text = T(def.d).replace('{s}', Math.round(dur)); break;
    case 'rain': s.buffs.push({ k: 'click', m: 77, end: s.play + dur, id: 'rain' }); out.text = T(def.d).replace('{s}', Math.round(dur)); break;
    case 'tide': s.buffs.push({ k: 'prod', m: 3, end: s.play + dur, id: 'tide' }); out.text = T(def.d).replace('{s}', Math.round(dur)); break;
    case 'chest': out.fish = Math.max(200, cpsNow(s) * 600); addFish(s, out.fish); out.perles = 1 + (rnd() < 0.3 ? 1 : 0); s.perles += out.perles; out.text = T(def.d); break;
    case 'bottle': s.st.bottles++; out.perles = 1; s.perles++; out.text = T(BOTTLES[Math.floor(rnd() * BOTTLES.length)]); break;
    case 'pants': s.st.pants++; out.text = T(L(`Pièce ${Math.min(s.st.pants, PANTS_NEEDED)} / ${PANTS_NEEDED}`, `Piece ${Math.min(s.st.pants, PANTS_NEEDED)} / ${PANTS_NEEDED}`)); out.perles = 1; s.perles++; break;
  }
  s.buffs = s.buffs.filter(b => b.end > s.play);
  return out;
}
function clickTreasure(s, w) {
  if (s.treasures[w]) return null; s.treasures[w] = 1; s.st.treasures++; s.perles += 2;
  const f = Math.max(500, cpsNow(s) * 1800); addFish(s, f); return { fish: f, perles: 2 };
}

/* ------------------------------------------------------------------ PRESTIGE */
function prestigeGain(s) { return Math.floor(soulsFor(s.run.fish) * (1 + C(s).soulg)); }
function doPrestige(s) {
  const g = prestigeGain(s); if (g < 1) return 0;
  s.souls += g; s.soulsEarned += g; s.prestiges++;
  s.b = BLD.map(() => 0); s.up = {}; s.fish = 0; s.run = { fish: 0, clicks: 0, t: 0 }; s.buffs = []; s.rt.fight = null; s.rt.events = []; s.nth = 0;
  dirty(s); const c = C(s); s.fish = c.start; s.b[0] = c.startb; dirty(s);
  s.quests = []; refillQuests(s); return g;
}

/* ------------------------------------------------------------------ CAISSES & SKINS */
function crateSkins(kind) { return SKINS.filter(k => k.crate === kind); }
function openCrates(s, kind, n, rnd) {
  rnd = rnd || Math.random;
  if (kind !== 'hero' && kind !== 'villain') return null;
  const need = CRATE_COST * n; if (s.perles < need) return null; s.perles -= need;
  const pool = crateSkins(kind), res = [];
  for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) {
    let r = rnd() * SKIN_W.reduce((a, b) => a + b, 0), rar = 0;
    for (let i = 0; i < 4; i++) { r -= SKIN_W[i]; if (r <= 0) { rar = i; break; } }
    const cand = pool.filter(x => x.rar === rar), sk = cand[Math.floor(rnd() * cand.length)];
    const e = s.skins[sk.id] || (s.skins[sk.id] = { own: false, frag: 0 });
    const out = { id: sk.id, dup: e.own, unlocked: false };
    if (e.own) addFish(s, Math.max(100, cpsNow(s) * 120)); else { e.frag++; if (e.frag >= SKIN_NEED[sk.rar]) { e.own = true; out.unlocked = true; } }
    res.push(out);
  }
  s.st.crates += n; dirty(s); return res;
}
function equipSkin(s, id) { if (s.skins[id] && s.skins[id].own) { s.skin = id; return true; } return false; }
function unlockPremium(s) {
  const out = [];
  const give = id => { if (!(s.skins[id] && s.skins[id].own)) { s.skins[id] = { own: true, frag: 0 }; out.push(id); dirty(s); } };
  if (s.st.treasures >= 6) give('clown'); if (s.prestiges >= 3) give('epouvo'); if (s.st.clicks >= 1e6) give('rng');
  if (FISH.every(f => s.dex[f.id])) give('dino');
  return out;
}
const hasPants = s => s.st.pants >= PANTS_NEEDED;

/* ------------------------------------------------------------------ QUÊTES */
function questProgress(s, q) { return Math.min(q.target, (s.st[q.stat] || 0) - q.start); }
function newQuest(s, rnd, avoid) {
  rnd = rnd || Math.random;
  let tpl; do { tpl = QUEST_TPL[Math.floor(rnd() * QUEST_TPL.length)]; } while (avoid.includes(tpl.id));
  const target = Math.max(1, Math.round(tpl.t(s)));
  return { tpl: tpl.id, stat: tpl.stat, target, start: s.st[tpl.stat] || 0 };
}
function refillQuests(s, rnd) { while (s.quests.length < 3) s.quests.push(newQuest(s, rnd, s.quests.map(q => q.tpl))); }
function claimQuest(s, i, rnd) {
  const q = s.quests[i]; if (!q || questProgress(s, q) < q.target) return null;
  const r = { perles: 2, fish: Math.max(100, cpsNow(s) * 300) }; s.perles += r.perles; addFish(s, r.fish); s.st.quests++;
  s.quests.splice(i, 1); refillQuests(s, rnd); return r;
}

/* ------------------------------------------------------------------ SUCCÈS */
const ACH = [];
const A = (id, ico, n, d, ok, p) => ACH.push({ id, ico, n, d, ok, p });
(function buildAch() {
  const bigN = n => { const e = Math.floor(Math.log10(n) / 3), v = Math.round(n / Math.pow(1000, e)); return v + SUFFIX[e]; };
  [1, 100, 1e3, 1e4, 1e5, 1e6].forEach((n, i) => A('clk' + i, '👆', L(['Premier lancer', 'Poignet souple', 'Doigts en feu', 'Tendinite', 'Machine à pêcher', 'Légende du clic'][i], ['First cast', 'Supple wrist', 'Fingers on fire', 'Tendonitis', 'Fishing machine', 'Click legend'][i]), L(`Clique ${n.toLocaleString('fr')} fois.`, `Click ${n.toLocaleString('en')} times.`), s => s.st.clicks >= n, i >= 4));
  [1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e12, 1e14, 1e16, 1e18, 1e20, 1e22, 1e24].forEach((n, i) => A('fsh' + i, '🐟', L(['Petite friture', 'Un seau plein', 'Marée de poissons', 'Banc géant', 'Rivière pleine', 'Océan de prises', 'Poissonnerie royale', 'Milliard de nageoires', 'Baleine de profits', 'Terre des poissons', 'Galaxie piscicole', 'Sushi cosmique', 'Univers écaillé', 'Poisson infini', 'Mer des mers', 'Fin des poissons'][i], ['Small fry', 'A full bucket', 'Fish tide', 'Giant shoal', 'Full river', 'Ocean of catches', 'Royal fishmonger', 'Billion fins', 'Whale of profits', 'Planet of fish', 'Fishy galaxy', 'Cosmic sushi', 'Scaly universe', 'Infinite fish', 'Sea of seas', 'End of fish'][i]), L(`Pêche ${bigN(n)} poissons au total.`, `Catch ${bigN(n)} fish overall.`), s => s.st.fishTotal >= n, i >= 8));
  [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10].forEach((n, i) => A('cps' + i, '⚙️', L(['Ça démarre', 'Petit débit', 'Débit confortable', 'Robinet ouvert', 'Torrent', 'Cascade', 'Tsunami', 'Déluge', 'Apocalypse piscicole'][i], ['Warming up', 'Small stream', 'Comfy flow', 'Tap open', 'Torrent', 'Cascade', 'Tsunami', 'Deluge', 'Fishpocalypse'][i]), L(`Atteins ${n.toLocaleString('fr')} poissons/s.`, `Reach ${n.toLocaleString('en')} fish/s.`), s => s.st.maxCps >= n));
  BLD.forEach((b, i) => [1, 25, 50, 100, 200].forEach((n, t) => A(`b${i}_${n}`, b.ico, L(`${b.n.fr} ×${n}`, `${b.n.en} ×${n}`), L(`Possède ${n} × ${b.n.fr}.`, `Own ${n} × ${b.n.en}.`), s => s.b[i] >= n, t >= 3)));
  [10, 25, 50, 100, 150].forEach((n, i) => A('upg' + i, '⬆️', L(`${n} améliorations`, `${n} upgrades`), L(`Achète ${n} améliorations.`, `Buy ${n} upgrades.`), s => Object.keys(s.up).length >= n, i >= 3));
  WORLDS.forEach((w, i) => A('w' + i, w.ico, L(`Bienvenue : ${w.n.fr}`, `Welcome: ${w.n.en}`), L(`Débloque ${w.n.fr}.`, `Unlock ${w.n.en}.`), s => s.unlocked > i));
  BOSSES.forEach((b, i) => A('boss_' + b.id, '🐬', L(`Vainqueur : ${b.n.fr}`, `Victor: ${b.n.en}`), L(`Bats ${b.n.fr}.`, `Defeat ${b.n.en}.`), s => !!s.beaten[b.id], i >= 10));
  [1, 5, 10, 25].forEach((n, i) => A('anar' + i, '☠️', L(`Anarchie ${n}`, `Anarchy ${n}`), L(`Bats ${n} boss en mode Anarchie.`, `Defeat ${n} Anarchy bosses.`), s => s.anarchy >= n, true));
  [1, 3, 10, 25].forEach((n, i) => A('pre' + i, '👻', L(`Renaissance ×${n}`, `Rebirth ×${n}`), L(`Renais ${n} fois.`, `Be reborn ${n} times.`), s => s.prestiges >= n, true));
  [1, 10, 50, 150, 400].forEach((n, i) => A('soul' + i, '💀', L(`${n} âmes`, `${n} souls`), L(`Cumule ${n} âmes rouges.`, `Gather ${n} red souls.`), s => s.soulsEarned >= n));
  [1, 5, 10, 20, 40].forEach((n, i) => A('skin' + i, '🎭', L(`Garde-robe ${n}`, `Wardrobe ${n}`), L(`Possède ${n} skins.`, `Own ${n} skins.`), s => Object.values(s.skins).filter(x => x.own).length >= n, i >= 3));
  [1, 10, 20, 36].forEach((n, i) => A('dex' + i, '📖', L(`Pêchédex ${n}`, `Fishdex ${n}`), L(`Découvre ${n} espèces.`, `Discover ${n} species.`), s => Object.keys(s.dex).length >= n, i >= 2));
  [1, 13, 77, 250].forEach((n, i) => A('evt' + i, '✨', L(`Œil de lynx ${n}`, `Lynx eye ${n}`), L(`Clique ${n} événements.`, `Click ${n} events.`), s => s.st.events >= n));
  [1, 10, 50, 150].forEach((n, i) => A('qst' + i, '📜', L(`Quêtes ${n}`, `Quests ${n}`), L(`Termine ${n} quêtes.`, `Complete ${n} quests.`), s => s.st.quests >= n));
  [1, 10, 100, 1000].forEach((n, i) => A('crt' + i, '📦', L(`Caisses ${n}`, `Crates ${n}`), L(`Ouvre ${n} caisses.`, `Open ${n} crates.`), s => s.st.crates >= n));
  [10, 100, 1000].forEach((n, i) => A('crit' + i, '💥', L(`Critiques ${n}`, `Crits ${n}`), L(`Réussis ${n} critiques.`, `Land ${n} crits.`), s => s.st.crits >= n));
  [1, 3, 6].forEach((n, i) => A('tre' + i, '💎', L(`Chasseur de trésors ${n}`, `Treasure hunter ${n}`), L(`Trouve ${n} trésors cachés.`, `Find ${n} hidden treasures.`), s => s.st.treasures >= n, i === 2));
  A('pants', '👖', L('Le pantalon retrouvé', 'Pants recovered'), L(`Récupère ${PANTS_NEEDED} morceaux de pantalon.`, `Gather ${PANTS_NEEDED} pants pieces.`), s => s.st.pants >= PANTS_NEEDED, true);
  A('bottle', '🍾', L('Message reçu', 'Message received'), L('Lis 5 bouteilles.', 'Read 5 bottles.'), s => s.st.bottles >= 5);
  [1, 10, 100].forEach((n, i) => A('time' + i, '⏱️', L(`${n} h de pêche`, `${n} h of fishing`), L(`Joue ${n} heure(s).`, `Play ${n} hour(s).`), s => s.play >= n * 3600));
  [1, 5, 10, 50].forEach((n, i) => A('perle' + i, '🦪', L(`Perles ${n}`, `Pearls ${n}`), L(`Possède ${n} perles en même temps.`, `Hold ${n} pearls at once.`), s => s.perles >= n));
  WEAPONS.forEach((w, i) => A('wp_' + w.id, w.ico, L(`Arsenal : ${w.n.fr}`, `Arsenal: ${w.n.en}`), L(`Obtiens ${w.n.fr}.`, `Get ${w.n.en}.`), s => !!s.wp.owned[w.id], i >= 10));
  A('wpmax', '🌟', L('Arme maîtrisée', 'Mastered weapon'), L('Monte une arme au niveau max.', 'Max a weapon level.'), s => Object.values(s.wp.lv).some(v => v >= WEAPON_MAXLV), true);
})();
function checkAch(s) {
  const got = [];
  for (const a of ACH) if (!s.ach[a.id] && a.ok(s)) { s.ach[a.id] = 1; if (a.p) s.perles++; got.push(a); }
  if (got.length) dirty(s);
  return got;
}

/* ------------------------------------------------------------------ BOUCLE LOGIQUE */
function tick(s, dt, rnd) {
  rnd = rnd || Math.random;
  const c = C(s), ev = { fight: null, events: [], ach: [] };
  s.play += dt; s.run.t += dt;
  s.buffs = s.buffs.filter(b => b.end > s.play);
  if (s.rt.fight) ev.fight = fightTick(s, dt);
  else { addFish(s, cpsNow(s) * dt); if (c.auto) addFish(s, c.auto * clickNow(s) * dt * 1.6); }
  // événements
  s.rt.nextEvt -= dt * c.evRate;
  for (const e of s.rt.events) e.age += dt;
  s.rt.events = s.rt.events.filter(e => e.age < e.life);
  if (s.rt.nextEvt <= 0) { ev.events.push(spawnEvent(s, rnd)); s.rt.nextEvt = 45 + rnd() * 75; }
  // historique + succès (1 Hz)
  s.rt.achT += dt; s.rt.histT += dt;
  if (s.rt.achT >= 1) { s.rt.achT = 0; ev.ach = checkAch(s); ev.prem = unlockPremium(s); if (!s.quests.length) refillQuests(s); dirty(s); }
  if (s.rt.histT >= 30) { s.rt.histT = 0; s.hist.push({ t: Math.round(s.play), v: cpsNow(s) }); if (s.hist.length > 120) s.hist.shift(); }
  return ev;
}
function applyOffline(s, secs) {
  secs = Math.min(secs, OFFLINE_CAP); if (secs < 30) return null;
  const c = C(s), g = c.cps * secs * c.off; addFish(s, g); s.play += secs; return { secs, gain: g };
}

/* ------------------------------------------------------------------ SAUVEGARDE */
function serialize(s) { const o = Object.assign({}, s); delete o.rt; o.last = Date.now(); return JSON.stringify(o); }
function deserialize(str) {
  const d = JSON.parse(str), base = newState(), s = Object.assign(base, d);
  for (const k of ['run', 'wp', 'st', 'opt']) s[k] = Object.assign(base[k], d[k] || {});
  while (s.b.length < BLD.length) s.b.push(0);
  s.rt = newRt();
  for (const k of Object.keys(s.st)) if (!isFinite(s.st[k])) s.st[k] = 0;
  if (!isFinite(s.fish)) s.fish = 0;
  s.world = Math.min(Math.max(0, s.world | 0), s.unlocked - 1);
  return s;
}
function exportSave(s) { return btoa(unescape(encodeURIComponent(serialize(s)))); }
function importSave(txt) { return deserialize(decodeURIComponent(escape(atob(txt.trim())))); }

/* ------------------------------------------------------------------ FORMAT DES NOMBRES */
function fmt(n) {
  if (!isFinite(n)) return '∞'; if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return n < 10 && n % 1 ? (Math.floor(n * 10) / 10).toString().replace('.', LANG === 'fr' ? ',' : '.') : Math.floor(n).toString();
  const e = Math.floor(Math.log10(n) / 3);
  if (e >= SUFFIX.length) return n.toExponential(2).replace('e+', 'e');
  const v = n / Math.pow(1000, e);
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)).replace('.', LANG === 'fr' ? ',' : '.') + SUFFIX[e];
}
function fmtTime(sec) { sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), x = sec % 60; return (h ? h + 'h ' : '') + (h || m ? m + 'm ' : '') + x + 's'; }
