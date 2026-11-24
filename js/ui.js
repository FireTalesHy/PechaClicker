/* Pechaclicker — interface DOM */
'use strict';
const $ = s => document.querySelector(s);
const tx = (fr, en) => (LANG === 'fr' ? fr : en);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FISH_ICO = '🐟';
let TAB = 'bld', lastHtml = '', modalOpen = false;

const TABS = [
  ['bld', '🏗️', 'Bâtiments', 'Buildings'], ['upg', '⬆️', 'Améliorations', 'Upgrades'], ['wp', '⚔️', 'Armes', 'Weapons'], ['map', '🗺️', 'Mondes & boss', 'Worlds & bosses'],
  ['dex', '📖', 'Pêchédex', 'Fishdex'], ['skin', '🎭', 'Skins & caisses', 'Skins & crates'], ['qst', '📜', 'Quêtes', 'Quests'], ['ach', '🏆', 'Succès', 'Achievements'],
  ['soul', '👻', 'Âmes', 'Souls'], ['stat', '📊', 'Stats', 'Stats'], ['opt', '⚙️', 'Options', 'Options'],
];

/* ------------------------------------------------------------------ OUTILS */
function toast(msg, cls) {
  const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.innerHTML = msg; $('#toasts').appendChild(d);
  setTimeout(() => d.classList.add('out'), 3800); setTimeout(() => d.remove(), 4300);
  while ($('#toasts').children.length > 5) $('#toasts').firstChild.remove();
}
function modal(o) {
  modalOpen = true; const m = $('#modal'); m.classList.add('show');
  m.innerHTML = `<div class="box"><h2>${o.title || ''}</h2><div class="mbody">${o.html || ''}</div><div class="mbtn">${(o.buttons || [{ t: 'OK' }]).map((b, i) => `<button class="btn ${b.cls || ''}" data-mb="${i}">${b.t}</button>`).join('')}</div></div>`;
  m.onclick = e => { const b = e.target.closest('[data-mb]'); if (!b) return; const bt = (o.buttons || [{ t: 'OK' }])[+b.dataset.mb]; if (bt.keep) { bt.fn && bt.fn(); return; } closeModal(); bt.fn && bt.fn(); };
}
function closeModal() { modalOpen = false; const m = $('#modal'); m.classList.remove('show'); m.innerHTML = ''; }
function story(lines, done) {
  let i = 0;
  const show = () => modal({ title: '🎣 Pechaclicker', html: `<p class="story">${esc(T(lines[i]))}</p>`, buttons: [{ t: i < lines.length - 1 ? tx('Suite ▶', 'Next ▶') : tx('C’est parti !', "Let's go!"), fn: () => { i++; if (i < lines.length) show(); else done && done(); } }] });
  show();
}
const bar = (v, max, cls) => `<div class="pbar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, v / max * 100)).toFixed(1)}%"></i></div>`;
const imgTag = (url, cls, title) => `<img class="${cls || ''}" src="${url}" alt="" ${title ? `title="${esc(title)}"` : ''}>`;

/* ------------------------------------------------------------------ BARRE DU HAUT */
function updateTop() {
  const c = C(S), cps = cpsNow(S);
  $('#r-fish').textContent = fmt(S.fish); $('#r-cps').textContent = fmt(cps) + '/s';
  $('#r-perles').textContent = fmt(S.perles); $('#r-souls').textContent = fmt(S.souls);
  $('#r-click').textContent = fmt(clickNow(S));
  const bf = S.buffs.filter(b => b.end > S.play);
  $('#buffs').innerHTML = bf.map(b => `<span class="buff">${b.id === 'shoal' ? '🐟' : b.id === 'rain' ? '🌧️' : '🌊'} ×${b.m} <small>${Math.ceil(b.end - S.play)}s</small></span>`).join('');
  document.title = fmt(S.fish) + ' 🐟 — Pechaclicker';
  // boss HUD
  const f = S.rt.fight, h = $('#bosshud');
  if (f) { h.classList.add('show'); h.innerHTML = `<div class="bn">${esc(T(f.boss.n))}</div>${bar(Math.max(0, f.hp), f.max, 'hp')}<div class="bt">${fmt(Math.max(0, f.hp))} / ${fmt(f.max)} · ⏱ ${Math.ceil(f.t)}s</div>`; } else h.classList.remove('show');
  // sélecteur de monde
  const wsel = $('#worlds');
  const key = S.unlocked + '|' + S.world + '|' + LANG + '|' + !!S.rt.fight;
  if (wsel.dataset.k !== key) { wsel.dataset.k = key; wsel.innerHTML = WORLDS.map((w, i) => `<button class="wbtn ${i === S.world ? 'on' : ''}" data-world="${i}" ${i >= S.unlocked || S.rt.fight ? 'disabled' : ''} title="${esc(T(w.n))}">${i < S.unlocked ? w.ico : '🔒'}</button>`).join(''); }
  const mod = $('#modtxt'); const mt = T(WORLDS[S.world].modT); if (mod.textContent !== mt) mod.textContent = T(WORLDS[S.world].n) + ' · ' + mt;
}

/* ------------------------------------------------------------------ ÉVÉNEMENTS (calque DOM) */
const evEls = new Map();
function syncEvents() {
  const layer = $('#events');
  for (const e of S.rt.events) if (!evEls.has(e)) {
    const def = EVENTS.find(x => x.id === e.id), b = document.createElement('button'); b.className = 'evt'; b.textContent = def.ico; b.title = T(def.n);
    b.style.left = (e.x * 100) + '%'; b.style.top = (e.y * 100) + '%'; b.onpointerdown = ev => { ev.stopPropagation(); onEvent(e); }; layer.appendChild(b); evEls.set(e, b);
  }
  for (const [e, el] of evEls) { if (!S.rt.events.includes(e)) { el.remove(); evEls.delete(e); } else el.style.opacity = e.life - e.age < 3 ? (Math.floor(e.age * 6) % 2 ? 0.4 : 1) : 1; }
}
function onEvent(e) {
  const r = clickEvent(S, e); SFX.play(r.def.id === 'chest' || r.def.id === 'pants' ? 'coin-double' : 'notification-gentle-bell');
  let m = `<b>${r.def.ico} ${esc(T(r.def.n))}</b><br>${esc(r.text)}`;
  if (r.fish) m += `<br>+${fmt(r.fish)} 🐟`; if (r.perles) m += ` +${r.perles} 🦪`;
  toast(m, 'tevt'); dirty(S); renderTab(true);
}

/* ------------------------------------------------------------------ ONGLETS */
function buildTabs() {
  $('#tabs').innerHTML = TABS.map(t => `<button class="tab ${t[0] === TAB ? 'on' : ''}" data-tab="${t[0]}" title="${tx(t[2], t[3])}"><span>${t[1]}</span><em>${tx(t[2], t[3])}</em></button>`).join('');
}
function setTab(k) { TAB = k; lastHtml = ''; buildTabs(); renderTab(true); SFX.play('tab-switch'); }

const R_TAB = { bld: rBld, upg: rUpg, wp: rWp, map: rMap, dex: rDex, skin: rSkin, qst: rQst, ach: rAch, soul: rSoul, stat: rStat, opt: rOpt };
function renderTab(force) {
  const h = R_TAB[TAB](); if (!force && h === lastHtml) return;
  const p = $('#content'), sc = p.scrollTop; p.innerHTML = h; p.scrollTop = sc; lastHtml = h;
  if (TAB === 'stat') bindChart();
}

/* --- bâtiments */
function rBld() {
  const c = C(S), n = S.opt.buyN;
  let h = `<div class="seg">${[1, 10, 100, 'max'].map(v => `<button class="${v === n ? 'on' : ''}" data-buyn="${v}">${v === 'max' ? 'MAX' : '×' + v}</button>`).join('')}</div>`;
  BLD.forEach((b, i) => {
    const prevOk = i === 0 || S.b[i - 1] > 0 || S.b[i] > 0 || S.run.fish >= b.cost * 0.4;
    if (!prevOk) { if (i === 0 || S.b[i - 1] || S.run.fish >= BLD[i - 1].cost * 0.4) h += `<div class="row lock"><span class="ico">❓</span><span class="inf"><b>???</b></span></div>`; return; }
    const q = n === 'max' ? Math.max(1, maxAfford(S, i)) : n, cost = costN(i, S.b[i], q), ok = S.fish >= cost && (n !== 'max' || maxAfford(S, i) > 0);
    const unit = b.cps * c.bm[i] * c.pm, tot = unit * S.b[i];
    h += `<button class="row ${ok ? 'ok' : ''}" data-buy="${i}"><span class="ico">${b.ico}</span><span class="inf"><b>${esc(T(b.n))}</b><i>${esc(T(b.d))}</i><small>+${fmt(unit)}/s ${tx('chacun', 'each')} · ${fmt(tot)}/s ${tx('au total', 'total')}${c.cps > 0 && tot > 0 ? ' (' + (tot / c.cps * 100).toFixed(0) + '%)' : ''}</small></span><span class="cnt">${S.b[i]}</span><span class="cost">${FISH_ICO} ${fmt(cost)}<small>×${q}</small></span></button>`;
  });
  return h;
}
/* --- améliorations */
function rUpg() {
  const av = UPGRADES.filter(u => upAvailable(S, u)).sort((a, b) => a.cost - b.cost);
  let h = `<p class="hint">${tx('Améliorations achetées', 'Upgrades owned')} : <b>${Object.keys(S.up).length}</b> / ${UPGRADES.length}</p>`;
  if (!av.length) h += `<p class="hint">${tx('Rien à acheter pour l’instant : achète des bâtiments pour débloquer des améliorations.', 'Nothing to buy yet: buy buildings to unlock upgrades.')}</p>`;
  av.slice(0, 40).forEach(u => { h += `<button class="row ${S.fish >= u.cost ? 'ok' : ''}" data-upg="${u.id}"><span class="ico">${u.ico}</span><span class="inf"><b>${esc(T(u.n))}</b><i>${esc(T(u.d))}</i></span><span class="cost">${FISH_ICO} ${fmt(u.cost)}</span></button>`; });
  if (av.length > 40) h += `<p class="hint">+${av.length - 40} ${tx('autres disponibles…', 'more available…')}</p>`;
  return h;
}
/* --- armes */
function rWp() {
  const c = C(S);
  return `<p class="hint">${tx('Une seule arme équipée à la fois. Chaque arme améliore ton clic et a un pouvoir qui grandit avec son niveau.', 'One weapon equipped at a time. Each weapon boosts your click and has a power that grows with level.')}</p>` + WEAPONS.map(w => {
    const own = S.wp.owned[w.id], lv = S.wp.lv[w.id] || 0, eq = S.wp.eq === w.id;
    let btn = '';
    if (!own) btn = `<button class="btn ${S.fish >= w.cost ? 'ok' : ''}" data-wbuy="${w.id}">${FISH_ICO} ${fmt(w.cost)}</button>`;
    else { btn = `<button class="btn ${eq ? 'on' : ''}" data-wequip="${w.id}">${eq ? tx('Équipée', 'Equipped') : tx('Équiper', 'Equip')}</button>`; btn += lv >= WEAPON_MAXLV ? `<span class="max">MAX</span>` : `<button class="btn ${S.fish >= weaponUpCost(S, w.id) ? 'ok' : ''}" data-wup="${w.id}">⬆ Nv.${lv + 1} · ${fmt(weaponUpCost(S, w.id))}</button>`; }
    return `<div class="card ${eq ? 'eq' : ''} ${own ? '' : 'dim'}"><span class="ico big">${w.ico}</span><div class="inf"><b>${esc(T(w.n))}</b> <small>${own ? 'Nv.' + lv + '/' + WEAPON_MAXLV : tx('Non acquise', 'Locked')}</small><i>${tx('Clic ×', 'Click ×')}${w.m} · ${esc(T(w.d))}</i></div><div class="btns">${btn}</div></div>`;
  }).join('');
}
/* --- mondes & boss */
function rMap() {
  const cb = currentBoss(S), c = C(S);
  let h = '';
  if (cb) {
    const b = cb.b, prog = Math.min(1, S.run.fish / b.th), ok = S.run.fish >= b.th, f = S.rt.fight;
    h += `<div class="card boss"><img class="bimg" src="${bossUrl(b)}" alt=""><div class="inf"><b>${cb.anar ? '☠️ ' : '🐬 '}${esc(T(b.n))}</b><i>${esc(T(b.pre))}</i>${bar(S.run.fish, b.th)}<small>${fmt(Math.min(S.run.fish, b.th))} / ${fmt(b.th)} ${tx('poissons pêchés ce run', 'fish this run')} · PV ${fmt(bossHp(b.th) * c.bossHp)} · ${BOSS_TIME}s</small></div><div class="btns"><button class="btn ${ok && !f ? 'ok' : ''}" data-fight="1" ${ok && !f ? '' : 'disabled'}>${f ? tx('Combat…', 'Fighting…') : tx('Affronter', 'Fight')}</button></div></div>`;
  } else h += `<p class="hint">${tx('Tous les boss sont vaincus !', 'All bosses defeated!')}</p>`;
  h += `<p class="hint">${tx('Pendant un combat, clique sur le boss : tes clics + 30 % de ton débit lui infligent des dégâts. Aucune pénalité en cas d’échec.', 'During a fight, click the boss: your clicks + 30% of your output deal damage. No penalty if you lose.')}</p>`;
  WORLDS.forEach((w, i) => {
    const un = i < S.unlocked, bs = BOSSES.filter(b => b.w === i);
    h += `<div class="card ${i === S.world ? 'eq' : ''} ${un ? '' : 'dim'}"><span class="ico big">${un ? w.ico : '🔒'}</span><div class="inf"><b>${esc(T(w.n))}</b><i>${un ? esc(T(w.intro)) : tx('Bats le 2e boss du monde précédent.', 'Defeat the previous world’s 2nd boss.')}</i><small>${esc(T(w.modT))} · 💎 ${S.treasures[i] ? '✔' : '?'}</small><div class="chips">${bs.map(b => `<span class="chip ${S.beaten[b.id] ? 'done' : ''}">${S.beaten[b.id] ? '✔' : '⚔'} ${esc(T(b.n))}</span>`).join('')}</div></div><div class="btns">${un ? `<button class="btn ${i === S.world ? 'on' : ''}" data-world="${i}" ${S.rt.fight ? 'disabled' : ''}>${i === S.world ? tx('Ici', 'Here') : tx('Aller', 'Go')}</button>` : ''}</div></div>`;
  });
  if (S.ending) h += `<p class="hint">☠️ ${tx('Mode Anarchie : boss vaincus', 'Anarchy mode: bosses defeated')} <b>${S.anarchy}</b></p>`;
  return h;
}
/* --- Pêchédex */
function rDex() {
  const c = C(S); let h = `<p class="hint">${tx('Espèces découvertes', 'Species found')} <b>${Object.keys(S.dex).length}/36</b> · ${tx('bonus de production', 'output bonus')} <b>+${(c.dexPct * 100).toFixed(0)}%</b> <small>(${tx('25 prises = +1 % · monde complet = +5 %', '25 catches = +1% · full world = +5%')})</small></p>`;
  WORLDS.forEach((w, wi) => {
    h += `<h3>${w.ico} ${esc(T(w.n))}</h3><div class="grid6">` + FISH.slice(wi * 6, wi * 6 + 6).map(f => {
      const n = S.dex[f.id]; return `<div class="fcard ${n ? '' : 'unk'}" title="${n ? esc(T(f.n)) : '???'}">${imgTag(fishUrl(f), 'fimg')}<b>${n ? esc(T(f.n)) : '???'}</b><small style="color:${RAR_COL[f.rar]}">${esc(T(RAR[f.rar]))}</small><small>${n ? '×' + fmt(n) + (n >= 25 ? ' ★' : '') : '—'}</small></div>`;
    }).join('') + '</div>';
  });
  return h;
}
/* --- skins & caisses */
function rSkin() {
  const c = C(S), pants = hasPants(S), owned = SKINS.filter(k => S.skins[k.id] && S.skins[k.id].own).length;
  let h = `<p class="hint">${tx('Skins', 'Skins')} <b>${owned}/${SKINS.length}</b> · ${tx('bonus', 'bonus')} <b>+${(c.skinPct * 100).toFixed(1)}%</b> · 🦪 <b>${S.perles}</b></p>`;
  h += `<div class="crates">` + [['hero', '📦', 'Caisse Héros', 'Hero crate'], ['villain', '🎁', 'Caisse Vilain', 'Villain crate']].map(k => `<div class="crate"><span class="ico big">${k[1]}</span><b>${tx(k[2], k[3])}</b><small>${CRATE_COST} 🦪 · 3 ${tx('fragments', 'fragments')}</small><div class="btns">${[1, 2, 4].map(n => `<button class="btn ${S.perles >= CRATE_COST * n ? 'ok' : ''}" data-crate="${k[0]}:${n}">×${n}</button>`).join('')}</div></div>`).join('') + `</div>`;
  ['hero', 'villain', 'premium'].forEach(cr => {
    h += `<h3>${cr === 'hero' ? tx('Héros', 'Heroes') : cr === 'villain' ? tx('Vilains', 'Villains') : '⭐ Premium'}</h3><div class="grid6">` + SKINS.filter(k => k.crate === cr).map(k => {
      const e = S.skins[k.id] || { frag: 0, own: false }, need = k.rar < 4 ? SKIN_NEED[k.rar] : 0;
      return `<button class="fcard skin ${e.own ? '' : 'unk'} ${S.skin === k.id ? 'sel' : ''}" data-skin="${k.id}" title="${esc(T(k.n))}">${imgTag(skinUrl(k, pants), 'simg')}<b>${esc(T(k.n))}</b><small style="color:${RAR_COL[k.rar]}">${e.own ? '+' + (SKIN_BONUS[k.rar] * 100).toFixed(1) + '%' : need ? e.frag + '/' + need : ''}</small>${!e.own && PREMIUM_HINT[k.id] ? `<small class="ph">${esc(T(PREMIUM_HINT[k.id]))}</small>` : ''}</button>`;
    }).join('') + '</div>';
  });
  h += `<h3>${tx('Équiper', 'Equip')}</h3><button class="btn ${S.skin === 'default' ? 'on' : ''}" data-skin="default">${tx('Pêcheur sans pantalon (par défaut)', 'Pantless fisherman (default)')}</button>`;
  h += `<p class="hint">👖 ${tx('Pantalon', 'Pants')} ${Math.min(S.st.pants, PANTS_NEEDED)}/${PANTS_NEEDED} ${hasPants(S) ? '✔' : ''}</p>`;
  return h;
}
/* --- quêtes */
function rQst() {
  let h = `<p class="hint">${tx('Quêtes terminées', 'Quests done')} <b>${S.st.quests}</b> · ${tx('Récompense : 2 🦪 + du poisson', 'Reward: 2 🦪 + fish')}</p>`;
  S.quests.forEach((q, i) => {
    const tpl = QUEST_TPL.find(t => t.id === q.tpl), p = questProgress(S, q), done = p >= q.target;
    h += `<div class="card ${done ? 'eq' : ''}"><span class="ico big">${tpl.ico}</span><div class="inf"><b>${esc(T(tpl.n).replace('{n}', fmt(q.target)))}</b>${bar(p, q.target)}<small>${fmt(p)} / ${fmt(q.target)}</small></div><div class="btns"><button class="btn ${done ? 'ok' : ''}" data-claim="${i}" ${done ? '' : 'disabled'}>${tx('Réclamer', 'Claim')}</button></div></div>`;
  });
  h += `<h3>👖 ${tx('Le pantalon perdu', 'The lost pants')}</h3><div class="card"><span class="ico big">👖</span><div class="inf"><b>${Math.min(S.st.pants, PANTS_NEEDED)} / ${PANTS_NEEDED}</b>${bar(S.st.pants, PANTS_NEEDED)}<i>${tx('Les morceaux apparaissent parfois dans les événements. Réunis-les pour que le pêcheur s’habille enfin.', 'Pieces sometimes show up in events. Collect them so the fisherman can finally dress.')}</i></div></div>`;
  h += `<h3>💎 ${tx('Trésors cachés', 'Hidden treasures')}</h3><p class="hint">${WORLDS.map((w, i) => `${w.ico}${S.treasures[i] ? '✔' : '?'}`).join('  ')} — ${tx('cherche les scintillements dans chaque décor.', 'look for twinkles in each scenery.')}</p>`;
  return h;
}
/* --- succès */
function rAch() {
  const n = Object.keys(S.ach).length;
  return `<p class="hint">${tx('Succès', 'Achievements')} <b>${n}/${ACH.length}</b> · ${tx('bonus', 'bonus')} <b>+${(n * 0.5).toFixed(1)}%</b> ${tx('de production', 'output')}</p><div class="achgrid">` + ACH.map(a => `<div class="ach ${S.ach[a.id] ? 'got' : ''}" title="${esc(T(a.n) + ' — ' + T(a.d))}">${S.ach[a.id] ? a.ico : '🔒'}<span>${S.ach[a.id] ? esc(T(a.n)) : '???'}</span></div>`).join('') + `</div>`;
}
/* --- âmes (prestige) */
function rSoul() {
  const c = C(S), g = prestigeGain(S);
  let h = `<div class="card eq"><span class="ico big">👻</span><div class="inf"><b>${tx('Renaissance du pêcheur', 'Fisher’s rebirth')}</b><i>${tx('Repars de zéro : bâtiments, améliorations et poissons sont perdus. Tu gardes boss, mondes, armes, skins, Pêchédex, succès et perles, et tu gagnes des âmes rouges : +3 % de production chacune.', 'Start over: buildings, upgrades and fish are lost. You keep bosses, worlds, weapons, skins, Fishdex, achievements and pearls, and gain red souls: +3% output each.')}</i><small>${tx('Âmes à gagner', 'Souls to gain')} : <b>${g}</b> · ${tx('Âmes totales', 'Total souls')} : ${S.soulsEarned} (+${(c.soulPct * 100).toFixed(0)}%) · ${tx('Renaissances', 'Rebirths')} : ${S.prestiges}</small><small>${tx('Il faut 1 000 000 000 000 poissons ce run pour la 1re âme (∛ du total).', 'You need 1,000,000,000,000 fish this run for the 1st soul (cube root of total).')}</small></div><div class="btns"><button class="btn ${g > 0 ? 'ok' : ''}" data-prestige="1" ${g > 0 ? '' : 'disabled'}>${tx('Renaître', 'Rebirth')}</button></div></div>`;
  h += `<h3>${tx('Boutique d’âmes', 'Soul shop')} · 👻 <b>${S.souls}</b></h3>`;
  SOUL_UP.forEach(u => { const own = S.sup[u.id]; h += `<button class="row ${!own && S.souls >= u.cost ? 'ok' : ''} ${own ? 'owned' : ''}" data-sbuy="${u.id}" ${own ? 'disabled' : ''}><span class="ico">${u.ico}</span><span class="inf"><b>${esc(T(u.n))}</b><i>${esc(T(u.d))}</i></span><span class="cost">${own ? '✔' : '👻 ' + u.cost}</span></button>`; });
  return h;
}
/* --- stats + graphiques */
function rStat() {
  const c = C(S), s = S.st, h = S.hist.slice();
  const rows = [
    [tx('Poissons ce run', 'Fish this run'), fmt(S.run.fish)], [tx('Poissons au total', 'Fish overall'), fmt(s.fishTotal)], [tx('Clics', 'Clicks'), fmt(s.clicks)], [tx('Critiques', 'Crits'), fmt(s.crits)],
    [tx('Débit max', 'Peak output'), fmt(s.maxCps) + '/s'], [tx('Clic', 'Click'), fmt(c.click)], [tx('Critique', 'Crit'), (c.crit * 100).toFixed(0) + '% ×' + c.critm.toFixed(1)], [tx('Multiplicateur global', 'Global multiplier'), '×' + c.G.toFixed(2)],
    [tx('Événements cliqués', 'Events clicked'), s.events], [tx('Boss vaincus', 'Bosses defeated'), s.bossWins], [tx('Caisses ouvertes', 'Crates opened'), s.crates], [tx('Temps de jeu', 'Play time'), fmtTime(S.play)],
  ];
  let out = `<div class="stats">${rows.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;
  out += `<h3>${tx('Débit de pêche au fil du temps', 'Output over time')}</h3>${lineChart(h)}`;
  const parts = BLD.map((b, i) => ({ n: T(b.n), v: S.b[i] * b.cps * c.bm[i] * c.pm })).filter(p => p.v > 0).sort((a, b) => b.v - a.v), tot = parts.reduce((a, b) => a + b.v, 0);
  out += `<h3>${tx('Part de production par bâtiment', 'Output share by building')}</h3><div class="hbars">${parts.length ? parts.map(p => `<div class="hb"><span>${esc(p.n)}</span><div class="hbt"><i style="width:${(p.v / tot * 100).toFixed(1)}%"></i></div><b>${(p.v / tot * 100).toFixed(0)}%</b></div>`).join('') : `<p class="hint">${tx('Aucun bâtiment.', 'No buildings.')}</p>`}</div>`;
  return out;
}
function lineChart(h) {
  if (h.length < 2) return `<p class="hint">${tx('Le graphique apparaît après une minute de jeu.', 'The chart appears after a minute of play.')}</p>`;
  const W = 520, H = 190, m = { l: 46, r: 12, t: 12, b: 22 }, xs = h.map(p => p.t), ys = h.map(p => Math.log10(Math.max(1, p.v)));
  const x0 = xs[0], x1 = xs[xs.length - 1] || 1, ymax = Math.max(1, Math.ceil(Math.max(...ys)));
  const X_ = t => m.l + (t - x0) / Math.max(1, x1 - x0) * (W - m.l - m.r), Y_ = v => H - m.b - v / ymax * (H - m.t - m.b);
  const pts = h.map((p, i) => `${X_(p.t).toFixed(1)},${Y_(ys[i]).toFixed(1)}`).join(' ');
  let g = ''; for (let i = 0; i <= ymax; i += Math.max(1, Math.ceil(ymax / 5))) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y_(i)}" y2="${Y_(i)}" class="gl"/><text x="${m.l - 6}" y="${Y_(i) + 3}" text-anchor="end" class="ax">${i ? '10^' + i : '1'}</text>`;
  g += `<text x="${m.l}" y="${H - 5}" class="ax">${fmtTime(x0)}</text><text x="${W - m.r}" y="${H - 5}" text-anchor="end" class="ax">${fmtTime(x1)}</text>`;
  const rowsT = h.slice(-30).map(p => `<tr><td>${fmtTime(p.t)}</td><td>${fmt(p.v)}/s</td></tr>`).join('');
  return `<div class="chart"><svg id="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tx('Courbe du débit (échelle logarithmique)', 'Output curve (log scale)')}">${g}<polyline points="${pts}" class="ln"/><line id="cx" y1="${m.t}" y2="${H - m.b}" class="cx" style="display:none"/><circle id="cd" r="4" class="cd" style="display:none"/><rect id="chit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg><div id="ctip" class="ctip"></div><small class="hint">${tx('Échelle logarithmique (puissances de 10)', 'Log scale (powers of 10)')}</small><details><summary>${tx('Voir en tableau', 'View as table')}</summary><table class="tbl">${rowsT}</table></details></div>`;
}
function bindChart() {
  const svg = $('#chart'); if (!svg) return; const h = S.hist;
  const hit = $('#chit'), cx = $('#cx'), cd = $('#cd'), tip = $('#ctip'), W = 520, m = { l: 46, r: 12 };
  hit.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W; const f = Math.max(0, Math.min(1, (px - m.l) / (W - m.l - m.r))), i = Math.round(f * (h.length - 1)), p = h[i];
    const ys = h.map(q => Math.log10(Math.max(1, q.v))), ymax = Math.max(1, Math.ceil(Math.max(...ys))), x = m.l + i / Math.max(1, h.length - 1) * (W - m.l - m.r), y = 190 - 22 - ys[i] / ymax * (190 - 12 - 22);
    cx.setAttribute('x1', x); cx.setAttribute('x2', x); cx.style.display = ''; cd.setAttribute('cx', x); cd.setAttribute('cy', y); cd.style.display = '';
    tip.style.display = 'block'; tip.textContent = fmtTime(p.t) + ' — ' + fmt(p.v) + '/s'; tip.style.left = Math.min(r.width - 120, Math.max(0, x / W * r.width - 50)) + 'px';
  });
  hit.addEventListener('pointerleave', () => { cx.style.display = 'none'; cd.style.display = 'none'; tip.style.display = 'none'; });
}
/* --- options */
function rOpt() {
  return `<div class="opts">
  <label>🔊 ${tx('Volume', 'Volume')} <input type="range" id="o-vol" min="0" max="1" step="0.05" value="${S.opt.vol}"></label>
  <label><input type="checkbox" id="o-mute" ${S.opt.mute ? 'checked' : ''}> ${tx('Muet', 'Mute')}</label>
  <label>🌐 ${tx('Langue', 'Language')} <button class="btn" data-lang="fr">🇫🇷 Français</button> <button class="btn" data-lang="en">🇬🇧 English</button></label>
  <h3>${tx('Sauvegarde', 'Save')}</h3>
  <div class="btns"><button class="btn" data-save="1">💾 ${tx('Sauvegarder', 'Save')}</button><button class="btn" data-export="1">📤 ${tx('Exporter', 'Export')}</button><button class="btn" data-import="1">📥 ${tx('Importer', 'Import')}</button><button class="btn bad" data-reset="1">🗑️ ${tx('Tout effacer', 'Erase all')}</button></div>
  <p class="hint">${tx('Sauvegarde automatique toutes les 20 s dans ton navigateur.', 'Auto-saves every 20 s in your browser.')}</p>
  <h3>${tx('À propos', 'About')}</h3>
  <p class="hint">Pechaclicker v1.0 — ${tx('inspiré de', 'inspired by')} <a href="https://pechadophin.vercel.app/" target="_blank" rel="noopener">Pechadophin</a> (L'taleshy &amp; cocobat), Cookie Clicker, Clicker Heroes.<br>${tx('Sons : SoundWeaver (MIT). Pixel art dessiné en code.', 'Sounds: SoundWeaver (MIT). Pixel art drawn in code.')}</p></div>`;
}

/* ------------------------------------------------------------------ ACTIONS (délégation) */
function afterBuy() { dirty(S); updateTop(); renderTab(true); }
function onPanelClick(e) {
  const t = e.target.closest('[data-tab],[data-buyn],[data-buy],[data-upg],[data-wbuy],[data-wequip],[data-wup],[data-world],[data-fight],[data-skin],[data-crate],[data-claim],[data-prestige],[data-sbuy],[data-lang],[data-save],[data-export],[data-import],[data-reset]');
  if (!t) return; const d = t.dataset;
  if (d.tab) return setTab(d.tab);
  if (d.buyn) { S.opt.buyN = d.buyn === 'max' ? 'max' : +d.buyn; SFX.play('tap-light'); return afterBuy(); }
  if (d.buy !== undefined) { const n = buyBuilding(S, +d.buy, S.opt.buyN === 'max' ? Infinity : S.opt.buyN); SFX.play(n ? 'confirm-unlock' : 'disabled-blip'); if (n) Scene.addFloater('+' + n, 120, 100, '#7aff9a'); return afterBuy(); }
  if (d.upg) { SFX.play(buyUpgrade(S, d.upg) ? 'select-item' : 'disabled-blip'); return afterBuy(); }
  if (d.wbuy) { SFX.play(buyWeapon(S, d.wbuy) ? 'level-up' : 'disabled-blip'); return afterBuy(); }
  if (d.wequip) { equipWeapon(S, d.wequip); SFX.play('click-crisp-primary'); return afterBuy(); }
  if (d.wup) { SFX.play(upgradeWeapon(S, d.wup) ? 'xp-up' : 'disabled-blip'); return afterBuy(); }
  if (d.world !== undefined) { if (setWorld(S, +d.world)) { Scene.resetWorld(S.world); SFX.play('swipe'); } return afterBuy(); }
  if (d.fight) return beginFight();
  if (d.skin) { if (equipSkin(S, d.skin)) SFX.play('select-item'); else SFX.play('disabled-blip'); return afterBuy(); }
  if (d.crate) { const [k, n] = d.crate.split(':'); return openCrateUI(k, +n); }
  if (d.claim !== undefined) { const r = claimQuest(S, +d.claim); if (r) { SFX.play('coin-double'); toast(`📜 ${tx('Quête terminée', 'Quest complete')} ! +${r.perles} 🦪 +${fmt(r.fish)} 🐟`, 'tevt'); } return afterBuy(); }
  if (d.prestige) return confirmPrestige();
  if (d.sbuy) { SFX.play(soulBuy(S, d.sbuy) ? 'achievement' : 'disabled-blip'); return afterBuy(); }
  if (d.lang) { setLang(d.lang); return; }
  if (d.save) { saveGame(); toast(tx('Sauvegardé ✔', 'Saved ✔')); return; }
  if (d.export) { const code = exportSave(S); modal({ title: tx('Exporter', 'Export'), html: `<p>${tx('Copie ce code et garde-le précieusement :', 'Copy this code and keep it safe:')}</p><textarea readonly id="exp" rows="6">${code}</textarea>`, buttons: [{ t: tx('Copier', 'Copy'), keep: true, fn: () => { const x = $('#exp'); x.select(); try { document.execCommand('copy'); toast(tx('Copié ✔', 'Copied ✔')); } catch (_) { } } }, { t: tx('Fermer', 'Close') }] }); return; }
  if (d.import) { modal({ title: tx('Importer', 'Import'), html: `<textarea id="imp" rows="6" placeholder="${tx('Colle ton code ici', 'Paste your code here')}"></textarea>`, buttons: [{ t: tx('Importer', 'Import'), fn: () => { try { const ns = importSave($('#imp').value); S = ns; Scene.resetWorld(S.world); LANG = S.lang; saveGame(); fullRefresh(); toast(tx('Import réussi ✔', 'Import successful ✔')); } catch (_) { toast(tx('Code invalide', 'Invalid code'), 'bad'); } } }, { t: tx('Annuler', 'Cancel') }] }); return; }
  if (d.reset) { modal({ title: tx('Tout effacer ?', 'Erase everything?'), html: `<p>${tx('Cette action est définitive.', 'This cannot be undone.')}</p>`, buttons: [{ t: tx('Annuler', 'Cancel') }, { t: tx('Oui, tout effacer', 'Yes, erase all'), cls: 'bad', fn: () => modal({ title: tx('Dernière chance', 'Last chance'), html: `<p>${tx('Vraiment sûr ? Toute la progression disparaîtra.', 'Really sure? All progress will vanish.')}</p>`, buttons: [{ t: tx('Non', 'No') }, { t: tx('Effacer', 'Erase'), cls: 'bad', fn: () => { try { localStorage.removeItem(SAVE_KEY); } catch (_) { } S = newState(); S.lang = LANG; refillQuests(S); Scene.resetWorld(0); fullRefresh(); } }] }) }] }); return; }
}
function confirmPrestige() {
  const g = prestigeGain(S); if (g < 1) return;
  modal({ title: '👻 ' + tx('Renaître ?', 'Rebirth?'), html: `<p>${tx('Tu vas gagner', 'You will gain')} <b>${g}</b> ${tx('âmes rouges', 'red souls')} (+${(g * 3)}%).</p><p>${tx('Bâtiments, améliorations et poissons seront remis à zéro.', 'Buildings, upgrades and fish will be reset.')}</p>`, buttons: [{ t: tx('Annuler', 'Cancel') }, { t: tx('Renaître', 'Rebirth'), cls: 'ok', fn: () => { const got = doPrestige(S); SFX.play('level-up'); toast(`👻 +${got} ${tx('âmes', 'souls')}`, 'tevt'); saveGame(); fullRefresh(); } }] });
}
function setLang(l) { LANG = l; S.lang = l; document.documentElement.lang = l; fullRefresh(); }
function fullRefresh() { buildTabs(); applyStaticText(); lastHtml = ''; renderTab(true); updateTop(); $('#worlds').dataset.k = ''; }
function applyStaticText() {
  $('#l-fish').textContent = tx('poissons', 'fish'); $('#l-cps').textContent = tx('par seconde', 'per second'); $('#l-click').textContent = tx('par clic', 'per click');
  $('#hint').textContent = tx('Clique sur la scène pour pêcher ! (Espace aussi)', 'Click the scene to fish! (Space works too)');
}

/* ------------------------------------------------------------------ BOSS & CAISSES */
function beginFight() {
  const cb = currentBoss(S); if (!cb || !canFight(S)) return;
  modal({ title: '🐬 ' + T(cb.b.n), html: `<img class="bimg" src="${bossUrl(cb.b)}" alt=""><p class="story">${esc(T(cb.b.pre))}</p>`, buttons: [{ t: tx('Plus tard', 'Later') }, { t: tx('⚔ Combattre !', '⚔ Fight!'), cls: 'ok', fn: () => { if (startFight(S)) { SFX.play('modal-open-rise'); if (cb.b.w !== S.world && !cb.anar) { } renderTab(true); } } }] });
}
function bossResult(res) {
  if (!res) return;
  if (res === 'lose') { SFX.play('error-sharp-alert'); toast('💤 ' + tx('Le boss t’a échappé… Reviens plus fort !', 'The boss got away… Come back stronger!'), 'bad'); renderTab(true); return; }
  const r = JSON.parse(res.slice(4)), b = [...BOSSES, anarchyBoss(S)].find(x => x.id === r.id) || BOSSES[0];
  SFX.play('success-celebrate'); Scene.flash = 1; Scene.world = S.world; if (r.newWorld >= 0) Scene.resetWorld(S.world);
  let h = `<p class="story">${esc(T(b.post || ''))}</p><p>+${r.perles} 🦪 · +${fmt(r.fish)} 🐟 · +10% ${tx('de production', 'output')}</p>`;
  if (r.newWorld >= 0) h += `<p>🌍 <b>${tx('Nouveau monde', 'New world')} : ${WORLDS[r.newWorld].ico} ${esc(T(WORLDS[r.newWorld].n))}</b></p>`;
  modal({ title: '🏆 ' + tx('Victoire !', 'Victory!'), html: h, buttons: [{ t: 'OK', fn: () => { if (r.ending) story(STORY.end); } }] }); renderTab(true);
}
function openCrateUI(kind, n) {
  if (S.perles < CRATE_COST * n) { SFX.play('disabled-blip'); toast(tx('Pas assez de perles 🦪', 'Not enough pearls 🦪'), 'bad'); return; }
  const res = openCrates(S, kind, n); if (!res) return; const pants = hasPants(S), pool = crateSkins(kind);
  modal({ title: tx('Ouverture…', 'Opening…'), html: `<div class="slots">${res.map((r, i) => `<div class="slot" id="sl${i}"><img src="${skinUrl(pool[0], pants)}" alt=""><small></small></div>`).join('')}</div>`, buttons: [] });
  $('#modal .mbtn').innerHTML = '';
  let done = 0;
  res.forEach((r, i) => {
    let k = 0; const el = $('#sl' + i), im = el.querySelector('img'), iv = setInterval(() => { im.src = skinUrl(pool[(k++ * 7 + i) % pool.length], pants); SFX.play('tap-light', { rate: 1 + (k % 5) * 0.05 }); }, 90);
    setTimeout(() => {
      clearInterval(iv); const sk = SKINS.find(x => x.id === r.id); im.src = skinUrl(sk, pants); el.classList.add('done'); el.style.borderColor = RAR_COL[sk.rar];
      el.querySelector('small').innerHTML = `<b style="color:${RAR_COL[sk.rar]}">${esc(T(sk.n))}</b><br>${r.unlocked ? '🎉 ' + tx('Débloqué !', 'Unlocked!') : r.dup ? tx('Doublon → poissons', 'Duplicate → fish') : '+1 ' + tx('fragment', 'fragment')}`;
      SFX.play(r.unlocked ? 'achievement' : sk.rar >= 2 ? 'success-warm-chime' : 'pop-bubble');
      if (++done === res.length) { setTimeout(() => { $('#modal .mbtn').innerHTML = `<button class="btn ok" data-mb="0">OK</button>`; $('#modal').onclick = ev => { if (ev.target.closest('[data-mb]')) { closeModal(); renderTab(true); } }; }, 300); }
    }, 1100 + i * 650);
  });
}
