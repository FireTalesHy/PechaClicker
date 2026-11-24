/* Sprites de Pechadophin (FireTalesHy/Pechadophin, MIT/idem projet) repris tels quels : moteur spr() à grille de caractères + palettes,
   skins, dauphins, boss et objets. Isolés dans une IIFE pour ne pas entrer en conflit avec les noms de art.js. */
const PD = (function () {
const T = 16, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function spr(rows,pal,outline){
  const w=Math.max(...rows.map(r=>r.length)),h=rows.length,pad=outline?1:0;
  const c=mk(w+pad*2,h+pad*2),g=c.getContext('2d');
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){
    const col=pal[rows[y][x]]; if(col){g.fillStyle=col;g.fillRect(x+pad,y+pad,1,1);}
  }
  if(outline){
    const W=c.width,H=c.height,d=g.getImageData(0,0,W,H).data;
    const sol=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0;
    g.fillStyle=pal.k||'#14182c';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)
      if(!sol(x,y)&&(sol(x-1,y)||sol(x+1,y)||sol(x,y-1)||sol(x,y+1))) g.fillRect(x,y,1,1);
  }
  return c;
}
function outlineRows(rows){   // contour noir automatique tout autour (skins de profil) : chaque case vide qui touche une couleur devient noire
  const g=rows.map(r=>r.split('')),at=(x,y)=>(g[y]&&g[y][x])||'.',col=c=>c!=='.'&&c!=='k';
  return g.map((r,y)=>r.map((c,x)=>c==='.'&&(col(at(x-1,y))||col(at(x+1,y))||col(at(x,y-1))||col(at(x,y+1))||col(at(x-1,y-1))||col(at(x+1,y-1))||col(at(x-1,y+1))||col(at(x+1,y+1)))?'k':c).join(''));
}
function tint(src,color){
  const c=mk(src.width,src.height),g=c.getContext('2d');
  g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c;
}

const PAL_P={k:'#14182c',h:'#ffd23f',H:'#e0a010',s:'#f6c19a',S:'#d98f66',b:'#3a78e0',B:'#27479a',n:'#7a4a21',p:'#3a78e0',w:'#ffffff',r:'#d63a3a',g:'#ffd23f',c:'#d92b3a',y:'#fff2a8'};
const LEGS={
 idle:["....kppk.kppk...","....kppk.kppk...","...knnnk.knnnk..","...kkkkk.kkkkk.."],
 a:["...kppk...kppk..","..kppk.....kppk.",".knnnk.....knnnk",".kkkkk.....kkkkk"],
 b:[".....kppppk.....",".....kppppk.....",".....knnnnk.....",".....kkkkkk....."],
 jump:["....kppk..kppk..","...kppk....kppk.","...knnk.....knnk","...kkkk.....kkkk"]};
/* Skins : archétypes de la pop culture (pirate, ninja, cow-boy, chevalier de l'espace, sorcier, super-héros, astronaute) */
const SKINS=[
 {id:'classic',name:'Pêcheur',price:0,rod:'#8a5a2b',pal:{},
  hat:["................",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kssssskssk...","...ksssssssSk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'pirate',name:'Pirate',price:2,rod:'#8a5a2b',
  pal:{h:'#34344a',H:'#1b1b28',w:'#f5f5f5',r:'#d63a3a',B:'#4a2f18',p:'#3a3f66',n:'#5a3a1e'},
  hat:["................",".....kkkkkk.....","....khhwhhhk....","...khhhhhhhhk...",".kHHHHHHHHHHHHk."],
  face:["...kssssssssk...","...kssskkkkssk..","...ksssssssSk...","....kkssssskk..."],
  torso:["...kwrwrwrwrk...","...krwrwrwrwssk.","...kBBBBBBBBk..."]},
 {id:'ninja',name:'Ninja',price:4,rod:'#4a3a2a',
  pal:{H:'#1c1c28',r:'#e0262e',b:'#2e3350',p:'#232639',n:'#1c1c28'},
  hat:["................","................",".....kkkkkk.....","....kHHHHHHk....","...kHHHHHHHHk..."],
  face:["...krrrrrrrrk...","...kHsssskssHk..","...kHHHHHHHHk...","....kkHHHHkk...."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...krrrrrrrrk..."]},
 {id:'cowboy',name:'Cow-boy',price:7,rod:'#8a5a2b',
  pal:{h:'#c8944f',H:'#8a5a2b',r:'#d63a3a',b:'#4a8fd0',B:'#5a3a1e',g:'#ffd23f',p:'#2f4f8f',n:'#5a3a1e'},
  hat:["................","....kkkkkkkk....","...khhhhhhhhk...",".kkHHHHHHHHHHkk.","kHHHHHHHHHHHHHHk"],
  face:["...kssssssssk...","...kssssskssk...","...ksssssssSk...","....krrrrrrk...."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...kBBBgBBBBk..."]},
 {id:'knight',name:"Chevalier de l'espace",price:11,rod:'#5ee6ff',glow:'#d6fbff',
  pal:{H:'#6b4a2a',b:'#d8c9a3',B:'#4a2f18',p:'#6b5a3a',n:'#3a2a18'},
  hat:["................",".....kkkkkk.....","....kHHHHHHk....","...kHHHHHHHHk...","..kHHHHHHHHHHk.."],
  face:["..kHHssssssHHk..","..kHHsssskssHk..","..kHHsssssssHk..","...kkHHHHHHkk..."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'wizard',name:'Apprenti sorcier',price:16,rod:'#d9b36a',glow:'#fff2a8',
  pal:{h:'#4b3a9a',H:'#33276e',b:'#2c3560',B:'#14182c',r:'#d63a3a',g:'#ffd23f',p:'#232846',n:'#1b1b28'},
  hat:[".......kk.......","......khhk......",".....khhhhk.....","...kkHHHHHHkk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kskksskkssk..","...ksssssssSk...","....krgrgrgk...."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'hero',name:'Super-héros',price:22,rod:'#8a5a2b',
  pal:{h:'#2057c8',H:'#14327a',c:'#d92b3a',b:'#2057c8',B:'#e0a010',g:'#ffd23f',p:'#2057c8',n:'#d92b3a'},
  hat:["................","................",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk..."],
  face:["...kssssssssk...","...kHHHHHwHHk...","...ksssssssSk...","....kkssssskk..."],
  torso:[".cckbbbgbbbbk...",".cckbbbbbbbbssk.",".cckBBBBBBBBk..."]},
 {id:'astronaut',name:'Astronaute',price:30,rod:'#b8c6d6',
  pal:{w:'#eef2fa',g:'#f2b630',y:'#fff2a8',r:'#e0383a',B:'#7a8aa3',p:'#eef2fa',n:'#6b7a90'},
  hat:["................",".....kkkkkk.....","....kwwwwwwk....","...kwwwwwwwwk...","..kwwwwwwwwwwk.."],
  face:["..kwwwwwwwwwwk..","..kwkyggggggwk..","..kwkgggggggwk..","...kkwwwwwwkk..."],
  torso:["...kwwrwwwwwk...","...kwwwwwwwwwwk.","...kBBBBBBBBk..."]},
 {id:'zombie',name:'Zombie',price:3,rod:'#6a5a3a',
  pal:{H:'#4a4a52',h:'#6a6a74',s:'#8fc46a',S:'#6b9a4a',b:'#6a7a86',B:'#46525c',p:'#4a5a6a',n:'#2a2a34'},
  hat:["................","................",".....kkkkkk.....","....kHhHhHHk....","...kHHhHHhHHk..."],
  face:["...kssssssssk...","...ksrsssskrsk..","...kssskkkksSk..","....kksssskk...."],
  torso:["...kbbbbbbbbk...","...kbBbbbbbssk..","...kBBBBBBBBk..."]},
 {id:'plumber',name:'Plombier',price:5,rod:'#8a5a2b',
  pal:{h:'#d92b3a',H:'#9a1a24',b:'#d92b3a',B:'#2f5bd0',g:'#ffd23f',p:'#2f5bd0',n:'#6b4a2a'},
  hat:["................",".....kkkkkk.....","....khhhhhhk....","...khhhwhhhhk...",".kHHHHHHHHHHHHk."],
  face:["...kssssssssk...","...kssssskssk...","...kssnnnnnSk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbBbbbbBssk..","...kBBgBBgBBk..."]},
 {id:'chef',name:'Cuisinier',price:6,rod:'#c9c9d4',
  pal:{b:'#f4f4f4',B:'#c9c9d4',r:'#d63a3a',p:'#3a3f66',n:'#2a2a34'},
  hat:[".....kwwwwk.....","....kwwwwwwk....","....kwwwwwwk....","...kkwwwwwwkk...","...kwwwwwwwwk..."],
  face:["...kssssssssk...","...kssssskssk...","...ksssssssSk...","....kkssssskk..."],
  torso:["...kbbrrrrbbk...","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'viking',name:'Viking',price:9,rod:'#8a5a2b',
  pal:{H:'#8a93a6',g:'#d9731e',b:'#7a5230',B:'#4a2f18',p:'#5a4a3a',n:'#3a2a18'},
  hat:["w..............w","wk....kkkk....kw","wkk..kHHHHk..kkw","..kkkHHHHHHkkk..","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kssssskssk...","..kggggggggggk..","..kkggggggggkk.."],
  torso:["...kbbbbbbbbk...","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'robot',name:'Robot',price:13,rod:'#5ee6ff',glow:'#d6fbff',
  pal:{h:'#c3ccd8',H:'#8a96a8',r:'#ff3b3b',y:'#ffe14d',b:'#aab4c4',B:'#6a768a',p:'#6a768a',n:'#3a4254'},
  hat:["................",".......kk.......","......krrk......","...kkkkkkkkkk...","...khhhhhhhhk..."],
  face:["...khHHHHHHhk...","...kHrrHHrrHk...","...kHHkkkkHHk...","....kkHHHHkk...."],
  torso:["...kbbbbbbbbk...","...kbbyybbbbHk..","...kBBBBBBBBk..."]},
 {id:'clown',name:'Clown',price:20000,souls:13,treasure:true,rod:'#d92b3a',
  pal:{h:'#ff8a2a',g:'#ffe14d',r:'#e0262e',s:'#fff6ee',S:'#e6d8cc',b:'#7a4ad8',B:'#4a2a98',p:'#f2b630',n:'#d92b3a'},
  hat:["................","...h.g.r.g.h....","..hhhgrrrghhh...","..hhhhgggrrhh...","...khhhhhhhhk..."],
  face:["...kssssssssk...","...kskssskssk...","...ksssrrsssk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbbgbbbbssk..","...kBBBBBBBBk..."]},
 {id:'ghost',name:'Fantôme',price:25,rod:'#c9d4ff',glow:'#eef2ff',
  pal:{w:'#f2f4ff',B:'#c3c9e6',p:'#f2f4ff',n:'#c3c9e6'},
  hat:["................",".....kkkkkk.....","....kwwwwwwk....","...kwwwwwwwwk...","..kwwwwwwwwwwk.."],
  face:["..kwwwwwwwwwwk..","..kwkkwwwwkkwk..","..kwkkwwwkkkwk..","...kwwwkkwwwk..."],
  torso:["..kwwwwwwwwwwk..","..kwwwwwwwwwwwk.","..kBBBBBBBBBBk.."]},
 {id:'pharaoh',name:'Pharaon',price:35,rod:'#ffd23f',glow:'#fff2a8',
  pal:{g:'#ffd23f',b:'#2f6fd0',B:'#e0a010',p:'#f4ecd0',n:'#c8a050'},
  hat:["................",".....kkkkkk.....","....kgbgbgbk....","...kgbgbgbgbk...","..kgbgbgbgbgbk.."],
  face:["..kgssssssssgk..","..kgsskssksgbk..","..kbssssssSsgk..","...kkbsssskbk..."],
  torso:["...kgggggggk....","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 {id:'dino',name:'Costume de dino',price:45,rod:'#5fbf5a',
  pal:{h:'#5fbf5a',H:'#3e8f3c',y:'#ffd23f',b:'#5fbf5a',B:'#3e8f3c',p:'#5fbf5a',n:'#3e8f3c'},
  hat:[".....y..y.......","....kyyyyyyk....","...khhhhhhhhk...","..khhhhhhhhhhk..","..kHhhhhhhhhHk.."],
  face:["..kHssssssssHk..","..kHsskssksHk...","..kHsssswwsHk...","...kkHHHHHHkk..."],
  torso:["...kbbbbbbbbk...","...kbbyyyybssk..","...kBBBBBBBBk..."]},
 {id:'king',name:'Roi',price:60,rod:'#ffd23f',glow:'#fff2a8',
  pal:{g:'#ffd23f',r:'#d63a3a',b:'#6a2fa8',B:'#3e1a6e',p:'#3e1a6e',n:'#ffd23f'},
  hat:["....g..g..g.....",".....gggggg.....","....kgrgrgrk....","...kgggggggk....","..kkkkkkkkkkk..."],
  face:["...kssssssssk...","...kssssskssk...","..kwwssssswwk...","..kwwwwwwwwk...."],
  torso:["..kwwwwwwwwwwk..","...kbbbbbbbbssk.","...kBBBBBBBBk..."]},
 /* Skins fantaisie : costumes hors du commun, certains laissent une traînée d'effets (fx) */
 {id:'unicorn',name:'Licorne',price:20,rod:'rainbow',glow:'#ffffff',fx:'rainbow',
  pal:{h:'#ff9ad8',H:'#b48cff',w:'#ffffff',g:'#ffd23f',b:'#ffffff',B:'#d8cfff',r:'#ff5a8a',c:'#5ad8ff',p:'#ffffff',n:'#ff9ad8',s:'#fff0e6',S:'#f0cfc4'},
  hat:['.......gg.......','......kggk......','....khhhwhhhk...','...khhHHhHHhhk..','..kHHhhHHhhHHHk.'],
  face:['...kssssssssk...','...kssssskssk...','...kssrssssrSk..','....kkssssskk...'],
  torso:['...kbbbbbbbbk...','...kbbbbbbbbssk.','...krgcrgcrgk...']},
 {id:'pumpkin',name:'Citrouille',price:24,rod:'#ff8a1e',glow:'#ffe14d',fx:'ember',
  pal:{g:'#4a8f2a',h:'#ff8a1e',H:'#d9650e',y:'#ffe14d',b:'#3a2a5e',B:'#241a3e',p:'#2a1f46',n:'#14101f',s:'#ff8a1e',S:'#d9650e'},
  hat:['.......gg.......','......kggk......','....kkhhhhkk....','...khhhhhhhhk...','..khhHhhhhHhhk..'],
  face:['..khhhhhhhhhhk..','..khyyhhhhyyhk..','..khyyhHHhyyhk..','...kyHyyyyHyk...'],
  torso:['...kbbbbbbbbk...','...kbbyBbbbbbk..','...kBBBBBBBBk...']},
 {id:'shroom',name:'Champignon',price:28,rod:'#c9a27a',glow:'#fff2a8',fx:'spore',
  pal:{r:'#e0383a',w:'#ffffff',b:'#f4e6c8',B:'#c9a27a',p:'#c9a27a',n:'#8a6a46',s:'#f6d9b8',S:'#d9b08a'},
  hat:['.....kkkkkk.....','...kkrrwrrrkk...','..krrrrrrrwrrk..','.krwrrrrrrrrrrk.','kkrrrrrwrrrrrkk.'],
  face:['...kssssssssk...','...kssssskssk...','...ksssssssSk...','....kkssssskk...'],
  torso:['...kbbbbbbbbk...','...kbbbbbbbbssk.','...kBBBBBBBBk...']},
 {id:'disco',name:'Boule disco',price:40,rod:'rainbow',glow:'#ffffff',fx:'disco',
  pal:{h:'#d9e2f2',H:'#9aa8c4',w:'#ffffff',c:'#5ad8ff',r:'#ff5ad8',g:'#ffe14d',b:'#ffd23f',B:'#c98a10',p:'#2a2a44',n:'#ffd23f',s:'#d9e2f2',S:'#9aa8c4'},
  hat:['................','.....kkkkkk.....','....khwhHhwk....','...kwhHwhHwhk...','..khHwhHwhHwhk..'],
  face:['..kwhHwhHwhHwk..','..kHwkHwhHwkHk..','..kwhHwhHwhHwk..','...kkHwhHwHkk...'],
  torso:['...kbgbgbgbbk...','...kgbbwbbgbssk.','...kBBBBBBBBk...']},
 {id:'dragon',name:'Dragon',price:55,rod:'#ff6a1e',glow:'#ffd23f',fx:'flame',
  pal:{h:'#3fae4a',H:'#2a7a34',y:'#fff2c8',r:'#ff6a1e',g:'#ffd23f',b:'#3fae4a',B:'#2a7a34',p:'#2a7a34',n:'#14401c',s:'#3fae4a',S:'#2a7a34'},
  hat:['..y..........y..','..ky........yk..','.....kkkkkk.....','....khhhhhhk....','...khHhhhhHhk...'],
  face:['...kssssssssk...','...kgkssssgksk..','...ksSssssSsk...','....kkyssykk....'],
  torso:['...kbBbBbBbBk...','...kbBbBbBbBssk.','...kBBBBBBBBk...']},
 {id:'alien',name:'Alien',price:32,rod:'#7dff9a',glow:'#d6ffe0',fx:'alien',
  pal:{g:'#7dff9a',h:'#58d86e',H:'#2a9a46',s:'#7dff9a',S:'#4ec46a',b:'#6a5acd',B:'#3e3290',p:'#3e3290',n:'#241c60',r:'#ff5ad8',y:'#d6ffe0'},
  hat:['..r..........r..','..k..........k..','..kk.kkkkkk.kk..','...khhhhhhhhk...','..khhhhhhhhhhk..'],
  face:['..khssssssssHk..','..kkkkssssskkk..','..kkkkkssskkkk..','...kHssssssHk...'],
  torso:['...kbbbbbbbbk...','...kbbyybbbbbk..','...kBBBBBBBBk...']},
 {id:'icecream',name:'Cornet de glace',price:36,rod:'#ffb0d8',glow:'#ffffff',fx:'sugar',
  pal:{r:'#ff6fa8',w:'#fff6ee',h:'#8af0d0',H:'#ff9ac8',y:'#fff2a8',b:'#e0b070',B:'#b8844a',p:'#b8844a',n:'#8a5a2e',s:'#f6c19a',S:'#d98f66'},
  hat:['......kk........','......krk.......','....kkwwwwkk....','...khhhhhhhhk...','..kHrrrrrrrrHk..'],
  face:['...kssssssssk...','...kssssskssk...','...kssrssssSk...','....kkssssskk...'],
  torso:['...kbBbBbBbBk...','...kBbBbBbBbssk.','...kbBbBbBbBk...']},
 {id:'mermaid',name:'Sirène',price:48,rod:'#5ee6ff',glow:'#d6fbff',fx:'bubbles',
  pal:{h:'#2fd0c0',H:'#1a9a9a',y:'#ffb0d0',w:'#fff6ee',b:'#2fd0c0',B:'#1a9a9a',p:'#1a9a9a',n:'#0e6a78',g:'#ffe14d',s:'#f6d0b0',S:'#d9a888'},
  hat:['......y.y.......','....kkyyyykk....','...khhhhhhhhk...','..khhHhhhhHhhk..','..khHhhhhhhHhk..'],
  face:['..khssssssssHk..','..khsskssksshk..','..kHsssssssSHk..','...kkHsssssHkk..'],
  torso:['...kwbbbbbbwk...','...kbBbBbBbBssk.','...kBBBBBBBBk...']},
 {id:'ghoul',name:'Goule',price:38,rod:'#5fe3b0',glow:'#d6ffe8',fx:'wisp',back:'tendrils',grab:true,
  pal:{s:'#a9bfa4',S:'#7f987c',h:'#4a4254',H:'#2c2634',b:'#5a5266',B:'#2c2634',p:'#2c2634',n:'#14101a',y:'#ffe14d',w:'#f4f1e6'},
  hat:['.....kkkkkk.....','....khhhhhhk....','...khhhHHhhhk...','..khhHHHHHHhhk..','..kHHHHHHHHHHk..'],
  face:['..kHssssssssHk..','..kHskkssskkHk..','..kHsykssykkHk..','...kkswwswwskk..'],
  torso:['...kbbbbbbbbk...','...kbBbbbbBbssk.','...kBBkBBkBBk...']},
 {id:'human',name:'Humain',price:42,rod:'#c4202e',glow:'#ff9a9a',fx:'',back:'tendrils',tc:['#7a1020','#c4202e','#ff6a6a'],tn:5,grab:true,
  pal:{h:'#6b4528',H:'#472d19',s:'#f0c7a0',S:'#d19a72',b:'#f7f7fa',B:'#c4c8d6',p:'#3a4a7a',n:'#2a2a34',w:'#ffffff'},
  hat:['................','.....kkkkkk.....','....khhhhhhk....','...khhhhhhhhk...','..kHhhhhhhhhHk..'],
  face:['...kssssssssk...','...kssssskssk...','...ksssssssSk...','....kkssssskk...'],
  torso:['...kBbbbbbbBk...','...kbbbbBbbbssk.','...kBBBBBBBBk...']}
];
/* =====================================================================================================
   KIT DE LA COLLAB  RNG∞ × Canne & Dauphins  (pour Firetail, de la part de Sacha, rng-infinite.com)
   À coller dans index.html, n'importe où APRÈS la définition de spr(), tint(), SKINS et AVANT la boucle de jeu.
   Rien ici ne modifie ton jeu tant que tu n'appelles pas les fonctions (voir LISEZMOI.md).
   ===================================================================================================== */

/* ---- 1. Les chiffres de RNG∞ : police Press Start 2P (la même que ton jeu), 7×7 pixels, au format de spr() ---- */
const RNG_DIGIT_ROWS = {
 '0':["..www..", ".w..ww.", "ww...ww", "ww...ww", "ww...ww", ".ww..w.", "..www.."],
 '1':["...ww..", "..www..", "...ww..", "...ww..", "...ww..", "...ww..", ".wwwwww"],
 '2':[".wwwww.", "ww...ww", "....www", "..wwww.", ".wwww..", "www....", "wwwwwww"],
 '3':[".wwwwww", "....ww.", "...ww..", "..wwww.", ".....ww", "ww...ww", ".wwwww."],
 '4':["...www.", "..wwww.", ".ww.ww.", "ww..ww.", "wwwwwww", "....ww.", "....ww."],
 '5':["wwwwww.", "ww.....", "wwwwww.", ".....ww", ".....ww", "ww...ww", ".wwwww."],
 '6':["..wwww.", ".ww....", "ww.....", "wwwwww.", "ww...ww", "ww...ww", ".wwwww."],
 '7':["wwwwwww", "ww...ww", "....ww.", "...ww..", "..ww...", "..ww...", "..ww..."],
 '8':[".wwww..", "ww...w.", "www..w.", ".wwww..", "w..wwww", "w....ww", ".wwwww."],
 '9':[".wwwww.", "ww...ww", "ww...ww", ".wwwwww", ".....ww", "....ww.", ".wwww.."]
};
const RNG_DIGITS = {}, RNG_DIGITS_WET = {}, SIX_COLS=['#ff3b3b','#ff9a2a','#ffe14d','#4ade5a','#3fd8ff','#4a7bff','#c26bff'], RNG_DIGITS_C = SIX_COLS.map(()=>({}));
for (const k in RNG_DIGIT_ROWS) {
  RNG_DIGITS[k] = spr(RNG_DIGIT_ROWS[k], { w: '#ffffff', k: '#14182c' }, true);     // chiffre posé : blanc, contour sombre
  SIX_COLS.forEach((c,i)=>{RNG_DIGITS_C[i][k]=spr(RNG_DIGIT_ROWS[k],{w:c,k:'#14182c'},true);});
  RNG_DIGITS_WET[k] = spr(RNG_DIGIT_ROWS[k], { w: '#a8dcff', k: '#27479a' }, true); // pendant le tirage : « sous l'eau »
}

/* ---- 2. L'animation de tirage de RNG∞, à afficher au-dessus de ton perso ----
   rngRoll(n)              lance un tirage qui finit sur le nombre n (0 à 999999) ; rngRoll() = au hasard
   drawRngRoll(cx, top)    à appeler à chaque image, après drawPlayer() : cx = milieu du perso, top = haut du perso
   Même rythme que sur rng-infinite.com : les 6 chiffres défilent en bleu, puis se posent un par un de gauche à droite,
   chacun avec le petit « coup de ferrage » (il plonge, il est arraché vers le haut, il retombe). Les zéros de tête
   restent pâles. Le nombre reste affiché 3 s puis s'efface. Utilise ta variable globale time (en secondes). */
let rngR = null;
function rngRoll(n) {
  if (n === undefined) n = Math.floor(Math.random() * 1000000);
  rngR = { s: String(Math.max(0, Math.min(999999, n | 0))).padStart(6, '0'), t0: time };
}
function drawRngRoll(cx, top) {
  if (!rngR) return;
  const el = time - rngR.t0, W = 9, x0 = Math.round(cx - (W * 6) / 2), y0 = Math.round(top - 14);
  const lockAt = i => 0.7 + i * 0.28, end = lockAt(5) + 3;
  if (el > end + 0.5) { rngR = null; return; }
  const lead = rngR.s.search(/[1-9]/), alpha = el > end ? 1 - (el - end) / 0.5 : 1;
  if (!rngR.paid && el >= lockAt(5) + 0.3) {   // bonus : les suites 13, 67 et 69 n'importe où dans le tirage rapportent autant d'or
    rngR.paid = true;
    let dy = 26;
    for (const n of ['13', '67', '69']) if (rngR.s.includes(n)) {   // chaque suite trouvée rapporte son nombre en or (cumulable)
      shop.gold += +n; saveShop(); sfx.heal(); floatText(cx, top - dy, '+' + n + ' OR', '#ffd23f'); burst(cx, top - 10, '#ffd23f', 14, 90); dy += 10;
    }
  }
  ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
  for (let i = 0; i < 6; i++) {
    const x = x0 + i * W, since = el - lockAt(i);
    if (since < 0) {   // défile : un chiffre au hasard toutes les 60 ms, qui ondule d'un pixel
      const d = String(Math.floor(Math.random() * 10)), wob = Math.floor(time * 12 + i) % 2;
      ctx.drawImage(RNG_DIGITS_WET[d], x, y0 + wob);
    } else {          // posé : coup de ferrage sur 0,3 s (plonge +2, arraché -4, retombe)
      const u = Math.min(1, since / 0.3), dy = u < 0.25 ? 2 : u < 0.55 ? -4 : u < 0.8 ? 1 : 0;
      const ghost = lead === -1 ? i < 5 : i < lead;
      ctx.globalAlpha = Math.max(0, alpha) * (ghost ? 0.3 : 1);
      ctx.drawImage(RNG_DIGITS[rngR.s[i]], x, y0 + dy);
      ctx.globalAlpha = Math.max(0, alpha);
    }
  }
  ctx.restore();
}

/* ---- 3. Idée de skin « RNG∞ » (récompense de la collab) au format de ton tableau SKINS ----
   Bonnet violet avec des points de dé, sweat violet aux reflets dorés, canne dorée qui brille.
   collab: true sert à le garder hors de ta boutique : il se débloque avec la récompense (voir LISEZMOI.md). */
const RNG_SKIN = {
  id: 'rnginf', name: 'RNG∞', price: 0, collab: true, rod: '#fde047', glow: '#c4b5fd',
  pal: { h: '#7c3aed', H: '#4c1d95', w: '#ffffff', b: '#6d28d9', B: '#4c1d95', g: '#fde047', p: '#312e81', n: '#1e1b4b' },
  hat: ["................", "....kkkkkkkk....", "...khhwhhwhhk...", "..khhhhhhhhhhk..", "..kHHHHHHHHHHk.."],
  face: ["...kssssssssk...", "...kssssskssk...", "...ksssssssSk...", "....kkssssskk..."],
  torso: ["...kbbbbbbbbk...", "...kbgbgbbbbssk.", "...kBBgBBBBBk..."],
};

/* ---- 4. Récompense croisée par compte Google ----
   À appeler dans gOnCredential(resp), juste après gCheckDev() :   rngCollab(resp.credential);
   Ton jeu envoie le jeton de connexion Google (signé par Google) au serveur de RNG∞. Le serveur vérifie la signature et
   que le jeton a bien été émis pour TON jeu (ton identifiant client Google), puis :
     - il retient que ce compte Google joue à Canne & Dauphins → le joueur reçoit le skin Fisherman sur RNG∞ ;
     - si ce compte Google a déjà un compte RNG∞, il répond { rng: true } → ici, on débloque le skin RNG∞.
   Aucun e-mail n'est envoyé ni stocké : seul l'identifiant Google (sub) est gardé. */
const RNG_COLLAB_API = 'https://db.rng-infinite.com/api/site';
function rngCollab(credential) {
  if (!credential) return;
  rngMsg('Vérification auprès de RNG∞…');
  fetch(RNG_COLLAB_API, { method: 'POST', body: JSON.stringify({ action: 'collab', game: 'pechadophin', credential }) })
    .then(r => r.json())
    .then(d => {
      if (d && d.rng && !shop.owned.includes(RNG_SKIN.id)) { shop.owned.push(RNG_SKIN.id); saveShop(); }
      rngMsg(shop.owned.includes(RNG_SKIN.id) ? 'Skin RNG∞ débloqué ! Équipe-le dans la boutique.' : (d && d.error) ? 'RNG∞ a refusé la vérification, reconnecte-toi.' : 'Aucun compte RNG∞ trouvé avec ce compte Google pour le moment.');
      try { if (shopOpen) renderShop(); } catch (e) { /* boutique pas ouverte */ }
    })
    .catch(() => rngMsg('Serveur RNG∞ injoignable, réessaie plus tard.'));
}
SKINS.push(RNG_SKIN);
SKINS.push({id:'scarecrow',name:'Épouvofodille',price:0,frag:12,rod:'#5a3a6a',glow:'#ffb020',
  pal:{h:'#c9a24a',H:'#7a5a1e',s:'#b8955a',S:'#8a6a3a',b:'#3a2a4a',B:'#241830',g:'#7a5a2a',w:'#f0d070',n:'#2a1a10',y:'#ffb020'},
  hat:["...w..w..w.w....",".....kkkkkk.....","....khhhhhhk....","...khhHHHhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...ksyssssysk...","...kssSSSSssk...","....kksnsnskk..."],
  torso:["...kbbbbbbbbk...","..wkbbgbbbbswk..","..wkBBBBBBBBkw.."]});   // skin premium : s'obtient par 6 fragments (Caisse à skin)
SKINS.push({id:'dinopremium',name:'Dino',price:0,soon:true,rod:'#3fae6a',glow:'#ffd23f',   // skin premium « prochainement » : visible mais pas encore obtenable
  pal:{h:'#4cc38a',H:'#2b8a5e',l:'#eaf5b8',y:'#ff7a3a',w:'#ffffff',b:'#3fae6a',B:'#2a7a4a',p:'#3fae6a',n:'#2a7a4a'},
  hat:["....y..y..y.....",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..khhHhhhhHhhk.."],
  face:["..kHhhhhhhhhHk..","..kHhwkhhkwhHk..","..kHhhhhhhhhHk..","...kkwwwwwwkk..."],
  torso:["...kbbbbbbbbk...","...kbbyyyybbbk..","...kBBBBBBBBk..."],
  side:{body:["........kkkkkkk.",".......khhhhhhhk",".......khhwkhhhk",".......khhhhhhhk",".......khhhhhhhk",".......khhhhkkkk","..y.y..khhhhwwk.",".khhhhkhhhhhkk..","khhhhhhhhhhhkHk.","kHk.khhllllhk...","k...khhllllhk...",".....kHHHHHk...."],   // dessiné de zéro : dino de profil, regard vers la droite
   legs:{idle:[".....kHk..kHk...",".....khk..khk...",".....khhk.khhk..",".....kkkk.kkkk.."],a:["....kHk....kHk..","...kHk......kHk.","...khhk.....khhk","...kkkk.....kkkk"],b:[".......kHHk.....",".......khhk.....",".......khhhk....",".......kkkkk...."],jump:[".....kHk..kHk...","....kHk..kHk....","....khk..khk....","....kkk..kkk...."]}}});
SKINS.push(
 {id:'angel',name:'Ange',price:34,rod:'#ffd23f',glow:'#ffffff',fx:'',
  pal:{h:'#fff0a0',H:'#e0c060',b:'#f4f4ff',B:'#c0c8e8',g:'#ffd23f'},
  hat:["....gggggggg....",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kskssskssk...","...ksssssssSk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbbgbbbbssk..","...kBBBBBBBBk..."]},
 {id:'paladin',name:'Paladin',price:46,rod:'#dfe8f0',glow:'#fff2a8',
  pal:{h:'#c8d4e8',H:'#8a98b0',r:'#e0262e',b:'#c8d4e8',B:'#8a98b0',g:'#ffd23f'},
  hat:["....rrr.........",".....hhhhhh.....","....khhhhhhk....","...khhhhhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kskssskssk...","...ksssssssSk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbbgbbbbssk..","...kBBBBBBBBk..."]},
 {id:'fairy',name:'Fée',price:52,rod:'#ff9ad8',glow:'#fffbb0',fx:'sugar',
  pal:{h:'#ff9ad8',H:'#c4569e',b:'#ffd0f0',B:'#e08ac0',y:'#fffbb0'},
  hat:["...y......y.....",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...kskssskssk...","...ksssssssSk...","....kkssssskk..."],
  torso:["...kbbbbbbbbk...","...kbbybbbbssk..","...kBBBBBBBBk..."]},
 {id:'demon',name:'Démon',price:50,rod:'#e0262e',glow:'#ff6a1e',fx:'ember',
  pal:{h:'#4a0f18',H:'#2a0810',r:'#e0262e',s:'#e8606a',S:'#b03a48',b:'#2a1018',B:'#14080c',y:'#ffe14d'},
  hat:["..r..........r..","..rr.kkkkkk.rr..","...rkhhhhhhkr...","...khhhhhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...ksyssssysk...","...kssSSSSssk...","....kksnsnskk..."],
  torso:["...kbbbbbbbbk...","...kbbrbbbbssk..","...kBBBBBBBBk..."]},
 {id:'necro',name:'Nécromancien',price:44,rod:'#7cff6a',glow:'#b6ffa8',fx:'wisp',
  pal:{h:'#3a2a5a',H:'#241838',s:'#d8e8d0',S:'#a8b8a0',b:'#2a1c48',B:'#180e2c',y:'#7cff6a'},
  hat:["................",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","..khhhhhhhhhhk.."],
  face:["...kssssssssk...","...ksyssssysk...","...kssSSSSssk...","....kksnsnskk..."],
  torso:["...kbbbbbbbbk...","...kbbybbbbssk..","...kBBBBBBBBk..."]},
 {id:'vampire',name:'Vampire',price:58,rod:'#8a1424',glow:'#ff4466',
  pal:{h:'#1c1c28',H:'#0c0c14',s:'#f0e4e4',S:'#c8b8b8',b:'#8a1424',B:'#4a0a14',y:'#ff4466'},
  hat:["................",".....kkkkkk.....","....khhhhhhk....","...khhhHhhhhk...","..kHHHHHHHHHHk.."],
  face:["...kssssssssk...","...ksyssssysk...","...kssSSSSssk...","....kkswsswkk..."],
  torso:["...kbbbbbbbbk...","...kbbwbbbbssk..","...kBBBBBBBBk..."]}
);
SKINS.sort((a,b)=>a.price-b.price);   // du moins cher au plus cher
for(const sk of SKINS)sk.price*=50;   // les skins s'achètent en or (le moins cher : 100 or)
const CRATES=[   // caisses : seule façon d'obtenir les skins à plus de 1600 or. Chaque caisse donne des fragments (6 = le skin) ; l'Épouvofodille peut sortir de toutes les caisses
 {id:'hero',show:'human',name:'Caisse Héros',cost:600,col:['#4aa8e8','#27479a'],skins:['knight','wizard','hero','astronaut','cowboy','plumber','chef','viking','robot','unicorn','king','pharaoh','mermaid','icecream','human','angel','paladin','fairy']},
 {id:'vil',show:'ghoul',name:'Caisse Vilain',cost:700,col:['#c4202e','#4a0f18'],skins:['pirate','ninja','zombie','ghost','pumpkin','shroom','alien','dino','disco','dragon','ghoul','demon','necro','vampire']}
];
const CRATE_BONUS={id:'scarecrow',chance:0.15},FRAG_NEED=6;
for(const c of CRATES){c.w=[];for(const id of c.skins){const sk=SKINS.find(x=>x.id===id);if(sk){sk.crate=c.id;sk.frag=FRAG_NEED;c.w.push(clamp(Math.round(100/(sk.price/50)),1,25));}else c.w.push(0);}}   // plus un skin vaut cher, plus il est rare
for(const sk of SKINS){
  sk.spr={};
  const pal=Object.assign({},PAL_P,sk.pal);
  for(const k in LEGS) sk.spr[k]=spr(sk.side?outlineRows(sk.side.body.concat(sk.side.legs[k])):sk.hat.concat(sk.face,sk.torso,LEGS[k]),pal,false);   // skin de profil (Dino) : corps + pattes dessinés de côté, regard vers la droite
}

const DOL=[
"DD.......D......",
".DD.....DDD.....",
"..DDdddddddd....",
"..ddddddddddddd.",
"...ddddddddedddd",
"....lllllllllddd",
".....lllllllll..",
".......DD......."];
const DOLB=spr(DOL,{D:'#2a6fb0',d:'#4aa8e8',l:'#d6f1ff',e:'#14182c'},true);
const DOLP=spr(DOL,{D:'#b84a86',d:'#f58fb8',l:'#ffe3ee',e:'#14182c'},true);
const DOLR=spr(DOL,{D:'#a8321e',d:'#e8622e',l:'#ffd9a8',e:'#14182c'},true);   // dauphin tireur
const DOLB_W=tint(DOLB,'#ffffff'), DOLP_W=tint(DOLP,'#ffffff'), DOLR_W=tint(DOLR,'#ffffff');

const HEART_ROWS=[".rr.rr.","rprrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."];
const HEART=spr(HEART_ROWS,{r:'#ff4466',p:'#ffc0cc'},true);
const HEART_GOLD=spr(HEART_ROWS,{r:'#ffc21f',p:'#fff3b0'},true);
const HEART_OFF=spr(HEART_ROWS,{r:'#3c4a63',p:'#52617d'},true);
const LURE=spr(["o...oo..","oo.oooo.","ooooooeo","oo.oooo.","o...oo.."],{o:'#ff9a3c',e:'#14182c'},true);

const PEARL=spr([".PPp.","Ppppp","pppdd",".ddd."],{p:'#e6dcff',P:'#ffffff',d:'#a89ad6'},true);
const CHEST_ROWS=["..kkkkkkkkkk..",".kbbbbbbbbbbk.","kbBBBBBBBBBBbk","kbBBBBBBBBBBbk","kkkkkkyykkkkkk","kbbbbbyybbbbbk","kbBBBByyBBBBbk","kbBBBBBBBBBBbk","kbBBBBBBBBBBbk","kbbbbbbbbbbbbk","kkkkkkkkkkkkkk"];
const CHEST=spr(CHEST_ROWS,{k:'#2a1608',b:'#a0662e',B:'#7a4a1e',y:'#ffd23f'},false);
const CHEST_R=spr(CHEST_ROWS,{k:'#2a0808',b:'#e0453a',B:'#a82020',y:'#ffd23f'},false);
const SHIELD_IC=spr(["xxxxxxx","xwwwwwx","xwwxwwx","xwxxxwx",".xwxwx.",".xwwwx.","..xwx..","...x..."],{x:'#14182c',w:'#cfd8ff'},true);
const ROD_ICON=spr(["..........ww","........ww.w","......ww...w",".....w.....w","....w......w","...w.......y","..w.......yy",".bw.......y.","bb.........."],{w:'#c98a4b',b:'#6b3f1c',y:'#dfe6f5'},true);
const DAGGER_ICON=spr([".......w",".....wwh","....wwh.","..y.wh..","...yh...","..rby...",".r..y...","y......."],{w:'#ffffff',h:'#9fb0cc',y:'#ffd23f',r:'#c4202e',b:'#2a1a10'},true);
const GOLD=spr([".hyy.","hyyyY","yyyYY",".YYY."],{y:'#ffd23f',Y:'#c98a10',h:'#fff3b0'},true);
const ICONS={
 range:spr(["..x...x..",".xx...xx.","xxxxxxxxx",".xx...xx.","..x...x.."],{x:'#4bd0d8'},true),
 count:spr(["......xx.","....xx...","xxxxxxxxx","....xx...","......xx."],{x:'#ff9a3c'},true),
 rate:spr(["....xx.","...xx..","..xx...",".xxxxx.","...xx..","..xx...",".xx...."],{x:'#ffe14d'},true),
 dmg:spr(["...x...",".x.x.x.","..xxx..","xxxxxxx","..xxx..",".x.x.x.","...x..."],{x:'#ff5a5a'},true)
};
function sharkRows(){
  const W=44,H=27,yc=15,g=[];
  for(let y=0;y<H;y++)g.push(new Array(W).fill('.'));
  const set=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)g[y][x]=c;};
  const hh=x=>{const t=(x-6)/37;if(t<=0||t>=1)return 0;return 8*Math.pow(Math.sin(Math.PI*Math.pow(t,0.75)),0.8);};
  const line=(x0,y0,x1,y1,th,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let d=0;d<th;d++)set(x,y+d,c);}};
  const tri=(ax,ay,bx,by,cx,cy,c)=>{
    const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
    for(let y=Math.floor(Math.min(ay,by,cy));y<=Math.ceil(Math.max(ay,by,cy));y++)
      for(let x=Math.floor(Math.min(ax,bx,cx));x<=Math.ceil(Math.max(ax,bx,cx));x++){
        const l1=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/d,l2=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/d,l3=1-l1-l2;
        if(l1>=0&&l2>=0&&l3>=0)set(x,y,c);
      }
  };
  for(let x=6;x<43;x++){const h=hh(x),top=Math.round(yc-h),bot=Math.round(yc+h*0.85);for(let y=top;y<=bot;y++)set(x,y,y>yc+h*0.25?'L':'R');}
  line(9,yc-1,1,yc-10,4,'D');line(9,yc+1,3,yc+8,4,'D');tri(5,yc-3,10,yc-2,9,yc+3,'D');tri(2,yc-9,8,yc-2,8,yc+6,'D');
  tri(16,yc-6,27,yc-7,24,yc-17,'D');            // aileron dorsal
  tri(19,yc+6,28,yc+6,17,yc+15,'D');            // nageoire
  for(const gx of[27,29,31])for(let y=yc-2;y<=yc+3;y++)set(gx,y,'D');   // ouïes
  tri(31,yc-6,34,yc-6,34,yc-13,'h');set(34,yc-13,'H');                  // cornes
  tri(35,yc-4,38,yc-4,38,yc-10,'h');set(38,yc-10,'H');
  for(let x=35;x<=37;x++){set(x,yc-2,'y');set(x,yc-1,'y');}             // oeil
  set(37,yc-1,'e');
  set(34,yc-4,'e');set(35,yc-4,'e');set(36,yc-3,'e');set(37,yc-3,'e');set(38,yc-2,'e');   // sourcil
  for(let x=30;x<=42;x++){const my=Math.round(yc+3-(x-30)*(2/12));set(x,my,'e');set(x,my+((x-30)%2===0?-1:1),'w');}   // gueule et dents
  return g.map(r=>r.join(''));
}
const SHARK_PAL={R:'#c8141f',D:'#7d0b13',L:'#f08a78',w:'#ffffff',y:'#ffe14d',e:'#14182c',h:'#4a0a10',H:'#ff6a3d',k:'#2a0408'};
const SHARK=spr(sharkRows(),SHARK_PAL,true);
const SHARK_W=tint(SHARK,'#ffffff');
function jellyRows(){
  const W=32,rows=[];
  for(let y=0;y<12;y++){
    const t=(y+0.5-12)/12,hw=Math.round(15.5*Math.sqrt(1-t*t));let r='';
    for(let x=0;x<W;x++){
      const d=Math.abs(x+0.5-W/2);
      if(d>hw){r+='.';continue;}
      let c=y>=8?'l':'w';
      if(d>=hw-1&&y>2)c='l';
      if(y===2&&d>5&&d<10)c='h';
      if(y>=3&&y<=4&&d>8&&d<12)c='h';
      if(y>=5&&y<=6&&(x===8||x===23||x===15||x===16))c='p';
      if(y===8&&(x===11||x===20))c='k';
      r+=c;
    }
    rows.push(r);
  }
  let r12='';for(let x=0;x<W;x++)r12+=(Math.abs(x+0.5-W/2)<=14.5)?'l':'.';
  rows.push(r12);
  for(let y=13;y<=16;y++){let r='';for(let x=0;x<W;x++)r+=(x>=3&&x<=28&&((x+(y%2)*2)%4<2))?(y>14?'p':'l'):'.';rows.push(r);}
  return rows;
}
const JELLY=spr(jellyRows(),{w:'#f6f0ff',l:'#cdbcff',h:'#ffffff',p:'#ff9ad8',k:'#4a3a8c'},true);
const JELLY_W=tint(JELLY,'#ffffff');
/* Marchand ambulant : un tuk-tuk (3 roues) et son vendeur */
function gridSpr(w,h,paint,pal){
  const g=[];for(let y=0;y<h;y++)g.push(new Array(w).fill('.'));
  const R=(x,y,ww,hh,ch)=>{for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++)if(i>=0&&i<w&&j>=0&&j<h)g[j][i]=ch;};
  const D=(cx,cy,rr,ch)=>{for(let j=-rr;j<=rr;j++)for(let i=-rr;i<=rr;i++)if(i*i+j*j<=rr*rr+rr*0.6&&cx+i>=0&&cx+i<w&&cy+j>=0&&cy+j<h)g[cy+j][cx+i]=ch;};
  paint(R,D);
  return spr(g.map(r=>r.join('')),pal,true);
}
const TUK=gridSpr(40,26,(R,D)=>{
  R(4,1,28,3,'G');R(3,3,30,2,'g');          // toit vert avec rebord
  R(5,5,2,10,'k');R(30,5,2,10,'k');          // montants
  R(7,5,22,9,'c');                           // fond de la cabine
  R(8,9,13,4,'r');R(8,8,13,1,'R');           // banquette
  R(3,14,28,6,'y');R(3,19,28,1,'Y');         // caisse jaune
  R(31,10,5,3,'c');R(31,13,7,7,'y');R(31,19,7,1,'Y');   // pare-brise et capot
  R(37,15,2,3,'h');                          // phare
  R(12,10,8,3,'O');                          // marchandises (cageot orange)
  D(10,21,4,'k');D(10,21,2,'s');D(33,21,4,'k');D(33,21,2,'s');   // roues
},{G:'#1f9a63',g:'#146b44',k:'#14182c',c:'#a9e3ff',r:'#b5472f',R:'#7a2d1c',y:'#ffcf2e',Y:'#c98a10',h:'#fff6b0',O:'#ff8a2a',s:'#c9d2dc'});
const MERCH=gridSpr(12,17,(R)=>{
  R(3,0,6,1,'o');R(2,1,8,2,'o');R(5,1,2,1,'O');   // turban
  R(2,3,8,3,'s');R(3,4,1,1,'k');R(8,4,1,1,'k');R(4,5,4,1,'n');   // visage, yeux, moustache
  R(4,6,4,1,'s');
  R(2,7,8,4,'r');R(5,7,2,4,'w');R(1,8,1,3,'s');R(10,8,1,3,'s');   // gilet, chemise, bras
  R(2,11,8,3,'p');R(3,14,2,2,'p');R(7,14,2,2,'p');R(2,16,3,1,'k');R(7,16,3,1,'k');
},{o:'#f2a63a',O:'#d9822a',s:'#e0a577',k:'#14182c',n:'#5a3a1e',r:'#c0392b',w:'#f4ecd8',p:'#3a6ea5'});
ICONS.pierce=spr(["......x..",".......x.","xxxxxxxxx",".......x.","......x.."],{x:'#ff6a6a'},true);
ICONS.trident=spr(["x..x..x","x..x..x","x..x..x","xxxxxxx","...y...","...y...","...y...","...y..."],{x:'#ff5a4a',y:'#e0a93b'},true);
ICONS.multi=spr(["...x...","...x...","...x...","xxx.xxx","...x...","...x...","...x..."],{x:'#ff6a6a'},true);
const TRIDENT_P=spr(["...........rrRw","..........r....","yYyYyYyYyrrrrRw","..........r....","...........rrRw"],{r:'#d8342a',R:'#ff7a5a',w:'#ffd8b0',y:'#e0a93b',Y:'#a8701e'},true);
const SOUL=spr(["..rrr..",".rrrrr.","rrerrer","rrrrrrr","rrrwrrr","rrrrrrr","rr.r.rr","r..r..r"],{r:'#ff4a5a',e:'#2a0408',w:'#ffd0d0',k:'#2a0408'},true);
function octoRows(rage){
  const W=124,H=92,g=[];
  for(let y=0;y<H;y++)g.push(new Array(W).fill('.'));
  const set=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)g[y][x]=c;};
  const dsc=(cx,cy,r,c)=>{for(let y=-r;y<=r;y++){const dx=Math.floor(Math.sqrt(r*r-y*y+0.5));for(let x=-dx;x<=dx;x++)set(cx+x,cy+y,c);}};
  const line=(x0,y0,x1,y1,th,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)dsc(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,th,c);};
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<8;i++){
    const x=14+i*(96/7),off=(x-62)*0.28;
    for(let k=1;k<=18;k++){
      const t=k/18,nx=x+off*t*1.6+Math.sin(t*3+i)*3*t,ny=52+t*34,r=Math.max(2,Math.round(5-t*3.2));
      dsc(nx,ny,r,'P');dsc(nx+0.5,ny+1,Math.max(1,r-2),'p');
      if(k%4===0)set(nx-r+1,ny,'l');
    }
  }
  const cx=62,cy=34,rx=52,ry=32;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<=1)set(x,y,d>0.8?'p':'P');}
  for(let i=0;i<16;i++){const sx=cx+(rnd()-0.5)*80,sy=cy-6+(rnd()-0.5)*36,r=1+Math.floor(rnd()*2);if(((sx-cx)/rx)**2+((sy-cy)/ry)**2<0.6)dsc(sx,sy,r,'l');}
  for(const ex of[40,84]){
    dsc(ex,36,10,'w');dsc(ex+(ex<62?2:-2),37,6,'y');
    for(let y=-4;y<=4;y++){set(ex+(ex<62?2:-2),37+y,'e');set(ex+(ex<62?2:-2)+1,37+y,'e');}
  }
  const bc=rage?'e':'p',bt=rage?2:1;
  line(26,rage?18:22,52,rage?33:31,bt,bc);
  line(98,rage?18:22,72,rage?33:31,bt,bc);
  return g.map(r=>r.join(''));
}
const OCTO_N=spr(octoRows(false),{P:'#7b4fb8',p:'#4e2c82',l:'#b896e8',w:'#ffffff',y:'#ffd23f',e:'#14182c',k:'#1e0f3a'},true);
const OCTO_R=spr(octoRows(true),{P:'#c42a38',p:'#7a1220',l:'#ff9a8a',w:'#ffe3e0',y:'#ff2a2a',e:'#14182c',k:'#2a0408'},true);
const OCTO_N_W=tint(OCTO_N,'#ffffff'),OCTO_R_W=tint(OCTO_R,'#ffffff');
const WALL=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#6b7289';g.fillRect(0,0,T,T);
  g.fillStyle='#4a5068';g.fillRect(0,7,T,1);g.fillRect(0,15,T,1);g.fillRect(7,0,1,8);g.fillRect(3,8,1,8);g.fillRect(11,8,1,8);
  g.fillStyle='#8a92aa';g.fillRect(0,0,7,1);g.fillRect(8,0,8,1);g.fillRect(4,8,7,1);g.fillRect(12,8,4,1);g.fillRect(0,8,3,1);
  g.fillStyle='#59607a';g.fillRect(1,3,2,1);g.fillRect(10,4,2,1);g.fillRect(6,11,2,1);
  return c;})();
const WALL_CAP=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.drawImage(WALL,0,0);g.fillStyle='#4a5068';g.fillRect(0,0,T,2);g.fillStyle='#a6aec6';g.fillRect(0,0,T,1);g.fillStyle='#2f3448';g.fillRect(0,2,T,1);
  return c;})();
const GATE=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#7a4a21';g.fillRect(0,0,T,T);
  g.fillStyle='#5a3417';for(const x of[3,7,11,15])g.fillRect(x,0,1,T);
  g.fillStyle='#9a6532';for(const x of[1,5,9,13])g.fillRect(x,0,1,T);
  g.fillStyle='#2d3144';g.fillRect(0,2,T,3);g.fillRect(0,10,T,3);
  g.fillStyle='#a9b0c4';for(const x of[2,8,14]){g.fillRect(x,3,1,1);g.fillRect(x,11,1,1);}
  return c;})();
const STONE_TOP=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#7a8199';g.fillRect(0,0,T,T);
  g.fillStyle='#b4bcd4';g.fillRect(0,0,T,2);g.fillStyle='#9aa2ba';g.fillRect(0,2,T,1);
  g.fillStyle='#565d76';g.fillRect(0,8,T,1);g.fillRect(8,0,1,8);g.fillRect(3,9,1,7);g.fillRect(12,9,1,7);
  return c;})();
const WALL_S=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#dcc07a';g.fillRect(0,0,T,T);
  g.fillStyle='#b8985a';g.fillRect(0,7,T,1);g.fillRect(0,15,T,1);g.fillRect(7,0,1,8);g.fillRect(3,8,1,8);g.fillRect(11,8,1,8);
  g.fillStyle='#f2dca0';g.fillRect(0,0,7,1);g.fillRect(8,0,8,1);g.fillRect(4,8,7,1);g.fillRect(12,8,4,1);g.fillRect(0,8,3,1);
  g.fillStyle='#c9aa68';g.fillRect(1,3,2,1);g.fillRect(10,4,2,1);g.fillRect(6,11,2,1);
  return c;})();
const WALL_S_CAP=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.drawImage(WALL_S,0,0);g.fillStyle='#b8985a';g.fillRect(0,0,T,2);g.fillStyle='#fff0c4';g.fillRect(0,0,T,1);g.fillStyle='#8a6c3a';g.fillRect(0,2,T,1);
  return c;})();
const WALL_W=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#6b452a';g.fillRect(0,0,T,T);
  g.fillStyle='#4a2c18';for(const x of[0,8])g.fillRect(x,0,1,T);g.fillRect(0,7,T,1);g.fillRect(0,15,T,1);
  g.fillStyle='#8a5c38';g.fillRect(1,0,6,1);g.fillRect(9,0,6,1);g.fillRect(1,8,6,1);g.fillRect(9,8,6,1);
  g.fillStyle='#3a2312';g.fillRect(3,3,1,1);g.fillRect(12,11,1,1);
  return c;})();
const WALL_W_CAP=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.drawImage(WALL_W,0,0);g.fillStyle='#3a2312';g.fillRect(0,0,T,2);g.fillStyle='#a8744a';g.fillRect(0,0,T,1);
  return c;})();
const WITCH=(()=>{   // sorcière démesurée (140 x 176) ; yeux, bouche et bras sont dessinés à part
  const W=140,H=176,c=mk(W,H),g=c.getContext('2d');
  const R=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  for(let y=86;y<H;y++){const half=Math.round(26+(y-86)*0.42);R('#3b2a63',70-half,y,half*2,1);R('#2c1e4d',70-half,y,5,1);R('#4d3880',70+half-6,y,5,1);}
  R('#ffd23f',52,128,4,4);R('#ffd23f',92,150,4,4);R('#ffd23f',34,156,3,3);R('#5a2f8a',84,126,14,14);R('#4a2478',60,152,16,12);
  R('#6b4423',36,108,68,6);R('#e8c33f',65,107,10,8);R('#8a6a14',68,110,4,2);
  R('#2a1c4a',44,84,52,9);
  R('#1a1030',38,50,10,50);R('#1a1030',92,50,10,50);R('#1a1030',44,40,52,12);
  R('#7fb26a',49,46,42,42);R('#7fb26a',46,49,48,36);
  R('#6a9a56',46,70,6,14);R('#6a9a56',88,70,6,14);R('#6a9a56',60,86,20,4);
  R('#7fb26a',66,64,10,16);R('#6a9a56',72,64,4,16);R('#6a9a56',68,78,10,5);R('#4a7a3a',68,70,3,3);
  R('#1a1030',51,54,8,3);R('#1a1030',59,52,8,3);R('#1a1030',73,52,8,3);R('#1a1030',81,54,8,3);
  for(let y=0;y<38;y++){const half=Math.round(9+y*0.55);R('#241545',70-half,y,half*2,1);R('#3a2468',70+half-5,y,4,1);}
  R('#1c1038',22,38,96,8);R('#2e1a5a',22,38,96,2);R('#120a26',30,46,80,2);
  R('#a8324a',44,30,52,8);R('#e8c33f',64,29,12,10);R('#241545',67,32,6,4);
  return c;})();
const WITCH_W=tint(WITCH,'#ffffff');
const CAT=(()=>{   // le chat de la sorcière : 28 px de haut, le double du pêcheur
  const W=34,H=28,c=mk(W,H),g=c.getContext('2d');
  const R=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const B='#221a3a',L='#3a2d5e';
  R(B,5,10,21,12);R(L,7,10,17,2);
  R(B,5,21,4,7);R(B,10,21,4,7);R(B,18,21,4,7);R(B,23,21,4,7);R('#4a3c78',5,26,4,2);R('#4a3c78',23,26,4,2);
  R(B,22,3,11,11);R(L,23,3,9,2);R(B,22,0,3,5);R(B,30,0,3,5);R('#ff8fb0',23,1,1,3);R('#ff8fb0',31,1,1,3);
  R('#ffe14d',24,7,3,3);R('#ffe14d',29,7,3,3);R('#14102a',25,7,1,3);R('#14102a',30,7,1,3);R('#ff8fb0',32,10,2,1);
  R('#dcd6f0',31,12,3,1);R('#dcd6f0',31,13,3,1);
  R(B,1,12,5,3);R(B,0,5,3,9);R(B,1,3,3,3);
  return c;})();
const CAT_W=tint(CAT,'#ffffff');
function outlineCanvas(c,col){   // contour sombre autour d'un sprite dessiné au canvas
  const W=c.width,H=c.height,g=c.getContext('2d'),d=g.getImageData(0,0,W,H).data;
  const sol=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0;
  g.fillStyle=col;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!sol(x,y)&&(sol(x-1,y)||sol(x+1,y)||sol(x,y-1)||sol(x,y+1)))g.fillRect(x,y,1,1);
  return c;
}
/* ---------- Glacière : glace, plateformes, murs, igloo, dauphins de glace, esquimau ---------- */
function makeIce(shade,v){
  const c=mk(T,T),g=c.getContext('2d');
  const base=['#b9e2f5','#98c9e6','#7aaed4'][shade],dark=['#a2d2ec','#80b6da','#6598c0'][shade],light=['#e4f6ff','#cfeafa','#b4d8ee'][shade];
  g.fillStyle=base;g.fillRect(0,0,T,T);
  const r=mulberry32(v*733+shade*41+7);
  for(let i=0;i<6;i++){g.fillStyle=r()<0.5?dark:light;g.fillRect(Math.floor(r()*13),Math.floor(r()*14),2+Math.floor(r()*3),1);}
  g.fillStyle=dark;if(v===1){g.fillRect(3,4,1,3);g.fillRect(4,7,1,3);g.fillRect(5,10,1,2);}if(v===2){g.fillRect(11,2,1,3);g.fillRect(10,5,1,3);}
  g.fillStyle=light;g.fillRect(Math.floor(r()*12),Math.floor(r()*12),1,2);
  return c;
}
const ICE=[0,1,2].map(sh=>[0,1,2].map(v=>makeIce(sh,v)));
function makeCloud(shade,v){   // monde nuage : coton blanc légèrement bleuté
  const c=mk(T,T),g=c.getContext('2d');
  const base=['#f6f9ff','#e6eefb','#d4e0f4'][shade],dark=['#e0e9f8','#cfdcf0','#bccbe6'][shade],light='#ffffff';
  g.fillStyle=base;g.fillRect(0,0,T,T);
  const r=mulberry32(v*541+shade*29+11);
  for(let i=0;i<5;i++){g.fillStyle=r()<0.5?dark:light;const w=3+Math.floor(r()*4);g.fillRect(Math.floor(r()*(T-w)),Math.floor(r()*14),w,2);}
  return c;
}
const CLOUD=[0,1,2].map(sh=>[0,1,2].map(v=>makeCloud(sh,v)));
function makeCloudTop(dec,v){
  const c=mk(T,T+6),g=c.getContext('2d');
  g.drawImage(CLOUD[0][v],0,6);
  g.fillStyle='#ffffff';g.fillRect(0,6,T,3);g.fillStyle='#d4e0f4';g.fillRect(0,9,T,1);
  const r=mulberry32(v*23+dec*7+5);
  for(let k=0;k<3;k++){const bx=Math.floor(r()*10),bw=4+Math.floor(r()*4);g.fillStyle='#ffffff';g.fillRect(bx,4,bw,3);g.fillRect(bx+1,3,bw-2,1);}
  return c;
}
const CLOUD_PLAT=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#bccbe6';g.fillRect(1,6,14,3);g.fillStyle='#ffffff';g.fillRect(0,4,T,4);g.fillRect(2,2,5,3);g.fillRect(8,1,5,4);g.fillStyle='#e6eefb';g.fillRect(1,7,14,1);return c;})();
const CLOUD_FRAG=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#8a9bbd';g.fillRect(1,6,14,3);g.fillStyle='#dfe7f6';g.fillRect(0,4,T,4);g.fillRect(2,2,5,3);g.fillRect(8,1,5,4);
  g.fillStyle='#8a9bbd';g.fillRect(4,4,1,3);g.fillRect(5,7,1,2);g.fillRect(10,3,1,4);g.fillRect(9,7,1,2);return c;})();
const CLOUDTOP=[0,1,2,3,4].map(d=>[0,1,2].map(v=>makeCloudTop(d,v)));
function makeIceTop(dec,v){
  const c=mk(T,T+6),g=c.getContext('2d');
  g.drawImage(ICE[0][v],0,6);
  g.fillStyle='#f2fbff';g.fillRect(0,6,T,3);g.fillStyle='#ffffff';g.fillRect(0,6,T,1);g.fillStyle='#cfeafa';g.fillRect(0,9,T,1);
  const r=mulberry32(v*17+dec*5+3);for(let i=0;i<3;i++){g.fillStyle='#ffffff';g.fillRect(Math.floor(r()*12),7,2,1);}
  if(dec===1){g.fillStyle='#7fd4ff';g.fillRect(6,2,2,4);g.fillRect(9,3,2,3);g.fillStyle='#e8fbff';g.fillRect(6,2,1,2);g.fillRect(9,3,1,1);}
  if(dec===2){g.fillStyle='#ffffff';g.fillRect(4,4,8,3);g.fillRect(6,3,4,1);g.fillStyle='#d6eefa';g.fillRect(4,6,8,1);}
  if(dec===3){g.fillStyle='#9fdcff';g.fillRect(7,1,2,5);g.fillRect(6,3,4,3);g.fillStyle='#ffffff';g.fillRect(7,1,1,2);}
  if(dec===4){g.fillStyle='#bfe9ff';g.fillRect(3,3,2,3);g.fillRect(11,2,2,4);g.fillStyle='#ffffff';g.fillRect(3,3,1,1);g.fillRect(11,2,1,1);}
  return c;
}
const ICETOP=[0,1,2,3,4].map(d=>[0,1,2].map(v=>makeIceTop(d,v)));
const ICE_PLAT=(()=>{const c=mk(T,T),g=c.getContext('2d');   // plateforme de glace : dalle claire avec des stalactites dessous
  g.fillStyle='#4c86b0';g.fillRect(0,2,T,6);g.fillStyle='#8fd2f2';g.fillRect(0,2,T,5);g.fillStyle='#e8fbff';g.fillRect(0,2,T,1);
  g.fillStyle='#bfe9ff';g.fillRect(2,3,5,1);g.fillRect(9,4,4,1);g.fillStyle='#5a9ec8';g.fillRect(0,6,T,1);
  g.fillStyle='#4c86b0';g.fillRect(3,8,3,2);g.fillRect(4,10,1,2);g.fillRect(10,8,3,3);g.fillRect(11,11,1,2);
  g.fillStyle='#bfe9ff';g.fillRect(3,8,1,2);g.fillRect(10,8,1,3);
  return c;})();
const SCEPTER_ICON=spr(["........xx.",".......xwwx","......xwWwx",".......xwwx","......yxxx.",".....y.....","....y......","...y.......","..y........",".y.........","y.........."],{x:'#4aa8e8',w:'#bfe9ff',W:'#ffffff',y:'#cfd8e8'},true);
const SCEPTER_H=(()=>{const c=mk(24,12),g=c.getContext('2d');   // sceptre tenu : horizontal, le cristal à droite
  const R=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  R('#14182c',0,4,15,4);R('#cfd8e8',1,5,13,2);R('#ffffff',1,5,13,1);R('#ffd23f',9,3,2,6);
  R('#14182c',14,1,8,10);R('#4aa8e8',15,2,6,8);R('#bfe9ff',16,3,4,6);R('#ffffff',17,4,2,3);R('#14182c',22,4,1,4);R('#4aa8e8',21,4,1,4);
  return c;})();
const WALL_I=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#8cc3e4';g.fillRect(0,0,T,T);
  g.fillStyle='#6aa4cc';g.fillRect(0,7,T,1);g.fillRect(0,15,T,1);g.fillRect(7,0,1,8);g.fillRect(3,8,1,8);g.fillRect(11,8,1,8);
  g.fillStyle='#d8f2ff';g.fillRect(0,0,7,1);g.fillRect(8,0,8,1);g.fillRect(4,8,7,1);g.fillRect(12,8,4,1);g.fillRect(0,8,3,1);
  g.fillStyle='#a9d6f0';g.fillRect(1,3,2,1);g.fillRect(10,4,2,1);g.fillRect(6,11,2,1);
  return c;})();
const WALL_I_CAP=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.drawImage(WALL_I,0,0);g.fillStyle='#5a92bd';g.fillRect(0,0,T,2);g.fillStyle='#eefaff';g.fillRect(0,0,T,1);g.fillStyle='#4c80a8';g.fillRect(0,2,T,1);
  return c;})();
const IGLOO=(()=>{const W=40,H=26,c=mk(W,H),g=c.getContext('2d');   // igloo du marchand
  const cxp=20;
  for(let y=1;y<H;y++){
    const half=Math.round(19*Math.sqrt(Math.max(0,1-Math.pow((H-1-y)/24,2))));
    g.fillStyle='#eaf8ff';g.fillRect(cxp-half,y,half*2,1);
    if(y%6===3){g.fillStyle='#b7dcf2';g.fillRect(cxp-half+1,y,Math.max(0,half*2-2),1);}
    else{g.fillStyle='#b7dcf2';const off=(Math.floor(y/6)%2)*4;for(let x=cxp-half+3+off;x<cxp+half-1;x+=8)g.fillRect(x,y,1,1);}
    g.fillStyle='#5c8db3';g.fillRect(cxp-half,y,1,1);g.fillRect(cxp+half-1,y,1,1);
  }
  g.fillStyle='#5c8db3';g.fillRect(cxp-3,1,6,1);g.fillStyle='#ffffff';g.fillRect(cxp-6,4,4,1);g.fillRect(cxp-8,7,3,1);
  g.fillStyle='#5c8db3';g.fillRect(23,15,11,11);g.fillRect(24,14,9,1);g.fillStyle='#14202e';g.fillRect(24,16,9,10);g.fillRect(25,15,7,1);g.fillStyle='#2a3f5a';g.fillRect(24,16,9,2);
  g.fillStyle='#ffd23f';g.fillRect(28,21,2,2);   // lueur d'une lanterne à l'intérieur
  return c;})();
const DOLB_I=spr(DOL,{D:'#6fb4e0',d:'#c4ecff',l:'#ffffff',e:'#14182c'},true);
const DOLP_I=spr(DOL,{D:'#a58ad4',d:'#e2d4f8',l:'#ffffff',e:'#14182c'},true);
const DOLR_I=spr(DOL,{D:'#2f66b8',d:'#58c0f0',l:'#e6faff',e:'#14182c'},true);   // dauphin tireur de glace : tire des boules bleues
const DOLB_IW=tint(DOLB_I,'#ffffff'),DOLP_IW=tint(DOLP_I,'#ffffff'),DOLR_IW=tint(DOLR_I,'#ffffff');
const ESKIMO=(()=>{   // esquimau (44 x 56), il regarde à droite
  const W=44,H=56,c=mk(W,H),g=c.getContext('2d');
  const R=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  R('#3a2a1a',10,50,11,6);R('#3a2a1a',24,50,11,6);R('#6a4a2a',10,50,11,2);R('#6a4a2a',24,50,11,2);
  R('#245a98',8,24,28,28);R('#2f6fb8',9,24,26,26);R('#3f86d4',9,24,26,3);R('#245a98',9,44,26,2);R('#1c3f6e',21,27,2,21);
  R('#f4f1e6',8,48,28,4);R('#d9d3c0',8,51,28,1);
  R('#2f6fb8',2,28,8,18);R('#245a98',2,28,3,18);R('#f4f1e6',2,44,8,4);
  R('#2f6fb8',34,28,8,18);R('#245a98',37,28,5,18);R('#f4f1e6',34,44,8,4);
  R('#f4f1e6',12,3,20,24);R('#f4f1e6',10,5,24,20);R('#d9d3c0',10,22,24,4);
  R('#f2c9a0',14,9,16,14);R('#f2c9a0',15,8,14,16);R('#e8a090',15,17,3,2);R('#e8a090',26,17,3,2);
  R('#14182c',18,13,3,3);R('#14182c',25,13,3,3);R('#ffffff',18,13,1,1);R('#ffffff',25,13,1,1);R('#e0a080',22,16,2,2);R('#14182c',21,20,3,1);
  R('#ffffff',14,9,16,1);
  return outlineCanvas(c,'#14182c');})();
const ESKIMO_W=tint(ESKIMO,'#ffffff');
const CASTLE=(()=>{
  const W=128,H=112,c=mk(W,H),g=c.getContext('2d');
  const S='#e4c882',L='#f6e2ac',D='#b8985a',O='#6e5026';
  const block=(x,y,w,h)=>{g.fillStyle=O;g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle=S;g.fillRect(x,y,w,h);g.fillStyle=L;g.fillRect(x,y,w,2);g.fillStyle=D;g.fillRect(x,y+h-2,w,2);g.fillRect(x+w-2,y,2,h);};
  block(44,24,40,50);for(let x=44;x<84;x+=12)block(x,16,7,10);   // donjon
  block(14,64,100,48);for(let x=14;x<114;x+=14)block(x,56,8,10);   // muraille
  for(const x0 of[4,104]){block(x0,36,20,76);for(let x=x0;x<x0+20;x+=8)block(x,28,5,10);}   // tours
  g.fillStyle=O;g.fillRect(63,2,2,14);g.fillStyle='#e8453c';g.fillRect(65,2,9,5);g.fillStyle='#ffb0a0';g.fillRect(65,2,9,1);   // drapeau
  g.fillStyle=O;g.fillRect(55,82,18,30);g.fillRect(57,80,14,2);g.fillStyle='#3a2410';g.fillRect(56,83,16,29);g.fillRect(58,81,12,2);   // porte
  g.fillStyle='#5a3a1e';for(const x of[60,64,68])g.fillRect(x,84,1,28);
  g.fillStyle=O;for(const x0 of[10,110]){g.fillRect(x0,50,5,10);g.fillRect(x0,78,5,9);g.fillStyle='#3a2410';g.fillRect(x0+1,51,3,8);g.fillRect(x0+1,79,3,7);g.fillStyle=O;}
  let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  for(let i=0;i<150;i++){const x=Math.floor(rnd()*W),y=Math.floor(rnd()*H);const d=g.getImageData(x,y,1,1).data;if(d[3]&&d[0]===0xe4){g.fillStyle=rnd()<0.5?L:D;g.fillRect(x,y,1,1);}}
  return c;
})();
const CASTLE_W=tint(CASTLE,'#ffffff');
const BUCKET=(()=>{
  const c=mk(14,17),g=c.getContext('2d');
  g.fillStyle='#14182c';for(let y=4;y<17;y++){const ins=Math.floor((y-4)/5);g.fillRect(ins,y,14-ins*2,1);}
  g.fillStyle='#e8453c';for(let y=5;y<16;y++){const ins=Math.floor((y-4)/5);g.fillRect(1+ins,y,12-ins*2,1);}
  g.fillStyle='#ffd23f';g.fillRect(2,10,10,2);
  g.fillStyle='#ff8a7a';g.fillRect(2,6,2,3);
  g.fillStyle='#14182c';g.fillRect(1,3,12,3);g.fillStyle='#4fc3ff';g.fillRect(2,4,10,2);g.fillStyle='#bff0ff';g.fillRect(3,4,4,1);
  g.fillStyle='#14182c';g.fillRect(2,0,1,4);g.fillRect(11,0,1,4);g.fillRect(3,0,8,1);g.fillStyle='#c9ced8';g.fillRect(3,1,8,1);
  return c;
})();
const BUCKET_W=tint(BUCKET,'#ffffff');
function makeDirt(shade,v){   // terre : grain fin, mottes ombrées, cailloux (racines près de la surface, strates en profondeur)
  const c=mk(T,T),g=c.getContext('2d');
  const base=['#a06a38','#8a5a30','#6c4526'][shade],dark=['#855428','#714824','#583820'][shade],light=['#b9804a','#a06c3c','#7f5430'][shade];
  const deep=['#6e4322','#5c3a1e','#472c17'][shade],stone=['#8f8578','#7a7166','#625b53'][shade],stoneL=['#b3a999','#9a9183','#7e776c'][shade],stoneD=['#5e564d','#4f4841','#3d3833'][shade];
  g.fillStyle=base;g.fillRect(0,0,T,T);
  const r=mulberry32(v*977+shade*31+5),R=n=>Math.floor(r()*n);
  for(let i=0;i<14;i++){g.fillStyle=r()<0.55?dark:light;g.fillRect(R(16),R(16),1,1);}   // grain
  for(let i=0;i<3;i++){const x=R(12),y=R(13),w=2+R(2);g.fillStyle=light;g.fillRect(x,y,w,1);g.fillStyle=dark;g.fillRect(x,y+1,w+1,1);g.fillStyle=deep;g.fillRect(x+1,y+2,w,1);}   // mottes : lumière dessus, ombre dessous
  if(shade===2){g.fillStyle=dark;const y=3+R(9);for(let x=0;x<T;x++)if(r()<0.75)g.fillRect(x,y+(x>7&&v===1?1:0),1,1);}   // strate
  const ns=0;
  for(let i=0;i<ns;i++){   // cailloux : arête claire en haut, ombre en bas
    const w=3+R(2),h=2,x=R(T-w-1),y=1+R(T-h-3);
    g.fillStyle=stoneD;g.fillRect(x,y+1,w+1,h);g.fillRect(x+1,y+h+1,w-1,1);
    g.fillStyle=stone;g.fillRect(x,y,w,h);
    g.fillStyle=stoneL;g.fillRect(x+1,y,w-1,1);
  }
  return c;
}
const DIRT=[0,1,2].map(s=>[0,1,2].map(v=>makeDirt(s,v)));
function makeGrass(dec,v){
  const c=mk(T,T+6),g=c.getContext('2d');
  g.drawImage(DIRT[0][v],0,6);
  const r=mulberry32(v*13+dec*7+1);
  g.fillStyle='#4fbf4a';g.fillRect(0,6,T,4);
  g.fillStyle='#8cec72';g.fillRect(0,6,T,1);
  g.fillStyle='#37963b';
  for(let x=0;x<T;x++) if(r()<0.6) g.fillRect(x,10,1,1+(r()<0.5?1:0));
  for(let x=0;x<T;x++) if(r()<0.18) g.fillRect(x,8,1,1);
  g.fillStyle='rgba(40,20,6,.38)';for(let x=0;x<T;x++){const d=g.getImageData(x,10,1,1).data;g.fillRect(x,d[1]>120?11:10,1,1);}g.fillStyle='rgba(40,20,6,.16)';g.fillRect(0,12,T,1);   // ombre portée sous le rebord d'herbe
  g.fillStyle='#5a3a1c';for(let x=1;x<T-1;x++)if(r()<0.12)g.fillRect(x,12,1,1+Math.floor(r()*3));   // radicelles
  if(dec===1){g.fillStyle='#4fbf4a';g.fillRect(5,3,1,3);g.fillRect(7,2,1,4);g.fillRect(9,4,1,2);g.fillStyle='#8cec72';g.fillRect(7,2,1,1);}
  if(dec===2||dec===3){
    g.fillStyle='#37963b';g.fillRect(8,4,1,2);
    g.fillStyle=dec===2?'#ff4d6d':'#ffe14d';g.fillRect(7,2,3,2);g.fillRect(8,1,1,4);
    g.fillStyle=dec===2?'#ffe14d':'#ff8a3d';g.fillRect(8,2,1,1);
  }
  if(dec===4){g.fillStyle='#f0a898';g.fillRect(5,3,6,3);g.fillStyle='#ffe3d6';g.fillRect(6,2,4,1);g.fillRect(6,3,4,2);g.fillStyle='#f0a898';g.fillRect(8,2,1,4);}
  if(dec===5){g.fillStyle='#6d7587';g.fillRect(4,3,7,3);g.fillStyle='#8d95a5';g.fillRect(5,2,5,1);g.fillRect(4,3,7,2);g.fillStyle='#b4bccb';g.fillRect(5,2,3,1);}
  return c;
}
const GRASS=[];for(let d=0;d<6;d++){GRASS.push([0,1,2].map(v=>makeGrass(d,v)));}
function darkenImg(img,col){const c=mk(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='destination-in';g.drawImage(img,0,0);return c;}
const SGRASS=GRASS.map(a=>a.map(i=>darkenImg(i,'#6f8a5c'))),SDIRT=DIRT.map(a=>a.map(i=>darkenImg(i,'#7d7a62')));   // marécages : herbe et terre sombres
const STONE_PLAT=(()=>{const c=mk(T,T),g=c.getContext('2d');
  g.fillStyle='#1e2420';g.fillRect(0,0,T,8);g.fillRect(1,-0,3,0);
  g.fillStyle='#7c8577';g.fillRect(0,2,T,5);g.fillStyle='#9aa394';g.fillRect(0,2,T,1);
  g.fillStyle='#5e665a';g.fillRect(7,3,1,4);g.fillRect(0,5,T,1);
  g.fillStyle='#1e2420';g.fillRect(2,0,3,2);g.fillRect(11,0,3,2);g.fillStyle='#7c8577';g.fillRect(3,0,1,2);g.fillRect(12,0,1,2);
  g.fillStyle='#4f7a3a';g.fillRect(4,7,2,2);g.fillRect(12,7,1,3);
  return c;})();
const TOWER=spr(["k..kk..kk..k","kkkkkkkkkkkk","kssSssSssSsk","kssssssssssk",".kssSsssSsk.",".kssssssssk.",".ksskkksssk.",".kssk.kssSk.",".kSsk.kssmk.",".kssssssmmk.",".kssSssssmk.",".kssssSsssk.",".kmsssssssk.",".kmmsssSssk.",".kssssssssk.",".ksSssssssk.",".kssssssmmk.",".kssssssssk.",".kkkkkkkkkk."],{k:'#1e2420',s:'#7c8577',S:'#5e665a',m:'#4f7a3a'},false);   // mini tour de château en ruine

const PANTS_ROWS=["bbbbbbbbbb","bBBBBBBBBb","bBBBkkBBBb","bBBB..BBBb","bBBB..BBBb","bBBB..BBBb","bBBB..BBBb","bddd..dddb"];
const PANTS=spr(PANTS_ROWS,{b:'#245a98',B:'#3b7fd4',k:'#ffd23f',d:'#1c3f6e'},true);
const CROWN=spr(["y...y...y","yy.yyy.yy","yyyyyyyyy","yrrybyyry","yyyyyyyyy"],{y:'#ffd23f',r:'#e0262e',b:'#3b9bff'},true);
const noPantsMemo=new Map();
function noPants(sp){   // le même sprite, mais en caleçon (rangée 12 : caleçon blanc à cœurs, rangée 13 : jambes nues)
  let c=noPantsMemo.get(sp);if(c)return c;
  c=mk(sp.width,sp.height);const g=c.getContext('2d');g.drawImage(sp,0,0);
  const d=g.getImageData(0,0,c.width,c.height),W=c.width;
  for(const y of[12,13])for(let x=0;x<W;x++){const o=(y*W+x)*4;if(!d.data[o+3])continue;const lum=d.data[o]+d.data[o+1]+d.data[o+2];if(lum<120)continue;
    const col=y===12?((x%3===1)?[224,38,46]:[244,241,230]):[245,196,156];d.data[o]=col[0];d.data[o+1]=col[1];d.data[o+2]=col[2];}
  g.putImageData(d,0,0);noPantsMemo.set(sp,c);return c;
}

return { DOL, mk, spr, tint, outlineRows, noPants, PAL_P, LEGS, SKINS, CRATES, FRAG_NEED, CRATE_BONUS, DOLB, DOLP, DOLR, DOLB_I, DOLP_I, DOLR_I, HEART, PEARL, CHEST, CHEST_R, GOLD, SOUL, SHARK, JELLY, OCTO_N, OCTO_R, TOWER, PANTS, CROWN, ROD_ICON };
})();
