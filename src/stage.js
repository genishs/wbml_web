import { GROUND_Y, HUD_W, VIEW_W, COLORS } from './constants.js';
import { Enemy, Boss, enemyAirborne } from './enemy.js';
import { Pickup } from './pickup.js';
import { SWORD } from './equipment.js';
import { drawBiomeBackground, biomeHazard, platColors } from './biomes.js';

// 열린 하늘 구역(떠다니는 구름 발판·도약대 배치 대상)
const OPEN_SKY = new Set(['village', 'meadow', 'beach', 'water', 'island_town']);

export const MAX_ROUNDS = 11;

// 아케이드 11라운드 정본 — 1차 자료(사용자 제공 doc/원더보이보스정보.html) 기준.
// HP는 그라디우스(공격력1) 기준 타수. 검 드롭: R2 킹뱀파이어→브로드, R5 자이언트콩→그레이트,
// R7 코인컬렉터→엑스칼리버, R8 데몬→레전드. (그라디우스는 R1 NPC 지급)
// ※ 자료대로 R2/R5/R7/R8은 2단 보스(chain). X-1=검 드롭, X-2=열쇠 드롭(마지막 보스 격파 시 성문 개방).
// MEKA DRAGON hp2=192 = 2페이즈 데이터(2페이즈 전투는 후속 #8).
// dir: 진행 방향(RL=우→좌, 카메라 반전). segments: 구역 시퀀스(각 세그먼트가 biome 보유).
//   town = 문(상점/시설) 밀집 / field = 적·픽업·지형 / climb = 다층 플랫폼 / bossgate = 보스문
//   biome(구역): 한 라운드가 여러 구역을 거쳐 진행(해변→물속→동굴→성벽 등). 사용자 확정 구성(2026-06-13).
//   해저드(물/용암/잠수)는 biome에서 자동 결정(biomes.js). cf. doc/map-composition.md
const ROUNDS = [
  { name: 'DEATH MASTER', sky: '#0088ff', boss: 'fly',    hp: 4,   score: 2000,  sword: null,        dir: 'LR',
    enemies: ['snake','myconid','fangbat'],
    segments: [ { type:'town', biome:'village', len:600, doors:['quest','shield','boots'] }, { type:'field', biome:'meadow', len:760, enemies:3, pickup:'buff' }, { type:'field', biome:'cave', len:560, enemies:2, pickup:'gold' }, { type:'bossgate', biome:'cave', len:240 } ] },
  { name: 'KING VAMPIRE', sky: '#1f6a3a', boss: 'fly',    hp: 6,  score: 2000,  sword: 'broad',     dir: 'LR',
    enemies: ['myconid','snake','fangbat'],
    chain: [ { name:'KING VAMPIRE',   type:'fly',    hp:6, score:2000, sword:'broad' },
             { name:'MYCONID MASTER', type:'ground', hp:8, score:2000, sword:null   } ],
    segments: [ { type:'field', biome:'cave', len:440, enemies:2, pickup:'gold' }, { type:'town', biome:'mushroom', len:560, doors:['shield','boots','magic'] }, { type:'field', biome:'mushroom', len:620, enemies:3, pickup:'heart' }, { type:'field', biome:'water', len:560, enemies:2, pickup:'potion' }, { type:'bossgate', biome:'mushroom', len:240 } ] },
  { name: 'RED KNIGHT', sky: '#44506a', boss: 'ground', hp: 20,  score: 3000,  sword: null,        dir: 'RL',
    enemies: ['orc','skeleton','fangbat'],
    segments: [ { type:'field', biome:'castle_in', len:760, enemies:3, pickup:'gold' }, { type:'town', biome:'castle_in', len:520, doors:['shield','armor'] }, { type:'climb', biome:'castle_in', len:480 }, { type:'field', biome:'castle_in', len:640, enemies:2, pickup:'buff' }, { type:'bossgate', biome:'castle_in', len:240 } ] },
  { name: 'KRAKEN', sky: '#0077cc', boss: 'fly',    hp: 24,  score: 3000,  sword: null,        dir: 'RL',
    enemies: ['jellyfish','crab','octopus'],
    segments: [ { type:'field', biome:'beach', len:820, enemies:3, pickup:'gold' }, { type:'town', biome:'island_town', len:520, doors:['boots','magic'] }, { type:'field', biome:'water', len:820, enemies:2, pickup:'heart' }, { type:'bossgate', biome:'water', len:240 } ] },
  { name: 'GIANT KONG', sky: '#338800', boss: 'ground', hp: 64,  score: 3000,  sword: 'great',     dir: 'LR',
    enemies: ['orc','werebat','anaconda'],
    chain: [ { name:'GIANT KONG',   type:'ground', hp:64, score:3000, sword:'great' },
             { name:'VAMPIRE BATS', type:'fly',    hp:16, score:2000, sword:null    } ],
    segments: [ { type:'field', biome:'mountain', len:640, enemies:3, pickup:'gold' }, { type:'town', biome:'forest', len:520, doors:['shield','armor','magic'] }, { type:'field', biome:'forest', len:520, enemies:2, pickup:'buff' }, { type:'climb', biome:'cave', len:460 }, { type:'field', biome:'desert', len:540, enemies:2, pickup:'potion' }, { type:'bossgate', biome:'desert', len:240 } ] },
  { name: 'SPHINX', sky: '#aaaa77', boss: 'ground', hp: 84,  score: 3000,  sword: null,        dir: 'LR',
    enemies: ['anaconda','skeleton','wisp'],
    segments: [ { type:'town', biome:'pyramid', len:580, doors:['shield','armor','magic'] }, { type:'field', biome:'pyramid', len:1140, enemies:3, pickup:'potion' }, { type:'climb', biome:'pyramid', len:480 }, { type:'bossgate', biome:'pyramid', len:240 } ] },
  { name: 'COIN COLLECTOR', sky: '#2ab0ff', boss: 'fly',    hp: 32,  score: 4000,  sword: 'excalibur', dir: 'LR',
    enemies: ['wisp','wererat','ghost'],
    chain: [ { name:'COIN COLLECTOR', type:'fly',    hp:32, score:4000, sword:'excalibur' },
             { name:'BLUE KNIGHT',    type:'ground', hp:64, score:4000, sword:null        } ],
    segments: [ { type:'field', biome:'beach', len:820, enemies:3, pickup:'gold' }, { type:'town', biome:'beach', len:520, doors:['armor','magic'] }, { type:'field', biome:'beach', len:820, enemies:3, pickup:'buff' }, { type:'bossgate', biome:'beach', len:240 } ] },
  { name: 'DEMON', sky: '#7a2012', boss: 'ground', hp: 96,  score: 3000,  sword: 'legend',    dir: 'LR',
    enemies: ['wisp','goblin','werebat'],
    chain: [ { name:'DEMON',      type:'ground', hp:96, score:3000, sword:'legend' },
             { name:'HOB GOBLIN', type:'ground', hp:96, score:4000, sword:null     } ],
    segments: [ { type:'field', biome:'lava', len:760, enemies:3, pickup:'gold' }, { type:'town', biome:'cave', len:480, doors:['armor','magic'] }, { type:'field', biome:'cave', len:440, enemies:2, pickup:'heart' }, { type:'field', biome:'ice_castle', len:520, enemies:2, pickup:'buff' }, { type:'bossgate', biome:'ice_castle', len:240 } ] },
  { name: 'SNOW KONG', sky: '#88ccee', boss: 'ground', hp: 96,  score: 4000,  sword: null,        dir: 'RL',
    enemies: ['snowyeti','yeti','ratmaster'],
    segments: [ { type:'field', biome:'ice_castle', len:700, enemies:3, pickup:'buff' }, { type:'town', biome:'ice_castle', len:520, doors:['armor','magic'] }, { type:'climb', biome:'ice_castle', len:520 }, { type:'field', biome:'ice_castle', len:640, enemies:2, pickup:'potion' }, { type:'bossgate', biome:'ice_castle', len:240 } ] },
  { name: 'SILVER KNIGHT', sky: '#667088', boss: 'ground', hp: 96,  score: 5000,  sword: null,        dir: 'LR',
    enemies: ['undead','goblin','skeleton'],
    segments: [ { type:'field', biome:'beach', len:640, enemies:2, pickup:'gold' }, { type:'field', biome:'underwater', len:620, enemies:2, pickup:'heart' }, { type:'field', biome:'cave', len:520, enemies:2, pickup:'potion' }, { type:'town', biome:'castle_out', len:520, doors:['shield','armor'] }, { type:'field', biome:'castle_out', len:520, enemies:2, pickup:'buff' }, { type:'bossgate', biome:'castle_out', len:240 } ] },
  { name: 'MEKA DRAGON', sky: '#000066', boss: 'ground', hp: 256, hp2: 192, score: 30000, sword: null, dir: 'LR', final: true,
    enemies: ['undead','goblin','roper'],
    segments: [ { type:'field', biome:'void_castle', len:1200, enemies:4, pickup:'gold' }, { type:'climb', biome:'void_castle', len:600 }, { type:'field', biome:'void_castle', len:940, enemies:3, pickup:'heart' }, { type:'bossgate', biome:'void_castle', len:300 } ] },
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
  const hazards   = [];     // 특수지형: water(부력)/deepwater(잠수)/lava(접촉피해)/spring(도약대)
  const areas     = [];     // 구역 시퀀스 [{x0,x1,biome}] — 배경 밴드 렌더용

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
    const biome = seg.biome || 'meadow';
    areas.push({ x0, x1, biome });            // 마지막 보스문 앞 여유 바닥은 아래에서 연장

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
        platforms.push({ x: px, y: GROUND_Y - (70 + (px % 3) * 12), w: 100, h: 16, biome });
      }
      // 특수지형 해저드 — 구역(biome)이 결정한다(biomes.js). lava=접촉피해+도약대 / water=부력 / deepwater=전구간 잠수
      const hz = biomeHazard(biome);
      if (hz === 'lava') {
        const lw = Math.round(Math.min(130, seg.len * 0.16));
        const lx = Math.round(x0 + seg.len * 0.46);
        hazards.push({ kind: 'lava',   x: lx,       y: GROUND_Y - 10, w: lw, h: 70 });
        hazards.push({ kind: 'spring', x: lx - 58,  y: GROUND_Y - 14, w: 32, h: 14 });  // 용암 직전 도약대
      } else if (hz === 'water') {
        const hw = Math.round(Math.min(300, seg.len * 0.36));
        hazards.push({ kind: 'water', x: Math.round(mid - hw / 2), y: GROUND_Y - 22, w: hw, h: 82 });
      } else if (hz === 'deepwater') {
        hazards.push({ kind: 'water', x: x0, y: 0, w: seg.len, h: GROUND_Y });          // 전 구간 잠수(상시 부력)
      }
      // 열린 하늘 구역: 떠다니는 구름 발판 + 닿기 위한 도약대(원작 R1 블록·R4 구름 점프 감각)
      if (OPEN_SKY.has(biome)) {
        const cpx = Math.round(x0 + seg.len * 0.55);
        platforms.push({ x: cpx - 46, y: GROUND_Y - 116, w: 92, h: 14, cloud: true, biome });
        hazards.push({ kind: 'spring', x: cpx - 120, y: GROUND_Y - 14, w: 32, h: 14 });
      }
      if (seg.pickup) {
        const type = seg.pickup === 'buff' ? buff : seg.pickup;
        const low  = seg.pickup === 'gold' || seg.pickup === 'potion';
        const opt  = seg.pickup === 'gold' ? { amount: 50 } : undefined;
        pickups.push(new Pickup(type, mid, GROUND_Y - (low ? 18 : 70), opt));
      }
    } else if (seg.type === 'climb') {
      const steps = seg.steps ?? 4;
      const open  = OPEN_SKY.has(biome);
      for (let k = 0; k < steps; k++) {
        const px = x0 + seg.len * (k + 0.5) / steps - 50;
        const plat = { x: px, y: GROUND_Y - 60 - k * 38, w: 92, h: 16, biome };
        if (open) plat.cloud = true;            // 열린 하늘 climb → 구름 발판(아래→위 통과)
        platforms.push(plat);
      }
      if (open) hazards.push({ kind: 'spring', x: Math.round(x0 + 30), y: GROUND_Y - 14, w: 32, h: 14 });
      const t  = eTypes[ei++ % eTypes.length];
      const ey = enemyAirborne(t) ? GROUND_Y - 150 : GROUND_Y - 90;
      enemies.push(new Enemy(t, mid, ey, { patrolMin: mid - 60, patrolMax: mid + 60 }));
    } else if (seg.type === 'bossgate') {
      bossDoor = makeBossDoor('boss-door', mid - 24, 'boss', stageBoss, 'key');
      doors.push(bossDoor);
    }
    cursor = x1;
  }
  if (areas.length) areas[areas.length - 1].x1 = groundLen;   // 보스문 앞 여유 바닥까지 구역 연장

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
  // 원작대로 검 가디언은 '비밀 입구' 뒤 — 숨은 문(↑로 탐색해 드러냄).
  swordBosses.forEach((sb, i) => {
    const sx = Math.round(fieldLen * (0.38 + i * 0.18));
    const d = makeBossDoor('sword-door-' + i, sx, 'swordboss', sb, 'sword');
    d.hidden = true; d.revealed = false;
    doors.push(d);
  });

  // 숨은 보너스 상점: 특정 지점에서 ↑를 눌러야 드러나는 추가 상점(원작의 ↑탐색 재미).
  const HIDDEN_SHOP = { 3: 'shield', 4: 'magic', 6: 'magic', 9: 'armor', 10: 'magic' };
  if (HIDDEN_SHOP[stageNum]) {
    const hx = Math.round(fieldLen * 0.64);
    const d = makeDoor('hidden-shop', hx, HIDDEN_SHOP[stageNum]);
    d.hidden = true; d.revealed = false;
    doors.push(d);
  }

  // 성문(스테이지 출구): 필드 끝. 열쇠 보유 시 통과해 클리어. 보스방 안이 아니라 필드에 있음.
  const castleGate = { x: groundLen - 100, y: GROUND_Y - 132, w: 60, h: 132 };

  // R1: 첫 NPC(그라디우스 + 물약) 직후, 검 받기 전 길을 막는 장애물
  const gate = stageNum === 1 ? { x: 250, y: GROUND_Y - 90, w: 26, h: 90 } : null;

  // RL 라운드(R3·R4·R9): 원작은 우→좌 진행. LR로 배치한 뒤 전체 x를 좌우 미러링한다.
  // (플레이어 우측 스폰·카메라/성문 충돌 방향 처리는 game.js에서 dir로 분기.)
  if (dir === 'RL') _mirrorStageX({ platforms, enemies, doors, pickups, castleGate, gate, hazards, areas }, groundLen);

  return {
    platforms, enemies, doors, boss, bossChain, groundLen, gate, castleGate, pickups, bossDoor, dir, hazards, areas,
    sky: round.sky, roundName: round.name, final: !!round.final,
  };
}

// 스테이지 전체를 수평으로 뒤집는다(좌→우 배치를 우→좌 진행으로). x' = len - x - w.
function _mirrorStageX(d, len) {
  const mx = (x, w) => len - x - (w || 0);
  for (const p of d.platforms) if (!p.isGround) p.x = mx(p.x, p.w);  // 바닥은 전폭이라 불변
  for (const dr of d.doors)    dr.x = mx(dr.x, dr.w);
  for (const pk of d.pickups)  pk.x = mx(pk.x, pk.w);
  if (d.castleGate) d.castleGate.x = mx(d.castleGate.x, d.castleGate.w);
  if (d.gate)       d.gate.x       = mx(d.gate.x, d.gate.w);
  for (const h of d.hazards)   h.x = mx(h.x, h.w);
  for (const a of d.areas) { const nx0 = mx(a.x1, 0), nx1 = mx(a.x0, 0); a.x0 = nx0; a.x1 = nx1; }  // 구역 범위 반전
  for (const e of d.enemies) {
    const nx = mx(e.x, e.w);
    const pmin = mx(e.patrolMax, e.w), pmax = mx(e.patrolMin, e.w);  // 순찰 범위도 반전
    e.x = nx; e.patrolMin = pmin; e.patrolMax = pmax;
    e.facing = -e.facing; e.vx = -e.vx;
  }
}

export function drawStage(ctx, stageData, camX, hasKey) {
  const { platforms, enemies, doors } = stageData;
  drawBiomeBackground(ctx, stageData.areas, camX, Date.now());   // 구역별 하늘+지면 밴드 + 장식
  _drawPlatforms(ctx, platforms, camX);
  _drawHazards(ctx, stageData.hazards, camX);
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

function _drawPlatforms(ctx, platforms, camX) {
  for (const p of platforms) {
    const sx = p.x - camX + HUD_W;
    if (sx + p.w < HUD_W || sx > 640) continue;
    if (p.isGround) {
      continue;                          // 지면은 구역별 배경 밴드(drawBiomeBackground)가 그린다
    } else if (p.cloud) {
      // 구름 발판: 아래에서 위로 통과 가능, 윗면에만 착지(원작 부유 발판)
      const t = Date.now() / 500 + sx * 0.02;
      ctx.fillStyle = 'rgba(245,250,255,0.95)';
      for (let cx = 0; cx < p.w; cx += 18) {
        const r = 9 + Math.sin(t + cx * 0.3) * 2;
        ctx.fillRect(sx + cx, p.y - r + 6, 20, r + 4);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(sx, p.y, p.w, 6);
      ctx.fillStyle = 'rgba(200,215,235,0.8)'; ctx.fillRect(sx, p.y + 5, p.w, 2);
    } else {
      const c = platColors(p.biome);     // 구역별 플랫폼 색
      ctx.fillStyle = c.face;
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = c.top;
      ctx.fillRect(sx, p.y, p.w, 5);
    }
  }
}

// 특수지형 해저드 렌더(애니메이션은 Date.now 기반 — 게임 프레임과 무관하게 부드럽게)
function _drawHazards(ctx, hazards, camX) {
  if (!hazards) return;
  const now = Date.now();
  for (const h of hazards) {
    const sx = Math.round(h.x - camX + HUD_W);
    if (sx + h.w < HUD_W || sx > 640) continue;
    if (h.kind === 'water')       _drawWater(ctx, sx, h, now);
    else if (h.kind === 'lava')   _drawLava(ctx, sx, h, now);
    else if (h.kind === 'spring') _drawSpring(ctx, sx, h);
  }
}

function _drawWater(ctx, sx, h, now) {
  ctx.fillStyle = 'rgba(40,120,220,0.42)';
  ctx.fillRect(sx, h.y + 6, h.w, h.h);
  ctx.fillStyle = 'rgba(120,190,255,0.55)';                 // 출렁이는 수면
  for (let x = 0; x < h.w; x += 8) {
    const yy = h.y + 6 + Math.sin(now / 240 + (sx + x) * 0.06) * 2;
    ctx.fillRect(sx + x, Math.round(yy), 6, 3);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';                 // 반짝임
  for (let x = (Math.floor(now / 300) * 4) % 24; x < h.w; x += 30) ctx.fillRect(sx + x, h.y + 13, 3, 1);
}

function _drawLava(ctx, sx, h, now) {
  ctx.fillStyle = '#7a1500'; ctx.fillRect(sx, h.y + 4, h.w, h.h);
  ctx.fillStyle = '#ff5a00';                                // 끓는 표면
  for (let x = 0; x < h.w; x += 6) {
    const yy = h.y + 2 + Math.sin(now / 160 + (sx + x) * 0.09) * 2;
    ctx.fillRect(sx + x, Math.round(yy), 6, 6);
  }
  ctx.fillStyle = '#ffd000';                                // 부글거리는 밝은 점
  for (let i = 0; i < h.w; i += 22) {
    const bx = (i + Math.floor(now / 120) * 4) % h.w;
    const by = h.y + 4 + (Math.sin(now / 200 + i) + 1) * 3;
    ctx.fillRect(sx + bx, Math.round(by), 3, 3);
  }
  ctx.fillStyle = 'rgba(255,90,0,0.12)';                    // 열기 글로우
  ctx.fillRect(sx - 6, h.y - 22, h.w + 12, 28);
}

function _drawSpring(ctx, sx, h) {
  ctx.fillStyle = '#888c96'; ctx.fillRect(sx + 2, h.y + h.h - 4, h.w - 4, 4);   // 받침
  ctx.fillStyle = '#c8ccd6';                                                    // 코일
  for (let i = 0; i < 3; i++) ctx.fillRect(sx + 4, h.y + 3 + i * 4, h.w - 8, 2);
  ctx.fillStyle = '#ff4444'; ctx.fillRect(sx + 1, h.y, h.w - 2, 4);             // 윗판
  ctx.fillStyle = '#ff9090'; ctx.fillRect(sx + 1, h.y, h.w - 2, 1);
}

function _drawDoors(ctx, doors, camX) {
  for (const d of doors) {
    const sx = d.x - camX + HUD_W;
    if (sx + d.w < HUD_W || sx > 640) continue;

    // 숨은 문(미발견): 정식 문은 그리지 않고 미세한 반짝임만 — ↑로 탐색해 드러냄
    if (d.hidden && !d.revealed) { _drawHiddenHint(ctx, sx, d); continue; }

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

// 숨은 문 힌트: 벽/지면에 아주 옅게 깜빡이는 반짝임. 위치를 어렴풋이 암시하되 노골적이지 않게.
function _drawHiddenHint(ctx, sx, d) {
  const t = Date.now() / 260 + sx * 0.05;
  const a = 0.10 + 0.09 * Math.sin(t);
  const cx = Math.round(sx + d.w / 2), cy = Math.round(d.y + d.h * 0.55);
  ctx.fillStyle = `rgba(255,255,190,${a})`;
  ctx.fillRect(cx - 1, cy - 1, 2, 2);
  ctx.fillStyle = `rgba(255,255,190,${a * 0.7})`;
  ctx.fillRect(cx - 7, cy + 3, 1, 1);
  ctx.fillRect(cx + 6, cy - 4, 1, 1);
  ctx.fillRect(cx + 2, cy + 6, 1, 1);
}

function _torch(ctx, x, y) {
  ctx.fillStyle = '#5a3a18'; ctx.fillRect(x, y, 4, 20);          // 받침
  ctx.fillStyle = '#ff9020'; ctx.fillRect(x - 3, y - 8, 10, 10); // 불꽃
  ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 1, y - 5, 6, 6);
  ctx.fillStyle = 'rgba(255,180,60,0.18)'; ctx.fillRect(x - 16, y - 16, 36, 40); // 빛무리
}
