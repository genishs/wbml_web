// 구역(biome) 시각 테마 + 렌더링 틀.
// 한 라운드는 여러 biome 구역을 거쳐 진행한다(예: 해변→물속→동굴→성벽).
// 각 biome = { sky:[top,bottom] 그라데이션, ground:{top,body,tile}, plat:{face,top}, decor:키, hazard:기본해저드 }.
// 좌표·아트는 전부 우리 작성(원작 진행 구조만 참고). cf. doc/map-composition.md
import { GROUND_Y, HUD_W, VIEW_W } from './constants.js';

export const BIOMES = {
  village:     { sky:['#2aa0ff','#a8dcff'], ground:{top:'#3cb043',body:'#7a4a28',tile:'#9a6a44'}, plat:{face:'#7a4a28',top:'#9a6a44'}, decor:'bush' },
  meadow:      { sky:['#2aa0ff','#bfe8ff'], ground:{top:'#3cb043',body:'#7a4a28',tile:'#9a6a44'}, plat:{face:'#7a4a28',top:'#9a6a44'}, decor:'bush' },
  cave:        { sky:['#120e1c','#241c30'], ground:{top:'#5a5060',body:'#352e3c',tile:'#473f50'}, plat:{face:'#352e3c',top:'#5a5060'}, decor:'stalactite' },
  mushroom:    { sky:['#163a26','#2f6a44'], ground:{top:'#5a8a3a',body:'#4a3a24',tile:'#6a5a34'}, plat:{face:'#4a3a24',top:'#6a5a34'}, decor:'mushroom' },
  water:       { sky:['#2aa0ff','#bfe8ff'], ground:{top:'#3cb043',body:'#5a4a28',tile:'#7a6a44'}, plat:{face:'#6a5540',top:'#8a7560'}, decor:'none', hazard:'water' },
  underwater:  { sky:['#0a2a5a','#1a5a9a'], ground:{top:'#3a6a9a',body:'#234a6a',tile:'#345a7a'}, plat:{face:'#2a4a66',top:'#3a6a8a'}, decor:'bubble', hazard:'deepwater' },
  castle_in:   { sky:['#2a3450','#44506a'], ground:{top:'#6a6a7a',body:'#3e3e4a',tile:'#52525e'}, plat:{face:'#3e3e4a',top:'#6a6a7a'}, decor:'column' },
  castle_out:  { sky:['#4a5878','#9aa8c8'], ground:{top:'#8a8a98',body:'#52525e',tile:'#6a6a76'}, plat:{face:'#52525e',top:'#8a8a98'}, decor:'battlement' },
  beach:       { sky:['#2ab0ff','#b8ecff'], ground:{top:'#e8d090',body:'#c8a860',tile:'#d8bc78'}, plat:{face:'#b89850',top:'#d8bc78'}, decor:'palm' },
  island_town: { sky:['#2ab0ff','#b8ecff'], ground:{top:'#e8d090',body:'#9a7a4a',tile:'#b89a6a'}, plat:{face:'#9a7a4a',top:'#b89a6a'}, decor:'palm' },
  mountain:    { sky:['#6a8a9a','#bcd4dc'], ground:{top:'#7a8a6a',body:'#544e44',tile:'#6e685a'}, plat:{face:'#544e44',top:'#7a746a'}, decor:'peak' },
  forest:      { sky:['#2a7a3a','#86d076'], ground:{top:'#3c9a33',body:'#5a3a24',tile:'#6a4a30'}, plat:{face:'#5a3a24',top:'#3c8a33'}, decor:'tree' },
  desert:      { sky:['#d8c87a','#f2e4a4'], ground:{top:'#d8b860',body:'#b89048',tile:'#c8a458'}, plat:{face:'#b89048',top:'#d8b860'}, decor:'cactus' },
  pyramid:     { sky:['#5a4a2a','#8a7444'], ground:{top:'#a88a4a',body:'#7a5e34',tile:'#8e7240'}, plat:{face:'#7a5e34',top:'#a88a4a'}, decor:'glyph' },
  lava:        { sky:['#3a0e08','#7a2012'], ground:{top:'#4a2a22',body:'#2a1814',tile:'#3a201a'}, plat:{face:'#2a1814',top:'#4a2a22'}, decor:'ember', hazard:'lava' },
  dungeon:     { sky:['#1a1226','#2a1f3a'], ground:{top:'#4a3e54',body:'#2e2638',tile:'#3c3248'}, plat:{face:'#2e2638',top:'#4a3e54'}, decor:'bars' },
  ice:         { sky:['#88ccee','#d4f0fb'], ground:{top:'#cfeaf5',body:'#9ac4d8',tile:'#b8dcec'}, plat:{face:'#9ac4d8',top:'#d4f0fb'}, decor:'icicle' },
  ice_castle:  { sky:['#6aaed0','#a8d8ee'], ground:{top:'#bfe2f0',body:'#7aa8c0',tile:'#9cc8dc'}, plat:{face:'#7aa8c0',top:'#bfe2f0'}, decor:'icicle' },
  void_castle: { sky:['#05031e','#10104a'], ground:{top:'#2a2a44',body:'#14142a',tile:'#1e1e38'}, plat:{face:'#14142a',top:'#2a2a44'}, decor:'crack' },
};

const FALLBACK = BIOMES.meadow;
export function biomeOf(key) { return BIOMES[key] || FALLBACK; }

// 구역의 기본 해저드(없으면 null). lava/water/deepwater.
export function biomeHazard(key) { return biomeOf(key).hazard || null; }

// 구역 배경(하늘+지면 밴드)을 그린다. areas = [{x0,x1,biome}], 카메라 기준 화면 밴드로 채움.
export function drawBiomeBackground(ctx, areas, camX, now) {
  if (!areas || !areas.length) return;
  const L = HUD_W, R = HUD_W + VIEW_W;
  for (const a of areas) {
    let s0 = Math.round(a.x0 - camX + HUD_W), s1 = Math.round(a.x1 - camX + HUD_W);
    if (s1 < L || s0 > R) continue;
    const cs0 = Math.max(L, s0), cs1 = Math.min(R, s1);
    if (cs1 <= cs0) continue;
    const b = biomeOf(a.biome);
    // 하늘 그라데이션
    const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    g.addColorStop(0, b.sky[0]); g.addColorStop(1, b.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(cs0, 0, cs1 - cs0, GROUND_Y);
    // 지면 밴드
    ctx.fillStyle = b.ground.top;  ctx.fillRect(cs0, GROUND_Y, cs1 - cs0, 8);
    ctx.fillStyle = b.ground.body; ctx.fillRect(cs0, GROUND_Y + 8, cs1 - cs0, 52);
    ctx.fillStyle = b.ground.tile;
    for (let tx = Math.floor((cs0 - L) / 48) * 48 + L; tx < cs1; tx += 48) {
      const dx = Math.max(cs0, tx); ctx.fillRect(dx, GROUND_Y + 10, Math.min(tx + 40, cs1) - dx, 4);
    }
  }
  // 구역 장식(전경, 지면 위) — 별도 패스
  for (const a of areas) {
    const s0 = a.x0 - camX + HUD_W, s1 = a.x1 - camX + HUD_W;
    if (s1 < L - 40 || s0 > R + 40) continue;
    _decor(ctx, a, camX, now);
  }
}

// 평탄 플랫폼 색(구역별). _drawPlatforms 가 사용.
export function platColors(key) { return biomeOf(key).plat; }

// ── 구역 장식: 결정적 배치(area x 기준 의사난수). 가볍게 1~수개 모티프. ──
function _decor(ctx, a, camX, now) {
  const b = biomeOf(a.biome), kind = b.decor;
  if (!kind || kind === 'none') return;
  const span = a.x1 - a.x0;
  const step = 220;
  for (let wx = a.x0 + 80; wx < a.x1 - 40; wx += step) {
    const r = _h(wx);                         // 0~1 의사난수
    const sx = Math.round(wx - camX + HUD_W);
    if (sx < HUD_W - 40 || sx > HUD_W + VIEW_W + 40) continue;
    const jitter = Math.round((r - 0.5) * 80);
    _motif(ctx, kind, sx + jitter, r, now);
  }
}

function _h(x) { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); }

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
    case 'stalactite': {  // 천장 고드름(돌)
      const len = 18 + Math.round(r * 22);
      ctx.fillStyle = '#4a4250'; ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 7, len); ctx.closePath(); ctx.fill(); break; }
    case 'icicle': {
      const len = 14 + Math.round(r * 20);
      ctx.fillStyle = 'rgba(220,245,255,0.9)'; ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 10, 0); ctx.lineTo(x + 5, len); ctx.closePath(); ctx.fill(); break; }
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
    case 'ember': {  // 용암 위 떠오르는 불씨
      const fy = gy - 30 - ((now / 14 + x * 7) % 60);
      ctx.fillStyle = 'rgba(255,140,40,0.7)'; ctx.fillRect(x + 6, Math.round(fy), 3, 3); break; }
    case 'bars':
      ctx.fillStyle = '#5a5060';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + i * 8, gy - 70, 3, 70); break;
    case 'bubble': {  // 물속 거품 상승
      const by = gy - ((now / 12 + x * 5) % (gy - 10));
      ctx.fillStyle = 'rgba(200,235,255,0.5)'; ctx.fillRect(x + 8, Math.round(by), 4, 4);
      ctx.fillStyle = 'rgba(120,200,240,0.35)'; ctx.fillRect(x - 4, Math.round(by) + 18, 3, 3); break; }
    case 'crack':
      ctx.fillStyle = 'rgba(80,90,200,0.4)';
      ctx.fillRect(x + 6, gy - 80, 2, 80); ctx.fillRect(x, gy - 50, 14, 2); break;
  }
}
