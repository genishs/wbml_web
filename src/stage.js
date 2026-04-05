import { TILE_SIZE, COLORS } from './constants.js';
import { Enemy } from './enemy.js';

// Each stage: platforms, enemies, shop positions, goal
export function buildStage(stageNum) {
  const groundY = 312;
  const platforms = [];
  const enemies = [];
  const pickups = [];
  const shops = [];

  // Ground (always)
  const groundLen = 2400 + stageNum * 800;
  platforms.push({ x: 0, y: groundY, w: groundLen, h: 48, isGround: true });

  // Stage-specific layout
  if (stageNum === 1) {
    platforms.push({ x: 200, y: 240, w: 96, h: 16 });
    platforms.push({ x: 400, y: 200, w: 96, h: 16 });
    platforms.push({ x: 640, y: 240, w: 128, h: 16 });
    platforms.push({ x: 900, y: 180, w: 80, h: 16 });
    platforms.push({ x: 1100, y: 240, w: 96, h: 16 });

    enemies.push(new Enemy('slime', 300, groundY - 16));
    enemies.push(new Enemy('slime', 600, groundY - 16));
    enemies.push(new Enemy('goblin', 850, groundY - 26));
    enemies.push(new Enemy('slime', 1000, groundY - 16));
    enemies.push(new Enemy('goblin', 1200, groundY - 26));
    enemies.push(new Enemy('goblin', 1400, groundY - 26));
    enemies.push(new Enemy('dragon', 1700, groundY - 40));

    shops.push({ x: 500, y: groundY - 48, w: 48, h: 48 });
    shops.push({ x: 1300, y: groundY - 48, w: 48, h: 48 });

    // Gold pickups
    for (let i = 0; i < 12; i++) {
      pickups.push({ x: 150 + i * 150, y: groundY - 32, type: 'gold', value: 10, collected: false });
    }
  } else if (stageNum === 2) {
    platforms.push({ x: 150, y: 250, w: 80, h: 16 });
    platforms.push({ x: 350, y: 200, w: 80, h: 16 });
    platforms.push({ x: 550, y: 150, w: 80, h: 16 });
    platforms.push({ x: 750, y: 200, w: 96, h: 16 });
    platforms.push({ x: 1000, y: 240, w: 96, h: 16 });
    platforms.push({ x: 1300, y: 200, w: 80, h: 16 });
    platforms.push({ x: 1600, y: 240, w: 112, h: 16 });

    enemies.push(new Enemy('goblin', 400, groundY - 26));
    enemies.push(new Enemy('goblin', 700, groundY - 26));
    enemies.push(new Enemy('knight', 900, groundY - 28));
    enemies.push(new Enemy('goblin', 1100, groundY - 26));
    enemies.push(new Enemy('knight', 1350, groundY - 28));
    enemies.push(new Enemy('knight', 1550, groundY - 28));
    enemies.push(new Enemy('dragon', 2000, groundY - 40));

    shops.push({ x: 600, y: groundY - 48, w: 48, h: 48 });
    shops.push({ x: 1450, y: groundY - 48, w: 48, h: 48 });

    for (let i = 0; i < 15; i++) {
      pickups.push({ x: 200 + i * 160, y: groundY - 32, type: 'gold', value: 15, collected: false });
    }
  }

  const goalX = groundLen - 120;

  return { platforms, enemies, pickups, shops, goalX, groundLen };
}

export function drawPlatforms(ctx, platforms, camX) {
  for (const p of platforms) {
    const px = p.x - camX;
    if (px + p.w < 0 || px > 640) continue;

    if (p.isGround) {
      ctx.fillStyle = COLORS.groundTop;
      ctx.fillRect(px, p.y, p.w, 8);
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(px, p.y + 8, p.w, p.h - 8);
      // Grass pattern
      for (let tx = 0; tx < p.w; tx += 32) {
        ctx.fillStyle = '#50a030';
        ctx.fillRect(px + tx, p.y, 28, 6);
      }
    } else {
      ctx.fillStyle = '#907050';
      ctx.fillRect(px, p.y, p.w, p.h);
      ctx.fillStyle = '#b09060';
      ctx.fillRect(px, p.y, p.w, 4);
    }
  }
}

export function drawShops(ctx, shops, camX) {
  for (const s of shops) {
    const px = s.x - camX;
    if (px + s.w < 0 || px > 640) continue;

    ctx.fillStyle = COLORS.shop;
    ctx.fillRect(px, s.y, s.w, s.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SHOP', px + 4, s.y + 18);
    ctx.font = '9px monospace';
    ctx.fillText('ENTER', px + 5, s.y + 32);
  }
}

export function drawPickups(ctx, pickups, camX) {
  for (const p of pickups) {
    if (p.collected) continue;
    const px = p.x - camX;
    if (px + 12 < 0 || px > 640) continue;
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(px + 6, p.y + 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('G', px + 3, p.y + 10);
  }
}

export function drawGoal(ctx, goalX, camX, groundY) {
  const px = goalX - camX;
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(px, groundY - 80, 8, 80);
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(px + 8, groundY - 80, 40, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('GOAL', px + 10, groundY - 63);
}
