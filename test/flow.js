/* Test navigateur : sauvegarde/rechargement, langue, achat, renaissance, mobile, sauvegarde corrompue. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const url = 'file://' + path.resolve(__dirname, '../index.html'), errs = [], b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errs.push(m.text()));
  await p.route('**/fonts.g*/**', r => r.abort());
  await p.goto(url); await p.evaluate(() => { for (let i = 0; i < 6; i++) document.querySelector('[data-mb="0"]') && document.querySelector('[data-mb="0"]').click(); });
  await p.evaluate(() => closeModal());
  await p.evaluate(() => { S.fish = 1e6; buyBuilding(S, 0, 10); buyBuilding(S, 1, 5); setLang('en'); saveGame(); });
  await p.reload(); await p.evaluate(() => closeModal());
  const r = await p.evaluate(() => ({ lang: LANG, b: S.b.slice(0, 3), title: document.querySelector('.tab em').textContent }));
  console.log('rechargement :', JSON.stringify(r)); if (r.lang !== 'en' || r.b[0] !== 10) errs.push('save non restaurée');
  // renaissance
  await p.evaluate(() => { S.run.fish = 8e12; S.b[0] = 50; dirty(S); });
  const g = await p.evaluate(() => { const g = doPrestige(S); return [g, S.souls, S.b[0], S.fish, S.prestiges]; }); console.log('renaissance [gain, âmes, cannes, poissons, renaissances] :', JSON.stringify(g)); if (!(g[0] >= 2)) errs.push('prestige KO');
  // sauvegarde corrompue
  await p.evaluate(() => localStorage.setItem('pechaclicker.save', '{pas du json')); await p.reload();
  const ok = await p.evaluate(() => !!S && S.fish === 0); console.log('sauvegarde corrompue → nouvelle partie :', ok); if (!ok) errs.push('corrompue KO');
  // hors-ligne
  await p.evaluate(() => { closeModal(); S.b[0] = 100; dirty(S); const before = S.fish; const o = applyOffline(S, 99999999); window.__o = [o.secs, o.gain > 0]; });
  console.log('hors-ligne plafonné :', await p.evaluate(() => JSON.stringify(window.__o)));
  // sauvegardes malveillantes / obsolètes : jamais de plantage, jamais de HTML injecté
  const bad = await p.evaluate(() => {
    const evil = '{"sup":{"x":1},"up":{"zz":1},"wp":{"eq":"zz","owned":null},"unlocked":"a","world":"b","skin":"nope","skins":{"nope":{"own":true}},"opt":{"vol":"\\"><img src=x onerror=window.__xss=1>","buyN":"<b>"},"perles":"<i>","dex":null,"quests":[null,{"tpl":"q_x"}],"b":"zzz"}';
    const s = deserialize(evil); const c = C(s); refillQuests(s);
    return [Number.isFinite(c.cps), s.opt.vol, s.opt.buyN, s.skin, s.wp.eq, s.world, s.unlocked, s.perles, s.quests.length];
  }); console.log('sauvegarde malveillante assainie :', JSON.stringify(bad)); if (bad[0] !== true || bad[2] !== 1 || bad[3] !== 'classic' || bad[4] !== 'canne' || typeof bad[7] !== 'number') errs.push('assainissement KO');
  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), q = await m.newPage();
  q.on('pageerror', e => errs.push('mobile: ' + e.message)); await q.goto(url); await q.evaluate(() => closeModal()); await q.evaluate(() => { S.fish = 5000; dirty(S); }); await q.waitForTimeout(500);
  await q.screenshot({ path: '/tmp/shots/mobile.png' });
  const sw = await q.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); console.log('mobile scrollWidth/innerWidth :', sw.join('/')); if (sw[0] > sw[1] + 1) errs.push('scroll horizontal mobile');
  console.log(errs.length ? 'ERREURS: ' + errs.join(' | ') : 'OK : flux complets sans erreur'); await b.close();
})();
