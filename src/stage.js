import { GROUND_Y, HUD_W, VIEW_W, COLORS } from './constants.js';
import { Enemy, Boss, enemyAirborne } from './enemy.js';
import { Pickup } from './pickup.js';
import { SWORD } from './equipment.js';

export const MAX_ROUNDS = 11;

// 아케이드 11라운드 정본 — 1차 자료(사용자 제공 doc/원더보이보스정보.html) 기준.
// HP는 그라디우스(공격력1) 기준 타수. 검 드롭: R2 킹뱀파이어→브로드, R5 자이언트콩→그레이트,
// R7 코인컬렉터→엑스칼리버, R8 데몬→레전드. (그라디우스는 R1 NPC 지급)
// ※ 자료대로 R2/R5/R7/R8은 2단 보스(chain). X-1=검 드롭, X-2=열쇠 드롭(마지막 보스 격파 시 성문 개방).
// MEKA DRAGON hp2=192 = 2페이즈 데이터(2페이즈 전투는 후속 #8).
// dir: 진행 방향(RL 라운드는 데이터에만 표기, 카메라 반전은 후속 단계). segments: 구역 시퀀스.
//   town  = 문(상점/시설) 밀집 / field = 적·픽업·지형 / climb = 다층 플랫폼 / bossgate = 보스문
const ROUNDS = [
  { name: 'DEATH MASTER', sky: '#0088ff', boss: 'fly',    hp: 4,   score: 2000,  sword: null,        dir: 'LR',
    enemies: ['snake','myconid','fangbat'],
    segments: [ { type:'town', len:640, doors:['quest','shield','boots'] }, { type:'field', len:880, terrain:'grass', enemies:3, pickup:'buff' }, { type:'climb', len:400 }, { type:'bossgate', len:240 } ] },
  { name: 'KING VAMPIRE', sky: '#1f6a3a', boss: 'fly',    hp: 6,  score: 2000,  sword: 'broad',     dir: 'LR',
    enemies: ['myconid','snake','fangbat'],
    chain: [ { name:'KING VAMPIRE',   type:'fly',    hp:6, score:2000, sword:'broad' },
             { name:'MYCONID MASTER', type:'ground', hp:8, score:2000, sword:null   } ],
    segments: [ { type:'town', len:600, doors:['shield','boots','magic'] }, { type:'field', len:1000, terrain:'water', enemies:3, pickup:'heart' }, { type:'climb', len:460 }, { type:'field', len:560, terrain:'grass', enemies:2, pickup:'potion' }, { type:'bossgate', len:240 } ] },
  { name: 'RED KNIGHT', sky: '#44506a', boss: 'ground', hp: 20,  score: 3000,  sword: null,        dir: 'RL',
    enemies: ['orc','skeleton','fangbat'],
    segments: [ { type:'field', len:760, terrain:'stone', enemies:3, pickup:'gold' }, { type:'town', len:520, doors:['shield','armor'] }, { type:'climb', len:480 }, { type:'field', len:640, terrain:'stone', enemies:2, pickup:'buff' }, { type:'bossgate', len:240 } ] },
  { name: 'KRAKEN', sky: '#0077cc', boss: 'fly',    hp: 24,  score: 3000,  sword: null,        dir: 'RL',
    enemies: ['jellyfish','crab','octopus'],
    segments: [ { type:'field', len:820, terrain:'coast', enemies:3, pickup:'gold' }, { type:'town', len:520, doors:['boots','magic'] }, { type:'field', len:820, terrain:'water', enemies:2, pickup:'heart' }, { type:'bossgate', len:240 } ] },
  { name: 'GIANT KONG', sky: '#338800', boss: 'ground', hp: 64,  score: 3000,  sword: 'great',     dir: 'LR',
    enemies: ['orc','werebat','anaconda'],
    chain: [ { name:'GIANT KONG',   type:'ground', hp:64, score:3000, sword:'great' },
             { name:'VAMPIRE BATS', type:'fly',    hp:16, score:2000, sword:null    } ],
    segments: [ { type:'town', len:600, doors:['shield','armor','magic'] }, { type:'field', len:1120, terrain:'mountain', enemies:4, pickup:'buff' }, { type:'climb', len:540 }, { type:'bossgate', len:240 } ] },
  { name: 'SPHINX', sky: '#aaaa77', boss: 'ground', hp: 84,  score: 3000,  sword: null,        dir: 'LR',
    enemies: ['anaconda','skeleton','wisp'],
    segments: [ { type:'town', len:580, doors:['shield','armor','magic'] }, { type:'field', len:1140, terrain:'desert', enemies:3, pickup:'potion' }, { type:'climb', len:480 }, { type:'bossgate', len:240 } ] },
  { name: 'COIN COLLECTOR', sky: '#7a1f1f', boss: 'fly',    hp: 32,  score: 4000,  sword: 'excalibur', dir: 'LR',
    enemies: ['wisp','wererat','ghost'],
    chain: [ { name:'COIN COLLECTOR', type:'fly',    hp:32, score:4000, sword:'excalibur' },
             { name:'BLUE KNIGHT',    type:'ground', hp:64, score:4000, sword:null        } ],
    segments: [ { type:'field', len:900, terrain:'lava', enemies:3, pickup:'gold' }, { type:'town', len:520, doors:['armor','magic'] }, { type:'field', len:820, terrain:'lava', enemies:3, pickup:'buff' }, { type:'bossgate', len:240 } ] },
  { name: 'DEMON', sky: '#2a1f3a', boss: 'ground', hp: 96,  score: 3000,  sword: 'legend',    dir: 'LR',
    enemies: ['wisp','goblin','werebat'],
    chain: [ { name:'DEMON',      type:'ground', hp:96, score:3000, sword:'legend' },
             { name:'HOB GOBLIN', type:'ground', hp:96, score:4000, sword:null     } ],
    segments: [ { type:'field', len:1000, terrain:'dungeon', enemies:3, pickup:'heart' }, { type:'town', len:520, doors:['armor','magic'] }, { type:'climb', len:540 }, { type:'bossgate', len:240 } ] },
  { name: 'SNOW KONG', sky: '#88ccee', boss: 'ground', hp: 96,  score: 4000,  sword: null,        dir: 'RL',
    enemies: ['snowyeti','yeti','ratmaster'],
    segments: [ { type:'town', len:560, doors:['armor','magic'] }, { type:'field', len:1240, terrain:'ice', enemies:4, pickup:'buff' }, { type:'climb', len:560 }, { type:'bossgate', len:240 } ] },
  { name: 'SILVER KNIGHT', sky: '#667088', boss: 'ground', hp: 96,  score: 5000,  sword: null,        dir: 'LR',
    enemies: ['undead','goblin','skeleton'],
    segments: [ { type:'field', len:1040, terrain:'castle', enemies:3, pickup:'potion' }, { type:'town', len:520, doors:['shield','armor'] }, { type:'climb', len:520 }, { type:'bossgate', len:240 } ] },
  { name: 'MEKA DRAGON', sky: '#000066', boss: 'ground', hp: 256, hp2: 192, score: 30000, sword: null, dir: 'LR', final: true,
    enemies: ['undead','goblin','roper'],
    segments: [ { type:'field', len:1200, terrain:'castle', enemies:4, pickup:'gold' }, { type:'climb', len:600 }, { type:'field', len:940, terrain:'castle', enemies:3, pickup:'heart' }, { type:'bossgate', len:300 } ] },
];

export function getRound(n) {
  return ROUNDS[Math.max(0, Math.min(ROUNDS.length - 1, n - 1))];
}

// 문(상점 입구) 정의
function makeDoor(id, x, type) {
  return { id, x, y: GROUND_Y - 52, w: 36, h: 52, type };
}

// 보스 문(검 보스/스테이지 보스 공용). 더 크고 위압적. boss=대상 Boss, drop='sword'|'key'.
function makeBossDoor(id, x, type, boss, drop) {
  const d = makeDoor(id, x, type);
  d.y = GROUND_Y - 70; d.w = 48; d.h = 70;
  d.boss = boss; d.drop = drop; d.cleared = false;
  if (drop === 'sword') d.swordReward = boss.swordReward;
  return d;
}

export function buildStage(stageNum) {
  const round  = getRound(stageNum);
  const dir    = round.dir || 'LR';
  const segs   = round.segments;
  const eTypes = round.enemies;
  const buff   = ['gauntlet', 'helmet', 'wingboots'][(stageNum - 1) % 3];

  const fieldLen  = segs.reduce((s, g) => s + g.len, 0);
  const groundLen = fieldLen + 220;                     // 보스문 앞 여유 바닥
  const platforms = [{ x: 0, y: GROUND_Y, w: groundLen, h: 60, isGround: true }];
  const enemies   = [];
  const doors     = [];
  const pickups   = [];

  // 보스 체인(스탯). 단일 보스 라운드는 1체, 2단 라운드(R2/R5/R7/R8)는 2체.
  // 원작 구조: 검 보스(X-1)는 별도 문/방 → 처치 시 검 드롭. 마지막=스테이지 보스 → 열쇠 드롭.
  const chainSpec = round.chain || [{
    name: round.name, type: round.boss, hp: round.hp, score: round.score, sword: round.sword,
  }];
  const bossChain = chainSpec.map(s => new Boss(s.type, fieldLen, GROUND_Y - 48, {
    name: s.name, hp: s.hp, score: s.score,
    swordReward: s.sword ? SWORD[s.sword] : null,
  }));
  const boss       = bossChain[0];
  const stageBoss  = bossChain[bossChain.length - 1];          // 열쇠 드롭(스테이지 보스)
  const swordBosses = bossChain.slice(0, -1);                  // 검 드롭(별도 방)

  // 세그먼트를 왼쪽부터 깔며 각 구역에 요소 배치 (마을→필드→다층→보스문)
  let cursor = 0, ei = 0, bossDoor = null;
  const townSpans = [];
  for (const seg of segs) {
    const x0 = cursor, x1 = cursor + seg.len, mid = (x0 + x1) / 2;

    if (seg.type === 'town') {
      townSpans.push({ x0, x1 });
      const list = seg.doors || [];
      list.forEach((t, i) => {
        const dx = x0 + seg.len * (i + 1) / (list.length + 1) - 18;
        doors.push(t === 'quest' ? makeDoor('quest', dx, 'quest') : makeDoor('shop-' + t, dx, t));
      });
    } else if (seg.type === 'field') {
      const n = seg.enemies ?? 3;
      for (let k = 0; k < n; k++) {
        const t  = eTypes[ei++ % eTypes.length];
        const ex = x0 + seg.len * (k + 0.5) / n;
        const ey = enemyAirborne(t) ? GROUND_Y - 150 : GROUND_Y - 90;
        enemies.push(new Enemy(t, ex, ey, { patrolMin: ex - 80, patrolMax: ex + 80 }));
      }
      for (let px = x0 + 140; px < x1 - 140; px += 320) {
        platforms.push({ x: px, y: GROUND_Y - (70 + (px % 3) * 12), w: 100, h: 16, terrain: seg.terrain });
      }
      if (seg.pickup) {
        const type = seg.pickup === 'buff' ? buff : seg.pickup;
        const low  = seg.pickup === 'gold' || seg.pickup === 'potion';
        const opt  = seg.pickup === 'gold' ? { amount: 50 } : undefined;
        pickups.push(new Pickup(type, mid, GROUND_Y - (low ? 18 : 70), opt));
      }
    } else if (seg.type === 'climb') {
      const steps = seg.steps ?? 4;
      for (let k = 0; k < steps; k++) {
        const px = x0 + seg.len * (k + 0.5) / steps - 50;
        platforms.push({ x: px, y: GROUND_Y - 60 - k * 38, w: 92, h: 16 });
      }
      const t  = eTypes[ei++ % eTypes.length];
      const ey = enemyAirborne(t) ? GROUND_Y - 150 : GROUND_Y - 90;
      enemies.push(new Enemy(t, mid, ey, { patrolMin: mid - 60, patrolMax: mid + 60 }));
    } else if (seg.type === 'bossgate') {
      bossDoor = makeBossDoor('boss-door', mid - 24, 'boss', stageBoss, 'key');
      doors.push(bossDoor);
    }
    cursor = x1;
  }

  // 시설 자동 배치: 병원은 비최종 라운드마다 1개(마지막 마을 끝), 바는 R1·R6(첫 마을 앞)
  if (!round.final && townSpans.length) {
    const t = townSpans[townSpans.length - 1];
    doors.push(makeDoor('hospital', t.x1 - 70, 'hospital'));
  }
  if ((stageNum === 1 || stageNum === 6) && townSpans.length) {
    const t = townSpans[0];
    doors.push(makeDoor('bar', t.x0 + 40, 'bar'));
  }

  // 검 보스 문(2단 라운드의 X-1): 스테이지 중반 별도 방. 처치 시 검을 떨어뜨리고 방을 나온다.
  swordBosses.forEach((sb, i) => {
    const sx = Math.round(fieldLen * (0.38 + i * 0.18));
    doors.push(makeBossDoor('sword-door-' + i, sx, 'swordboss', sb, 'sword'));
  });

  // 성문(스테이지 출구): 필드 끝. 열쇠 보유 시 통과해 클리어. 보스방 안이 아니라 필드에 있음.
  const castleGate = { x: groundLen - 100, y: GROUND_Y - 132, w: 60, h: 132 };

  // R1: 첫 NPC(그라디우스 + 물약) 직후, 검 받기 전 길을 막는 장애물
  const gate = stageNum === 1 ? { x: 250, y: GROUND_Y - 90, w: 26, h: 90 } : null;

  return {
    platforms, enemies, doors, boss, bossChain, groundLen, gate, castleGate, pickups, bossDoor, dir,
    sky: round.sky, roundName: round.name, final: !!round.final,
  };
}

export function drawStage(ctx, stageData, camX, hasKey) {
  const { platforms, enemies, doors } = stageData;
  _drawSky(ctx, stageData.sky);
  _drawPlatforms(ctx, platforms, camX);
  _drawDoors(ctx, doors, camX);
  _drawCastleGate(ctx, stageData.castleGate, camX, hasKey);   // 스테이지 끝 성문(필드)
  for (const e of enemies) e.draw(ctx, camX);
}

// 보스방(아레나): 문을 열고 들어가면 나오는 화면 가득한 석조 전투방. 보스를 직접 상대.
// 성문은 방 안이 아니라 필드(스테이지 끝)에 있다. 보스 처치→보상(검/열쇠) 드롭→주우면 방을 나온다.
// camX는 항상 0(한 화면 고정).
export function drawArena(ctx, arena, boss) {
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
  // 좌우 입구(닫힌 철문 — 가둠 연출) + 횃불
  ctx.fillStyle = '#1a1422';
  ctx.fillRect(L, 0, 14, GROUND_Y); ctx.fillRect(R - 14, 0, 14, GROUND_Y);
  ctx.fillStyle = '#5a5a6a';
  for (let by = 0; by < GROUND_Y; by += 16) { ctx.fillRect(L, by, 12, 12); ctx.fillRect(R - 12, by, 12, 12); }
  _torch(ctx, L + 26, GROUND_Y - 120);
  _torch(ctx, R - 64, GROUND_Y - 120);
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

    if (d.type === 'boss' || d.type === 'swordboss') { _drawBossDoor(ctx, sx, d); continue; }

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
    const label = { weapon: 'WPN', shield: 'SHD', armor: 'ARM', boots: 'BTS', magic: 'MAG', quest: 'NPC', hospital: 'HOSP', bar: 'BAR' }[d.type] ?? '?';
    ctx.fillText(label, sx + d.w / 2, d.y - 4);
    ctx.textAlign = 'left';
  }
}

// 보스문: 위압적인 석문(아치). 열고 들어가면 보스방으로 전환.
//  boss      = 스테이지 보스(열쇠) — 해골 장식 / swordboss = 검 보스 — 검 장식
//  d.cleared = 이미 처치 → 어둑하게 + CLEAR 표시
function _drawBossDoor(ctx, sx, d) {
  const isSword = d.type === 'swordboss';
  ctx.fillStyle = isSword ? '#1f2a3a' : '#3a2030';  // 석문 기둥
  ctx.fillRect(sx - 6, d.y - 16, d.w + 12, d.h + 16);
  ctx.fillStyle = '#0a0508';                         // 아치 내부(어둠)
  ctx.fillRect(sx + 3, d.y, d.w - 6, d.h);
  ctx.beginPath(); ctx.arc(sx + d.w / 2, d.y, d.w / 2 - 3, Math.PI, 0); ctx.fill();

  const mx = sx + d.w / 2, my = d.y - 6;
  if (isSword) {                                      // 검 장식
    ctx.fillStyle = '#caa030'; ctx.fillRect(mx - 5, my + 1, 10, 2);
    ctx.fillStyle = '#cfd6e0'; ctx.fillRect(mx - 1, my - 6, 2, 10);
  } else {                                            // 해골 장식
    ctx.fillStyle = '#e8e0d0'; ctx.fillRect(mx - 5, my - 5, 10, 9);
    ctx.fillStyle = '#0a0508'; ctx.fillRect(mx - 4, my - 2, 3, 3); ctx.fillRect(mx + 1, my - 2, 3, 3);
  }

  ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  if (d.cleared) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(sx - 6, d.y - 16, d.w + 12, d.h + 16);  // 어둑
    ctx.fillStyle = '#88cc88'; ctx.fillText('CLEAR', mx, d.y - 20);
  } else {
    ctx.fillStyle = isSword ? '#88bbff' : '#ff5050';
    ctx.fillText(isSword ? 'SWORD' : 'BOSS', mx, d.y - 20);
  }
  ctx.textAlign = 'left';
}

function _torch(ctx, x, y) {
  ctx.fillStyle = '#5a3a18'; ctx.fillRect(x, y, 4, 20);          // 받침
  ctx.fillStyle = '#ff9020'; ctx.fillRect(x - 3, y - 8, 10, 10); // 불꽃
  ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 1, y - 5, 6, 6);
  ctx.fillStyle = 'rgba(255,180,60,0.18)'; ctx.fillRect(x - 16, y - 16, 36, 40); // 빛무리
}
