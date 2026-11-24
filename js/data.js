/* Pechaclicker — données du jeu (aucune dépendance au DOM) */
'use strict';
const L = (fr, en) => ({ fr, en });
let LANG = 'fr';
const T = o => (o == null ? '' : typeof o === 'string' ? o : (o[LANG] || o.fr));

/* ------------------------------------------------------------------ BÂTIMENTS */
const BLD = [
  { id: 'canne', ico: '🎣', n: L('Canne à pêche', 'Fishing rod'), cost: 15, cps: 0.1, d: L('Une canne plantée dans la rive. Elle pêche toute seule.', 'A rod stuck in the bank. Fishes by itself.') },
  { id: 'ponton', ico: '🪵', n: L('Ponton', 'Jetty'), cost: 100, cps: 1, d: L('Des planches branlantes, des poissons confiants.', 'Rickety planks, trusting fish.') },
  { id: 'filet', ico: '🕸️', n: L('Filet', 'Net'), cost: 1100, cps: 8, d: L('Tressé par la grand-mère du pêcheur.', "Woven by the fisherman's grandma.") },
  { id: 'barque', ico: '🛶', n: L('Barque', 'Rowboat'), cost: 12000, cps: 47, d: L('Elle fuit, mais elle revient toujours pleine.', 'It leaks, yet always returns full.') },
  { id: 'cormoran', ico: '🐦', n: L('Cormoran dressé', 'Trained cormorant'), cost: 130000, cps: 260, d: L('Plonge, avale, recrache. Pas de pourboire.', 'Dives, swallows, spits. Never tips.') },
  { id: 'chalutier', ico: '🚢', n: L('Chalutier', 'Trawler'), cost: 1.4e6, cps: 2100, d: L('Les dauphins le regardent passer, jaloux.', 'Dolphins watch it pass, jealous.') },
  { id: 'appat', ico: '🪱', n: L('Appât magique', 'Magic bait'), cost: 2e7, cps: 17550, d: L('Irrésistible, même pour un poisson-zombie.', 'Irresistible, even to a zombie fish.') },
  { id: 'cabane', ico: '🛖', n: L('Cabane de pêcheur', "Fisher's hut"), cost: 3.3e8, cps: 150000, d: L('Un toit, un hamac et une glacière géante.', 'A roof, a hammock and a giant cooler.') },
  { id: 'port', ico: '⚓', n: L('Port marchand', 'Trading port'), cost: 5.1e9, cps: 1.33e6, d: L('Les criées ne dorment jamais.', 'The fish markets never sleep.') },
  { id: 'sousmarin', ico: '🤿', n: L('Sous-marin', 'Submarine'), cost: 7.5e10, cps: 1.2e7, d: L('Pêche en profondeur, sans se mouiller les pieds.', 'Deep-sea fishing, dry feet.') },
  { id: 'phare', ico: '🗼', n: L('Phare des dauphins', 'Dolphin lighthouse'), cost: 1e12, cps: 1.14e8, d: L('Les poissons viennent à la lumière, les dauphins aussi.', 'Fish come to the light. So do dolphins.') },
  { id: 'cite', ico: '🏛️', n: L('Cité engloutie', 'Sunken city'), cost: 1.4e13, cps: 1.1e9, d: L("L'ancienne Cité des dauphins, réquisitionnée.", 'The old Dolphin City, requisitioned.') },
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const TIER_AT = [1, 5, 25, 50, 100, 150, 200];
const TIER_COST = [10, 50, 500, 5e3, 5e4, 5e6, 5e8];

/* ------------------------------------------------------------------ MONDES */
const WORLDS = [
  { id: 'plaines', ico: '🌾', n: L('Les Plaines', 'The Plains'), mod: { perle: 0.10 }, modT: L('+10 % de chances de perle', '+10% pearl chance'), intro: L("Il fait frais aux jambes... Mon pantalon doit être tombé tout près.", "It's chilly on the legs... My pants must have landed nearby.") },
  { id: 'plage', ico: '🏖️', n: L('La Plage', 'The Beach'), mod: { click: 0.25 }, modT: L('+25 % de puissance de clic', '+25% click power'), intro: L("Du sable plein les bottes et des dauphins plein la plage. Ils sont partout !", "Sand in my boots and dolphins all over the beach. They're everywhere!") },
  { id: 'marais', ico: '🐸', n: L('Les Marécages', 'The Swamps'), mod: { prod: 0.25 }, modT: L('+25 % de production des bâtiments', '+25% building output'), intro: L("Ça sent la vase et le poisson pas frais. On dit qu'une sorcière s'est alliée aux dauphins.", "It smells of mud and stale fish. They say a witch has sided with the dolphins.") },
  { id: 'glaciere', ico: '🧊', n: L('La Glacière', 'The Icebox'), mod: { crit: 0.10 }, modT: L('+10 % de chances de coup critique', '+10% crit chance'), intro: L("Brrr ! Heureusement que j'ai retrouvé mon pantalon.", "Brrr! Good thing I found my pants.") },
  { id: 'nuages', ico: '☁️', n: L('Le Monde Nuage', 'Cloud World'), mod: { event: 0.30 }, modT: L('+30 % de fréquence des événements', '+30% event frequency'), intro: L("Les dauphins volent, maintenant ?! Leur capitale doit être au bout des nuages.", "Dolphins fly now?! Their capital must be past the clouds.") },
  { id: 'cite', ico: '🔱', n: L('La Cité des dauphins', 'Dolphin City'), mod: { all: 0.30 }, modT: L('+30 % à tout', '+30% to everything'), intro: L("Leur capitale... Le palais du roi est tout au bout de la ville. On y est presque.", "Their capital... The king's palace is at the far end of town. Almost there.") },
];

/* ------------------------------------------------------------------ BOSS (2 par monde) */
const BOSSES = [
  { id: 'requin', w: 0, th: 2e3, n: L('Démon requin', 'Shark Demon'), pre: L("Les dauphins m'ont promis ta canne à pêche. Et tes jambes, si elles sont bonnes.", "The dolphins promised me your fishing rod. And your legs, if they taste good."), post: L("Le requin coule en grommelant. Le ciel redevient bleu.", 'The shark sinks, grumbling. The sky turns blue again.') },
  { id: 'poulpe', w: 0, th: 1.5e4, n: L('Poulpe géant', 'Giant Octopus'), pre: L("Huit bras, zéro pitié. La plage est aux dauphins, pêcheur.", "Eight arms, zero mercy. The beach belongs to the dolphins, fisherman."), post: L("Le poulpe t'offre un coup de tentacule amical. Le chemin de la plage s'ouvre.", 'The octopus gives you a friendly tentacle wave. The beach path opens.') },
  { id: 'meduse', w: 1, th: 3e5, n: L('Méduse', 'Jellyfish'), pre: L("Bzzz... Un pas de plus et je t'électrise le caleçon.", "Bzzz... One more step and I'll electrify your boxers."), post: L("La méduse s'éteint doucement. Quelle lumière !", 'The jellyfish dims gently. What a glow!') },
  { id: 'chateau', w: 1, th: 1e7, n: L('Château de sable', 'Sandcastle'), pre: L("Aucun pêcheur ne franchira mes remparts ! Enfin... sauf avec un seau d'eau.", "No fisherman shall pass my walls! Well... unless he has a bucket of water."), post: L("Le château s'effondre… en une adorable dune.", 'The castle crumbles… into an adorable dune.') },
  { id: 'vache', w: 2, th: 5e8, n: L('Vache géante', 'Giant Cow'), pre: L("Meuuuh. Les dauphins m'ont dit que tu volais le lait. MEUUUH !", "Mooo. The dolphins told me you steal milk. MOOOO!"), post: L("Meuh. (Elle te laisse passer.)", 'Moo. (She lets you through.)') },
  { id: 'numero6', w: 2, th: 3e10, n: L('N°6', 'No. 6'), pre: L("6 6 6 6 6 6. (Il ne sait dire que ça.)", "6 6 6 6 6 6. (That's all it can say.)"), post: L("N°6 te lègue son arme. Elle sent la vase.", 'No. 6 bequeaths you his weapon. It smells of mud.') },
  { id: 'sorciere', w: 3, th: 1e12, n: L('Sorcière', 'Witch'), pre: L("Le roi des dauphins paie bien. Goûte donc à mes potions !", "The dolphin king pays well. Have a taste of my potions!"), post: L("La sorcière fond en un petit tas de givre.", 'The witch melts into a little pile of frost.') },
  { id: 'esquimau', w: 3, th: 4e14, n: L('Esquimau', 'Eskimo'), pre: L("Les dauphins m'ont donné ce sceptre. Tu vas finir en glaçon !", "The dolphins gave me this scepter. You'll end up an ice cube!"), post: L("L'esquimau te laisse son sceptre de glace et son thermos.", 'The Eskimo leaves you his ice scepter and his thermos.') },
  { id: 'cacamille', w: 4, th: 3e16, n: L('Roi Cacamille 2', 'King Cacamille II'), pre: L("Je ne suis qu'un roi de pacotille... le vrai roi, c'est un dauphin. Mais je défendrai son passage !", "I'm only a puppet king... the real one is a dolphin. But I'll guard his way!"), post: L("Le Roi Cacamille 2 abdique avec un grand soupir parfumé.", 'King Cacamille II abdicates with a great fragrant sigh.') },
  { id: 'nuagedauphin', w: 4, th: 8e17, n: L('Dauphin des nuages', 'Cloud Dolphin'), pre: L("Personne ne monte plus haut que les dauphins. Redescends... en chute libre !", "No one climbs higher than the dolphins. Go back down... in free fall!"), post: L("Le dauphin des nuages se dissout en pluie de poissons.", 'The Cloud Dolphin dissolves into a rain of fish.') },
  { id: 'meca', w: 5, th: 4e19, n: L('Méca-dauphin', 'Mecha-Dolphin'), pre: L("Le garde du palais. Acier, lasers, et un sifflet très aigu.", "The palace guard. Steel, lasers and a very shrill whistle."), post: L("Le Méca-dauphin fait « bip » et s'éteint. Le trône est libre d'accès.", 'The Mecha-Dolphin goes "beep" and shuts down. The throne awaits.') },
  { id: 'roi', w: 5, th: 3e21, n: L('Roi des dauphins', 'Dolphin King'), pre: L("« Pêcheur sans pantalon, tu as osé venir jusqu'ici. Je suis le roi de TOUS les dauphins ! »", '"Pantless fisherman, you dared come this far. I am king of ALL dolphins!"'), post: L("Le Roi des dauphins s'incline. Les océans sont à toi… et le pantalon aussi ?", "The Dolphin King bows. The oceans are yours… and the pants too?") },
];
const BOSS_TIME = 60;
const bossHp = th => th / 120;

/* ------------------------------------------------------------------ POISSONS (6 par monde) */
const RAR = [L('Commun', 'Common'), L('Peu commun', 'Uncommon'), L('Rare', 'Rare'), L('Épique', 'Epic'), L('Légendaire', 'Legendary')];
const RAR_COL = ['#9fb3c8', '#6bd16b', '#4aa3ff', '#b36bff', '#ffb02e'];
const FISH_W = [40, 28, 16, 10, 5, 1];
const FISH_M = [1, 1.5, 2.5, 5, 10, 50];
const FISH_R = [0, 0, 1, 2, 3, 4];
// [id, fr, en, body, belly, shape(0 fusiforme 1 rond 2 long 3 plat), accent]
const FISH_RAW = [
  [['gardon', 'Gardon', 'Roach', '#8aa0a8', '#dfe8ea', 0, '#e8553a'], ['ablette', 'Ablette', 'Bleak', '#a8c0c8', '#f0f6f6', 2, '#5d7a85'], ['carpe', 'Carpe', 'Carp', '#b8893f', '#f2d58a', 1, '#8a5a1f'], ['brochet', 'Brochet', 'Pike', '#5a8a4a', '#d6e8a8', 2, '#2f5a28'], ['truitedoree', 'Truite dorée', 'Golden trout', '#e8b82e', '#fff2b0', 0, '#c4561a'], ['anguille', 'Anguille arc-en-ciel', 'Rainbow eel', '#a24cff', '#4cffd9', 2, '#ff4cc8']],
  [['sardine', 'Sardine', 'Sardine', '#6f8fb0', '#e6eef6', 2, '#3a5878'], ['maquereau', 'Maquereau', 'Mackerel', '#2f7a9e', '#e6f2f6', 0, '#16405a'], ['crabe', 'Crabe bleu', 'Blue crab', '#3a6fd6', '#a8c4f2', 1, '#e8553a'], ['hippocampe', 'Hippocampe', 'Seahorse', '#ffb347', '#ffe0a8', 3, '#c46a1a'], ['raie', 'Raie', 'Ray', '#7a6a9a', '#d8d0ea', 3, '#4a3a6a'], ['lune', 'Poisson-lune', 'Sunfish', '#c0c8d0', '#f4f6f8', 1, '#7a8a98']],
  [['tetard', 'Têtard géant', 'Giant tadpole', '#3f5a2f', '#8aa860', 1, '#1f2f14'], ['poissonchat', 'Poisson-chat', 'Catfish', '#6a5a3a', '#b8a67a', 2, '#3a2f1a'], ['zombie', 'Poisson-zombie', 'Zombie fish', '#7a9a6a', '#c8d8a8', 0, '#b8e8a0'], ['lamproie', 'Lamproie', 'Lamprey', '#4a4a5a', '#8a8a9a', 2, '#c04a4a'], ['lanterne', 'Poisson-lanterne', 'Lantern fish', '#2a4a5a', '#5a8a9a', 0, '#fff27a'], ['grenouille', 'Grenouille-pêcheuse', 'Frog-fisher', '#5ab04a', '#c8f09a', 1, '#ffe14a']],
  [['omble', 'Omble glacé', 'Frost char', '#9ec8e8', '#f0fbff', 0, '#4a8ac8'], ['morue', 'Morue givrée', 'Frosted cod', '#8a9a8a', '#e6efe6', 2, '#5a6a5a'], ['glace', 'Poisson-glace', 'Ice fish', '#cfeaff', '#ffffff', 0, '#8ac8f0'], ['narval', 'Narval nain', 'Dwarf narwhal', '#8aa0c0', '#e0eaf6', 2, '#f6f0d0'], ['lotte', 'Lotte des glaces', 'Ice monkfish', '#4a5a7a', '#8a9aba', 1, '#a8f0ff'], ['cristal', 'Poisson de cristal', 'Crystal fish', '#b8f0ff', '#ffffff', 3, '#ff9ae8']],
  [['pnuage', 'Poisson-nuage', 'Cloud fish', '#f4f8ff', '#ffffff', 1, '#b8c8e8'], ['eclair', 'Poisson-éclair', 'Lightning fish', '#ffe14a', '#fff8c0', 0, '#a84aff'], ['manta', 'Manta céleste', 'Sky manta', '#7a8ae8', '#cfd6ff', 3, '#3a3a9a'], ['ballon', 'Poisson-ballon', 'Balloon fish', '#ff7a9a', '#ffc8d6', 1, '#c8305a'], ['orage', 'Méduse d\'orage', 'Storm jelly', '#5a4a9a', '#9a8ada', 1, '#ffe14a'], ['filante', 'Poisson-étoile filante', 'Shooting-star fish', '#ffd24a', '#fff6c0', 0, '#ff6a9a']],
  [['royal', 'Poisson doré royal', 'Royal goldfish', '#ffb02e', '#ffe08a', 0, '#c4561a'], ['meca', 'Poisson mécanique', 'Clockwork fish', '#8a96a6', '#c8d0da', 0, '#e8553a'], ['perle', 'Poisson-perle', 'Pearl fish', '#f0e8f6', '#ffffff', 1, '#ff9ae8'], ['couronne', 'Poisson-couronne', 'Crown fish', '#4a2f8a', '#8a6ada', 0, '#ffd24a'], ['calamar', "Calamar d'or", 'Golden squid', '#ffd24a', '#fff2b0', 2, '#c49a1a'], ['pantalon', 'Poisson-pantalon', 'Pants-fish', '#2f5ac8', '#8aa8f0', 3, '#ffffff']],
];
const FISH = [];
FISH_RAW.forEach((ws, w) => ws.forEach((f, i) => FISH.push({ id: f[0], w, i, n: L(f[1], f[2]), body: f[3], belly: f[4], shape: f[5], acc: f[6], rar: FISH_R[i], mult: FISH_M[i], wt: FISH_W[i] })));

/* ------------------------------------------------------------------ ARMES (les 12 de Pechadophin) */
// s = effet spécial par niveau
const WEAPONS = [
  { id: 'canne', ico: '🎣', n: L('Canne', 'Rod'), cost: 0, m: 1, d: L('+2 % de débit passif par niveau.', '+2% passive output per level.'), s: { cps: 0.02 } },
  { id: 'tridentinf', ico: '🔱', n: L('Trident infernal', 'Infernal trident'), cost: 5e3, m: 1.6, d: L('+1,5 % de critiques par niveau.', '+1.5% crit chance per level.'), s: { crit: 0.015 } },
  { id: 'dagues', ico: '🗡️', n: L('Dagues de dash', 'Dash daggers'), cost: 4e4, m: 2.2, d: L('+4 % de chance de double prise par niveau.', '+4% double-catch chance per level.'), s: { dbl: 0.04 } },
  { id: 'numero6', ico: '6️⃣', n: L('Arme Numéro 6', 'Number 6 weapon'), cost: 3e5, m: 3, d: L('Un clic sur 6 est multiplié par 6 (+0,5 par niveau).', 'Every 6th click is ×6 (+0.5 per level).'), s: { nth: 6, nthM: 6, nthL: 0.5 } },
  { id: 'sceptre', ico: '🧊', n: L('Sceptre de glace', 'Ice scepter'), cost: 2e6, m: 4, d: L('+12 % de dégâts aux boss par niveau.', '+12% boss damage per level.'), s: { boss: 0.12 } },
  { id: 'tarot', ico: '🃏', n: L('Jeu de tarot', 'Tarot deck'), cost: 1.5e7, m: 6, d: L('+6 % de fréquence des événements par niveau.', '+6% event frequency per level.'), s: { event: 0.06 } },
  { id: 'harpon', ico: '🪝', n: L('Harpon', 'Harpoon'), cost: 1e8, m: 8, d: L('+0,4 de multiplicateur critique par niveau.', '+0.4 crit multiplier per level.'), s: { critM: 0.4 } },
  { id: 'katana', ico: '⚔️', n: L('Katana', 'Katana'), cost: 8e8, m: 12, d: L('+3 % de poissons rares par niveau.', '+3% rarer catches per level.'), s: { rare: 0.03 } },
  { id: 'boomerang', ico: '🪃', n: L('Boomerang', 'Boomerang'), cost: 6e9, m: 18, d: L('Revient : +1,5 % de ton débit en bonus par clic et par niveau.', 'Comes back: +1.5% of your output per click per level.'), s: { clickCps: 0.015 } },
  { id: 'tentacules', ico: '🐙', n: L('Tentacules', 'Tentacles'), cost: 5e10, m: 30, d: L("+3 % de chances de perle par niveau.", '+3% pearl chance per level.'), s: { perle: 0.03 } },
  { id: 'faux', ico: '🌙', n: L('Faux', 'Scythe'), cost: 4e11, m: 50, d: L('Combo en 4 coups : chaque 4e clic ×4 (+0,5 par niveau).', 'Four-hit combo: every 4th click ×4 (+0.5 per level).'), s: { nth: 4, nthM: 4, nthL: 0.5 } },
  { id: 'tridentroyal', ico: '👑', n: L('Trident royal', 'Royal trident'), cost: 5e12, m: 100, d: L('+2 % à toute la production par niveau.', '+2% to all production per level.'), s: { all: 0.02 } },
];
const WEAPON_MAXLV = 10;
const weaponLvCost = (w, lv) => Math.max(500, w.cost) * Math.pow(2.4, lv) * (lv === 0 && w.cost === 0 ? 1 : 0.3);

/* ------------------------------------------------------------------ SKINS (les vrais skins de Pechadophin) */
// [id, fr, en, caisse, rareté (0 commun … 3 légendaire, 4 premium), poids de tirage] — sprites : js/pd.js
const SKIN_RAW = [
  ['classic', 'Pêcheur', 'Fisherman', 'none', 0, 0],
  ['rnginf', 'RNG∞', 'RNG∞', 'premium', 4, 0],
  ['scarecrow', 'Épouvofodille', 'Scarecrodile', 'premium', 4, 0],
  ['dinopremium', 'Dino', 'Dino', 'premium', 4, 0],
  ['pirate', 'Pirate', 'Pirate', 'villain', 0, 25],
  ['zombie', 'Zombie', 'Zombie', 'villain', 0, 25],
  ['ninja', 'Ninja', 'Ninja', 'villain', 0, 25],
  ['plumber', 'Plombier', 'Plumber', 'hero', 0, 20],
  ['chef', 'Cuisinier', 'Chef', 'hero', 0, 17],
  ['cowboy', 'Cow-boy', 'Cowboy', 'hero', 1, 14],
  ['viking', 'Viking', 'Viking', 'hero', 1, 11],
  ['knight', 'Chevalier de l\'espace', 'Space knight', 'hero', 1, 9],
  ['robot', 'Robot', 'Robot', 'hero', 1, 8],
  ['wizard', 'Apprenti sorcier', 'Apprentice wizard', 'hero', 1, 6],
  ['unicorn', 'Licorne', 'Unicorn', 'hero', 2, 5],
  ['hero', 'Super-héros', 'Superhero', 'hero', 2, 5],
  ['pumpkin', 'Citrouille', 'Pumpkin', 'villain', 2, 4],
  ['ghost', 'Fantôme', 'Ghost', 'villain', 2, 4],
  ['shroom', 'Champignon', 'Mushroom', 'villain', 2, 4],
  ['astronaut', 'Astronaute', 'Astronaut', 'hero', 2, 3],
  ['alien', 'Alien', 'Alien', 'villain', 2, 3],
  ['angel', 'Ange', 'Angel', 'hero', 2, 3],
  ['pharaoh', 'Pharaon', 'Pharaoh', 'hero', 2, 3],
  ['icecream', 'Cornet de glace', 'Ice cream cone', 'hero', 2, 3],
  ['ghoul', 'Goule', 'Ghoul', 'villain', 3, 3],
  ['disco', 'Boule disco', 'Disco ball', 'villain', 3, 2],
  ['human', 'Humain', 'Human', 'hero', 3, 2],
  ['necro', 'Nécromancien', 'Necromancer', 'villain', 3, 2],
  ['dino', 'Costume de dino', 'Dino costume', 'villain', 3, 2],
  ['paladin', 'Paladin', 'Paladin', 'hero', 3, 2],
  ['mermaid', 'Sirène', 'Mermaid', 'hero', 3, 2],
  ['demon', 'Démon', 'Demon', 'villain', 3, 2],
  ['fairy', 'Fée', 'Fairy', 'hero', 3, 2],
  ['dragon', 'Dragon', 'Dragon', 'villain', 3, 2],
  ['vampire', 'Vampire', 'Vampire', 'villain', 3, 2],
  ['king', 'Roi', 'King', 'hero', 3, 2],
  ['clown', 'Clown', 'Clown', 'premium', 4, 0],
];
const SKINS = SKIN_RAW.map(s => ({ id: s[0], n: L(s[1], s[2]), crate: s[3], rar: s[4], w: s[5] }));
const FRAG_NEED = 6;
const SKIN_BONUS = [0.005, 0.01, 0.02, 0.03, 0.05];
const CRATE_COST = 6;
const PREMIUM_HINT = {
  clown: L('Trouve les 6 trésors cachés (un par monde, cherche les scintillements).', 'Find the 6 hidden treasures (one per world, look for twinkles).'),
  scarecrow: L('Fais ta 3e renaissance.', 'Complete your 3rd rebirth.'),
  rnginf: L('Fais 1 000 000 de clics.', 'Click 1,000,000 times.'),
  dinopremium: L('Complète tout le Pêchédex.', 'Complete the whole Fishdex.'),
};

/* ------------------------------------------------------------------ AMÉLIORATIONS */
// eff: {k:'bm', i:idx, v:2}  multiplicateur d'un bâtiment
//      {k:'g', v}  +% global ; {k:'cm', v} clic ×v ; {k:'cc', v} % du débit par clic
//      {k:'crit', v} {k:'critm', v} {k:'event', v} {k:'dur', v} {k:'perle', v} {k:'off', v}
const UPGRADES = [];
BLD.forEach((b, i) => TIER_AT.forEach((cnt, t) => UPGRADES.push({
  id: `b${i}_${t}`, ico: b.ico, n: L(`${b.n.fr} — rang ${ROMAN[t]}`, `${b.n.en} — rank ${ROMAN[t]}`),
  d: L(`${b.n.fr} ×2 de production.`, `${b.n.en} output ×2.`),
  cost: b.cost * TIER_COST[t], req: { b: i, n: cnt }, eff: { k: 'bm', i, v: 2 },
})));
const G_UP = [
  ['Soleil radieux', 'Radiant sun', 0.05, 5e3, 2e3], ['Vent favorable', 'Fair wind', 0.05, 5e5, 1e5], ['Eaux limpides', 'Clear waters', 0.05, 5e7, 1e7],
  ['Bonne étoile', 'Lucky star', 0.10, 5e9, 1e9], ['Marée montante', 'Rising tide', 0.10, 5e11, 1e11], ['Alliance des sirènes', 'Mermaid pact', 0.10, 5e13, 1e13],
  ['Courants dorés', 'Golden currents', 0.15, 5e15, 1e15], ['Bénédiction des dauphins', 'Dolphin blessing', 0.15, 5e17, 1e17], ['Ère du Roi', "King's era", 0.25, 5e19, 1e19], ['Pantalon cosmique', 'Cosmic pants', 0.5, 5e22, 1e22],
];
G_UP.forEach((g, i) => UPGRADES.push({ id: 'g' + i, ico: '✨', n: L(g[0], g[1]), d: L(`+${g[2] * 100} % de production globale.`, `+${g[2] * 100}% global output.`), cost: g[3], req: { f: g[4] }, eff: { k: 'g', v: g[2] } }));
const C_UP = [['Hameçon affûté', 'Sharp hook'], ['Fil renforcé', 'Strong line'], ['Moulinet huilé', 'Oiled reel'], ['Gants de pêche', 'Fishing gloves'], ['Biceps de marin', 'Sailor biceps'], ['Poignet de fer', 'Iron wrist'], ['Coup du Roi', "King's cast"], ['Lancer divin', 'Divine cast']];
C_UP.forEach((c, i) => UPGRADES.push({ id: 'c' + i, ico: '👆', n: L(c[0], c[1]), d: L('Clic ×2.', 'Click ×2.'), cost: [100, 500, 1e4, 1e5, 1e7, 1e9, 1e11, 1e13][i], req: { f: [20, 100, 2e3, 2e4, 2e6, 2e8, 2e10, 2e12][i] }, eff: { k: 'cm', v: 2 } }));
const K_UP = [['Doigts agiles', 'Nimble fingers'], ['Mille doigts', 'Thousand fingers'], ['Main dorée', 'Golden hand'], ['Mains de dauphin', 'Dolphin hands'], ['Toucher du Roi', "King's touch"]];
K_UP.forEach((c, i) => UPGRADES.push({ id: 'k' + i, ico: '🖐️', n: L(c[0], c[1]), d: L('Chaque clic rapporte +2 % de ton débit.', 'Each click adds +2% of your output.'), cost: [1e5, 1e7, 1e9, 1e11, 1e13][i], req: { f: [2e4, 2e6, 2e8, 2e10, 2e12][i] }, eff: { k: 'cc', v: 0.02 } }));
const MISC_UP = [
  ['Œil de lynx', 'Lynx eye', 'crit', 0.02, '+2 % de coups critiques.', '+2% crit chance.', [1e4, 1e6, 1e8, 1e10]],
  ['Coup fatal', 'Fatal blow', 'critm', 2, 'Critiques +2 de multiplicateur.', 'Crits +2 multiplier.', [1e6, 1e9, 1e12]],
  ['Jumelles', 'Binoculars', 'event', 0.25, '+25 % de fréquence des événements.', '+25% event frequency.', [5e4, 5e7, 5e10]],
  ['Panier profond', 'Deep basket', 'dur', 0.25, '+25 % de durée des bonus.', '+25% bonus duration.', [1e5, 1e8, 1e11]],
  ['Sac de perles', 'Pearl pouch', 'perle', 0.10, '+10 % de chances de perle.', '+10% pearl chance.', [2e6, 2e9, 2e12]],
  ['Sommeil du pêcheur', "Fisher's nap", 'off', 0.10, '+10 % de gain hors-ligne.', '+10% offline gains.', [3e5, 3e8, 3e11]],
];
MISC_UP.forEach((m, j) => m[6].forEach((c, i) => UPGRADES.push({ id: `m${j}_${i}`, ico: '🧰', n: L(`${m[0]} ${ROMAN[i]}`, `${m[1]} ${ROMAN[i]}`), d: L(m[4], m[5]), cost: c, req: { f: c / 8 }, eff: { k: m[2], v: m[3] } })));
const UP_BY_ID = {}; UPGRADES.forEach(u => UP_BY_ID[u.id] = u);

/* ------------------------------------------------------------------ BOUTIQUE D'ÂMES (permanent) */
const SOUL_UP = [
  { id: 's0', ico: '👻', n: L('Âme de pêcheur', "Fisher's soul"), d: L('Clic ×2.', 'Click ×2.'), cost: 1, eff: { k: 'cm', v: 2 } },
  { id: 's1', ico: '🎁', n: L('Offrande', 'Offering'), d: L('Démarre chaque vie avec 1 000 poissons.', 'Start each life with 1,000 fish.'), cost: 2, eff: { k: 'start', v: 1000 } },
  { id: 's2', ico: '🪵', n: L('Premiers jours', 'First days'), d: L('Démarre avec 10 cannes à pêche.', 'Start with 10 fishing rods.'), cost: 3, eff: { k: 'startb', v: 10 } },
  { id: 's3', ico: '⏳', n: L('Marée infinie', 'Endless tide'), d: L('Bonus ×1,5 plus longs.', 'Bonuses last 1.5× longer.'), cost: 4, eff: { k: 'dur', v: 0.5 } },
  { id: 's4', ico: '🎯', n: L('Visée parfaite', 'Perfect aim'), d: L('+5 % de critiques.', '+5% crit chance.'), cost: 5, eff: { k: 'crit', v: 0.05 } },
  { id: 's5', ico: '🦪', n: L('Trésor ancien', 'Ancient treasure'), d: L('+25 % de chances de perle.', '+25% pearl chance.'), cost: 8, eff: { k: 'perle', v: 0.25 } },
  { id: 's6', ico: '😴', n: L('Sommeil profond', 'Deep sleep'), d: L('+50 % de gain hors-ligne.', '+50% offline gains.'), cost: 10, eff: { k: 'off', v: 0.5 } },
  { id: 's7', ico: '🐬', n: L('Dauphin apprivoisé', 'Tamed dolphin'), d: L('Un dauphin clique 1 fois par seconde.', 'A dolphin clicks once per second.'), cost: 15, eff: { k: 'auto', v: 1 } },
  { id: 's8', ico: '👑', n: L('Pacte du Roi', "King's pact"), d: L('Les boss ont 25 % de PV en moins.', 'Bosses have 25% less HP.'), cost: 20, eff: { k: 'bosshp', v: 0.25 } },
  { id: 's9', ico: '🌍', n: L('Mémoire des mondes', 'World memory'), d: L('Les poissons du Pêchédex rapportent +50 %.', 'Fishdex bonuses +50%.'), cost: 25, eff: { k: 'dexb', v: 0.5 } },
  { id: 's10', ico: '👖', n: L('Pantalon enchanté', 'Enchanted pants'), d: L('Production ×1,5.', 'Output ×1.5.'), cost: 30, eff: { k: 'gm', v: 1.5 } },
  { id: 's11', ico: '🐬', n: L('Meute de dauphins', 'Dolphin pod'), d: L('Le dauphin clique 3 fois de plus par seconde.', 'The dolphin clicks 3 more times per second.'), cost: 40, eff: { k: 'auto', v: 3 } },
  { id: 's12', ico: '💀', n: L('Fortune des âmes', 'Soul fortune'), d: L('+10 % d’âmes à chaque renaissance.', '+10% souls per rebirth.'), cost: 50, eff: { k: 'soulg', v: 0.10 } },
  { id: 's13', ico: '🔱', n: L('Sceau du Roi', "King's seal"), d: L('Production ×2.', 'Output ×2.'), cost: 100, eff: { k: 'gm', v: 2 } },
];
const SOUL_PCT = 0.03;
const soulsFor = runFish => Math.floor(Math.cbrt(Math.max(0, runFish) / 1e12));

/* ------------------------------------------------------------------ ÉVÉNEMENTS */
const EVENTS = [
  { id: 'shoal', w: 28, ico: '🐟', n: L('Banc de poissons', 'Fish shoal'), d: L('Production ×7 pendant {s} s !', 'Output ×7 for {s}s!'), dur: 30 },
  { id: 'rain', w: 18, ico: '🌧️', n: L('Pluie de poissons', 'Fish rain'), d: L('Clics ×77 pendant {s} s !', 'Clicks ×77 for {s}s!'), dur: 15 },
  { id: 'tide', w: 18, ico: '🌊', n: L('Marée haute', 'High tide'), d: L('Production ×3 pendant {s} s.', 'Output ×3 for {s}s.'), dur: 60 },
  { id: 'chest', w: 20, ico: '🧰', n: L('Coffre au trésor', 'Treasure chest'), d: L('Un butin tombe du ciel !', 'Loot falls from the sky!'), dur: 0 },
  { id: 'bottle', w: 12, ico: '🍾', n: L('Bouteille à la mer', 'Message in a bottle'), d: L('Un message… et une perle.', 'A message… and a pearl.'), dur: 0 },
  { id: 'pants', w: 4, ico: '👖', n: L('Pantalon volant', 'Flying pants'), d: L('Un morceau de pantalon !', 'A piece of the pants!'), dur: 0 },
];
const PANTS_NEEDED = 10;
const BOTTLES = [
  L('« Le Roi des dauphins cache un pantalon dans son trône. » — Anonyme', '"The Dolphin King hides a pair of pants in his throne." — Anonymous'),
  L('« Ne mange jamais le poisson-zombie. » — Mon grand-père', '"Never eat the zombie fish." — My grandfather'),
  L("« La vache du marais est gentille. Le lait, non. »", '"The swamp cow is nice. The milk, not so much."'),
  L('« N°6 est un homme libre. » — N°6', '"No. 6 is a free man." — No. 6'),
  L("« Les trésors brillent. Regarde bien le décor. »", '"Treasures twinkle. Look closely at the scenery."'),
  L('« Un dauphin m\'a volé mon sandwich. » — Jean-Claude', '"A dolphin stole my sandwich." — Jean-Claude'),
  L('« Le pantalon est quelque part entre le monde 3 et le monde 6. »', '"The pants are somewhere between world 3 and world 6."'),
  L('« Pêche tranquille. Pêche longtemps. »', '"Fish calmly. Fish long."'),
];

/* ------------------------------------------------------------------ QUÊTES */
// stat = compteur à suivre ; t = fonction d'objectif (état -> nombre)
const QUEST_TPL = [
  { id: 'q_clicks', stat: 'clicks', ico: '👆', n: L('Lancer {n} fois la ligne', 'Cast the line {n} times'), t: s => Math.max(50, Math.round(Math.min(2000, 80 + s.st.clicks * 0.02) / 10) * 10) },
  { id: 'q_fish', stat: 'fishTotal', ico: '🐟', n: L('Pêcher {n} poissons', 'Catch {n} fish'), t: s => Math.max(500, calcRef(s).cps * 900) },
  { id: 'q_build', stat: 'bought', ico: '🏗️', n: L('Acheter {n} bâtiments', 'Buy {n} buildings'), t: s => 15 },
  { id: 'q_events', stat: 'events', ico: '✨', n: L('Cliquer {n} événements', 'Click {n} events'), t: s => 3 },
  { id: 'q_crit', stat: 'crits', ico: '💥', n: L('Réussir {n} critiques', 'Land {n} crits'), t: s => 25 },
  { id: 'q_dex', stat: 'species', ico: '📖', n: L('Découvrir {n} nouveaux poissons', 'Discover {n} new fish'), t: s => 2 },
  { id: 'q_crate', stat: 'crates', ico: '📦', n: L('Ouvrir {n} caisse', 'Open {n} crate'), t: s => 1 },
  { id: 'q_boss', stat: 'bossWins', ico: '🐬', n: L('Vaincre {n} boss', 'Defeat {n} boss'), t: s => 1 },
  { id: 'q_upg', stat: 'upgrades', ico: '⬆️', n: L('Acheter {n} améliorations', 'Buy {n} upgrades'), t: s => 5 },
];

/* ------------------------------------------------------------------ HISTOIRE */
const STORY = {
  intro: [
    L("Il était une fois un pêcheur, un ponton et une mer bien tranquille.", "Once upon a time there was a fisherman, a jetty and a very quiet sea."),
    L("Jusqu'au jour où les dauphins sortirent de l'eau... tous en même temps.", "Until the day the dolphins came out of the water... all at once."),
    L("En une nuit, ils prirent le contrôle du monde : les plaines, la plage, les marécages, la glace et même les nuages.", "In one night they took over the world: the plains, the beach, the swamps, the ice and even the clouds."),
    L("Hi hi hi ! Ce monde appartient désormais aux dauphins ! Et à leur roi : MOI !", "Hee hee hee! This world now belongs to the dolphins! And to their king: ME!"),
    L("Dans la panique, notre pêcheur perdit quelque chose de très précieux...", "In the panic, our fisherman lost something very precious..."),
    L("MON PANTALON !! Ces dauphins vont me le payer. Je vais jusqu'au palais de leur roi !", "MY PANTS!! Those dolphins will pay. I'm going all the way to their king's palace!"),
  ],
  end: [
    L("Le Roi des dauphins est vaincu. Les 6 mondes te reconnaissent.", 'The Dolphin King is defeated. All 6 worlds recognize you.'),
    L("Les dauphins organisent une fête. Tu n'es pas invité (pas de pantalon).", "The dolphins throw a party. You're not invited (no pants)."),
    L("Mais la pêche, elle, ne s'arrête jamais. Mode Anarchie débloqué : boss sans fin !", 'But fishing never ends. Anarchy mode unlocked: endless bosses!'),
  ],
};
const NEWS = [
  L('Un dauphin demande poliment un pantalon. Il se fait refuser.', 'A dolphin politely asks for pants. Gets refused.'),
  L('La mouette de la plage a été vue avec une canne. Enquête en cours.', 'The beach gull was spotted with a rod. Investigation ongoing.'),
  L('Cours du poisson-pantalon : en hausse de 12 %.', 'Pants-fish stock: up 12%.'),
  L("Le Roi Cacamille 2 dément avoir un problème d'hygiène.", 'King Cacamille II denies having a hygiene problem.'),
  L('Selon les experts, pêcher détend. Selon les poissons, beaucoup moins.', 'Experts say fishing relaxes. Fish disagree.'),
  L('La vache géante réclame un meilleur marais.', 'The giant cow demands a better swamp.'),
  L("N°6 n'est pas un numéro. Il insiste.", 'No. 6 is not a number. He insists.'),
  L("Un esquimau gagne le concours du plus long silence. Il ne le sait pas encore.", 'An Eskimo wins the longest-silence contest. He does not know yet.'),
  L('Le Méca-dauphin lance une mise à jour. Redémarrage dans 3 ans.', 'Mecha-Dolphin launches an update. Restart in 3 years.'),
  L('Découverte : le sable est surtout du sable.', 'Discovery: sand is mostly sand.'),
  L('Une sirène ouvre une boutique de pantalons. Succès mitigé.', 'A mermaid opens a pants shop. Mixed success.'),
  L("Le poulpe géant tricote six pulls. Il en reste deux.", 'The giant octopus is knitting six sweaters. Two to go.'),
  L("Les poissons-lanternes réclament l'électricité.", 'Lantern fish demand electricity.'),
  L("Météo : pluie de poissons à prévoir en début d'après-midi.", 'Weather: fish rain expected early afternoon.'),
  L('Le château de sable porte plainte contre la marée.', 'The sandcastle sues the tide.'),
  L('Un pêcheur sans pantalon a été vu en train de sourire. Mystère.', 'A pantless fisherman was seen smiling. Mystery.'),
  L('Les dauphins construisent un cinquième monde. Il est en nuages.', 'Dolphins build a fifth world. It is made of clouds.'),
  L("Dernière minute : le poisson-lune n'est pas la lune.", 'Breaking: the sunfish is not the sun.'),
  L('Le Roi des dauphins cherche un bon coiffeur.', 'The Dolphin King seeks a good hairdresser.'),
  L('Rappel : un clic par seconde, c’est déjà de la gym.', 'Reminder: a click a second is already exercise.'),
];
