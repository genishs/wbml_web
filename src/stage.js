import { GROUND_Y, HUD_W, VIEW_W, COLORS } from './constants.js';
import { Enemy, Boss, enemyAirborne } from './enemy.js';
import { Pickup } from './pickup.js';
import { SHOP_TYPE, SWORD } from './equipment.js';

export const MAX_ROUNDS = 11;

// 아케이드 정식 보스 라인업(웹 자료 기준): 명칭·점수·HP·검 드롭 위치.
// HP는 그라디우스(공격력1) 기준 타수 단위 — DEATH=4타. 검 드롭: 킹뱀파이어→브로드,
// 자이언트콩→그레이트, 코인컬렉터→엑스칼리버, 데몬→레전드. (그라디우스는 1라운드 NPC가 지급)
const ROUNDS = [
  { name: 'DEATH MASTER',   sky: '#0088ff', boss: 'fly',    hp: 4,   score: 2000,  sword: null,        enemies: ['snake','myconid','fangbat']      },
  { name: 'KING VAMPIRE',   sky: '#223388', boss: 'fly',    hp: 6,   score: 2000,  sword: 'broad',     enemies: ['fangbat','myconid','python']     },
  { name: 'RED KNIGHT',     sky: '#4455bb', boss: 'ground', hp: 20,  score: 3000,  sword: null,        enemies: ['orc','skeleton','fangbat']       },
  { name: 'KRAKEN',         sky: '#0077cc', boss: 'fly',    hp: 24,  score: 3000,  sword: null,        enemies: ['jellyfish','crab','octopus']     },
  { name: 'GIANT KONG',     sky: '#338800', boss: 'ground', hp: 64,  score: 3000,  sword: 'great',     enemies: ['orc','werebat','anaconda']       },
  { name: 'SPHINX',         sky: '#aaaa77', boss: 'ground', hp: 84,  score: 3000,  sword: null,        enemies: ['anaconda','skeleton','wisp']     },
  { name: 'COIN COLLECTOR', sky: '#aa0000', boss: 'fly',    hp: 32,  score: 4000,  sword: 'excalibur', enemies: ['wisp','wererat','ghost']         },
  { name: 'DEMON',          sky: '#7a1f1f', boss: 'ground', hp: 96,  score: 3000,  sword: 'legend',    enemies: ['wisp','goblin','werebat']        },
  { name: 'SNOW KONG',      sky: '#88ccee', boss: 'ground', hp: 96,  score: 4000,  sword: null,        enemies: ['yeti','ratmaster','snowyeti']    },
  { name: 'SILVER KNIGHT',  sky: '#663322', boss: 'ground', hp: 96,  score: 5000,  sword: null,        enemies: ['undead','goblin','tarman']       },
  { name: 'MECHA DRAGON',   sky: '#000066', boss: 'ground', hp: 256, score: 30000, sword: null,        enemies: ['undead','goblin','roper'], final: true },
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
  const fieldLen  = 2600 + stageNum * 360;
  const bossRoom  = { x: fieldLen, w: VIEW_W };          // 라운드 끝 = 보스 방(한 화면)
  const groundLen = fieldLen + bossRoom.w;
  const platforms = [{ x: 0, y: GROUND_Y, w: groundLen, h: 60, isGround: true }];
  const enemies   = [];
  const doors     = [];

  // 공중 플랫폼 (필드 구간에만 배치, 보스 방은 비움)
  for (let x = 400; x < fieldLen - 300; x += 350) {
    platforms.push({ x, y: GROUND_Y - (60 + (x % 3) * 12), w: 100, h: 16 });
  }

  // 적: 라운드가 깊어질수록 증가, 보스 방 앞까지만 배치
  const count = 5 + stageNum;
  const types = round.enemies;
  const span  = Math.max(400, fieldLen - 700);
  for (let i = 0; i < count; i++) {
    const t  = types[i % types.length];
    const ex = 500 + i * (span / count);
    const ey = enemyAirborne(t) ? GROUND_Y - 150 : GROUND_Y - 90;
    enemies.push(new Enemy(t, ex, ey, { patrolMin: ex - 80, patrolMax: ex + 80 }));
  }

  // 1라운드: 첫 NPC(그라디우스 검 + 물약 지급) + 검 받기 전 길을 막는 장애물
  let gate = null;
  if (stageNum === 1) {
    doors.push(makeDoor('quest', 110, 'quest'));
    gate = { x: 250, y: GROUND_Y - 90, w: 26, h: 90 };
  }

  // 상점 문 (후반일수록 희소, 최종 라운드는 없음). 1라운드는 장애물 뒤로 배치.
  if (!round.final) {
    const base = stageNum === 1 ? 380 : 180;
    doors.push(makeDoor('shop-weapon', base,       SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-shield', base + 140, SHOP_TYPE.SHIELD));
    doors.push(makeDoor('shop-magic',  base + 280, SHOP_TYPE.MAGIC));
    if (stageNum <= 6) doors.push(makeDoor('shop-armor', base + 420, SHOP_TYPE.ARMOR));
    if (stageNum <= 4) doors.push(makeDoor('shop-boots', base + 560, SHOP_TYPE.BOOTS));
  }

  // 필드 수집물: 시간제 강화아이템(라운드마다 순환) + 하트/물약/돈주머니를 곳곳에 숨김
  const pickups = [];
  const buffCycle = ['gauntlet', 'helmet', 'wingboots'];
  const fieldStart = stageNum === 1 ? 520 : 320;   // 1라운드는 장애물/NPC 뒤부터
  const fieldEnd   = fieldLen - 200;
  const at = (frac) => fieldStart + (fieldEnd - fieldStart) * frac;
  pickups.push(new Pickup(buffCycle[(stageNum - 1) % 3], at(0.30), GROUND_Y - 70));
  pickups.push(new Pickup('heart',  at(0.62), GROUND_Y - 70));
  pickups.push(new Pickup('potion', at(0.80), GROUND_Y - 18));
  pickups.push(new Pickup('gold',   at(0.45), GROUND_Y - 18, { amount: 50 }));

  // 보스: 방 안 오른쪽에 대기. 입장 전까지 active=false → 필드로 안 나옴
  const bossX = bossRoom.x + bossRoom.w * 0.62;
  const boss  = new Boss(round.boss, bossX, GROUND_Y - 48, {
    name: round.name,
    hp:   round.hp,
    score: round.score,
    swordReward: round.sword ? SWORD[round.sword] : null,
  });
  boss.homeX     = bossX;
  boss.patrolMin = bossRoom.x + 70;
  boss.patrolMax = bossRoom.x + bossRoom.w - boss.w - 40;

  return {
    platforms, enemies, doors, boss, groundLen, bossRoom, gate, pickups,
    sky: round.sky, roundName: round.name, final: !!round.final,
  };
}

export function drawStage(ctx, stageData, camX, inRoom = false) {
  const { platforms, enemies, doors, boss } = stageData;

  _drawSky(ctx, stageData.sky);
  _drawPlatforms(ctx, platforms, camX);
  _drawBossRoom(ctx, stageData.bossRoom, camX, inRoom);
  _drawDoors(ctx, doors, camX);
  for (const e of enemies) e.draw(ctx, camX);
  if (boss && boss.active) boss.draw(ctx, camX);
}

function _drawSky(ctx, sky) {
  ctx.fillStyle = sky || '#0088ff';
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
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(sx, p.y, p.w, 8);
      ctx.fillStyle = '#885544';
      ctx.fillRect(sx, p.y + 8, p.w, p.h - 8);
      ctx.fillStyle = '#aa7766';
      for (let tx = 0; tx < p.w; tx += 48) {
        ctx.fillRect(sx + tx, p.y + 10, 40, 4);
      }
    } else {
      ctx.fillStyle = '#774433';
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = '#996655';
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
    const label = { weapon: 'WPN', shield: 'SHD', armor: 'ARM', boots: 'BTS', magic: 'MAG', quest: 'NPC' }[d.type] ?? '?';
    ctx.fillText(label, sx + d.w / 2, d.y - 4);
    ctx.textAlign = 'left';
  }
}

// 보스 방(석조 챔버). closed=true면 입구에 철문이 내려와 가둠.
function _drawBossRoom(ctx, room, camX, closed) {
  if (!room) return;
  const left  = room.x - camX + HUD_W;
  const right = room.x + room.w - camX + HUD_W;
  if (right < HUD_W || left > 640) return;

  const x0 = Math.max(HUD_W, left);
  const x1 = Math.min(640, right);
  const w  = x1 - x0;

  // 뒷벽 (지면 위)
  ctx.fillStyle = '#241c2e';
  ctx.fillRect(x0, 0, w, GROUND_Y);
  // 벽돌 무늬
  ctx.fillStyle = '#2f2638';
  for (let y = 8; y < GROUND_Y; y += 26) {
    const off = ((y / 26) | 0) % 2 ? 24 : 0;
    for (let x = x0 - 48 + off; x < x1; x += 48) {
      const bx = Math.max(x0, x);
      ctx.fillRect(bx, y, Math.min(x + 44, x1) - bx, 22);
    }
  }
  // 석조 바닥
  ctx.fillStyle = '#37303f';
  ctx.fillRect(x0, GROUND_Y, w, 60);
  ctx.fillStyle = '#2a2433';
  for (let x = x0; x < x1; x += 32) ctx.fillRect(x, GROUND_Y, 2, 60);

  // 좌측 입구 기둥 + 횃불
  if (left >= HUD_W - 20 && left <= 640) {
    ctx.fillStyle = '#1a1422';
    ctx.fillRect(left, 0, 14, GROUND_Y);
    _torch(ctx, left + 22, GROUND_Y - 120);
  }
  // 우측 끝 기둥 + 횃불
  if (right <= 640 + 20 && right >= HUD_W) {
    ctx.fillStyle = '#1a1422';
    ctx.fillRect(right - 14, 0, 14, GROUND_Y);
    _torch(ctx, right - 26, GROUND_Y - 120);
  }

  // 닫힌 철문(입장 후 빠져나가지 못함)
  if (closed && left >= HUD_W - 14 && left <= 640) {
    ctx.fillStyle = '#5a5a6a';
    for (let by = 0; by < GROUND_Y; by += 16) ctx.fillRect(left, by, 12, 12);
    ctx.fillStyle = '#3a3a48';
    for (let by = 0; by < GROUND_Y; by += 16) ctx.fillRect(left + 12, by + 2, 4, 12);
  }
}

function _torch(ctx, x, y) {
  ctx.fillStyle = '#5a3a18'; ctx.fillRect(x, y, 4, 20);          // 받침
  ctx.fillStyle = '#ff9020'; ctx.fillRect(x - 3, y - 8, 10, 10); // 불꽃
  ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 1, y - 5, 6, 6);
  ctx.fillStyle = 'rgba(255,180,60,0.18)'; ctx.fillRect(x - 16, y - 16, 36, 40); // 빛무리
}
