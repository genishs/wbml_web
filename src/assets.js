import { getPlayerAppearanceStage } from './equipment.js';

const REF_BASE = '../assets/reference_art';

const refs = {
  items: {
    sword: 'sword.png',
    swordBroad: 'sword-broad.png',
    swordGradius: 'sword-gradius.png',
    swordExcalibur: 'sword-excalibur.png',
    swordLegend: 'sword-legend.png',
    shield: 'shield.png',
    armor: 'armor.png',
    boots: 'boots.png',
  },
  enemies: {
    goblin: 'goblin.png',
    knight: 'knight.png',
    dragon: 'dragon.png',
  },
  playerStages: [
    'hero-stage-0.png',
    'hero-stage-1.png',
    'hero-stage-2.png',
    'hero-stage-3.png',
    'hero-stage-4.png',
    'hero-stage-5.png',
  ],
};

function buildRef(name) {
  return new URL(`${REF_BASE}/${encodeURIComponent(name)}`, import.meta.url).href;
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export const assets = {
  ready: false,
  items: {},
  enemies: {},
  playerStages: [],
};

export async function loadAssets() {
  const itemEntries = await Promise.all(
    Object.entries(refs.items).map(async ([key, file]) => [key, await loadImage(buildRef(file))])
  );
  assets.items = Object.fromEntries(itemEntries);

  const enemyEntries = await Promise.all(
    Object.entries(refs.enemies).map(async ([key, file]) => [key, await loadImage(buildRef(file))])
  );
  assets.enemies = Object.fromEntries(enemyEntries);

  assets.playerStages = await Promise.all(refs.playerStages.map(file => loadImage(buildRef(file))));
  assets.ready = true;
  return assets;
}

export function getPlayerStageSprite(player) {
  const stageIndex = Math.min(assets.playerStages.length - 1, getPlayerAppearanceStage(player));
  return assets.playerStages[stageIndex] || null;
}
