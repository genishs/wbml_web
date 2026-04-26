// Wonder Boy in Monster Land — Sprite Renderer
// Uses reference art images (assets/reference_art/) with canvas pixel-art fallback.
import { assets } from './assets.js';

const SWORD_STAGE = {
  none: 0, gradius: 1, broad: 2, great: 3, excalibur: 4, legend: 5,
};

function heroStageN(eq) {
  return SWORD_STAGE[eq?.sword?.id ?? 'none'] ?? 0;
}

function heroImageKey(n, state, animFrame) {
  switch (state) {
    case 'walk':     return `hero-stage-${n}-walk${animFrame === 1 ? 2 : 1}`;
    case 'attack':   return `hero-stage-${n}-atk${animFrame === 1 ? 2 : 1}`;
    case 'jump':
    case 'knockback':return `hero-stage-${n}-walk1`;
    default:         return `hero-stage-${n}`;
  }
}

export function drawWonderBoy(ctx, { facing, state, animFrame, eq }) {
  const DRAW_H = 72;
  const FALLBACK_W = 28;
  const n   = heroStageN(eq);
  const key = heroImageKey(n, state, animFrame);
  const img = assets.imgs[key];

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (img && img.naturalHeight > 0) {
    const drawW = img.naturalWidth * (DRAW_H / img.naturalHeight);
    if (facing === -1) {
      ctx.translate(drawW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, drawW, DRAW_H);
    } else {
      ctx.translate(-drawW / 2 + FALLBACK_W / 2, 0);
      ctx.drawImage(img, 0, 0, drawW, DRAW_H);
    }
  } else {
    // Fallback: colored silhouette
    ctx.fillStyle = '#cc2222';
    if (facing === -1) { ctx.translate(FALLBACK_W, 0); ctx.scale(-1, 1); }
    ctx.fillRect(0, 0, FALLBACK_W, DRAW_H);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(6, 4, 16, 16); // head
  }

  ctx.restore();
}

// ── Enemy image renderer ──────────────────────────────────────────────────────
const ENEMY_IMG_MAP = {
  blob: 'goblin', goblin: 'goblin', goblin_king: 'goblin',
  knight: 'knight', dark_knight: 'knight',
  dragon: 'dragon', great_dragon: 'dragon', dragon_warrior: 'dragon',
};

export function drawEnemySprite(ctx, { type, facing, w, h }) {
  const imgKey = ENEMY_IMG_MAP[type];
  const img    = imgKey ? assets.imgs[imgKey] : null;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (img && img.naturalHeight > 0) {
    if (facing === -1) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(img, 0, 0, w, h);
  } else {
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

// ── Legacy canvas pixel-art sprites ──────────────────────────────────────────
// Used by enemy.draw() colour-based rendering when images aren't loaded.
const P = [
  null, '#F8B068', '#5C2810', '#F0A010', '#401808', '#8C4820',
  '#101010', '#D0D0C0', '#C81818', '#FFD030', '#30A830', '#60D060',
  '#0C400C', '#E06018', '#983008', '#3858A8', '#202868', '#7898E0',
  '#B02020', '#701010', '#FF8000',
];

function make(rows) {
  const h = rows.length, w = rows[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = P[parseInt(row[x], 36)];
      if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
    }
  });
  return cv;
}

const SLIME_1 = make([
  '0000aaaa00', '000aaaaaaa', '00aaabbaab', '0aaab6aab6',
  '0aaabababa', '0aaaaaaaaab', '0aaaaaaaaaa', '00aaaaaaaaa',
  '000aaaaaaa', '0000aaaaaa',
]);
const SLIME_2 = make([
  '0000000000', '0000000000', '00aaaaaaaaaaaa', '0aaab6aaab6aaa',
  '0aaababababaaa', '0aaaaaaaaaaaaa', '00aaaaaaaaaa', '0000aaaaaa',
]);

const GOBLIN_1 = make([
  '00000ddddd', '0000dde66edd', '0000dddddddd', '0000dddedeed',
  '0000edddddde', '0000e8888ee', '0000888888', '0000888888',
  '0000888888', '0004944494', '0004488884', '0004488884',
  '0000480048', '0000480048', '0000440044',
]);
const GOBLIN_2 = make([
  '00000ddddd', '0000dde66edd', '0000dddddddd', '0000dddedeed',
  '0000edddddde', '0000e8888ee', '0888888888', '0088888888',
  '0000888888', '0004944494', '0004488884', '0004488884',
  '0000048048', '0000048048', '0000044044',
]);

const KNIGHT_1 = make([
  '0000ffffff', '000ffffffhf', '000fgggggff', '000fg6g6gff',
  '000fffffffh', '0000f777ff', '00fffffffff', '00fhffhffff',
  '00fffffffff', '0007ffffff7', '000ffgffgff', '000ffgffgff',
  '000fg0ff0gf', '0000g0ff0g', '0000ggffgg',
]);
const KNIGHT_2 = make([
  '0000ffffff', '000ffffffhf', '000fgggggff', '000fg6g6gff',
  '000fffffffh', '0000f777ff', '0ffffffffffh', '0ffhffhfffff',
  '00fffffffff', '0007ffffff7', '000ffgffgff', '000ffgffgff',
  '0000fg0gff', '0000fg0gff', '0000ffgff',
]);

function makeDragon(frame) {
  const cv = document.createElement('canvas');
  cv.width = 48; cv.height = 40;
  const c = cv.getContext('2d');
  c.fillStyle = '#B02020'; c.fillRect(12, 12, 32, 18);
  c.fillStyle = '#D04040'; c.fillRect(14, 18, 28, 12);
  c.fillStyle = '#C03030'; c.fillRect(2, 6, 16, 16);
  c.fillStyle = '#B02020'; c.fillRect(0, 6, 6, 8);
  c.fillStyle = '#801010'; c.fillRect(0, 14, 8, 6);
  c.fillStyle = '#FFD030'; c.fillRect(6, 8, 5, 5);
  c.fillStyle = '#101010'; c.fillRect(7, 9, 3, 3);
  c.fillStyle = '#901010';
  for (let i = 0; i < 4; i++) {
    const sx = 16 + i * 8, sy = frame === 1 ? 1 : 0;
    c.fillRect(sx + 1, sy, 2, 10); c.fillRect(sx, sy + 4, 4, 6);
  }
  c.fillStyle = '#901818'; c.fillRect(40, 20, 8, 8);
  c.fillStyle = '#701010'; c.fillRect(44, 26, 4, 6); c.fillRect(46, 30, 2, 4);
  const lo = frame === 0 ? 0 : 2;
  c.fillStyle = '#901818';
  c.fillRect(16, 30 - lo, 8, 10); c.fillRect(28, 30 + lo, 8, Math.max(6, 10 - lo));
  if (frame === 1) { c.fillStyle = '#FF8000'; c.fillRect(0, 15, 8, 5); }
  return cv;
}

export const sprites = {
  slime:  [SLIME_1, SLIME_2],
  goblin: [GOBLIN_1, GOBLIN_2],
  knight: [KNIGHT_1, KNIGHT_2],
  dragon: [makeDragon(0), makeDragon(1)],
};
