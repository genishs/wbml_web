// 구역(biome) 시각 테마 + 렌더링.
// 한 라운드는 여러 biome 구역을 거쳐 진행한다(예: 해변→물속→동굴→성벽).
// 레이어: ① 하늘 그라데이션 ② 원경(배경 실루엣, 패럴랙스) ③ 지면 밴드+텍스처 ④ 전경 장식 ⑤ 앰비언트 파티클.
// 좌표·아트는 전부 우리 작성(원작 진행 구조만 참고). cf. doc/map-composition.md
import { GROUND_Y, HUD_W, VIEW_W } from './constants.js';

// biome = { sky:[top,bottom], ground:{top,body,tile}, plat:{face,top}, decor, bg, gtex, particle?, hazard? }
export const BIOMES = {
  village:     { sky:['#2aa0ff','#a8dcff'], ground:{top:'#3cb043',body:'#7a4a28',tile:'#9a6a44'}, plat:{face:'#7a4a28',top:'#9a6a44'}, decor:'bush',       bg:'hills',      gtex:'grass' },
  meadow:      { sky:['#2aa0ff','#bfe8ff'], ground:{top:'#3cb043',body:'#7a4a28',tile:'#9a6a44'}, plat:{face:'#7a4a28',top:'#9a6a44'}, decor:'bush',       bg:'hills',      gtex:'grass' },
  cave:        { sky:['#120e1c','#241c30'], ground:{top:'#5a5060',body:'#352e3c',tile:'#473f50'}, plat:{face:'#352e3c',top:'#5a5060'}, decor:'stalactite', bg:'cavewall',   gtex:'rock' },
  mushroom:    { sky:['#163a26','#2f6a44'], ground:{top:'#5a8a3a',body:'#4a3a24',tile:'#6a5a34'}, plat:{face:'#4a3a24',top:'#6a5a34'}, decor:'mushroom',   bg:'mushroomfar',gtex:'grass', particle:'spore' },
  water:       { sky:['#2aa0ff','#bfe8ff'], ground:{top:'#3cb043',body:'#5a4a28',tile:'#7a6a44'}, plat:{face:'#6a5540',top:'#8a7560'}, decor:'none',       bg:'sea',        gtex:'grass', hazard:'water' },
  underwater:  { sky:['#0a2a5a','#1a5a9a'], ground:{top:'#3a6a9a',body:'#234a6a',tile:'#345a7a'}, plat:{face:'#2a4a66',top:'#3a6a8a'}, decor:'coral',      bg:'deepsea',    gtex:'sand',  particle:'bubble', hazard:'deepwater' },
  castle_in:   { sky:['#2a3450','#44506a'], ground:{top:'#6a6a7a',body:'#3e3e4a',tile:'#52525e'}, plat:{face:'#3e3e4a',top:'#6a6a7a'}, decor:'column',     bg:'hall',       gtex:'brick' },
  castle_out:  { sky:['#4a5878','#9aa8c8'], ground:{top:'#8a8a98',body:'#52525e',tile:'#6a6a76'}, plat:{face:'#52525e',top:'#8a8a98'}, decor:'battlement', bg:'towers',     gtex:'brick' },
  beach:       { sky:['#2ab0ff','#b8ecff'], ground:{top:'#e8d090',body:'#c8a860',tile:'#d8bc78'}, plat:{face:'#b89850',top:'#d8bc78'}, decor:'palm',       bg:'sea',        gtex:'sand' },
  island_town: { sky:['#2ab0ff','#b8ecff'], ground:{top:'#e8d090',body:'#9a7a4a',tile:'#b89a6a'}, plat:{face:'#9a7a4a',top:'#b89a6a'}, decor:'palm',       bg:'sea',        gtex:'sand' },
  mountain:    { sky:['#6a8a9a','#bcd4dc'], ground:{top:'#7a8a6a',body:'#544e44',tile:'#6e685a'}, plat:{face:'#544e44',top:'#7a746a'}, decor:'peak',       bg:'peaks',      gtex:'rock' },
  forest:      { sky:['#2a7a3a','#86d076'], ground:{top:'#3c9a33',body:'#5a3a24',tile:'#6a4a30'}, plat:{face:'#5a3a24',top:'#3c8a33'}, decor:'tree',       bg:'canopy',     gtex:'grass' },
  desert:      { sky:['#d8c87a','#f2e4a4'], ground:{top:'#d8b860',body:'#b89048',tile:'#c8a458'}, plat:{face:'#b89048',top:'#d8b860'}, decor:'cactus',     bg:'dunes',      gtex:'sand' },
  pyramid:     { sky:['#5a4a2a','#8a7444'], ground:{top:'#a88a4a',body:'#7a5e34',tile:'#8e7240'}, plat:{face:'#7a5e34',top:'#a88a4a'}, decor:'glyph',      bg:'pyramidin',  gtex:'brick' },
  lava:        { sky:['#3a0e08','#7a2012'], ground:{top:'#4a2a22',body:'#2a1814',tile:'#3a201a'}, plat:{face:'#2a1814',top:'#4a2a22'}, decor:'ember',      bg:'volcano',    gtex:'rock',  particle:'ember', hazard:'lava' },
  dungeon:     { sky:['#1a1226','#2a1f3a'], ground:{top:'#4a3e54',body:'#2e2638',tile:'#3c3248'}, plat:{face:'#2e2638',top:'#4a3e54'}, decor:'bars',       bg:'cells',      gtex:'brick' },
  ice:         { sky:['#88ccee','#d4f0fb'], ground:{top:'#cfeaf5',body:'#9ac4d8',tile:'#b8dcec'}, plat:{face:'#9ac4d8',top:'#d4f0fb'}, decor:'icicle',     bg:'snowpeaks',  gtex:'ice',   particle:'snow' },
  ice_castle:  { sky:['#6aaed0','#a8d8ee'], ground:{top:'#bfe2f0',body:'#7aa8c0',tile:'#9cc8dc'}, plat:{face:'#7aa8c0',top:'#bfe2f0'}, decor:'icicle',     bg:'icespire',   gtex:'ice',   particle:'snow' },
  void_castle: { sky:['#05031e','#10104a'], ground:{top:'#2a2a44',body:'#14142a',tile:'#1e1e38'}, plat:{face:'#14142a',top:'#2a2a44'}, decor:'crack',      bg:'voidspire',  gtex:'brick', particle:'star' },
};

const FALLBACK = BIOMES.meadow;
export function biomeOf(key) { return BIOMES[key] || FALLBACK; }
export function biomeHazard(key) { return biomeOf(key).hazard || null; }
export function platColors(key) { return biomeOf(key).plat; }

// 의사난수(좌표 결정적) — 장식/별 배치에 사용
function _h(x) { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); }

// 구역 배경 전체: 하늘 → 원경 → 지면 밴드+텍스처 → (전경 장식·파티클은 별도 패스)
export function drawBiomeBackground(ctx, areas, camX, now) {
  if (!areas || !areas.length) return;
  const L = HUD_W, R = HUD_W + VIEW_W;
  for (const a of areas) {
    const s0 = Math.round(a.x0 - camX + HUD_W), s1 = Math.round(a.x1 - camX + HUD_W);
    if (s1 < L || s0 > R) continue;
    const cs0 = Math.max(L, s0), cs1 = Math.min(R, s1);
    if (cs1 <= cs0) continue;
    const b = biomeOf(a.biome);
    // ① 하늘 그라데이션
    const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    g.addColorStop(0, b.sky[0]); g.addColorStop(1, b.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(cs0, 0, cs1 - cs0, GROUND_Y);
    // ② 원경(패럴랙스, 구역 밴드로 클립)
    ctx.save(); ctx.beginPath(); ctx.rect(cs0, 0, cs1 - cs0, GROUND_Y); ctx.clip();
    _bg(ctx, b.bg, camX, now);
    ctx.restore();
    // ③ 지면 밴드 + 텍스처
    ctx.fillStyle = b.ground.top;  ctx.fillRect(cs0, GROUND_Y, cs1 - cs0, 8);
    ctx.fillStyle = b.ground.body; ctx.fillRect(cs0, GROUND_Y + 8, cs1 - cs0, 52);
    ctx.fillStyle = b.ground.tile;
    for (let tx = Math.floor((cs0 - L) / 48) * 48 + L; tx < cs1; tx += 48) {
      const dx = Math.max(cs0, tx); ctx.fillRect(dx, GROUND_Y + 10, Math.min(tx + 40, cs1) - dx, 4);
    }
    _groundTex(ctx, b.gtex, cs0, cs1, camX);
  }
  // ④ 전경 장식 + ⑤ 앰비언트 파티클
  for (const a of areas) {
    const s0 = a.x0 - camX + HUD_W, s1 = a.x1 - camX + HUD_W;
    if (s1 < L - 60 || s0 > R + 60) continue;
    _decor(ctx, a, camX, now);
    const b = biomeOf(a.biome);
    if (b.particle) _particles(ctx, b.particle, Math.max(L, s0), Math.min(R, s1), now);
  }
}

// ── 원경(배경) 패럴랙스 헬퍼 ──
// factor<1 로 느리게 스크롤. period 간격으로 요소를 화면 폭만큼 반복 배치.
function _repeat(camX, factor, period, fn) {
  const ox = camX * factor;
  let wx = Math.floor((ox - HUD_W) / period) * period;
  for (; wx - ox < VIEW_W + period; wx += period) fn(Math.round(wx - ox + HUD_W), wx);
}
function _sun(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.fill();
}
function _cloudPuff(ctx, x, y, s, c) {
  ctx.fillStyle = c; ctx.fillRect(x, y, 30 * s, 9 * s); ctx.fillRect(x + 6 * s, y - 6 * s, 20 * s, 8 * s);
}
function _hill(ctx, x, base, w, h, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x - w, base); ctx.quadraticCurveTo(x, base - h, x + w, base); ctx.closePath(); ctx.fill();
}

function _bg(ctx, kind, camX, now) {
  const gy = GROUND_Y;
  switch (kind) {
    case 'hills':
      _sun(ctx, HUD_W + 90, 56, 18, '#fff2b0');
      _repeat(camX, 0.15, 240, (sx) => _cloudPuff(ctx, sx, 40 + (sx % 30), 1, 'rgba(255,255,255,0.85)'));
      _repeat(camX, 0.30, 300, (sx) => _hill(ctx, sx, gy, 150, 90, '#2f9a3a'));
      _repeat(camX, 0.45, 200, (sx) => _hill(ctx, sx + 100, gy, 110, 60, '#37b045')); break;
    case 'sea': {
      _sun(ctx, HUD_W + VIEW_W - 110, 60, 20, '#fff0a0');
      const hor = gy - 70; ctx.fillStyle = '#1f7fd0'; ctx.fillRect(HUD_W, hor, VIEW_W, 70);       // 바다
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      _repeat(camX, 0.5, 60, (sx) => ctx.fillRect(sx, hor + 18 + (Math.sin(now / 500 + sx) * 3 | 0), 22, 2));
      _repeat(camX, 0.15, 280, (sx) => _cloudPuff(ctx, sx, 44, 1, 'rgba(255,255,255,0.9)'));
      _repeat(camX, 0.32, 360, (sx) => { _hill(ctx, sx, hor + 4, 60, 30, '#2a7a4a'); });           // 먼 섬
      break; }
    case 'deepsea': {
      ctx.fillStyle = 'rgba(120,200,255,0.06)';                                                    // 수면 광선
      _repeat(camX, 0.2, 120, (sx) => { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 40, 0); ctx.lineTo(sx + 90, gy); ctx.lineTo(sx + 50, gy); ctx.closePath(); ctx.fill(); });
      _repeat(camX, 0.4, 200, (sx) => {                                                             // 먼 산호/해초 실루엣
        ctx.fillStyle = 'rgba(20,60,90,0.7)';
        ctx.fillRect(sx, gy - 70, 6, 70); ctx.fillRect(sx + 10, gy - 50, 6, 50); ctx.fillRect(sx + 20, gy - 84, 6, 84);
      }); break; }
    case 'cavewall':
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      _repeat(camX, 0.25, 70, (sx) => ctx.fillRect(sx, 0, 30, gy));                                 // 암벽 줄무늬
      _repeat(camX, 0.4, 320, (sx, wx) => { const cy = 60 + _h(wx) * 160;                            // 크리스탈 미광
        ctx.fillStyle = 'rgba(120,200,220,0.18)'; ctx.fillRect(sx, cy, 5, 12); ctx.fillRect(sx + 1, cy - 4, 3, 6); }); break;
    case 'mushroomfar':
      _repeat(camX, 0.3, 260, (sx, wx) => { const h = 60 + _h(wx) * 60;
        ctx.fillStyle = 'rgba(30,70,40,0.7)'; ctx.fillRect(sx + 8, gy - h, 8, h);
        ctx.fillStyle = 'rgba(120,40,50,0.6)'; ctx.fillRect(sx - 6, gy - h - 12, 36, 16); }); break;
    case 'canopy':
      ctx.fillStyle = 'rgba(20,70,30,0.55)';
      _repeat(camX, 0.25, 90, (sx) => { ctx.beginPath(); ctx.arc(sx, 30, 34, 0, Math.PI); ctx.fill(); }); // 위쪽 우거진 잎
      ctx.fillStyle = 'rgba(255,255,210,0.06)';
      _repeat(camX, 0.45, 160, (sx) => { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 24, 0); ctx.lineTo(sx + 60, gy); ctx.lineTo(sx + 36, gy); ctx.closePath(); ctx.fill(); }); break;
    case 'peaks':
      _repeat(camX, 0.2, 320, (sx) => { _hill(ctx, sx, gy, 180, 150, '#5a6e7a'); });
      _repeat(camX, 0.34, 260, (sx) => {                                                            // 만년설 봉우리
        ctx.fillStyle = '#6e8290'; ctx.beginPath(); ctx.moveTo(sx - 120, gy); ctx.lineTo(sx, gy - 130); ctx.lineTo(sx + 120, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8f0f4'; ctx.beginPath(); ctx.moveTo(sx - 28, gy - 100); ctx.lineTo(sx, gy - 130); ctx.lineTo(sx + 28, gy - 100); ctx.closePath(); ctx.fill(); }); break;
    case 'dunes':
      _sun(ctx, HUD_W + 100, 58, 22, 'rgba(255,240,180,0.9)');
      _repeat(camX, 0.25, 300, (sx) => { ctx.fillStyle = '#cfa85a'; ctx.beginPath(); ctx.moveTo(sx - 160, gy); ctx.quadraticCurveTo(sx, gy - 60, sx + 160, gy); ctx.closePath(); ctx.fill(); });
      _repeat(camX, 0.34, 520, (sx) => {                                                            // 먼 피라미드
        ctx.fillStyle = '#b8924c'; ctx.beginPath(); ctx.moveTo(sx - 70, gy); ctx.lineTo(sx, gy - 96); ctx.lineTo(sx + 70, gy); ctx.closePath(); ctx.fill(); }); break;
    case 'hall':
      _repeat(camX, 0.3, 150, (sx) => {                                                             // 아치 창 + 휘장
        ctx.fillStyle = '#1f2638'; ctx.fillRect(sx, 30, 40, 160);
        ctx.fillStyle = '#33405e'; ctx.fillRect(sx + 4, 36, 32, 150);
        ctx.fillStyle = '#1f2638'; ctx.beginPath(); ctx.arc(sx + 20, 36, 20, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#7a3a3a'; ctx.fillRect(sx + 16, gy - 120, 8, 80); });                      // 휘장
      break;
    case 'towers':
      _repeat(camX, 0.22, 300, (sx) => {                                                            // 먼 성탑
        ctx.fillStyle = '#5a6480'; ctx.fillRect(sx, gy - 170, 54, 170);
        ctx.fillStyle = '#454e66'; for (let i = 0; i < 54; i += 16) ctx.fillRect(sx + i, gy - 184, 10, 16); // 흉벽
        ctx.fillStyle = '#2a3148'; ctx.fillRect(sx + 22, gy - 150, 10, 18);                          // 창
        ctx.fillStyle = '#b04040'; ctx.fillRect(sx + 27, gy - 200, 2, 18); ctx.fillRect(sx + 29, gy - 200, 12, 8); }); // 깃발
      break;
    case 'pyramidin':
      _repeat(camX, 0.3, 200, (sx) => {                                                             // 거대 기둥
        ctx.fillStyle = 'rgba(90,70,40,0.8)'; ctx.fillRect(sx, 0, 40, gy);
        ctx.fillStyle = 'rgba(60,46,24,0.8)'; ctx.fillRect(sx + 40, 0, 14, gy); });
      _repeat(camX, 0.3, 200, (sx) => { ctx.fillStyle = 'rgba(255,150,40,0.16)'; ctx.beginPath(); ctx.arc(sx + 70, gy - 90, 26, 0, Math.PI * 2); ctx.fill(); }); break; // 횃불 광무리
    case 'volcano':
      _repeat(camX, 0.18, 380, (sx) => {                                                            // 먼 화산
        ctx.fillStyle = '#3a1a14'; ctx.beginPath(); ctx.moveTo(sx - 120, gy); ctx.lineTo(sx, gy - 150); ctx.lineTo(sx + 120, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff5a20'; ctx.fillRect(sx - 16, gy - 150, 32, 10);
        ctx.fillStyle = 'rgba(120,60,40,0.5)'; ctx.fillRect(sx - 10, gy - 200, 20, 50); });          // 연기
      ctx.fillStyle = 'rgba(255,80,0,0.07)'; ctx.fillRect(HUD_W, gy - 60, VIEW_W, 60); break;        // 하단 열기
    case 'cells':
      _repeat(camX, 0.3, 130, (sx) => {                                                             // 먼 감옥 창살
        ctx.fillStyle = 'rgba(10,8,16,0.8)'; ctx.fillRect(sx, 40, 70, 130);
        ctx.fillStyle = '#3a3248'; for (let i = 0; i < 70; i += 12) ctx.fillRect(sx + i, 40, 3, 130); }); break;
    case 'snowpeaks':
      _repeat(camX, 0.2, 300, (sx) => {
        ctx.fillStyle = '#8aa8bc'; ctx.beginPath(); ctx.moveTo(sx - 150, gy); ctx.lineTo(sx, gy - 130); ctx.lineTo(sx + 150, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#eef6fb'; ctx.beginPath(); ctx.moveTo(sx - 40, gy - 96); ctx.lineTo(sx, gy - 130); ctx.lineTo(sx + 40, gy - 96); ctx.closePath(); ctx.fill(); }); break;
    case 'icespire':
      _repeat(camX, 0.28, 220, (sx) => {                                                            // 얼음 첨탑
        ctx.fillStyle = 'rgba(150,200,225,0.7)'; ctx.beginPath(); ctx.moveTo(sx, gy); ctx.lineTo(sx + 18, gy - 160); ctx.lineTo(sx + 36, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(220,240,250,0.6)'; ctx.fillRect(sx + 16, gy - 150, 4, 150); }); break;
    case 'voidspire':
      ctx.fillStyle = 'rgba(180,200,255,0.9)';                                                      // 별
      _repeat(camX, 0.1, 40, (sx, wx) => { if (_h(wx) > 0.6) { const sy = (_h(wx * 3) * gy) | 0; ctx.fillRect(sx, sy, 2, 2); } });
      _repeat(camX, 0.26, 240, (sx) => {                                                            // 먼 첨탑
        ctx.fillStyle = '#0c0c28'; ctx.beginPath(); ctx.moveTo(sx, gy); ctx.lineTo(sx + 26, gy - 190); ctx.lineTo(sx + 52, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(90,120,255,0.7)'; ctx.fillRect(sx + 22, gy - 120, 8, 8); }); break;    // 푸른 불
  }
}

// ── 지면 표면 텍스처 ──
function _groundTex(ctx, kind, cs0, cs1, camX) {
  const off = ((camX % 24) + 24) % 24;
  const gy = GROUND_Y;
  switch (kind) {
    case 'grass':
      ctx.fillStyle = '#2e8b2e';
      for (let x = cs0 - off; x < cs1; x += 8) ctx.fillRect(x, gy - 2, 2, 4); break;               // 풀잎
    case 'sand':
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let x = cs0 - off; x < cs1; x += 24) ctx.fillRect(x, gy + 4, 12, 1); break;             // 모래 결
    case 'brick':
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (let x = cs0 - off; x < cs1; x += 24) ctx.fillRect(x, gy, 1, 58);                         // 세로 줄눈
      for (let y = gy + 16; y < gy + 60; y += 18) ctx.fillRect(cs0, y, cs1 - cs0, 1); break;        // 가로 줄눈
    case 'rock':
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let x = cs0 - off; x < cs1; x += 30) ctx.fillRect(x, gy + 14, 14, 6); break;             // 돌 덩이
    case 'ice':
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let x = cs0 - off; x < cs1; x += 40) ctx.fillRect(x, gy + 2, 18, 1);                     // 광택
      ctx.fillStyle = 'rgba(120,170,200,0.5)';
      for (let x = cs0 - off; x < cs1; x += 56) { ctx.fillRect(x, gy + 8, 1, 10); ctx.fillRect(x, gy + 14, 8, 1); } break; // 균열
  }
}

// ── 앰비언트 파티클(눈/불씨/포자/거품/별빛) ──
function _particles(ctx, kind, s0, s1, now) {
  const w = s1 - s0; if (w <= 0) return;
  const N = Math.min(40, Math.round(w / 16));
  for (let i = 0; i < N; i++) {
    const seed = i * 53.13;
    const px = s0 + (_h(seed) * w);
    switch (kind) {
      case 'snow': {
        const py = (now / 22 + _h(seed) * GROUND_Y) % GROUND_Y;
        const dx = Math.sin(now / 600 + i) * 6;
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(px + dx, py, 2, 2); break; }
      case 'ember': {
        const py = GROUND_Y - ((now / 16 + _h(seed) * 220) % 220);
        ctx.fillStyle = 'rgba(255,150,50,0.8)'; ctx.fillRect(px, py, 2, 3); break; }
      case 'spore': {
        const py = (now / 40 + _h(seed) * GROUND_Y) % GROUND_Y;
        ctx.fillStyle = 'rgba(180,255,180,0.5)'; ctx.fillRect(px, py, 2, 2); break; }
      case 'bubble': {
        const py = GROUND_Y - ((now / 18 + _h(seed) * GROUND_Y) % GROUND_Y);
        ctx.fillStyle = 'rgba(200,235,255,0.45)'; ctx.fillRect(px, py, 3, 3); break; }
      case 'star': {
        const tw = (Math.sin(now / 300 + i) + 1) * 0.3;
        ctx.fillStyle = `rgba(200,210,255,${0.3 + tw})`; ctx.fillRect(px, (_h(seed) * GROUND_Y) | 0, 2, 2); break; }
    }
  }
}

// ── 전경 장식(지면 위): 결정적 배치 ──
function _decor(ctx, a, camX, now) {
  const b = biomeOf(a.biome), kind = b.decor;
  if (!kind || kind === 'none') return;
  for (let wx = a.x0 + 80; wx < a.x1 - 40; wx += 220) {
    const r = _h(wx);
    const sx = Math.round(wx - camX + HUD_W);
    if (sx < HUD_W - 40 || sx > HUD_W + VIEW_W + 40) continue;
    _motif(ctx, kind, sx + Math.round((r - 0.5) * 80), r, now);
  }
}

function _motif(ctx, kind, x, r, now) {
  const gy = GROUND_Y;
  switch (kind) {
    case 'bush':
      ctx.fillStyle = '#2e8b2e'; ctx.fillRect(x, gy - 12, 22, 12);
      ctx.fillStyle = '#3cb043'; ctx.fillRect(x + 3, gy - 16, 16, 8); break;
    case 'tree':
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x + 8, gy - 40, 8, 40);
      ctx.fillStyle = '#1f6a2a'; ctx.fillRect(x - 6, gy - 64, 36, 28);
      ctx.fillStyle = '#2e8b3a'; ctx.fillRect(x - 2, gy - 58, 28, 18); break;
    case 'palm':
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x + 9, gy - 46, 6, 46);
      ctx.fillStyle = '#2e9a4a';
      ctx.fillRect(x - 12, gy - 50, 22, 5); ctx.fillRect(x + 12, gy - 50, 22, 5);
      ctx.fillRect(x - 6, gy - 56, 16, 5); ctx.fillRect(x + 12, gy - 56, 16, 5); break;
    case 'cactus':
      ctx.fillStyle = '#3a8a4a'; ctx.fillRect(x + 6, gy - 38, 10, 38);
      ctx.fillRect(x, gy - 26, 6, 14); ctx.fillRect(x + 16, gy - 30, 6, 16); break;
    case 'mushroom':
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x + 6, gy - 26, 8, 26);
      ctx.fillStyle = '#c83838'; ctx.fillRect(x - 4, gy - 38, 28, 14);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 2, gy - 34, 4, 4); ctx.fillRect(x + 12, gy - 36, 4, 4); break;
    case 'coral':
      ctx.fillStyle = '#d86a8a'; ctx.fillRect(x + 6, gy - 24, 5, 24);
      ctx.fillRect(x, gy - 16, 5, 10); ctx.fillRect(x + 12, gy - 20, 5, 14);
      ctx.fillStyle = '#e89aae'; ctx.fillRect(x + 4, gy - 28, 9, 5); break;
    case 'stalactite': { const len = 18 + Math.round(r * 22);
      ctx.fillStyle = '#4a4250'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 7, len); ctx.closePath(); ctx.fill(); break; }
    case 'icicle': { const len = 14 + Math.round(r * 20);
      ctx.fillStyle = 'rgba(220,245,255,0.9)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 10, 0); ctx.lineTo(x + 5, len); ctx.closePath(); ctx.fill(); break; }
    case 'column':
      ctx.fillStyle = '#52525e'; ctx.fillRect(x, gy - 96, 16, 96);
      ctx.fillStyle = '#6a6a78'; ctx.fillRect(x - 3, gy - 100, 22, 6); ctx.fillRect(x - 3, gy - 12, 22, 6); break;
    case 'battlement':
      ctx.fillStyle = '#6a6a76'; ctx.fillRect(x, gy - 70, 20, 70);
      ctx.fillStyle = '#52525e'; ctx.fillRect(x, gy - 80, 6, 12); ctx.fillRect(x + 14, gy - 80, 6, 12); break;
    case 'glyph':
      ctx.fillStyle = 'rgba(60,40,10,0.5)';
      ctx.fillRect(x, gy - 60, 14, 4); ctx.fillRect(x + 4, gy - 52, 4, 16); ctx.fillRect(x, gy - 40, 14, 4); break;
    case 'peak':
      ctx.fillStyle = 'rgba(70,80,70,0.55)'; ctx.beginPath();
      ctx.moveTo(x - 30, gy); ctx.lineTo(x + 6, gy - 90); ctx.lineTo(x + 42, gy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(230,238,240,0.8)'; ctx.beginPath();
      ctx.moveTo(x - 4, gy - 70); ctx.lineTo(x + 6, gy - 90); ctx.lineTo(x + 16, gy - 70); ctx.closePath(); ctx.fill(); break;
    case 'ember': { const fy = gy - 30 - ((now / 14 + x * 7) % 60);
      ctx.fillStyle = 'rgba(255,140,40,0.7)'; ctx.fillRect(x + 6, Math.round(fy), 3, 3); break; }
    case 'bars':
      ctx.fillStyle = '#5a5060'; for (let i = 0; i < 3; i++) ctx.fillRect(x + i * 8, gy - 70, 3, 70); break;
    case 'crack':
      ctx.fillStyle = 'rgba(80,90,200,0.4)'; ctx.fillRect(x + 6, gy - 80, 2, 80); ctx.fillRect(x, gy - 50, 14, 2); break;
  }
}
