import { SHOP_TYPE, getShopItemsForType, getShopTitle } from './equipment.js';

export class Shop {
  constructor() {
    this.cursor = 0;
    this.message = '';
    this.messageTimer = 0;
    this.type = SHOP_TYPE.SHIELD;
    this.sessionHandled = false;
  }

  open(type) {
    this.type = type;
    this.cursor = 0;
    this.message = '';
    this.messageTimer = 0;
    this.sessionHandled = false;
  }

  getItems(player) {
    return getShopItemsForType(this.type, player);
  }

  update(input, player) {
    const items = this.getItems(player);

    if (this.type === SHOP_TYPE.STARTER_GIFT) {
      if (!this.sessionHandled) {
        if (items[0]) {
          player.equip(items[0].id);
          this.message = '기본 칼을 받았다!';
        } else {
          this.message = '이미 기본 칼을 받았다.';
        }
        this.messageTimer = 1;
        this.sessionHandled = true;
      }

      if (input.wasPressed('Enter') || input.wasPressed('KeyX') || input.wasPressed('Escape') || input.wasPressed('KeyZ')) {
        return 'exit';
      }
      return null;
    }

    if (items.length === 0) {
      this.message = this.type === SHOP_TYPE.WEAPON ? '무기 상점은 아직 준비 중이다.' : '더 좋은 장비가 없다.';
      if (input.wasPressed('Enter') || input.wasPressed('KeyX') || input.wasPressed('Escape') || input.wasPressed('KeyZ')) {
        return 'exit';
      }
      return null;
    }

    if (this.cursor >= items.length) this.cursor = items.length - 1;

    if (input.wasPressed('ArrowUp'))   this.cursor = Math.max(0, this.cursor - 1);
    if (input.wasPressed('ArrowDown')) this.cursor = Math.min(items.length - 1, this.cursor + 1);

    if (input.wasPressed('Enter') || input.wasPressed('KeyX')) {
      const item = items[this.cursor];
      if (player.gold >= item.cost) {
        player.gold -= item.cost;
        player.equip(item.id);
        this.message = `${item.label} 구입!`;
      } else {
        this.message = 'GOLD가 부족합니다!';
      }
      this.messageTimer = 90;
    }

    if (input.wasPressed('Escape') || input.wasPressed('KeyZ')) return 'exit';

    if (this.messageTimer > 0) this.messageTimer--;
    return null;
  }

  draw(ctx, player, assets) {
    const W = 400, H = 280;
    const sx = 120, sy = 40;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(sx, sy, W, H);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, W, H);

    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(getShopTitle(this.type), sx + 110, sy + 30);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`GOLD: ${player.gold}`, sx + 280, sy + 30);

    const items = this.getItems(player);
    if (this.type === SHOP_TYPE.STARTER_GIFT) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px monospace';
      ctx.fillText(this.message || '상인이 기본 칼을 건넨다.', sx + 82, sy + 120);
      const icon = assets?.items?.sword;
      if (icon) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(icon, sx + 170, sy + 150, 60, 36);
        ctx.restore();
      }
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText('ENTER / Z / ESC: 돌아가기', sx + 112, sy + H - 20);
      return;
    }

    if (items.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px monospace';
      ctx.fillText(this.message || '더 좋은 장비가 없다.', sx + 72, sy + 140);
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText('ENTER / Z / ESC: 돌아가기', sx + 112, sy + H - 20);
      return;
    }

    items.forEach((item, i) => {
      const iy = sy + 60 + i * 38;
      if (i === this.cursor) {
        ctx.fillStyle = '#33336688';
        ctx.fillRect(sx + 10, iy - 4, W - 20, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('>', sx + 14, iy + 16);
      }
      const icon = item.iconKey ? assets?.items?.[item.iconKey] : null;
      if (icon) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = player.gold >= item.cost ? 1 : 0.4;
        ctx.drawImage(icon, sx + 28, iy - 2, 28, 28);
        ctx.restore();
      }
      ctx.fillStyle = player.gold >= item.cost ? '#ffffff' : '#888888';
      ctx.fillText(item.label, sx + 66, iy + 16);
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${item.cost}G`, sx + 270, iy + 16);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px monospace';
      ctx.fillText(item.desc, sx + 66, iy + 28);
      ctx.font = '14px monospace';
    });

    if (this.messageTimer > 0) {
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(this.message, sx + 100, sy + H - 20);
    } else {
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText('Z/ESC: 나가기  X/Enter: 구입', sx + 80, sy + H - 20);
    }
  }
}
