import { GROUND_Y, HUD_W, COLORS } from './constants.js';
import { Enemy, Boss } from './enemy.js';
import { SHOP_TYPE, SWORD } from './equipment.js';

export const MAX_ROUNDS = 11;

// 아케이드 11라운드: 테마/보스/검 보상/적 구성 (GDD 2.2표 기준, 일부 추정치)
const ROUNDS = [
  { name: 'DEATH',         sky: '#5c94fc', boss: 'death',   sword: 'broad',     enemies: ['blob','snake','bat']    },
  { name: 'MUSHROOM KING', sky: '#2f5a30', boss: 'generic', sword: null,        enemies: ['blob','bat','snake']    },
  { name: 'RED KNIGHT',    sky: '#5a5a82', boss: 'generic', sword: null,        enemies: ['knight','blob','bat']   },
  { name: 'KRAKEN',        sky: '#2f72b8', boss: 'generic', sword: null,        enemies: ['bat','snake','blob']    },
  { name: 'KONG',          sky: '#3f5a30', boss: 'generic', sword: 'great',     enemies: ['knight','blob','bat']   },
  { name: 'SPHINX',        sky: '#b89850', boss: 'generic', sword: null,        enemies: ['snake','blob','knight'] },
  { name: 'DEMON',         sky: '#7a1f1f', boss: 'generic', sword: 'excalibur', enemies: ['bat','knight','blob']   },
  { name: 'GHOST',         sky: '#2a2a3c', boss: 'generic', sword: null,        enemies: ['bat','snake','knight']  },
  { name: 'MINOTAUR',      sky: '#4a3a2a', boss: 'generic', sword: null,        enemies: ['knight','bat','blob']   },
  { name: 'GREAT CATFISH', sky: '#245a78', boss: 'generic', sword: 'legend',    enemies: ['snake','bat','knight']  },
  { name: 'MEKA DRAGON',   sky: '#0e0e1a', boss: 'generic', sword: null,        enemies: ['knight','bat','knight'], final: true },
];

export function getRound(n) {
  return ROUNDS[Math.max(0, Math.min(ROUNDS.length - 1, n - 1))];
}

// 문(상점 입구) 정의
function makeDoor(id, x, type) {
  return { id, x, y: GROUND_Y - 52, w: 36, h: 52, type };
}

export function buildStage(stageNum) {
  const round     = getRound(stageNum);
  const groundLen = 2800 + stageNum * 400;
  const platforms = [{ x: 0, y: GROUND_Y, w: groundLen, h: 60, isGround: true }];
  const enemies   = [];
  const doors     = [];

  // 공중 플랫폼 (라운드 길이에 걸쳐 배치)
  for (let x = 400; x < groundLen - 400; x += 350) {
    platforms.push({ x, y: GROUND_Y - (60 + (x % 3) * 12), w: 100, h: 16 });
  }

  // 적: 라운드가 깊어질수록 증가, 라운드별 타입을 순환 배치
  const count = 5 + stageNum;
  const types = round.enemies;
  for (let i = 0; i < count; i++) {
    const t  = types[i % types.length];
    const ex = 500 + i * ((groundLen - 1000) / count);
    const ey = t === 'bat' ? GROUND_Y - 80 : GROUND_Y - (t === 'knight' ? 30 : 18);
    enemies.push(new Enemy(t, ex, ey, { patrolMin: ex - 80, patrolMax: ex + 80 }));
  }

  // 상점 문 (후반일수록 희소, 최종 라운드는 없음)
  if (!round.final) {
    doors.push(makeDoor('shop-weapon', 180, SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-shield', 320, SHOP_TYPE.SHIELD));
    if (stageNum <= 6) doors.push(makeDoor('shop-armor', 460, SHOP_TYPE.ARMOR));
    if (stageNum <= 4) doors.push(makeDoor('shop-boots', 600, SHOP_TYPE.BOOTS));
  }

  const goalX = groundLen - 150;
  // 라운드 끝을 지키는 보스
  const boss = new Boss(round.boss, goalX - 220, GROUND_Y - 48, {
    swordReward: round.sword ? SWORD[round.sword] : null,
  });

  return {
    platforms, enemies, doors, boss, groundLen, goalX,
    sky: round.sky, roundName: round.name, final: !!round.final,
  };
}

export function drawStage(ctx, stageData, camX) {
  const { platforms, enemies, doors, boss } = stageData;

  _drawSky(ctx, stageData.sky);
  _drawPlatforms(ctx, platforms, camX);
  _drawDoors(ctx, doors, camX);
  for (const e of enemies) e.draw(ctx, camX);
  if (boss) boss.draw(ctx, camX);
  _drawGoal(ctx, stageData.goalX, camX);
}

function _drawSky(ctx, sky) {
  ctx.fillStyle = sky || '#5c94fc';
  ctx.fillRect(HUD_W, 0, 528, 360);
  // 구름
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
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
