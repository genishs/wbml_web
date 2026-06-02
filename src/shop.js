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

  draw(ctx) {
    if (!this.open) return;

    ctx.fillStyle = 'rgba(0,0,0,0.80)';
    ctx.fillRect(HUD_W, 0, 528, 360);

    const cx = HUD_W + 264;
    const panelW = 400, panelH = 250, px = cx - panelW / 2, py = 54;

    ctx.fillStyle = '#1a1228';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#8060ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(shopTypeName(this.shopType).toUpperCase(), cx, py + 24);

    ctx.fillStyle = '#80ff80';
    ctx.font = '11px monospace';
    ctx.fillText(`소지 GOLD: ${this._player.gold}`, cx, py + 44);

    if (!this.items.length) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px monospace';
      ctx.fillText('더 살 수 있는 물건이 없다.', cx, py + 120);
      ctx.fillStyle = '#888888';
      ctx.fillText('[ X / ESC ] 닫기', cx, py + 150);
      ctx.textAlign = 'left';
      return;
    }

    // 좌/우 2개 슬롯
    const boxW = 150, boxH = 130, gap = 28;
    const total = boxW * 2 + gap;
    const bx0 = cx - total / 2, by = py + 70;
    for (let i = 0; i < 2; i++) {
      const item = this.items[i];
      const bx = bx0 + i * (boxW + gap);
      const selected = i === this.cursor && item;

      ctx.fillStyle = item ? (selected ? '#332452' : '#221833') : '#140e1e';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = selected ? '#ffdd44' : '#5a4a8a';
      ctx.lineWidth = selected ? 3 : 1;
      ctx.strokeRect(bx, by, boxW, boxH);

      if (!item) {
        ctx.fillStyle = '#444';
        ctx.font = '11px monospace';
        ctx.fillText('—', bx + boxW / 2, by + boxH / 2);
        continue;
      }

      ctx.fillStyle = selected ? '#ffffff' : '#cccccc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(item.name, bx + boxW / 2, by + 26);

      // 스탯 설명(줄바꿈)
      ctx.fillStyle = '#aaaadd';
      ctx.font = '9px monospace';
      _wrap(ctx, _statDesc(item, this.shopType), bx + boxW / 2, by + 52, boxW - 16, 12);

      const canAfford = this._player.gold >= item.cost;
      ctx.fillStyle = canAfford ? '#ffd700' : '#aa5533';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`${item.cost} G`, bx + boxW / 2, by + boxH - 14);

      if (selected) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('▼', bx + boxW / 2, by - 4);
      }
    }

    if (this.msgTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(cx - 120, py + panelH - 34, 240, 26);
      ctx.fillStyle = '#ffff88';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(this.message, cx, py + panelH - 16);
    }

    ctx.fillStyle = '#888888';
    ctx.font = '9px monospace';
    ctx.fillText('← → 선택    Z 구입    X 닫기', cx, py + panelH + 16);
    ctx.textAlign = 'left';
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
