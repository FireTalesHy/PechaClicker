/* Pechaclicker — point d'entrée et boucle de jeu */
'use strict';
let S = null;
function loadGame() { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return deserialize(raw); } catch (e) { console.warn('Sauvegarde illisible, nouvelle partie.', e); } return null; }
function saveGame() { try { localStorage.setItem(SAVE_KEY, serialize(S)); } catch (e) { /* stockage indisponible */ } }

const cv = $('#scene'), g2 = cv.getContext('2d');
function sceneXY(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * SW, (e.clientY - r.top) / r.height * SH]; }

function doClick(x, y) {
  if (modalOpen) return;
  const tp = TREASURE_POS[S.world];
  if (x !== undefined && !S.treasures[S.world] && Math.hypot(x - tp[0], y - tp[1]) < 14) {
    const r = clickTreasure(S, S.world); if (r) { SFX.play('coin-double'); Scene.addFloater('💎', tp[0], tp[1] - 6, '#fff', true); toast(`💎 ${tx('Trésor caché trouvé', 'Hidden treasure found')} ! +${fmt(r.fish)} 🐟 +${r.perles} 🦪`, 'tevt'); dirty(S); renderTab(true); return; }
  }
  if (S.rt.fight) {
    const r = fightClick(S); if (!r) return;
    Scene.shakeBoss = 1; Scene.flash = r.crit ? 1 : 0.4; Scene.addFloater((r.crit ? '💥 ' : '') + fmt(r.dmg), 330 + (Math.random() - 0.5) * 70, 90 + Math.random() * 30, r.crit ? '#ffd24a' : '#ffffff', r.crit);
    SFX.play(r.crit ? 'xp-up' : 'click-crisp-primary'); if (r.res) bossResult(r.res); return;
  }
  const o = clickCatch(S); Scene.catchFish(o.fish, o.crit);
  Scene.addFloater((o.crit ? '💥 ' : o.nth ? '⭐ ' : '') + '+' + fmt(o.gain), 250 + (Math.random() - 0.5) * 40, 160, o.crit ? '#ffd24a' : o.nth ? '#7aff9a' : '#ffffff', o.crit);
  SFX.play(o.crit ? 'xp-up' : 'click-soft-tap'); if (o.fish.rar >= 3) SFX.play('pop-bubble');
  if (o.perle) { SFX.play('coin-collect'); toast(`🦪 ${tx('Une perle !', 'A pearl!')} <small>${esc(T(o.fish.n))}</small>`, 'tevt'); }
  if (o.newSpecies) { toast(`📖 ${tx('Nouvelle espèce', 'New species')} : ${esc(T(o.fish.n))}`, 'tevt'); }
}
cv.addEventListener('pointerdown', e => { e.preventDefault(); const [x, y] = sceneXY(e); doClick(x, y); });
document.addEventListener('keydown', e => { if ((e.code === 'Space' || e.code === 'Enter') && !modalOpen && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); doClick(); } });
$('#panel').addEventListener('click', onPanelClick);
$('#worlds').addEventListener('click', onPanelClick);
$('#panel').addEventListener('input', e => {
  if (e.target.id === 'o-vol') { S.opt.vol = +e.target.value; SFX.set(S.opt.vol, S.opt.mute); SFX.play('tap-light'); }
  if (e.target.id === 'o-mute') { S.opt.mute = e.target.checked; SFX.set(S.opt.vol, S.opt.mute); }
  if (e.target.id === 'o-vol' || e.target.id === 'o-mute') $('#snd').textContent = S.opt.mute || S.opt.vol === 0 ? '🔇' : '🔊';
});
$('#snd').addEventListener('click', () => { S.opt.mute = !S.opt.mute; SFX.set(S.opt.vol, S.opt.mute); $('#snd').textContent = S.opt.mute ? '🔇' : '🔊'; SFX.play('tap-light'); lastHtml = ''; });
$('#lang').addEventListener('click', () => setLang(LANG === 'fr' ? 'en' : 'fr'));

function handleTick(ev) {
  for (const a of ev.ach) { toast(`🏆 <b>${esc(T(a.n))}</b><br><small>${esc(T(a.d))}</small>`, 'ach'); SFX.play('achievement'); }
  if (ev.prem) for (const id of ev.prem) { const sk = SKINS.find(k => k.id === id); toast(`🎭 ${tx('Skin débloqué', 'Skin unlocked')} : <b>${esc(T(sk.n))}</b>`, 'ach'); SFX.play('level-up'); }
  if (ev.events.length) SFX.play('notification-gentle-bell');
  if (ev.fight) bossResult(ev.fight);
}
function offlineReport(secs) {
  const o = applyOffline(S, secs); if (!o) return;
  modal({ title: '😴 ' + tx('Bon retour !', 'Welcome back!'), html: `<p>${tx('Pendant ton absence de', 'While you were away for')} <b>${fmtTime(o.secs)}</b>, ${tx('tes bâtiments ont pêché', 'your buildings caught')} <b>${fmt(o.gain)}</b> 🐟.</p>`, buttons: [{ t: 'OK' }] });
}

/* boucle */
let last = performance.now(), accUI = 0, accTab = 0, accSave = 0, accNews = 0;
function frame(now) {
  try { step(now); } catch (e) { console.error('Erreur de boucle', e); }
  requestAnimationFrame(frame);
}
function step(now) {
  let dt = (now - last) / 1000; last = now;
  if (dt > 3) { offlineReport(dt); dt = 0.05; }
  dt = Math.min(dt, 1);
  let rem = dt; while (rem > 0) { const d = Math.min(0.25, rem); handleTick(tick(S, d)); rem -= d; }
  Scene.update(dt); Scene.draw(g2, S, S.rt.fight);
  syncEvents();
  accUI += dt; if (accUI > 0.1) { accUI = 0; updateTop(); }
  accTab += dt; if (accTab > 0.5 && !modalOpen) { accTab = 0; renderTab(false); }
  accSave += dt; if (accSave > 20) { accSave = 0; saveGame(); }
  accNews += dt; if (accNews > 14) { accNews = 0; const n = $('#news'); n.classList.remove('in'); void n.offsetWidth; n.textContent = '📰 ' + T(NEWS[Math.floor(Math.random() * NEWS.length)]); n.classList.add('in'); }
}
function init() {
  S = loadGame() || newState(); LANG = S.lang || 'fr'; document.documentElement.lang = LANG;
  refillQuests(S); SFX.init(S.opt.vol, S.opt.mute); $('#snd').textContent = S.opt.mute ? '🔇' : '🔊';
  Scene.resetWorld(S.world); dirty(S); C(S);
  const away = (Date.now() - (S.last || Date.now())) / 1000; fullRefresh();
  $('#news').textContent = '📰 ' + T(NEWS[0]);
  if (!S.seen.intro) { S.seen.intro = 1; story(STORY.intro, saveGame); } else offlineReport(away);
  window.addEventListener('beforeunload', saveGame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
  requestAnimationFrame(t => { last = t; frame(t); });
}
init();
