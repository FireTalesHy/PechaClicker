# Pechaclicker — design

## Intent
Un clicker 2D en pixel art, cosy et très riche, dans l'univers de **Pechadophin** (pêcheur sans pantalon, dauphins qui dominent le monde, 6 mondes, 12 boss, 12 armes, caisses à skins). Inspirations : Cookie Clicker (bâtiments, paliers, prestige, événements dorés), Clicker Heroes (boss), Adventure Capitalist, Pokédex (Pêchédex).

## Décisions (utilisateur)
- Boucle : **pêche tranquille** (clic = prise, bâtiments automatiques). Les boss sont des défis ponctuels, sans pénalité.
- Visuel : pixel art. SpriteCook n'a pas pu se connecter dans cette session (proxy) → sprites dessinés en code (canvas), remplaçables par de vrais PNG plus tard.
- Contenu v1 : 6 mondes + 12 boss, prestige + âmes rouges, succès / quêtes / coffres / événements. Caisses à skins incluses (skins = bonus de production).
- FR + EN, sauvegarde locale (localStorage + export/import).
- Tout est poussé sur `main` de FireTalesHy/PechaClicker.

## Décisions (mes choix)
- HTML/CSS/JS classiques, sans build ni dépendance ; fichiers séparés (`js/`) ; sons SoundWeaver (WAV réels en base64, pas de synthèse) ; icônes d'interface en emoji.
- Logique pure (`data.js`, `logic.js`) sans DOM, pour la simuler en Node (`test/sim.js`).
- Boss : HP fixe = seuil / 50, 60 s, dégâts = clics + 30 % du débit passif.
- Prestige : âmes = ∛(poissons du run / 1e12), +3 % de production chacune.

## Non-goals
Pas de serveur, pas de comptes, pas de monétisation.
