/* Simulation d'un joueur glouton : vérifie que la progression est atteignable et chiffre les temps. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = ['data', 'logic'].map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8')).join('\n');
const ctx = { console, Math, Date, JSON, btoa, atob, unescape, escape, decodeURIComponent, encodeURIComponent, Object };
vm.createContext(ctx);
vm.runInContext(src + '\nthis.api={newState,tick,C,clickCatch,fightClick,startFight,canFight,currentBoss,buyBuilding,maxAfford,costN,UPGRADES,upAvailable,buyUpgrade,buyWeapon,upgradeWeapon,equipWeapon,WEAPONS,BLD,BOSSES,fmt,fmtTime,cpsNow,prestigeGain,doPrestige,serialize,deserialize,exportSave,importSave,openCrates,checkAch,ACH,FISH,SKINS,weaponUpCost,soulBuy,SOUL_UP,clickEvent,spawnEvent,clickTreasure,refillQuests,claimQuest,questProgress,applyOffline,dirty,WEAPON_MAXLV,EVENTS,QUEST_TPL};', ctx);
const A = ctx.api;
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function run(maxH, cps, label) {
  const s = A.newState(); A.refillQuests(s, rnd); const marks = [];
  const t0 = 0; let lastBeaten = 0;
  for (let t = 0; t < maxH * 3600; t++) {
    const c = A.C(s);
    // clics : 'cps' clics/s
    for (let k = 0; k < cps; k++) { if (s.rt.fight) { const r = A.fightClick(s, rnd); if (r && r.res) marks.push([A.fmtTime(s.play), 'boss ' + Object.keys(s.beaten).length + ' (clic)', 'cps=' + A.fmt(A.cpsNow(s))]); } else A.clickCatch(s, rnd); }
    // événements : clique tous ceux visibles
    for (const e of s.rt.events.slice()) A.clickEvent(s, e, rnd);
    const ev = A.tick(s, 1, rnd);
    if (ev.fight && ev.fight.startsWith('win')) marks.push([A.fmtTime(s.play), 'boss ' + Object.keys(s.beaten).length, 'cps=' + A.fmt(A.cpsNow(s))]);
    if (ev.fight === 'lose') marks.push([A.fmtTime(s.play), 'DÉFAITE', 'cps=' + A.fmt(A.cpsNow(s)), JSON.stringify(s.beaten), String(s.rt.fight)]);
    // achats : meilleur rapport coût / gain parmi les améliorations dispo puis bâtiments
    if (t % 2 === 0) {
      let guard = 0, bought = true;
      while (bought && guard++ < 50) {
        bought = false;
        for (const w of A.WEAPONS) if (!s.wp.owned[w.id] && s.fish >= w.cost * 1.0) { A.buyWeapon(s, w.id); A.equipWeapon(s, w.id); bought = true; }
        for (const w of A.WEAPONS) if (s.wp.owned[w.id] && s.fish > A.weaponUpCost(s, w.id) * 4 && (s.wp.lv[w.id] || 0) < A.WEAPON_MAXLV) { A.upgradeWeapon(s, w.id); bought = true; }
        for (const u of A.UPGRADES) if (A.upAvailable(s, u) && s.fish >= u.cost) { if (A.buyUpgrade(s, u.id)) bought = true; }
        // bâtiment le moins cher en proportion du gain
        let best = -1, bs = Infinity;
        for (let i = 0; i < A.BLD.length; i++) { const cost = A.costN(i, s.b[i], 1); if (cost > s.fish) continue; const sc = cost / A.BLD[i].cps; if (sc < bs) { bs = sc; best = i; } }
        if (best >= 0) { A.buyBuilding(s, best, 1); bought = true; }
      }
      if (A.canFight(s) && !s.rt.fight) { const cb = A.currentBoss(s).b; const hp = cb.th / 120 * A.C(s).bossHp; if ((0.3 * A.cpsNow(s) + cps * A.C(s).click * 0.5) * 60 * A.C(s).bossDmg > hp) A.startFight(s); }
    }
    A.dirty(s);
    if (s.ending && !marks.find(m => m[1] === 'FIN')) marks.push([A.fmtTime(s.play), 'FIN', 'fish=' + A.fmt(s.run.fish)]);
    if (Object.keys(s.beaten).length === 12) break;
  }
  console.log(`\n== ${label} (${cps} clics/s) ==`); marks.forEach(m => console.log(m.join('  ')));
  console.log('fin :', A.fmtTime(s.play), 'run.fish', A.fmt(s.run.fish), 'cps', A.fmt(A.cpsNow(s)), 'souls potentielles', A.prestigeGain(s), 'succès', Object.keys(s.ach).length + '/' + A.ACH.length);
  return s;
}
const s = run(30, 5, 'actif');
run(30, 0, 'passif pur (sans clic)');
// sauvegarde / chargement
const copy = A.deserialize(A.serialize(s));
console.assert(copy.run.fish === s.run.fish && Object.keys(copy.up).length === Object.keys(s.up).length, 'save roundtrip');
const imp = A.importSave(A.exportSave(s)); console.assert(imp.fish === s.fish, 'export roundtrip');
console.log('upgrades:', A.UPGRADES.length, 'achievements:', A.ACH.length, 'fish:', A.FISH.length, 'skins:', A.SKINS.length);
console.log('bâtiments:', s.b.join(','), '| upgrades', Object.keys(s.up).length, '/', A.UPGRADES.length, '| banque', A.fmt(s.fish), '| armes', JSON.stringify(s.wp.lv), 'G=', A.fmt(A.C(s).G), 'cps(base)', A.fmt(A.C(s).cps));
