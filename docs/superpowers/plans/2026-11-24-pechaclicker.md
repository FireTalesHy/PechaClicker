# Pechaclicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Clicker pixel art FR/EN sur le thème de Pechadophin.
**Architecture:** données (`js/data.js`) + logique pure (`js/logic.js`) + rendu canvas (`js/art.js`) + UI DOM (`js/ui.js`) + sons (`js/sfx.js`) + boucle (`js/main.js`).
**Tech Stack:** JS/HTML/CSS vanilla, Playwright pour la vérification.
**Spec:** `docs/superpowers/specs/2026-11-24-pechaclicker-design.md`

## Global Constraints
- Aucune dépendance externe ; ouvrable en `file://` ; sauvegarde `localStorage` clé `pechaclicker.save`.

## Review Focus
- Sauvegarde corrompue ou vide → nouvelle partie sans plantage.
- Nombres très grands (≥1e24) → affichage lisible, pas de NaN.
- Achat en masse / max avec peu de poissons → rien d'acheté, pas de coût négatif.
- Reprise après longue absence → gain hors-ligne plafonné.
- Changement de langue en cours de combat de boss.

### Task 1: Données — `js/data.js` (bâtiments, mondes, boss, poissons, armes, skins, succès, quêtes)
- [ ] Écrire les données, vérifier : 12 bâtiments, 6 mondes, 12 boss, 36 poissons, 12 armes, 40 skins.
### Task 2: Logique — `js/logic.js` (économie, achats, boss, événements, prestige, caisses, sauvegarde)
- [ ] `test/sim.js` : un bot glouton atteint chaque boss ; temps par palier raisonnable.
### Task 3: Rendu — `js/art.js` (décors des 6 mondes, pêcheur et 40 skins, 36 poissons, dauphins, 12 boss)
### Task 4: UI + sons — `js/ui.js`, `js/sfx.js`, `style.css`, `index.html`
### Task 5: Vérification navigateur (Playwright, 0 erreur console, captures) puis revue de code et push sur `main`
