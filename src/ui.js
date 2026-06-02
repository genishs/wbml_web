import { HUD_W, CANVAS_H } from './constants.js';

const HUD_H   = CANVAS_H;
const H_COLOR = '#e81020';
const H_EMPTY = '#600000';

export function drawHUD(ctx, player, stageNum) {
  // ── HUD 배경 ──
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, HUD_W, HUD_H);
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, HUD_W, HUD_H);

  let y = 6;

  // ── SCORE ──
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SCORE', HUD_W / 2, y + 9);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(String(player.score).padStart(6, '0'), HUD_W / 2, y + 20);
  y += 28;

  _hline(ctx, y); y += 4;

  // ── LIFE ──
  ctx.fillStyle = '#ff8888';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('LIFE', HUD_W / 2, y + 9);
  y += 12;
  _drawHearts(ctx, player, y);
  y += 28;

  _hline(ctx, y); y += 4;

  // ── GOLD ──
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('GOLD', HUD_W / 2, y + 9);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(String(player.gold), HUD_W / 2, y + 20);
  y += 28;

  _hline(ctx, y); y += 4;

  // ── MAGIC (활성 서브웨폰) ──
  ctx.fillStyle = '#cc88ff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('MAGIC', HUD_W / 2, y + 8);
  const am = player.activeMagic();
  ctx.font = '8px monospace';
  if (am) { ctx.fillStyle = '#ffffff'; ctx.fillText(`${am.magic.name} ×${am.count}`, HUD_W / 2, y + 19); }
  else    { ctx.fillStyle = '#555555'; ctx.fillText('없음', HUD_W / 2, y + 19); }
  y += 24;

  _hline(ctx, y); y += 4;

  // ── ITEM (소지품 6슬롯) ──
  ctx.fillStyle = '#aaaaaa';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('ITEM', HUD_W / 2, y + 8);
  y += 11;
  _drawInventoryGrid(ctx, player, y);
  y += 66;

  _hline(ctx, y); y += 4;

  // ── TIMER (모래시계) ──
  _drawTimer(ctx, player, y);
  y += 62;

  _hline(ctx, y); y += 4;

  // ── RND. ──
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`RND.${stageNum}`, HUD_W / 2, y + 10);

  ctx.textAlign = 'left';
}

function _hline(ctx, y) {
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, y); ctx.lineTo(HUD_W - 4, y);
  ctx.stroke();
}

function _drawHearts(ctx, player, y) {
  const cols = 5, rows = 2;
  const size = 10, gap = 2;
  const startX = (HUD_W - (cols * (size + gap) - gap)) / 2;
  for (let i = 0; i < player.maxHp; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const hx = startX + col * (size + gap);
    const hy = y + row * (size + gap);
    ctx.fillStyle = i < player.hp ? H_COLOR : H_EMPTY;
    _drawHeart(ctx, hx, hy, size);
  }
}

function _drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + size * 0.85);
  ctx.bezierCurveTo(x, y + size * 0.4, x, y, x + size * 0.25, y);
  ctx.bezierCurveTo(x + size * 0.5, y, x + size * 0.5, y + size * 0.2, x + size / 2, y + size * 0.35);
  ctx.bezierCurveTo(x + size * 0.5, y + size * 0.2, x + size * 0.5, y, x + size * 0.75, y);
  ctx.bezierCurveTo(x + size, y, x + size, y + size * 0.4, x + size / 2, y + size * 0.85);
  ctx.closePath();
  ctx.fill();
}

function _drawInventoryGrid(ctx, player, y) {
  const inv = player.inventory;
  const slots = [
    { key: 'helmet',    has: inv.helmet > 0,    n: inv.helmet },
    { key: 'gauntlet',  has: inv.gauntlet > 0,  n: inv.gauntlet },
    { key: 'wingboots', has: inv.wingboots > 0, n: inv.wingboots },
    { key: 'key',       has: inv.key > 0,       n: inv.key },
    { key: 'potion',    has: inv.potion > 0,    n: inv.potion },
    { key: 'story',     has: !!inv.story,       n: 0 },
  ];
  const cols = 3, cw = 34, ch = 30, sx0 = (HUD_W - cols * cw) / 2;
  ctx.textAlign = 'center';
  slots.forEach((s, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const sx = sx0 + col * cw, sy = y + row * ch;
    ctx.fillStyle = s.has ? '#2a2040' : '#111111';
    ctx.fillRect(sx + 1, sy + 1, cw - 2, ch - 2);
    ctx.strokeStyle = s.has ? '#6040cc' : '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 1, sy + 1, cw - 2, ch - 2);
    const ccx = sx + cw / 2, ccy = sy + ch / 2;
    if (s.has) _drawInvIcon(ctx, s.key, ccx, ccy);
    else { ctx.fillStyle = '#333333'; ctx.font = '8px monospace'; ctx.fillText('·', ccx, ccy + 3); }
    if (s.n > 1) {
      ctx.fillStyle = '#ffdd44'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'right';
      ctx.fillText('×' + s.n, sx + cw - 3, sy + ch - 3); ctx.textAlign = 'center';
    }
  });
}

function _drawInvIcon(ctx, key, x, y) {
  switch (key) {
    case 'helmet':
      ctx.fillStyle = '#88bbff'; ctx.fillRect(x - 6, y - 1, 12, 4);
      ctx.beginPath(); ctx.arc(x, y, 6, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ee0000'; ctx.fillRect(x - 1, y - 9, 2, 5); break;
    case 'gauntlet':
      ctx.fillStyle = '#ffcc00'; ctx.fillRect(x - 5, y - 3, 10, 8); ctx.fillRect(x - 6, y - 6, 4, 5); break;
    case 'wingboots':
      ctx.fillStyle = '#774433'; ctx.fillRect(x - 1, y - 5, 6, 9); ctx.fillRect(x - 1, y + 2, 9, 3);
      ctx.fillStyle = '#ffffff'; ctx.beginPath();
      ctx.moveTo(x - 2, y - 4); ctx.lineTo(x - 9, y - 7); ctx.lineTo(x - 2, y + 2); ctx.closePath(); ctx.fill(); break;
    case 'key':
      ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(x - 4, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 1, y - 1, 9, 2); ctx.fillRect(x + 6, y - 1, 2, 4); break;
    case 'potion':
      ctx.fillStyle = '#aaaaaa'; ctx.fillRect(x - 2, y - 7, 4, 3);
      ctx.fillStyle = '#cccccc'; ctx.fillRect(x - 4, y - 4, 8, 9);
      ctx.fillStyle = '#ee0000'; ctx.fillRect(x - 3, y - 1, 6, 5); break;
    case 'story':
      ctx.fillStyle = '#ffee00'; ctx.font = 'bold 13px monospace'; ctx.fillText('★', x, y + 4); break;
  }
}

function _drawEquipGrid(ctx, eq, y) {
  const slots = [
    { key: 'sword',  label: '검' },
    { key: 'shield', label: '방패' },
    { key: 'armor',  label: '갑옷' },
    { key: 'boots',  label: '신발' },
  ];
  const cellW = 48, cellH = 34, cols = 2;
  const startX = (HUD_W - cols * cellW) / 2;

  slots.forEach((slot, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const sx = startX + col * cellW;
    const sy = y + row * cellH;
    const item = eq[slot.key];
    const equipped = item && item.id !== 'none';

    ctx.fillStyle = equipped ? '#2a2040' : '#111111';
    ctx.fillRect(sx + 1, sy + 1, cellW - 2, cellH - 2);
    ctx.strokeStyle = equipped ? '#6040cc' : '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 1, sy + 1, cellW - 2, cellH - 2);

    ctx.fillStyle = '#666666';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(slot.label, sx + cellW / 2, sy + 9);

    if (equipped) {
      _drawEquipIcon(ctx, slot.key, item, sx + cellW / 2, sy + 22);
    } else {
      ctx.fillStyle = '#333333';
      ctx.font = '8px monospace';
      ctx.fillText('--', sx + cellW / 2, sy + 24);
    }
  });
}

function _drawEquipIcon(ctx, slot, item, cx, cy) {
  switch (slot) {
    case 'sword':
      ctx.fillStyle = item.bladeColor;
      ctx.fillRect(cx - 1, cy - 10, 2, 14);
      ctx.fillStyle = item.guardColor;
      ctx.fillRect(cx - 5, cy + 2, 10, 2);
      ctx.fillStyle = '#804020';
      ctx.fillRect(cx - 1, cy + 4, 2, 4);
      break;
    case 'shield':
      ctx.fillStyle = item.bodyColor;
      ctx.fillRect(cx - 7, cy - 8, 14, 14);
      ctx.fillStyle = item.rimColor;
      ctx.strokeStyle = item.rimColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 7, cy - 8, 14, 14);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(cx - 5, cy - 6, 5, 4);
      break;
    case 'armor':
      ctx.fillStyle = item.bodyColor;
      ctx.fillRect(cx - 8, cy - 9, 16, 16);
      ctx.fillStyle = item.trimColor;
      ctx.fillRect(cx - 8, cy - 9, 16, 3);
      ctx.fillStyle = item.helmetColor;
      ctx.fillRect(cx - 6, cy - 14, 12, 7);
      break;
    case 'boots':
      ctx.fillStyle = item.color;
      ctx.fillRect(cx - 8, cy - 6, 10, 10);
      ctx.fillRect(cx - 8, cy + 4, 14, 4);
      break;
  }
}

function _drawTimer(ctx, player, y) {
  const ratio = player.timer / player.timerMax;
  const bx = 18, by = y + 4, bw = HUD_W - 36, bh = 50;

  // 모래시계 외형
  ctx.fillStyle = '#d4b060';
  // 위 삼각형
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw / 2, by + bh / 2 - 2);
  ctx.closePath();
  ctx.fill();
  // 아래 삼각형
  ctx.beginPath();
  ctx.moveTo(bx, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw / 2, by + bh / 2 + 2);
  ctx.closePath();
  ctx.fill();

  // 모래 (초록)
  const sandH = Math.round((bh / 2 - 2) * ratio);
  ctx.fillStyle = ratio > 0.3 ? '#40dd40' : '#ffaa00';
  // 위쪽 남은 모래
  ctx.beginPath();
  const topRatio = Math.min(1, ratio * 2);
  const topW = bw * topRatio;
  ctx.moveTo(bx + (bw - topW) / 2, by);
  ctx.lineTo(bx + (bw + topW) / 2, by);
  ctx.lineTo(bx + bw / 2, by + bh / 2 - 2);
  ctx.closePath();
  ctx.fill();
}
