import { getPlayerAppearanceStage } from './equipment.js';

const REF = '../assets/reference_art';

const REF_FILES = [
  'hero-stage-0', 'hero-stage-1', 'hero-stage-2',
  'hero-stage-3', 'hero-stage-4', 'hero-stage-5',
  'hero-stage-0-walk1', 'hero-stage-0-walk2',
  'hero-stage-1-walk1', 'hero-stage-1-walk2',
  'hero-stage-2-walk1', 'hero-stage-2-walk2',
  'hero-stage-3-walk1', 'hero-stage-3-walk2',
  'hero-stage-4-walk1', 'hero-stage-4-walk2',
  'hero-stage-5-walk1', 'hero-stage-5-walk2',
  'hero-stage-0-atk1', 'hero-stage-0-atk2',
  'hero-stage-1-atk1', 'hero-stage-1-atk2',
  'hero-stage-2-atk1', 'hero-stage-2-atk2',
  'hero-stage-3-atk1', 'hero-stage-3-atk2',
  'hero-stage-4-atk1', 'hero-stage-4-atk2',
  'hero-stage-5-atk1', 'hero-stage-5-atk2',
  'goblin', 'knight', 'dragon',
  'armor', 'boots', 'shield',
  'sword', 'sword-gradius', 'sword-broad',
  'sword-great', 'sword-excalibur', 'sword-legend',
];

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export const assets = {
  ready: false,
  imgs: {},
  items: {},
  enemies: {},
  playerStages: [],
  playerFrames: [],
};

export async function loadAssets() {
  const results = await Promise.all(
    REF_FILES.map(key => {
      const url = new URL(`${REF}/${key}.png`, import.meta.url).href;
      return loadImage(url).then(img => [key, img]);
    })
  );

  for (const [key, img] of results) {
    if (img) assets.imgs[key] = img;
  }

  // Equipment icon shortcuts
  const itemMap = {
    sword: 'sword', swordBroad: 'sword-broad', swordGradius: 'sword-gradius',
    swordGreat: 'sword-great', swordExcalibur: 'sword-excalibur', swordLegend: 'sword-legend',
    shield: 'shield', armor: 'armor', boots: 'boots',
  };
  for (const [k, v] of Object.entries(itemMap)) {
    if (assets.imgs[v]) assets.items[k] = assets.imgs[v];
  }

  // Enemy shortcuts
  for (const t of ['goblin', 'knight', 'dragon']) {
    if (assets.imgs[t]) assets.enemies[t] = assets.imgs[t];
  }

  // Player stage frames
  for (let i = 0; i < 6; i++) {
    assets.playerStages[i] = assets.imgs[`hero-stage-${i}`] || null;
    assets.playerFrames[i] = {
      idle:  assets.imgs[`hero-stage-${i}`]       || null,
      walk1: assets.imgs[`hero-stage-${i}-walk1`] || null,
      walk2: assets.imgs[`hero-stage-${i}-walk2`] || null,
      atk1:  assets.imgs[`hero-stage-${i}-atk1`] || null,
      atk2:  assets.imgs[`hero-stage-${i}-atk2`] || null,
    };
  }

  assets.ready = true;
  return assets;
}

export function getPlayerStageSprite(player) {
  const n = Math.min(5, getPlayerAppearanceStage(player));
  return assets.playerStages[n] || null;
}

export { getPlayerAppearanceStage };
