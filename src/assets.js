import { getPlayerAppearanceStage } from './equipment.js';

const REF  = '../assets/reference_art';
const SPR  = '../assets/sprites';

// reference_art: hero stages + equipment icons
const refFiles = {
  playerStages: [
    'hero-stage-0.png',
    'hero-stage-1.png',
    'hero-stage-2.png',
    'hero-stage-3.png',
    'hero-stage-4.png',
    'hero-stage-5.png',
  ],
  items: {
    sword:         'sword.png',
    swordBroad:    'sword-broad.png',
    swordGradius:  'sword-gradius.png',
    swordExcalibur:'sword-excalibur.png',
    swordLegend:   'sword-legend.png',
    shield:        'shield.png',
    armor:         'armor.png',
    boots:         'boots.png',
  },
};

// sprites/: enemy images (type → filename)
const sprFiles = {
  snake:         'snake.png',
  goblin:        'goblin.png',
  orc:           'orc.png',
  knight:        'blue_knight.png',
  redKnight:     'red_knight.png',
  blueKnight:    'blue_knight.png',
  silverKnight:  'silver_knight.png',
  death:         'death_master.png',
  dragon:        'dragon.png',
  mechDragon:    'mech_dragon.png',
  vampireLord:   'vampire_lord.png',
  wereRat:       'were_rat.png',
  yetti:         'yeti.png',
  snowYetti:     'yeti.png',
  giantKong:     'giant_kong.png',
  goldCollector: 'gold_collector.png',
};

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function ref(name)  { return new URL(`${REF}/${encodeURIComponent(name)}`, import.meta.url).href; }
function spr(name)  { return new URL(`${SPR}/${encodeURIComponent(name)}`, import.meta.url).href; }

export const assets = {
  ready: false,
  items: {},
  enemies: {},
  playerStages: [],
};

export async function loadAssets() {
  const itemEntries = await Promise.all(
    Object.entries(refFiles.items).map(async ([k, f]) => [k, await loadImage(ref(f))])
  );
  assets.items = Object.fromEntries(itemEntries);

  const enemyEntries = await Promise.all(
    Object.entries(sprFiles).map(async ([k, f]) => [k, await loadImage(spr(f))])
  );
  assets.enemies = Object.fromEntries(enemyEntries);

  assets.playerStages = await Promise.all(refFiles.playerStages.map(f => loadImage(ref(f))));
  assets.ready = true;
  return assets;
}

export function getPlayerStageSprite(player) {
  const stageIndex = Math.min(assets.playerStages.length - 1, getPlayerAppearanceStage(player));
  return assets.playerStages[stageIndex] || null;
}
