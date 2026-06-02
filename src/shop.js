import { SHOP_TYPE, getShopItems, shopTypeName } from './equipment.js';
import { HUD_W } from './constants.js';

export class Shop {
  constructor() {
    this.open     = false;
    this.shopType = null;
    this.items    = [];
    this.cursor   = 0;        // 0=왼쪽, 1=오른쪽
    this.stage    = 1;
    this._player  = null;
    this.message  = '';
    this.msgTimer = 0;
  }

  openShop(shopType, player, stage = 1) {
    this.shopType = shopType;
    this._player  = player;
    this.stage    = stage;
    this.items    = getShopItems(shopType, player, stage);
    this.cursor   = 0;
    this.open     = true;
    this.message  = '';
    this.msgTimer = 0;
  }

  close() { this.open = false; }

  update(input) {
    if (!this.open) return;
    if (this.msgTimer > 0) { this.msgTimer--; return; }

    // 좌/우로 둘 중 하나 선택
    if (input.wasPressed('ArrowLeft'))  this.cursor = 0;
    if (input.wasPressed('ArrowRight')) this.cursor = Math.min(this.items.length - 1, 1);

    if (input.wasPressed('KeyZ') || input.wasPressed('Space')) this._buy();
    if (input.wasPressed('Escape') || input.wasPressed('KeyX')) this.close();
  }

  _buy() {
    if (!this.items.length) return;
    const item = this.items[this.cursor];
    if (!item) return;

    if (this._player.gold < item.cost) {
      this.message  = 'GOLD가 부족하다!';
      this.msgTimer = 90;
      return;
    }

    this._player.gold -= item.cost;

    if (this.shopType === SHOP_TYPE.MAGIC) {
      const n = item.buy || 1;
      this._player.addMagic(item, n);
      this.message  = `${item.name} ×${n} 구입!`;
      this.msgTimer = 90;
      return;   // 매직은 반복 구매 — 목록/커서 유지
    }

    const slot = { weapon: 'sword', shield: 'shield', armor: 'armor', boots: 'boots' }[this.shopType];
    this._player.equip(slot, item);
    this.message  = `${item.name} 구입!`;
    this.msgTimer = 90;
    this.items    = getShopItems(this.shopType, this._player, this.stage);
    this.cursor   = Math.min(this.cursor, Math.max(0, this.items.length - 1));
  }

  // 원작 감각: 팝업이 아니라 '가게 안으로 들어가 점원과 진열대를 바라보는' 화면.
  draw(ctx) {
    if (!this.open) return;
    const VW = 528, x0 = HUD_W, cx = HUD_W + VW / 2;
    const floorY = 250;

    // ── 가게 실내(벽/바닥/카운터) ──
    ctx.fillStyle = '#2a1c14'; ctx.fillRect(x0, 0, VW, 360);          // 뒷벽
    ctx.fillStyle = '#241812';
    for (let bx = x0; bx < x0 + VW; bx += 40)                          // 벽 판자
      ctx.fillRect(bx, 0, 2, floorY);
    ctx.fillStyle = '#4a3420'; ctx.fillRect(x0, floorY, VW, 360 - floorY); // 바닥
    ctx.fillStyle = '#3a2818';
    for (let fx = x0; fx < x0 + VW; fx += 48) ctx.fillRect(fx, floorY, 2, 360 - floorY);

    // 간판
    ctx.fillStyle = '#1a1008'; ctx.fillRect(cx - 110, 12, 220, 30);
    ctx.strokeStyle = '#c89030'; ctx.lineWidth = 2; ctx.strokeRect(cx - 110, 12, 220, 30);
    ctx.fillStyle = '#ffdd66'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
    ctx.fillText(shopTypeName(this.shopType).toUpperCase() + ' SHOP', cx, 33);

    // 점원(카운터 뒤)
    _drawShopkeeper(ctx, cx, floorY);

    // 소지 골드
    ctx.fillStyle = '#80ff80'; ctx.font = 'bold 11px monospace';
    ctx.fillText(`소지 GOLD: ${this._player.gold}`, cx, 56);

    if (!this.items.length) {
      ctx.fillStyle = '#ffcc88'; ctx.font = '12px monospace';
      ctx.fillText('"더 팔 물건이 없다네."', cx, 150);
      ctx.fillStyle = '#888888'; ctx.font = '10px monospace';
      ctx.fillText('[ X / ESC ] 나가기', cx, 178);
      ctx.textAlign = 'left';
      return;
    }

    // ── 좌/우 진열대 2개 ──
    const standY = 120, standW = 150, gap = 70;
    const bx0 = cx - (standW * 2 + gap) / 2;
    for (let i = 0; i < 2; i++) {
      const item = this.items[i];
      const bx = bx0 + i * (standW + gap);
      const selected = i === this.cursor && item;
      _drawStand(ctx, bx, standY, standW, selected, item, this.shopType, this._player.gold);
    }

    // 점원 대사 / 결과 메시지
    if (this.msgTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(cx - 150, 300, 300, 28);
      ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1; ctx.strokeRect(cx - 150, 300, 300, 28);
      ctx.fillStyle = '#ffff88'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.message, cx, 319);
    } else {
      ctx.fillStyle = '#bbbbbb'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('← → 고르기    Z 구입    X 나가기', cx, 318);
    }
    ctx.textAlign = 'left';
  }
}

// 진열대 1칸(받침대 + 아이템 아이콘 + 이름/스탯/가격)
function _drawStand(ctx, bx, by, w, selected, item, shopType, gold) {
  const h = 150, cx = bx + w / 2;
  // 받침대
  ctx.fillStyle = selected ? '#5a4630' : '#3c2c1c';
  ctx.fillRect(bx, by + h - 24, w, 24);
  ctx.fillStyle = selected ? '#7a5e3e' : '#4c3824';
  ctx.fillRect(bx + 6, by + h - 30, w - 12, 8);

  // 진열 박스
  ctx.fillStyle = item ? (selected ? '#2e2640' : '#1c1626') : '#140e16';
  ctx.fillRect(bx, by, w, h - 30);
  ctx.strokeStyle = selected ? '#ffdd44' : '#6a5a3a';
  ctx.lineWidth = selected ? 3 : 1;
  ctx.strokeRect(bx, by, w, h - 30);

  ctx.textAlign = 'center';
  if (!item) {
    ctx.fillStyle = '#444'; ctx.font = '12px monospace'; ctx.fillText('—', cx, by + (h - 30) / 2);
    return;
  }
  if (selected) {
    ctx.fillStyle = '#ffdd44'; ctx.font = 'bold 13px monospace'; ctx.fillText('▼', cx, by - 6);
  }
  // 아이콘
  _drawShopIcon(ctx, shopType, item, cx, by + 34);
  // 이름
  ctx.fillStyle = selected ? '#ffffff' : '#cccccc'; ctx.font = 'bold 12px monospace';
  ctx.fillText(item.name, cx, by + 70);
  // 스탯
  ctx.fillStyle = '#aaaadd'; ctx.font = '9px monospace';
  _wrap(ctx, _statDesc(item, shopType), cx, by + 88, w - 14, 11);
  // 가격
  const afford = gold >= item.cost;
  ctx.fillStyle = afford ? '#ffd700' : '#aa5533'; ctx.font = 'bold 13px monospace';
  ctx.fillText(`${item.cost} G`, cx, by + h - 36);
}

// 점원 픽셀 캐릭터(카운터 뒤에서 인사)
function _drawShopkeeper(ctx, cx, floorY) {
  const x = cx, y = floorY - 70;
  ctx.fillStyle = '#e8b888'; ctx.fillRect(x - 9, y, 18, 16);          // 얼굴
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 11, y - 6, 22, 8);      // 모자/머리
  ctx.fillStyle = '#222';    ctx.fillRect(x - 5, y + 6, 3, 3); ctx.fillRect(x + 3, y + 6, 3, 3); // 눈
  ctx.fillStyle = '#7a1f1f'; ctx.fillRect(x - 12, y + 16, 24, 26);    // 상의
  ctx.fillStyle = '#e8b888'; ctx.fillRect(x + 11, y + 16, 5, 16);     // 손(인사)
  // 카운터
  ctx.fillStyle = '#3a2614'; ctx.fillRect(x - 70, floorY - 14, 140, 26);
  ctx.fillStyle = '#5a4024'; ctx.fillRect(x - 70, floorY - 16, 140, 5);
}

// 상점 종류별 아이템 아이콘
function _drawShopIcon(ctx, type, item, x, y) {
  switch (type) {
    case SHOP_TYPE.WEAPON:
      ctx.fillStyle = item.bladeColor || '#ccc'; ctx.fillRect(x - 2, y - 14, 4, 22);
      ctx.fillStyle = item.guardColor || '#fc0'; ctx.fillRect(x - 8, y + 6, 16, 3);
      ctx.fillStyle = '#804020'; ctx.fillRect(x - 2, y + 8, 4, 6); break;
    case SHOP_TYPE.SHIELD:
      ctx.fillStyle = item.bodyColor || '#88f'; ctx.fillRect(x - 10, y - 12, 20, 22);
      ctx.strokeStyle = item.rimColor || '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x - 10, y - 12, 20, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x - 7, y - 9, 6, 6); break;
    case SHOP_TYPE.ARMOR:
      ctx.fillStyle = item.bodyColor || '#88a'; ctx.fillRect(x - 11, y - 10, 22, 20);
      ctx.fillStyle = item.trimColor || '#ccd'; ctx.fillRect(x - 11, y - 10, 22, 4);
      ctx.fillStyle = item.helmetColor || '#99b'; ctx.fillRect(x - 7, y - 18, 14, 8); break;
    case SHOP_TYPE.BOOTS:
      ctx.fillStyle = item.color || '#964'; ctx.fillRect(x - 9, y - 6, 12, 12); ctx.fillRect(x - 9, y + 6, 18, 5); break;
    case SHOP_TYPE.MAGIC: {
      ctx.fillStyle = item.color || '#333'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = item.core || '#f70'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); break;
    }
  }
}

function _wrap(ctx, text, cx, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, cx, yy); line = w; yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, cx, yy);
}

function _statDesc(item, type) {
  switch (type) {
    case SHOP_TYPE.WEAPON:
      return `공격력 +${item.atk} 리치 ${item.reach}`;
    case SHOP_TYPE.SHIELD:
      return `방어 +${item.def} 차단 ${Math.round(item.block * 100)}% 넉백저항 ${Math.round(item.kbResist * 100)}%`;
    case SHOP_TYPE.ARMOR: {
      const nerf = item.agi < 0 ? ` 민첩 ${item.agi.toFixed(2)}` : '';
      return `방어 +${item.def}${nerf}`;
    }
    case SHOP_TYPE.BOOTS: {
      const slip = item.friction >= 0.88 ? ' ⚠미끄러움' : '';
      return `속도 +${item.speed.toFixed(1)} 점프 +${item.jump.toFixed(1)}${slip}`;
    }
    case SHOP_TYPE.MAGIC: {
      const desc = {
        roll:    '굴러가며 타격 (피해1·고정2회)',
        fly:     '직선비행 첫적 (검 공격력)',
        tornado: '지면회오리 다단 (검 공격력)',
        thunder: '화면전체 일괄 (검 공격력)',
      }[item.kind] || '';
      const qty = item.buy > 1 ? ` ×${item.buy}` : '';
      return `${desc}${qty}`;
    }
    default: return '';
  }
}
