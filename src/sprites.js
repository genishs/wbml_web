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
  drawSword(ctx, eq?.sword, state, attackPhase, pal); // 검: 뒷손 → 앞으로 찌르기(맨 위)
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
// 평상시엔 뒷손에 세워 들고, 공격 시 크게 찌른다: 윈드업(뒤로 당김)→내지름→최대→회수.
function drawSword(ctx, sword, state, phase, pal) {
  if (!sword || sword.id === 'none') return;
  const blade    = sword.bladeColor || '#d8d8e8';
  const guard    = sword.guardColor || '#c0a020';
  const reach    = sword.reach || 14;
  const reachVis = 18 + reach;
  const skin     = (pal && pal.s) || '#ffccbb';
  const skinD    = (pal && pal.d) || '#cc9988';

  if (state === 'attack') {
    const y = 41;

    if (phase === 0) {
      // 윈드업: 검을 어깨 뒤로 세워 끌어당김(타격 직전의 '준비' 동작 → 무게감)
      const gx = 3;
      ctx.fillStyle = skin;  fr(ctx, gx + 1, y, 6, 3);                    // 당긴 앞손
      ctx.fillStyle = guard; fr(ctx, gx, y - 3, 3, 9);                    // 크로스가드
      ctx.fillStyle = blade; fr(ctx, gx - 1, y - 13, 3, 11);             // 세운 날
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; fr(ctx, gx - 1, y - 13, 1, 11);
      return;
    }

    // 내지름/최대/회수: 수평 전방. 몸→손잡이로 뻗은 앞팔까지 그려 '닿는' 무게감.
    let gripX, len, th;
    switch (phase) {
      case 1:  gripX = 23; len = reachVis * 0.72; th = 6; break;          // 내지름
      case 2:  gripX = 32; len = reachVis * 1.18; th = 8; break;          // 최대(크고 굵게)
      default: gripX = 25; len = reachVis * 0.58; th = 6; break;          // 회수
    }
    // 뻗은 앞팔(어깨 ~ 손잡이)
    ctx.fillStyle = skinD; fr(ctx, 22, y + 1, gripX - 20, 4);
    ctx.fillStyle = skin;  fr(ctx, 22, y, gripX - 20, 3);
    _bladeH(ctx, gripX, y, len, blade, guard, th);

    if (phase === 2) {
      // 최대 찌르기 임팩트: 칼끝 섬광 + 흩날리는 스파크(타격감)
      const tipX = gripX + 4 + len;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      fr(ctx, tipX, y - 3, 2, th + 6);
      ctx.fillStyle = 'rgba(255,240,170,0.8)';
      fr(ctx, tipX + 3, y - 5, 2, 2); fr(ctx, tipX + 5, y + 1, 2, 2);
      fr(ctx, tipX + 3, y + th + 1, 2, 2); fr(ctx, tipX + 7, y + 3, 2, 2);
    }
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

// 수평 전방 찌르기용 칼날 렌더 (th = 검 두께; 최대 찌르기에서 더 굵게)
function _bladeH(ctx, gripX, y, len, blade, guard, th = 6) {
  const bt = th - 2;                                                 // 날 두께
  ctx.fillStyle = '#6a3410'; fr(ctx, gripX - 7, y, 9, bt);           // 손잡이
  ctx.fillStyle = '#3a1c08'; fr(ctx, gripX - 8, y, 3, bt);           // 폼멜
  ctx.fillStyle = guard;     fr(ctx, gripX + 1, y - 4, 3, th + 6);   // 크로스가드
  ctx.fillStyle = blade;     fr(ctx, gripX + 4, y, len, bt);         // 날
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; fr(ctx, gripX + 4, y, len, 1);
  ctx.fillStyle = blade;                                            // 칼끝(삼각)
  ctx.beginPath();
  ctx.moveTo(gripX + 4 + len, y); ctx.lineTo(gripX + 4 + len + 7, y + bt / 2);
  ctx.lineTo(gripX + 4 + len, y + bt); ctx.closePath(); ctx.fill();
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

// ── 보스 고유 스프라이트 (라운드 가디언별 개별 디자인) ────────────────────────
// ctx는 보스 히트박스 좌상단(0,0)으로 translate + facing 반전까지 끝난 상태로 들어온다.
// 각 보스는 자체 팔레트를 가진다(같은 fly/ground라도 외형이 완전히 다르게).
export function drawBossSprite(ctx, { sprite, w, h, t }) {
  const fn = BOSS_SPRITE[sprite];
  if (!fn) return false;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  fn(ctx, w, h, t || 0);
  ctx.restore();
  return true;
}

function tri(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}
function bossEyes(ctx, x, y, gap, color = '#ff2020', sz = 4) {
  ctx.fillStyle = color; fr(ctx, x, y, sz, sz); fr(ctx, x + gap, y, sz, sz);
}

const BOSS_SPRITE = {
  // R1 — 사신(낫). 검은 후드 로브 + 해골 + 큰 낫
  death(ctx, w, h, t) {
    ctx.fillStyle = '#10101a'; tri(ctx, w * 0.5, 0, w * 0.05, h, w * 0.95, h);        // 로브
    ctx.fillStyle = '#1c1c2c'; fr(ctx, w * 0.2, h * 0.5, w * 0.6, h * 0.5);
    ctx.fillStyle = '#0a0a12'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.3, w * 0.22, Math.PI, 0); ctx.fill(); // 후드 그늘
    ctx.fillStyle = '#e8e4d4'; fr(ctx, w * 0.36, h * 0.22, w * 0.28, h * 0.2);        // 해골
    ctx.fillStyle = '#0a0a12'; fr(ctx, w * 0.4, h * 0.27, 5, 5); fr(ctx, w * 0.54, h * 0.27, 5, 5);
    ctx.fillStyle = '#7a6a3a'; fr(ctx, w * 0.86, -h * 0.1, 3, h * 1.0);               // 낫 자루
    ctx.fillStyle = '#cfd6e0'; ctx.beginPath(); ctx.moveTo(w * 0.88, -h * 0.1);
    ctx.quadraticCurveTo(w * 1.25, h * 0.0, w * 1.0, h * 0.32); ctx.lineTo(w * 0.86, h * 0.12); ctx.closePath(); ctx.fill();
  },
  // R2-1 — 킹 뱀파이어. 붉은 안감 망토 + 창백한 얼굴 + 송곳니
  vampire(ctx, w, h) {
    ctx.fillStyle = '#7a1020'; tri(ctx, w * 0.5, h * 0.3, -w * 0.1, h * 0.95, w * 0.5, h);  // 망토 좌
    ctx.fillStyle = '#5a0c18'; tri(ctx, w * 0.5, h * 0.3, w * 1.1, h * 0.95, w * 0.5, h);   // 망토 우
    ctx.fillStyle = '#1a1018'; fr(ctx, w * 0.3, h * 0.3, w * 0.4, h * 0.6);                 // 정장
    ctx.fillStyle = '#e8dcd0'; fr(ctx, w * 0.36, h * 0.08, w * 0.28, h * 0.26);             // 얼굴
    ctx.fillStyle = '#1a1018'; fr(ctx, w * 0.34, h * 0.04, w * 0.32, h * 0.08);             // 머리
    bossEyes(ctx, w * 0.4, h * 0.16, w * 0.16, '#ff2020', 4);
    ctx.fillStyle = '#ffffff'; fr(ctx, w * 0.42, h * 0.28, 2, 4); fr(ctx, w * 0.54, h * 0.28, 2, 4); // 송곳니
  },
  // R2-2 — 마이코니드 마스터. 거대 붉은 갓 + 점박이 + 줄기 몸
  myconid(ctx, w, h) {
    ctx.fillStyle = '#e8e0d0'; fr(ctx, w * 0.3, h * 0.5, w * 0.4, h * 0.5);                 // 줄기
    ctx.fillStyle = '#c02828'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * 0.5, Math.PI, 0); ctx.fill(); // 갓
    ctx.fillStyle = '#ffffff'; fr(ctx, w * 0.2, h * 0.34, 6, 6); fr(ctx, w * 0.5, h * 0.24, 7, 7); fr(ctx, w * 0.72, h * 0.36, 5, 5);
    bossEyes(ctx, w * 0.38, h * 0.62, w * 0.18, '#000000', 4);
    ctx.fillStyle = '#000000'; fr(ctx, w * 0.44, h * 0.78, w * 0.12, 3);                    // 입
  },
  // R3 — 레드 나이트. 붉은 판금 + 깃털 투구 + 검·방패
  redknight(ctx, w, h) { knight(ctx, w, h, '#cc2a2a', '#8a1818', '#ff6a3a'); },
  // R7-2 — 블루 나이트
  blueknight(ctx, w, h) { knight(ctx, w, h, '#3a66cc', '#22408a', '#7aa8ff'); },
  // R10 — 실버 나이트
  silverknight(ctx, w, h) { knight(ctx, w, h, '#b8c0cc', '#7a8290', '#eef4fb'); },
  // R4 — 크라켄. 둥근 머리 + 큰 눈 + 흐느적 촉수
  kraken(ctx, w, h, t) {
    ctx.fillStyle = '#7a3aa0'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.34, w * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a2a80';                                                              // 촉수
    for (let i = 0; i < 5; i++) { const wig = Math.sin(t * 0.12 + i) * 4;
      fr(ctx, w * (0.12 + i * 0.18) + wig, h * 0.5, 5, h * (0.4 + (i % 2) * 0.14)); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w * 0.36, h * 0.32, 6, 0, 7); ctx.arc(w * 0.64, h * 0.32, 6, 0, 7); ctx.fill();
    ctx.fillStyle = '#101018'; fr(ctx, w * 0.34, h * 0.3, 4, 4); fr(ctx, w * 0.62, h * 0.3, 4, 4);
    ctx.fillStyle = '#3a1a55'; tri(ctx, w * 0.42, h * 0.46, w * 0.58, h * 0.46, w * 0.5, h * 0.56); // 부리
  },
  // R5-1 — 자이언트 콩. 갈색 거대 유인원 + 가슴
  kong(ctx, w, h) { ape(ctx, w, h, '#6a4a2a', '#4a3018', '#caa078'); },
  // R9 — 스노우 콩. 흰/빙 유인원
  snowkong(ctx, w, h) { ape(ctx, w, h, '#dfeaf2', '#9ec0d4', '#bfe0ef'); },
  // R5-2 — 뱀파이어 박쥐. 큰 박쥐 + 송곳니 + 펼친 날개
  vampirebats(ctx, w, h, t) {
    const flap = Math.sin(t * 0.2) * h * 0.06;
    ctx.fillStyle = '#3a2a55';
    tri(ctx, w * 0.4, h * 0.5, -w * 0.05, h * 0.3 + flap, w * 0.2, h * 0.8);                // 좌 날개
    tri(ctx, w * 0.6, h * 0.5, w * 1.05, h * 0.3 + flap, w * 0.8, h * 0.8);                 // 우 날개
    ctx.fillStyle = '#22182f'; fr(ctx, w * 0.36, h * 0.36, w * 0.28, h * 0.4);              // 몸통
    ctx.fillStyle = '#22182f'; tri(ctx, w * 0.4, h * 0.28, w * 0.46, h * 0.16, w * 0.5, h * 0.3); tri(ctx, w * 0.6, h * 0.28, w * 0.54, h * 0.16, w * 0.5, h * 0.3); // 귀
    bossEyes(ctx, w * 0.42, h * 0.42, w * 0.1, '#ffcc00', 4);
    ctx.fillStyle = '#ffffff'; fr(ctx, w * 0.44, h * 0.54, 2, 4); fr(ctx, w * 0.54, h * 0.54, 2, 4);
  },
  // R6 — 스핑크스. 사자 몸 + 파라오 두건(금/청 줄) + 사람 얼굴
  sphinx(ctx, w, h) {
    ctx.fillStyle = '#d8b46a'; fr(ctx, w * 0.1, h * 0.55, w * 0.85, h * 0.4);               // 사자 몸
    fr(ctx, w * 0.08, h * 0.78, w * 0.12, h * 0.22); fr(ctx, w * 0.8, h * 0.78, w * 0.12, h * 0.22); // 앞발
    ctx.fillStyle = '#e8c87a'; fr(ctx, w * 0.3, h * 0.2, w * 0.4, h * 0.4);                 // 얼굴
    ctx.fillStyle = '#caa24a'; fr(ctx, w * 0.24, h * 0.12, w * 0.52, h * 0.16);             // 두건 상단
    ctx.fillStyle = '#2a5aa0'; fr(ctx, w * 0.24, h * 0.28, w * 0.1, h * 0.3); fr(ctx, w * 0.66, h * 0.28, w * 0.1, h * 0.3); // 두건 옆 청줄
    bossEyes(ctx, w * 0.38, h * 0.34, w * 0.16, '#101018', 4);
    ctx.fillStyle = '#caa24a'; fr(ctx, w * 0.44, h * 0.46, w * 0.12, 4);                    // 입
  },
  // R7-1 — 코인 컬렉터(가난귀신). 굽은 탐욕 영혼 + 돈자루 + 동전 반짝
  coincollector(ctx, w, h, t) {
    ctx.fillStyle = '#3a4a2a'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.4, w * 0.4, Math.PI, 0); ctx.fill(); // 두건
    ctx.fillStyle = '#2a361e'; fr(ctx, w * 0.2, h * 0.4, w * 0.6, h * 0.55);                // 망토
    ctx.fillStyle = '#b8a070'; fr(ctx, w * 0.38, h * 0.28, w * 0.24, h * 0.2);              // 야윈 얼굴
    bossEyes(ctx, w * 0.42, h * 0.34, w * 0.12, '#ffdd33', 4);
    ctx.fillStyle = '#8a6a30'; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.7, w * 0.18, 0, Math.PI * 2); ctx.fill(); // 돈자루
    ctx.fillStyle = '#ffd040'; const ph = (t * 0.1) % 6; fr(ctx, w * 0.74, h * 0.5 - ph * 2, 4, 4); fr(ctx, w * 0.84, h * 0.55 - ph, 3, 3); // 동전
  },
  // R8-1 — 데몬. 큰 뿔 + 날개 + 발광 눈 + 불덩이
  demon(ctx, w, h, t) {
    ctx.fillStyle = '#3a1228'; tri(ctx, w * 0.3, h * 0.4, -w * 0.1, h * 0.2, w * 0.25, h * 0.7); // 날개
    ctx.fillStyle = '#3a1228'; tri(ctx, w * 0.7, h * 0.4, w * 1.1, h * 0.2, w * 0.75, h * 0.7);
    ctx.fillStyle = '#7a1a20'; fr(ctx, w * 0.26, h * 0.3, w * 0.48, h * 0.6);               // 몸
    ctx.fillStyle = '#9a2a28'; fr(ctx, w * 0.32, h * 0.08, w * 0.36, h * 0.28);             // 머리
    ctx.fillStyle = '#e8d0b0'; tri(ctx, w * 0.32, h * 0.1, w * 0.18, h * -0.06, w * 0.4, h * 0.06); tri(ctx, w * 0.68, h * 0.1, w * 0.82, h * -0.06, w * 0.6, h * 0.06); // 뿔
    bossEyes(ctx, w * 0.38, h * 0.16, w * 0.16, '#ffcc00', 5);
    const fl = 0.5 + Math.sin(t * 0.2) * 0.3;                                               // 불덩이
    ctx.fillStyle = `rgba(255,${120 + fl * 100 | 0},20,0.9)`; ctx.beginPath(); ctx.arc(w * 0.85, h * 0.6, w * 0.16, 0, Math.PI * 2); ctx.fill();
  },
  // R8-2 — 호브 고블린. 초록 + 큰 귀 + 에너지 검
  hobgoblin(ctx, w, h) {
    ctx.fillStyle = '#3a7a2a'; fr(ctx, w * 0.28, h * 0.34, w * 0.44, h * 0.5);              // 몸
    ctx.fillStyle = '#4a9a36'; fr(ctx, w * 0.34, h * 0.1, w * 0.32, h * 0.28);              // 머리
    ctx.fillStyle = '#3a7a2a'; tri(ctx, w * 0.34, h * 0.18, w * 0.12, h * 0.1, w * 0.34, h * 0.32); tri(ctx, w * 0.66, h * 0.18, w * 0.88, h * 0.1, w * 0.66, h * 0.32); // 귀
    bossEyes(ctx, w * 0.4, h * 0.2, w * 0.14, '#ff3020', 4);
    ctx.fillStyle = '#cfd6e0'; fr(ctx, w * 0.82, h * 0.0, 4, h * 0.7);                       // 검
    ctx.fillStyle = 'rgba(120,255,180,0.6)'; fr(ctx, w * 0.8, h * 0.0, 8, h * 0.7);          // 에너지광
    ctx.fillStyle = '#7a4a20'; fr(ctx, w * 0.78, h * 0.68, w * 0.16, 5);
  },
  // R11 — 메카 드래곤. 금속 머리·이빨 + 발광 눈 + 판금 + 날개
  mekadragon(ctx, w, h, t) {
    ctx.fillStyle = '#3a4a3a'; tri(ctx, w * 0.5, h * 0.4, w * 1.1, h * 0.1, w * 0.6, h * 0.7); // 날개
    ctx.fillStyle = '#5a6a5a'; fr(ctx, w * 0.2, h * 0.4, w * 0.5, h * 0.5);                  // 몸 판금
    ctx.fillStyle = '#6a7a6a'; for (let i = 0; i < 3; i++) fr(ctx, w * (0.24 + i * 0.14), h * 0.42, w * 0.1, h * 0.46); // 판금 줄
    ctx.fillStyle = '#4a5a4a'; fr(ctx, w * 0.5, h * 0.08, w * 0.5, h * 0.3);                 // 머리(주둥이)
    ctx.fillStyle = '#cfd6e0'; for (let i = 0; i < 4; i++) tri(ctx, w * (0.56 + i * 0.1), h * 0.38, w * (0.6 + i * 0.1), h * 0.38, w * (0.58 + i * 0.1), h * 0.46); // 이빨
    const g = 0.5 + Math.sin(t * 0.25) * 0.4;
    ctx.fillStyle = `rgba(255,40,40,${0.6 + g * 0.4})`; fr(ctx, w * 0.66, h * 0.16, 6, 6);    // 발광 눈
    ctx.fillStyle = '#202820'; fr(ctx, w * 0.5, h * 0.2, w * 0.06, h * 0.06);                // 콧구멍
  },
};

// 공용: 기사형(색만 다름) — 판금 갑옷 + 깃털 투구 + 검·방패
function knight(ctx, w, h, body, dark, plume) {
  ctx.fillStyle = dark; fr(ctx, w * 0.28, h * 0.66, w * 0.16, h * 0.34); fr(ctx, w * 0.56, h * 0.66, w * 0.16, h * 0.34); // 다리
  ctx.fillStyle = body; fr(ctx, w * 0.22, h * 0.3, w * 0.56, h * 0.42);                    // 몸통
  ctx.fillStyle = dark; fr(ctx, w * 0.22, h * 0.3, w * 0.56, 4);
  ctx.fillStyle = body; fr(ctx, w * 0.34, h * 0.08, w * 0.32, h * 0.26);                   // 투구
  ctx.fillStyle = '#101018'; fr(ctx, w * 0.38, h * 0.16, w * 0.24, h * 0.08);              // 면갑 틈
  ctx.fillStyle = '#ff2020'; fr(ctx, w * 0.4, h * 0.18, 4, 3); fr(ctx, w * 0.56, h * 0.18, 4, 3);
  ctx.fillStyle = plume; fr(ctx, w * 0.46, h * -0.04, w * 0.08, h * 0.16);                 // 깃털
  ctx.fillStyle = '#cfd6e0'; fr(ctx, w * 0.84, h * 0.06, 4, h * 0.6);                       // 검
  ctx.fillStyle = '#ffcc00'; fr(ctx, w * 0.8, h * 0.6, w * 0.14, 4);
  ctx.fillStyle = dark; fr(ctx, w * 0.06, h * 0.36, w * 0.16, h * 0.3);                     // 방패
  ctx.fillStyle = body; fr(ctx, w * 0.09, h * 0.4, w * 0.1, h * 0.22);
}

// 공용: 유인원형(콩/스노우콩) — 색만 다름
function ape(ctx, w, h, fur, dark, face) {
  ctx.fillStyle = dark; fr(ctx, w * 0.22, h * 0.7, w * 0.2, h * 0.3); fr(ctx, w * 0.58, h * 0.7, w * 0.2, h * 0.3); // 다리
  ctx.fillStyle = fur; fr(ctx, w * 0.1, h * 0.28, w * 0.8, h * 0.48);                       // 몸통(넓은 어깨)
  ctx.fillStyle = dark; fr(ctx, -w * 0.02, h * 0.32, w * 0.18, h * 0.44); fr(ctx, w * 0.84, h * 0.32, w * 0.18, h * 0.44); // 팔
  ctx.fillStyle = fur; fr(ctx, w * 0.3, h * 0.04, w * 0.4, h * 0.3);                        // 머리
  ctx.fillStyle = face; fr(ctx, w * 0.36, h * 0.12, w * 0.28, h * 0.2);                     // 얼굴
  bossEyes(ctx, w * 0.4, h * 0.16, w * 0.16, '#101018', 4);
  ctx.fillStyle = '#101018'; fr(ctx, w * 0.44, h * 0.26, w * 0.12, 3);                      // 콧등
  ctx.fillStyle = face; fr(ctx, w * 0.34, h * 0.5, w * 0.32, h * 0.16);                     // 가슴
}
