/* Test navigateur : sauvegarde/rechargement, langue, achat, renaissance, mobile, sauvegarde corrompue. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const url = 'file://' + path.resolve(__dirname, '../index.html'), errs = [], b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.evaluate(() => { for (let i = 0; i < 3; i++) document.querySelector('[data-mb="0"]') && document.querySelector('[data-mb="0"]').click(); });
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
  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), q = await m.newPage();
  q.on('pageerror', e => errs.push('mobile: ' + e.message)); await q.goto(url); await q.evaluate(() => closeModal()); await q.evaluate(() => { S.fish = 5000; dirty(S); }); await q.waitForTimeout(500);
  await q.screenshot({ path: '/tmp/shots/mobile.png' });
  const sw = await q.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); console.log('mobile scrollWidth/innerWidth :', sw.join('/')); if (sw[0] > sw[1] + 1) errs.push('scroll horizontal mobile');
  console.log(errs.length ? 'ERREURS: ' + errs.join(' | ') : 'OK : flux complets sans erreur'); await b.close();
})();
