// Wonder Boy in Monster Land — Procedural Sprite Renderer
// 모든 캐릭터를 캔버스에 직접 그린다(외부 PNG 의존 제거).
// 검/방패/갑옷은 equipment.js의 색 데이터로 등급별 외형이 달라진다.

// ── 픽셀 매트릭스 렌더 헬퍼 ───────────────────────────────────────────────
function pad16(s) { return (s + '................').slice(0, 16); }

function drawMatrix(ctx, rows, pal, sc) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (col) { ctx.fillStyle = col; ctx.fillRect(x * sc, y * sc, sc, sc); }
    }
  }
}

function fr(ctx, x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ── 히어로(원더보이) ─────────────────────────────────────────────────────
// 16×24 그리드, 스케일 3 → 시각 48×72. 충돌박스(28) 기준 가운데 정렬.
const HERO_UPPER = [
  '',
  '....cccc',
  '...cccccc',
  '..cccccccc',
  '..cksssskc',
  '...sssse',
  '...ssssss',
  '...sdssss',
  '....ssss',
  '....httt',
  '...tttttt',
  '..tttttttt',
  '..tutttttt',
  '...tttttt',
  '...pppp',
  '...pppp',
].map(pad16);

const HERO_LEGS = {
  idle:  ['...pp.pp', '...pp.pp', '...ss.ss', '...ss.ss', '...ss.ss', '..bbb.bbb', '..bbb.bbb', ''],
  walk1: ['...pp.pp', '...pp.pp', '..sss.ss', '..ss..ss', '..ss...s', '.bbb..bb', '.bbb...b', ''],
  walk2: ['...pp.pp', '...pp.pp', '...ss.sss', '...ss..ss', '..s...sss', '..bb..bbb', '..b...bbb', ''],
  jump:  ['...pp.pp', '...pppppp', '...ss.ss', '...ss.ss', '..bbb.bbb', '..bbb.bbb', '', ''],
}; // eslint-disable-line
for (const k of Object.keys(HERO_LEGS)) HERO_LEGS[k] = HERO_LEGS[k].map(pad16);

// 색은 원작 ROM 색상 PROM에서 추출한 정품 팔레트(doc/arcade-palette.json) 색군으로 매핑
function heroPalette(eq) {
  const armor = eq?.armor;
  const boots = eq?.boots;
  return {
    '.': null,
    c: armor?.helmetColor || '#00cc00',          // 초록 모자
    k: '#008800',
    s: '#ffccbb', d: '#cc9988', e: '#000000', h: '#774433', // 피부/명암/눈/머리
    t: armor?.bodyColor || '#0077cc',            // 튜닉(파랑)
    u: armor?.trimColor || '#004499',
    p: '#ee0000', q: '#aa0000',                  // 빨강 반바지
    b: (boots && boots.id !== 'none' && boots.color) || '#663322',
  };
}

function legsFor(state, animFrame) {
  if (state === 'walk')      return animFrame === 1 ? HERO_LEGS.walk2 : HERO_LEGS.walk1;
  if (state === 'jump' || state === 'knockback') return HERO_LEGS.jump;
  return HERO_LEGS.idle;
}

export function drawWonderBoy(ctx, { facing, state, animFrame, eq, attackPhase = 0 }) {
  const SC = 3;
  const GW = 16;
  const ox = (28 - GW * SC) / 2; // -10, 충돌박스 가운데 정렬

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(ox, 0);
  if (facing === -1) { ctx.translate(GW * SC, 0); ctx.scale(-1, 1); }

  const pal = heroPalette(eq);
  drawMatrix(ctx, HERO_UPPER, pal, SC);          // 상체(0~15행)
  drawLegs(ctx, state, animFrame, pal, SC);      // 다리(16~23행)
  drawShield(ctx, eq?.shield);                   // 방패: 앞손(진행방향)
  drawSword(ctx, eq?.sword, state, attackPhase); // 검: 뒷손 → 앞으로 찌르기(맨 위)
  ctx.restore();
}

function drawLegs(ctx, state, animFrame, pal, sc) {
  const rows = legsFor(state, animFrame);
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (col) { ctx.fillStyle = col; ctx.fillRect(x * sc, (y + 16) * sc, sc, sc); }
    }
  }
}

// 진짜 '검' 모양: 손잡이 + 크로스가드 + 날(하이라이트) + 뾰족한 끝.
// 평상시엔 뒷손에 세워 들고, 공격 시 앞으로 4단계 찌르기.
function drawSword(ctx, sword, state, phase) {
  if (!sword || sword.id === 'none') return;
  const blade    = sword.bladeColor || '#d8d8e8';
  const guard    = sword.guardColor || '#c0a020';
  const reach    = sword.reach || 14;
  const reachVis = 16 + reach;

  if (state === 'attack') {
    // 4프레임 찌르기: 준비(당김) → 뻗기 → 최대 → 회수. 모두 수평 전방.
    const y = 42;
    let gripX, len;
    switch (phase) {
      case 0:  gripX = 12; len = reachVis * 0.30; break;
      case 1:  gripX = 20; len = reachVis * 0.62; break;
      case 2:  gripX = 26; len = reachVis * 1.00; break;
      default: gripX = 22; len = reachVis * 0.55; break;
    }
    _bladeH(ctx, gripX, y, len, blade, guard);
  } else {
    // 평상시 — 뒷손(좌측)에 세워 듦
    const x = 7, yBot = 34, len = 14 + reach * 0.6;
    ctx.fillStyle = '#6a3410'; fr(ctx, x, yBot, 3, 7);                 // 손잡이
    ctx.fillStyle = '#3a1c08'; fr(ctx, x, yBot + 7, 3, 2);            // 폼멜
    ctx.fillStyle = guard;     fr(ctx, x - 3, yBot - 2, 9, 3);        // 크로스가드
    ctx.fillStyle = blade;     fr(ctx, x, yBot - len, 3, len);         // 날(위로)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; fr(ctx, x, yBot - len, 1, len);
    ctx.fillStyle = blade;                                            // 칼끝
    ctx.beginPath();
    ctx.moveTo(x, yBot - len); ctx.lineTo(x + 1.5, yBot - len - 6);
    ctx.lineTo(x + 3, yBot - len); ctx.closePath(); ctx.fill();
  }
}

// 수평 전방 찌르기용 칼날 렌더
function _bladeH(ctx, gripX, y, len, blade, guard) {
  const th = 6;
  ctx.fillStyle = '#6a3410'; fr(ctx, gripX - 7, y, 9, th - 2);        // 손잡이
  ctx.fillStyle = '#3a1c08'; fr(ctx, gripX - 8, y, 3, th - 2);        // 폼멜
  ctx.fillStyle = guard;     fr(ctx, gripX + 1, y - 4, 3, th + 6);    // 크로스가드
  ctx.fillStyle = blade;     fr(ctx, gripX + 4, y, len, th - 2);      // 날
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; fr(ctx, gripX + 4, y, len, 1);
  ctx.fillStyle = blade;                                             // 칼끝
  ctx.beginPath();
  ctx.moveTo(gripX + 4 + len, y); ctx.lineTo(gripX + 4 + len + 6, y + (th - 2) / 2);
  ctx.lineTo(gripX + 4 + len, y + th - 2); ctx.closePath(); ctx.fill();
}

function drawShield(ctx, shield) {
  if (!shield || shield.id === 'none') return;
  const body = shield.bodyColor || '#8090a0';
  const rim  = shield.rimColor  || '#404858';
  const x = 32, y = 28, w = 11, h = 20;  // 앞손(우측, 진행방향)
  ctx.fillStyle = rim;  fr(ctx, x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = body; fr(ctx, x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; fr(ctx, x + 2, y + 2, 2, h - 6);
  ctx.fillStyle = rim;  fr(ctx, x + w / 2 - 1, y + 3, 2, h - 8); // 보스(중앙 돌기)
}

// ── 적 스프라이트 (family별 절차적, color/dark로 변종 색 구분) ──────────────
// ctx는 적 히트박스 좌상단(0,0)으로 이미 translate 된 상태.
export function drawEnemySprite(ctx, { family, color, dark, facing, w, h, tick }) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (facing === -1) { ctx.translate(w, 0); ctx.scale(-1, 1); }

  const fn = ENEMY_FAMILY[family];
  let drawn = true;
  if (fn) fn(ctx, w, h, color, dark, tick || 0); else drawn = false;

  ctx.restore();
  return drawn;
}

function eyes(ctx, ex, ey, gap = 0) {
  ctx.fillStyle = '#ffffff'; fr(ctx, ex, ey, 3, 3); fr(ctx, ex + gap, ey, 3, 3);
  ctx.fillStyle = '#000000'; fr(ctx, ex + 1, ey + 1, 2, 2); fr(ctx, ex + gap + 1, ey + 1, 2, 2);
}

const ENEMY_FAMILY = {
  snake(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, 0, h * 0.45, w * 0.78, h * 0.55);          // 몸통
    fr(ctx, w * 0.56, h * 0.05, w * 0.34, h * 0.62);                      // 세운 머리
    ctx.fillStyle = d; fr(ctx, 0, h * 0.8, w * 0.78, h * 0.2);
    eyes(ctx, w * 0.74, h * 0.2, 0); ctx.fillStyle = '#ee0000'; fr(ctx, w * 0.9, h * 0.4, 6, 2);
  },
  mushroom(ctx, w, h, c, d) {
    ctx.fillStyle = d; fr(ctx, w * 0.34, h * 0.45, w * 0.32, h * 0.55);   // 줄기(살색 d)
    ctx.fillStyle = c; fr(ctx, w * 0.08, h * 0.2, w * 0.84, h * 0.3);     // 갓
    fr(ctx, w * 0.2, h * 0.1, w * 0.6, h * 0.16);
    ctx.fillStyle = '#ffffff'; fr(ctx, w * 0.28, h * 0.26, 5, 5); fr(ctx, w * 0.6, h * 0.3, 4, 4);
    eyes(ctx, w * 0.4, h * 0.58, w * 0.16);
  },
  humanoid(ctx, w, h, c, d) {
    ctx.fillStyle = d; fr(ctx, w * 0.3, h * 0.72, w * 0.14, h * 0.28); fr(ctx, w * 0.56, h * 0.72, w * 0.14, h * 0.28); // 다리
    ctx.fillStyle = c; fr(ctx, w * 0.26, h * 0.34, w * 0.48, h * 0.4);   // 몸통
    ctx.fillStyle = d; fr(ctx, w * 0.32, h * 0.1, w * 0.36, h * 0.26);   // 머리
    eyes(ctx, w * 0.4, h * 0.18, w * 0.16);
    ctx.fillStyle = '#cccccc'; fr(ctx, w * 0.74, h * 0.2, 3, h * 0.4);   // 무기
    ctx.fillStyle = '#774433'; fr(ctx, w * 0.16, h * 0.4, w * 0.12, 4);  // 활/곤봉 손
  },
  bat(ctx, w, h, c, d) {
    ctx.fillStyle = c;
    fr(ctx, 0, h * 0.18, w * 0.36, h * 0.5); fr(ctx, w * 0.64, h * 0.18, w * 0.36, h * 0.5); // 날개
    fr(ctx, w * 0.06, h * 0.12, w * 0.16, h * 0.16); fr(ctx, w * 0.78, h * 0.12, w * 0.16, h * 0.16);
    ctx.fillStyle = d; fr(ctx, w * 0.36, h * 0.22, w * 0.28, h * 0.52);  // 몸통
    fr(ctx, w * 0.4, h * 0.06, 3, 6); fr(ctx, w * 0.56, h * 0.06, 3, 6); // 귀
    ctx.fillStyle = '#ffcc00'; fr(ctx, w * 0.42, h * 0.34, 3, 3); fr(ctx, w * 0.55, h * 0.34, 3, 3);
  },
  orb(ctx, w, h, c, d, t) {
    const r = w / 2, cx = w / 2, cy = h / 2 + Math.sin(t * 0.1) * 1;
    ctx.fillStyle = d; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill();
    eyes(ctx, cx - 5, cy - 2, 6);
    // 불꽃 꼬리
    ctx.fillStyle = c; fr(ctx, cx - 2, cy + r * 0.6, 4, h * 0.2);
  },
  jelly(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, w * 0.1, h * 0.1, w * 0.8, h * 0.4);      // 돔
    fr(ctx, w * 0.2, h * 0.02, w * 0.6, h * 0.14);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; fr(ctx, w * 0.2, h * 0.16, w * 0.2, h * 0.18);
    ctx.fillStyle = d;                                                   // 촉수
    for (let i = 0; i < 5; i++) fr(ctx, w * (0.15 + i * 0.16), h * 0.5, 3, h * (0.3 + (i % 2) * 0.18));
    eyes(ctx, w * 0.4, h * 0.28, w * 0.18);
  },
  crab(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, w * 0.2, h * 0.4, w * 0.6, h * 0.4);      // 몸통
    ctx.fillStyle = d; fr(ctx, 0, h * 0.5, w * 0.2, h * 0.2); fr(ctx, w * 0.8, h * 0.5, w * 0.2, h * 0.2); // 집게
    fr(ctx, 0, h * 0.42, w * 0.1, h * 0.12); fr(ctx, w * 0.9, h * 0.42, w * 0.1, h * 0.12);
    ctx.fillStyle = c; for (let i = 0; i < 3; i++) { fr(ctx, w * (0.22 + i * 0.2), h * 0.78, 3, h * 0.2); fr(ctx, w * (0.62 + i * 0.06), h * 0.78, 3, h * 0.2); }
    eyes(ctx, w * 0.38, h * 0.32, w * 0.2); ctx.fillStyle = c; fr(ctx, w * 0.4, h * 0.28, 2, h * 0.08); fr(ctx, w * 0.58, h * 0.28, 2, h * 0.08);
  },
  rat(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, w * 0.1, h * 0.4, w * 0.66, h * 0.5);     // 몸통
    fr(ctx, w * 0.66, h * 0.3, w * 0.28, h * 0.4);                       // 머리
    ctx.fillStyle = d; fr(ctx, 0, h * 0.55, w * 0.16, 3);                // 꼬리
    fr(ctx, w * 0.7, h * 0.18, 5, 6); fr(ctx, w * 0.84, h * 0.18, 5, 6); // 귀
    ctx.fillStyle = '#ff0000'; fr(ctx, w * 0.86, h * 0.4, 3, 3);         // 눈
    ctx.fillStyle = '#ffffff'; fr(ctx, w * 0.92, h * 0.5, 3, 2);         // 이빨
  },
  octopus(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, w * 0.18, h * 0.08, w * 0.64, h * 0.46);  // 머리
    fr(ctx, w * 0.28, h * 0.0, w * 0.44, h * 0.12);
    ctx.fillStyle = d;                                                   // 다리
    for (let i = 0; i < 6; i++) fr(ctx, w * (0.12 + i * 0.13), h * 0.5, 4, h * (0.35 + (i % 2) * 0.15));
    eyes(ctx, w * 0.36, h * 0.26, w * 0.2);
  },
  yeti(ctx, w, h, c, d) {
    ctx.fillStyle = d; fr(ctx, w * 0.24, h * 0.72, w * 0.2, h * 0.28); fr(ctx, w * 0.56, h * 0.72, w * 0.2, h * 0.28); // 다리
    ctx.fillStyle = c; fr(ctx, w * 0.14, h * 0.3, w * 0.72, h * 0.46);  // 몸통
    fr(ctx, w * 0.02, h * 0.36, w * 0.16, h * 0.3); fr(ctx, w * 0.82, h * 0.36, w * 0.16, h * 0.3); // 팔
    fr(ctx, w * 0.3, h * 0.04, w * 0.4, h * 0.3);                       // 머리
    ctx.fillStyle = d; fr(ctx, w * 0.36, h * 0.34, w * 0.28, h * 0.06); // 입
    eyes(ctx, w * 0.4, h * 0.16, w * 0.18);
  },
  mudman(ctx, w, h, c, d) {
    ctx.fillStyle = d; fr(ctx, w * 0.1, h * 0.7, w * 0.8, h * 0.3);     // 바닥 진흙
    ctx.fillStyle = c; fr(ctx, w * 0.18, h * 0.3, w * 0.64, h * 0.5);   // 몸
    fr(ctx, w * 0.28, h * 0.16, w * 0.44, h * 0.2);                     // 머리
    ctx.fillStyle = d; for (let i = 0; i < 4; i++) fr(ctx, w * (0.2 + i * 0.18), h * 0.3, 4, 4); // 방울
    eyes(ctx, w * 0.38, h * 0.24, w * 0.18);
  },
  roper(ctx, w, h, c, d) {
    ctx.fillStyle = c; fr(ctx, w * 0.28, h * 0.4, w * 0.44, h * 0.6);   // 기둥
    ctx.fillStyle = d;                                                  // 촉수
    for (let i = 0; i < 6; i++) { const a = (i / 5 - 0.5); fr(ctx, w * (0.5 + a * 0.7) - 2, h * 0.1, 4, h * 0.4); }
    ctx.fillStyle = c; fr(ctx, w * 0.3, h * 0.36, w * 0.4, h * 0.12);
    eyes(ctx, w * 0.4, h * 0.52, w * 0.18);
  },
};
