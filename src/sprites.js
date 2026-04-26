// Wonder Boy 캐릭터 픽셀아트 렌더러
// native 16w×26h  →  scale S=3  →  48×78px on canvas
//
// 정지: 3/4 뷰 (방향은 있지만 살짝 관람자를 향함)
// 이동/공격/점프: 완전 측면 프로필

export const CHAR_W = 16;
export const CHAR_H = 26;
export const S      = 3;   // 해상도 배율

// ─── 팔레트 ────────────────────────────────────────────
const SKIN    = '#f4a060';
const SKIN_S  = '#d07840';   // 그림자
const HAIR    = '#f0c800';
const HAIR_H  = '#fff080';   // 하이라이트
const EYE     = '#181818';
const MOUTH   = '#b04828';
const WHITE   = '#f0f0f0';
const HANDLE  = '#804020';
const HANDLE_S= '#5a2c10';
const OUTLINE = '#201008';

// ─── 유틸 ───────────────────────────────────────────────
function r(ctx, x, y, w, h, col) {
  if (!col || w <= 0 || h <= 0) return;
  ctx.fillStyle = col;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}
function px(ctx, x, y, col) { r(ctx, x, y, 1, 1, col); }

// ─── 진입점 ─────────────────────────────────────────────
export function drawWonderBoy(ctx, { facing, state, animFrame, eq }) {
  ctx.save();
  if (facing === -1) {
    ctx.translate(CHAR_W * S, 0);
    ctx.scale(-1, 1);
  }

  if (state === 'idle') {
    _drawIdle(ctx, eq);
  } else {
    _drawSide(ctx, eq, state, animFrame);
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// 정지 — 3/4 뷰 (오른쪽 방향 기준으로 설계, 왼쪽은 flip)
// ═══════════════════════════════════════════════════════
function _drawIdle(ctx, eq) {
  const { ac, hc, ht, bc, hasSword, hasShield } = _colors(eq);

  // ── 뒤쪽 레이어: 칼 (왼손, 세워 들기) ──
  if (hasSword) _swordUpright(ctx, eq.sword, 0, 3);

  // ── 다리 (3/4 뷰 — 두 다리 모두 살짝 벌림) ──
  r(ctx, 3, 17, 4, 7, SKIN);        // 왼다리 (뒤)
  r(ctx, 3, 17, 4, 7, SKIN_S);      // 음영
  r(ctx, 3, 17, 4, 7, SKIN);        // 재덮어쓰기(명도)
  r(ctx, 4, 17, 3, 7, SKIN);        // 왼다리
  r(ctx, 9, 17, 4, 7, SKIN);        // 오른다리 (앞)
  // 발/부츠
  r(ctx, 3, 23, 5, 2, bc);
  r(ctx, 8, 23, 6, 2, bc);
  if (bc !== SKIN_S) {
    r(ctx, 4, 22, 3, 1, bc);
    r(ctx, 9, 22, 4, 1, bc);
  }

  // ── 몸통 ──
  r(ctx, 3, 9, 9, 8, ac ?? SKIN);
  r(ctx, 3, 15, 9, 3, WHITE);
  if (ac) {
    r(ctx, 3, 15, 9, 2, ac);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(4*S, 10*S, 8*S, S);   // 가슴 하이라이트
    r(ctx, 3, 10, 1, 6, ht);            // 왼 트림
    r(ctx, 11, 10, 1, 6, ht);           // 오른 트림
    // 흉갑 중앙 음각
    r(ctx, 6, 11, 3, 4, ac);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(6*S, 12*S, 3*S, 2*S);
  }

  // ── 왼팔 (뒤) ──
  r(ctx, 1, 10, 3, 5, SKIN);
  r(ctx, 1, 14, 3, 1, SKIN_S);  // 손

  // ── 오른팔 (앞, 방패 or 빈팔) ──
  r(ctx, 12, 10, 3, 5, SKIN);
  if (hasShield) {
    _shieldIdle(ctx, eq.shield);
  } else {
    r(ctx, 12, 14, 3, 1, SKIN_S);
  }

  // ── 목 ──
  r(ctx, 6, 8, 4, 2, ac ?? SKIN);

  // ── 머리 (3/4 뷰, 오른쪽 약간 앞) ──
  // 머리카락 전체
  r(ctx, 2, 0, 11, 5, HAIR);
  r(ctx, 3, 0, 9,  2, HAIR_H);   // 하이라이트
  // 얼굴 (오른쪽으로 약간 치우친 타원)
  r(ctx, 3, 2, 9, 7, SKIN);
  r(ctx, 2, 3, 1, 5, SKIN);      // 왼쪽 귀
  r(ctx, 12, 3, 1, 3, SKIN);     // 오른쪽 귀 (살짝만)
  // 눈 — 오른눈(앞)이 더 크고 오른쪽에, 왼눈(뒤)이 더 안쪽
  r(ctx, 5, 3, 2, 2, EYE);       // 왼눈 (2×2)
  r(ctx, 9, 3, 2, 2, EYE);       // 오른눈 (2×2, 앞눈)
  // 눈 흰자
  px(ctx, 5, 3, '#ffffff');
  px(ctx, 9, 3, '#ffffff');
  // 코 힌트 (오른쪽 방향으로 돌출)
  px(ctx, 11, 5, SKIN_S);
  // 입 (오른쪽 방향 쪽으로 약간 치우침)
  r(ctx, 7, 7, 4, 1, MOUTH);
  // 눈썹
  r(ctx, 5, 2, 2, 1, HAIR);
  r(ctx, 9, 2, 2, 1, HAIR);

  if (hc) _helmetFront(ctx, hc, ht);
}

// ═══════════════════════════════════════════════════════
// 이동/공격/점프/넉백 — 완전 측면 프로필
// ═══════════════════════════════════════════════════════
function _drawSide(ctx, eq, state, frame) {
  const { ac, hc, ht, bc, hasSword, hasShield } = _colors(eq);
  const isAttack = state === 'attack';
  const isJump   = state === 'jump';
  const isKnock  = state === 'knockback';

  // 다리 교대 위치
  let frontX, backX, frontY, backY;
  if (isJump) {
    frontX = 8; backX = 5; frontY = 3; backY = 1;
  } else if (isKnock) {
    frontX = 10; backX = 3; frontY = -2; backY = -2;
  } else if (isAttack) {
    frontX = 7; backX = 5; frontY = 0; backY = 0;
  } else {
    // 걷기: 프레임 0→오른발 앞, 프레임 1→왼발 앞
    const step = frame % 2;
    frontX = step === 0 ? 9 : 4;
    backX  = step === 0 ? 4 : 9;
    frontY = 0; backY = 0;
  }

  // ── 뒤 다리 ──
  r(ctx, backX, 17 + backY, 3, 7, SKIN_S);
  r(ctx, backX-1, 23 + backY, 4, 2, bc);   // 뒤 발

  // ── 뒤 팔 or 칼 ──
  if (!isAttack) {
    r(ctx, 2, 10, 2, 5, SKIN);
    if (hasSword) _swordUpright(ctx, eq.sword, 0, 8);
  }

  // ── 몸통 (측면 — 좌우 폭 좁게) ──
  r(ctx, 4, 9, 7, 8, ac ?? SKIN);
  r(ctx, 4, 15, 7, 3, WHITE);
  if (ac) {
    r(ctx, 4, 15, 7, 2, ac);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(5*S, 10*S, 6*S, S);
    r(ctx, 3, 10, 1, 6, ht);
    r(ctx, 11, 10, 1, 6, ht);
  }

  // ── 앞 다리 ──
  r(ctx, frontX, 17 + frontY, 3, 7, SKIN);
  r(ctx, frontX, 23 + frontY, 4, 2, bc);   // 앞 발

  // ── 앞 팔 ──
  if (isAttack) {
    r(ctx, 9, 10, 5, 2, SKIN);        // 뻗은 팔
    _swordThrust(ctx, eq.sword);
    if (hasShield) {
      r(ctx, 2, 10, 4, 5, eq.shield.bodyColor);  // 방패 뒤로
      r(ctx, 2, 10, 4, 5, eq.shield.bodyColor);
    }
  } else {
    r(ctx, 11, 10, 2, 5, SKIN);
    if (hasShield) _shieldSide(ctx, eq.shield);
  }

  // ── 목 ──
  r(ctx, 5, 8, 4, 2, ac ?? SKIN);

  // ── 머리 — 완전 측면 프로필 ──
  r(ctx, 2, 0, 9, 5, HAIR);
  r(ctx, 3, 0, 7, 2, HAIR_H);
  r(ctx, 3, 2, 7, 7, SKIN);
  // 코 (오른쪽 돌출)
  r(ctx, 10, 4, 2, 2, SKIN);
  px(ctx, 10, 5, SKIN_S);
  // 눈 (앞쪽에 하나만)
  r(ctx, 8, 3, 2, 2, EYE);
  px(ctx, 8, 3, '#ffffff');
  // 귀 (뒤쪽)
  r(ctx, 2, 3, 1, 3, SKIN);
  // 입
  r(ctx, 7, 7, 3, 1, MOUTH);
  // 눈썹
  r(ctx, 8, 2, 2, 1, HAIR);

  if (hc) _helmetSide(ctx, hc, ht);
}

// ─── 헬멧 ────────────────────────────────────────────
function _helmetFront(ctx, hc, ht) {
  r(ctx, 1, -1, 13, 5, hc);
  r(ctx, 1, 4, 2, 5, hc);    // 왼 볼가드
  r(ctx, 12, 4, 2, 5, hc);   // 오른 볼가드
  r(ctx, 3, 3, 9, 3, 'rgba(0,10,50,0.55)');  // 바이저 슬롯
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillRect(2*S, 0, 9*S, S);
  if (ht) { r(ctx, 1, 3, 13, 1, ht); r(ctx, 1, 8, 13, 1, ht); }
}

function _helmetSide(ctx, hc, ht) {
  r(ctx, 1, -1, 10, 5, hc);
  r(ctx, 1, 4, 2, 5, hc);    // 뒤 볼가드
  r(ctx, 3, 3, 7, 3, 'rgba(0,10,50,0.55)');
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillRect(2*S, 0, 7*S, S);
  if (ht) { r(ctx, 1, 3, 10, 1, ht); r(ctx, 1, 8, 10, 1, ht); }
}

// ─── 방패 ────────────────────────────────────────────
function _shieldIdle(ctx, shield) {
  const bc = shield.bodyColor, rc = shield.rimColor;
  r(ctx, 13, 9, 4, 7, bc);
  r(ctx, 12, 10, 1, 5, bc);
  r(ctx, 13, 9, 4, 1, rc);
  r(ctx, 13, 15, 4, 1, rc);
  r(ctx, 16, 9, 1, 7, rc);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(13*S, 10*S, S, 3*S);
  if (shield.id === 'legend') {
    r(ctx, 17, 10, 2, 2, '#ffe0a0');
    r(ctx, 17, 13, 2, 2, '#ffe0a0');
  }
}

function _shieldSide(ctx, shield) {
  const bc = shield.bodyColor, rc = shield.rimColor;
  r(ctx, 12, 9, 4, 7, bc);
  r(ctx, 12, 9, 4, 1, rc);
  r(ctx, 12, 15, 4, 1, rc);
  r(ctx, 15, 9, 1, 7, rc);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(12*S, 10*S, S, 3*S);
}

// ─── 칼 ──────────────────────────────────────────────
function _swordUpright(ctx, sword, x, guardY) {
  if (!sword || !sword.bladeColor) return;
  const blen = Math.max(5, Math.round(sword.reach * 0.52));
  r(ctx, x,   guardY - blen, 1, blen, sword.bladeColor);
  // 날 하이라이트
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x*S, (guardY - blen)*S, S, blen*S * 0.5);
  r(ctx, x-1, guardY,        3, 1, sword.guardColor);
  r(ctx, x,   guardY+1,      1, 3, HANDLE);
  px(ctx, x, guardY+4, HANDLE_S);
}

function _swordThrust(ctx, sword) {
  if (!sword || !sword.bladeColor) return;
  const blen = Math.max(6, Math.round(sword.reach * 0.65));
  r(ctx, 13, 10, blen, 1, sword.bladeColor);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(13*S, 10*S, blen*S * 0.6, S);
  r(ctx, 12, 9,  1, 3, sword.guardColor);
  r(ctx, 10, 10, 2, 1, HANDLE);
}

// ─── 공통 색상 추출 ──────────────────────────────────
function _colors(eq) {
  const armor  = eq.armor;
  const shield = eq.shield;
  const boots  = eq.boots;
  const sword  = eq.sword;
  return {
    ac: armor?.id  !== 'none' ? armor.bodyColor   : null,
    hc: armor?.id  !== 'none' ? armor.helmetColor : null,
    ht: armor?.id  !== 'none' ? armor.trimColor   : null,
    bc: boots?.id  !== 'none' ? boots.color       : SKIN_S,
    hasSword:  sword?.id  !== 'none',
    hasShield: shield?.id !== 'none',
  };
}
