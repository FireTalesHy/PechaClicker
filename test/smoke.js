/* Test navigateur : charge le jeu, joue, parcourt tous les onglets, vérifie 0 erreur console. */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/shots';
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: out + '/01-intro.png' });
  for (let i = 0; i < 3; i++) { await p.click('[data-mb="0"]'); await p.waitForTimeout(150); }
  const box = await p.locator('#scene').boundingBox();
  for (let i = 0; i < 40; i++) { await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.6); await p.waitForTimeout(40); }
  await p.evaluate(() => { S.fish = 5e4; S.run.fish = 5e4; dirty(S); });
  await p.waitForTimeout(700);
  await p.screenshot({ path: out + '/02-jeu.png' });
  for (const t of ['bld', 'upg', 'wp', 'map', 'dex', 'skin', 'qst', 'ach', 'soul', 'stat', 'opt']) { await p.click(`[data-tab="${t}"]`); await p.waitForTimeout(250); await p.screenshot({ path: `${out}/tab-${t}.png` }); }
  // monde par monde
  await p.evaluate(() => { S.unlocked = 6; S.run.fish = 1e12; S.fish = 1e12; S.b = S.b.map(() => 20); dirty(S); });
  for (let w = 0; w < 6; w++) { await p.evaluate(w => { setWorld(S, w); Scene.resetWorld(w); }, w); await p.waitForTimeout(400); await p.screenshot({ path: `${out}/world-${w}.png`, clip: { x: box.x, y: box.y, width: box.width, height: box.height } }); }
  // boss
  await p.evaluate(() => { S.b = S.b.map(() => 0); S.up = {}; dirty(S); closeModal(); });
  for (let i = 0; i < 12; i++) {
    await p.evaluate(i => { S.beaten = {}; for (let k = 0; k < i; k++) S.beaten[BOSSES[k].id] = 1; S.run.fish = 1e22; S.rt.fight = null; setWorld(S, BOSSES[i].w); Scene.resetWorld(S.world); startFight(S); S.rt.fight.hp = S.rt.fight.max * 0.7; S.rt.fight.t = 999; }, i);
    await p.waitForTimeout(350); await p.screenshot({ path: `${out}/boss-${i}.png`, clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  }
  await p.evaluate(() => { S.rt.fight = null; closeModal(); });
  await p.evaluate(() => { S.perles = 40; renderTab(true); });
  await p.click('[data-tab="skin"]'); await p.click('[data-crate="hero:2"]'); await p.waitForTimeout(4000); await p.screenshot({ path: out + '/crate.png' });
  console.log(errs.length ? 'ERREURS:\n' + errs.join('\n') : 'OK : 0 erreur console');
  await b.close();
})();
