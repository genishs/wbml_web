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
  const groundLen = fieldLen + 200;                     // 보스문 앞 여유 바닥
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

  // 보스문: 필드 끝. 다른 상점처럼 문을 열고 들어가면 보스방(아레나)으로 전환
  const bossDoor = makeDoor('boss-door', fieldLen + 60, 'boss');
  bossDoor.y = GROUND_Y - 70; bossDoor.w = 48; bossDoor.h = 70;   // 보스문은 더 크고 위압적
  doors.push(bossDoor);

  // 보스 객체(스탯). 위치/순찰은 아레나 입장 시 설정됨
  const boss = new Boss(round.boss, fieldLen, GROUND_Y - 48, {
    name: round.name,
    hp:   round.hp,
    score: round.score,
    swordReward: round.sword ? SWORD[round.sword] : null,
  });

  return {
    platforms, enemies, doors, boss, groundLen, gate, pickups, bossDoor,
    sky: round.sky, roundName: round.name, final: !!round.final,
  };
}

export function drawStage(ctx, stageData, camX) {
  const { platforms, enemies, doors } = stageData;
  _drawSky(ctx, stageData.sky);
  _drawPlatforms(ctx, platforms, camX);
  _drawDoors(ctx, doors, camX);
  for (const e of enemies) e.draw(ctx, camX);
}

// 보스방(아레나): 문을 열고 들어가면 나오는 화면 가득한 석조 방. 보스를 직접 상대.
// 격파 후 열쇠로 우측 성문을 열어 클리어. camX는 항상 0(한 화면 고정).
export function drawArena(ctx, arena, boss, hasKey) {
  const L = HUD_W, R = HUD_W + VIEW_W;
  // 뒷벽 + 벽돌
  ctx.fillStyle = '#241c2e'; ctx.fillRect(L, 0, VIEW_W, GROUND_Y);
  ctx.fillStyle = '#2f2638';
  for (let y = 8; y < GROUND_Y; y += 26) {
    const off = ((y / 26) | 0) % 2 ? 24 : 0;
    for (let x = L - 48 + off; x < R; x += 48) {
      const bx = Math.max(L, x);
      ctx.fillRect(bx, y, Math.min(x + 44, R) - bx, 22);
    }
  }
  // 바닥
  ctx.fillStyle = '#37303f'; ctx.fillRect(L, GROUND_Y, VIEW_W, 60);
  ctx.fillStyle = '#2a2433';
  for (let x = L; x < R; x += 32) ctx.fillRect(x, GROUND_Y, 2, 60);
  // 좌측 입구(닫힌 철문 — 가둠 연출) + 횃불
  ctx.fillStyle = '#1a1422'; ctx.fillRect(L, 0, 14, GROUND_Y);
  ctx.fillStyle = '#5a5a6a';
  for (let by = 0; by < GROUND_Y; by += 16) ctx.fillRect(L, by, 12, 12);
  _torch(ctx, L + 26, GROUND_Y - 120);
  _torch(ctx, R - 64, GROUND_Y - 120);
  // 우측 성문 + 보스
  _drawCastleGate(ctx, arena.castleGate, 0, hasKey);
  if (boss && !(boss.dead && boss.deathTimer <= 0)) boss.draw(ctx, 0);
}

// 성문(라운드 출구). 열쇠 보유 시 창살이 올라가 통과 가능한 모습.
function _drawCastleGate(ctx, g, camX, open) {
  if (!g) return;
  const sx = Math.round(g.x - camX + HUD_W);
  if (sx + g.w * 2 < HUD_W || sx - g.w > 640) return;

  // 성벽 기둥(문 양옆)
  ctx.fillStyle = '#6a6a78';
  ctx.fillRect(sx - 16, g.y - 24, 16, g.h + 24);
  ctx.fillRect(sx + g.w, g.y - 24, 16, g.h + 24);
  ctx.fillStyle = '#52525e';                    // 흉벽(총안)
  for (let bx = -16; bx < g.w + 16; bx += 12) {
    if (((bx + 16) / 12 | 0) % 2 === 0) ctx.fillRect(sx + bx, g.y - 32, 10, 10);
  }
  // 아치 입구(어두운 안쪽)
  ctx.fillStyle = '#0a0810';
  ctx.fillRect(sx, g.y, g.w, g.h);
  ctx.beginPath(); ctx.arc(sx + g.w / 2, g.y, g.w / 2, Math.PI, 0); ctx.fill();

  if (open) {
    // 열린 상태: 창살이 위로 올라가 있고 안쪽에서 빛이 새어나옴
    ctx.fillStyle = 'rgba(255,230,140,0.25)';
    ctx.fillRect(sx + 4, g.y + 6, g.w - 8, g.h - 6);
    ctx.fillStyle = '#7a5a2a';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx + 4 + i * (g.w / 5), g.y - 6, 3, 10);
    ctx.fillStyle = '#ffe060'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('▶ CLEAR', sx + g.w / 2, g.y - 14); ctx.textAlign = 'left';
  } else {
    // 잠긴 상태: 쇠창살(포트컬리스)
    ctx.fillStyle = '#9a9aa8';
    for (let i = 0; i <= 4; i++) ctx.fillRect(sx + 3 + i * (g.w - 6) / 4, g.y + 4, 3, g.h - 4);
    for (let j = 0; j < g.h; j += 16) ctx.fillRect(sx + 3, g.y + 4 + j, g.w - 6, 3);
    ctx.fillStyle = '#ffcc00';                  // 자물쇠
    ctx.fillRect(sx + g.w / 2 - 5, g.y + g.h / 2 - 5, 10, 9);
    ctx.fillStyle = '#0a0810'; ctx.fillRect(sx + g.w / 2 - 1, g.y + g.h / 2 - 1, 2, 4);
  }
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

    if (d.type === 'boss') { _drawBossDoor(ctx, sx, d); continue; }

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

// 보스문: 해골이 박힌 위압적인 석문(아치). 열고 들어가면 보스방으로 전환.
function _drawBossDoor(ctx, sx, d) {
  ctx.fillStyle = '#3a2030';                       // 석문 기둥
  ctx.fillRect(sx - 6, d.y - 16, d.w + 12, d.h + 16);
  ctx.fillStyle = '#0a0508';                        // 아치 내부(어둠)
  ctx.fillRect(sx + 3, d.y, d.w - 6, d.h);
  ctx.beginPath(); ctx.arc(sx + d.w / 2, d.y, d.w / 2 - 3, Math.PI, 0); ctx.fill();
  // 해골 장식
  const skx = sx + d.w / 2, sky = d.y - 6;
  ctx.fillStyle = '#e8e0d0'; ctx.fillRect(skx - 5, sky - 5, 10, 9);
  ctx.fillStyle = '#0a0508'; ctx.fillRect(skx - 4, sky - 2, 3, 3); ctx.fillRect(skx + 1, sky - 2, 3, 3);
  // 라벨
  ctx.fillStyle = '#ff5050'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  ctx.fillText('BOSS', sx + d.w / 2, d.y - 20); ctx.textAlign = 'left';
}

function _torch(ctx, x, y) {
  ctx.fillStyle = '#5a3a18'; ctx.fillRect(x, y, 4, 20);          // 받침
  ctx.fillStyle = '#ff9020'; ctx.fillRect(x - 3, y - 8, 10, 10); // 불꽃
  ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 1, y - 5, 6, 6);
  ctx.fillStyle = 'rgba(255,180,60,0.18)'; ctx.fillRect(x - 16, y - 16, 36, 40); // 빛무리
}
