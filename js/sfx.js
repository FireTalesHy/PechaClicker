/* Gestionnaire de sons (vrais fichiers WAV via HTMLAudioElement, aucune synthèse) — basé sur SoundWeaver */
const SFX = (() => {
  const pool = {}; let master = 0.5, muted = false, last = {};
  function load(id) { if (!pool[id] && typeof Audio !== 'undefined' && SFX_DATA[id]) { const a = new Audio(); a.preload = 'auto'; a.src = SFX_DATA[id]; pool[id] = a; } return pool[id]; }
  return {
    init(vol, mute) { master = vol; muted = mute; Object.keys(SFX_DATA).forEach(load); },
    play(id, o) {
      if (muted || master <= 0) return;
      const now = performance.now(); if (now - (last[id] || 0) < 45) return; last[id] = now; // anti-saturation
      const base = load(id); if (!base) return;
      const n = base.cloneNode(true); n.volume = Math.min(1, Math.max(0, ((o && o.volume) || SFX_VOL[id] || 0.4) * master * 2));
      if (o && o.rate) n.playbackRate = o.rate;
      const p = n.play(); if (p && p.catch) p.catch(() => {});
    },
    set(vol, mute) { master = vol; muted = mute; },
  };
})();
