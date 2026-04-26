import { GROUND_Y, HUD_W, COLORS } from './constants.js';
import { Enemy } from './enemy.js';
import { SHOP_TYPE } from './equipment.js';

// 문(상점 입구) 정의
function makeDoor(id, x, type) {
  return { id, x, y: GROUND_Y - 52, w: 36, h: 52, type };
}

export function buildStage(stageNum) {
  const groundLen = 3200 + stageNum * 800;
  const platforms = [{ x: 0, y: GROUND_Y, w: groundLen, h: 60, isGround: true }];
  const enemies   = [];
  const doors     = [];

  // 공중 플랫폼
  const plats = [
    { x: 400,  y: GROUND_Y - 70, w: 100, h: 16 },
    { x: 700,  y: GROUND_Y - 90, w: 80,  h: 16 },
    { x: 1050, y: GROUND_Y - 60, w: 110, h: 16 },
    { x: 1400, y: GROUND_Y - 80, w: 90,  h: 16 },
    { x: 1750, y: GROUND_Y - 70, w: 100, h: 16 },
  ];
  platforms.push(...plats);

  // 적들
  enemies.push(new Enemy('blob',   500,  GROUND_Y - 18, { patrolMin: 450, patrolMax: 650 }));
  enemies.push(new Enemy('snake',  800,  GROUND_Y - 12));
  enemies.push(new Enemy('blob',   1100, GROUND_Y - 18, { patrolMin: 1050, patrolMax: 1250 }));
  enemies.push(new Enemy('bat',    950,  GROUND_Y - 80, { patrolMin: 880, patrolMax: 1080 }));
  enemies.push(new Enemy('knight', 1500, GROUND_Y - 30, { patrolMin: 1420, patrolMax: 1620 }));
  enemies.push(new Enemy('blob',   1800, GROUND_Y - 18, { patrolMin: 1750, patrolMax: 1950 }));

  // 상점 문들 (스테이지 초반에 4개 배치 — 테스트용)
  doors.push(makeDoor('shop-weapon', 180, SHOP_TYPE.WEAPON));
  doors.push(makeDoor('shop-shield', 320, SHOP_TYPE.SHIELD));
  doors.push(makeDoor('shop-armor',  460, SHOP_TYPE.ARMOR));
  doors.push(makeDoor('shop-boots',  600, SHOP_TYPE.BOOTS));

  const goalX = groundLen - 150;
  return { platforms, enemies, doors, groundLen, goalX };
}

export function drawStage(ctx, stageData, camX) {
  const { platforms, enemies, doors } = stageData;

  _drawSky(ctx);
  _drawPlatforms(ctx, platforms, camX);
  _drawDoors(ctx, doors, camX);
  for (const e of enemies) e.draw(ctx, camX);
  _drawGoal(ctx, stageData.goalX, camX);
}

function _drawSky(ctx) {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(HUD_W, 0, 528, 360);
  // 구름
  ctx.fillStyle = '#ffffff';
  for (const [cx, cy] of [[200, 60],[350, 40],[120, 80],[450, 55]]) {
    _cloud(ctx, HUD_W + cx, cy);
  }
}

function _cloud(ctx, x, y) {
  ctx.fillRect(x, y, 48, 14);
  ctx.fillRect(x + 8, y - 8, 32, 12);
}

function _drawPlatforms(ctx, platforms, camX) {
  for (const p of platforms) {
    const sx = p.x - camX + HUD_W;
    if (sx + p.w < HUD_W || sx > 640) continue;
    if (p.isGround) {
      ctx.fillStyle = '#50a830';
      ctx.fillRect(sx, p.y, p.w, 8);
      ctx.fillStyle = '#a07040';
      ctx.fillRect(sx, p.y + 8, p.w, p.h - 8);
      ctx.fillStyle = '#c09050';
      for (let tx = 0; tx < p.w; tx += 48) {
        ctx.fillRect(sx + tx, p.y + 10, 40, 4);
      }
    } else {
      ctx.fillStyle = '#906850';
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = '#b08860';
      ctx.fillRect(sx, p.y, p.w, 5);
    }
  }
}

function _drawDoors(ctx, doors, camX) {
  for (const d of doors) {
    const sx = d.x - camX + HUD_W;
    if (sx + d.w < HUD_W || sx > 640) continue;

    // 문 틀
    ctx.fillStyle = '#6a4820';
    ctx.fillRect(sx, d.y, d.w, d.h);
    // 문 열린 부분 (어두운 내부)
    ctx.fillStyle = '#100a06';
    ctx.fillRect(sx + 4, d.y + 10, d.w - 8, d.h - 10);
    // 손잡이
    ctx.fillStyle = '#d7b46a';
    ctx.fillRect(sx + d.w - 9, d.y + 28, 4, 4);

    // 상점 종류 라벨
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    const label = { weapon: 'WPN', shield: 'SHD', armor: 'ARM', boots: 'BTS' }[d.type] ?? '?';
    ctx.fillText(label, sx + d.w / 2, d.y - 4);
    ctx.textAlign = 'left';
  }
}

function _drawGoal(ctx, goalX, camX) {
  const sx = goalX - camX + HUD_W;
  if (sx < HUD_W - 60 || sx > 640) return;
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(sx, GROUND_Y - 80, 8, 80);
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(sx + 8, GROUND_Y - 80, 48, 28);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('GOAL', sx + 12, GROUND_Y - 61);
}
