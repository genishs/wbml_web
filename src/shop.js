import { SHOP_TYPE, getShopItems, shopTypeName } from './equipment.js';
import { HUD_W } from './constants.js';

export class Shop {
  constructor() {
    this.open     = false;
    this.shopType = null;
    this.items    = [];
    this.cursor   = 0;
    this._player  = null;
    this.message  = '';
    this.msgTimer = 0;
  }

  openShop(shopType, player) {
    this.shopType = shopType;
    this._player  = player;
    this.items    = getShopItems(shopType, player);
    this.cursor   = 0;
    this.open     = true;
    this.message  = '';
    this.msgTimer = 0;
  }

  close() { this.open = false; }

  update(input) {
    if (!this.open) return;
    if (this.msgTimer > 0) { this.msgTimer--; return; }

    if (input.wasPressed('ArrowUp'))   this.cursor = Math.max(0, this.cursor - 1);
    if (input.wasPressed('ArrowDown')) this.cursor = Math.min(this.items.length - 1, this.cursor + 1);

    if (input.wasPressed('KeyZ') || input.wasPressed('Space')) {
      this._buy();
    }
    if (input.wasPressed('Escape') || input.wasPressed('KeyX')) {
      this.close();
    }
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
    const slot = { weapon: 'sword', shield: 'shield', armor: 'armor', boots: 'boots' }[this.shopType];
    this._player.equip(slot, item);

    this.message  = `${item.name} 구입!`;
    this.msgTimer = 90;
    // 살 수 있는 나머지 목록 갱신
    this.items  = getShopItems(this.shopType, this._player);
    this.cursor = 0;
  }

  draw(ctx) {
    if (!this.open) return;

    // 반투명 배경
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(HUD_W, 0, 528, 360);

    const cx = HUD_W + 264;  // 가운데
    const panelW = 380, panelH = 260;
    const px = cx - panelW / 2, py = 50;

    // 패널 배경
    ctx.fillStyle = '#1a1228';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#8060ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    // 제목
    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(shopTypeName(this.shopType).toUpperCase(), cx, py + 22);

    // 현재 GOLD
    ctx.fillStyle = '#80ff80';
    ctx.font = '11px monospace';
    ctx.fillText(`소지 GOLD: ${this._player.gold}`, cx, py + 40);
    ctx.textAlign = 'left';

    if (!this.items.length) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('더 높은 등급의 장비가 없다.', cx, py + 100);
      ctx.fillStyle = '#888888';
      ctx.fillText('[ X/ESC ] 닫기', cx, py + 130);
      ctx.textAlign = 'left';
    } else {
      // 아이템 목록
      this.items.forEach((item, i) => {
        const iy = py + 60 + i * 46;
        const selected = i === this.cursor;

        ctx.fillStyle = selected ? '#302040' : 'transparent';
        if (selected) ctx.fillRect(px + 10, iy - 2, panelW - 20, 40);

        ctx.fillStyle = selected ? '#ffffff' : '#cccccc';
        ctx.font = `bold 12px monospace`;
        ctx.fillText(item.name, px + 22, iy + 14);

        // 스탯 설명
        ctx.fillStyle = '#aaaadd';
        ctx.font = '10px monospace';
        const statText = _statDesc(item, this.shopType);
        ctx.fillText(statText, px + 22, iy + 28);

        // 가격
        const canAfford = this._player.gold >= item.cost;
        ctx.fillStyle = canAfford ? '#ffd700' : '#884400';
        ctx.textAlign = 'right';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${item.cost} G`, px + panelW - 14, iy + 14);
        ctx.textAlign = 'left';

        // 선택 화살표
        if (selected) {
          ctx.fillStyle = '#ffdd44';
          ctx.fillText('▶', px + 10, iy + 14);
        }
      });
    }

    // 메시지
    if (this.msgTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(cx - 120, py + panelH - 40, 240, 28);
      ctx.fillStyle = '#ffff88';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, cx, py + panelH - 22);
    }

    // 조작 안내
    ctx.fillStyle = '#666666';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 선택   Z/SPACE 구입   X/ESC 닫기', cx, py + panelH + 14);
    ctx.textAlign = 'left';
  }
}

function _statDesc(item, type) {
  switch (type) {
    case SHOP_TYPE.WEAPON: return `공격력 +${item.atk}  리치 ${item.reach}`;
    case SHOP_TYPE.SHIELD: return `방어 +${item.def}  원거리차단 ${Math.round(item.block * 100)}%`;
    case SHOP_TYPE.ARMOR:  return `방어 +${item.def}`;
    case SHOP_TYPE.BOOTS:  return `속도 +${item.speed.toFixed(1)}  점프 +${item.jump.toFixed(1)}`;
    default: return '';
  }
}
