import { COLORS } from './constants.js';

const SHOP_ITEMS = [
  { id: 'sword',  label: 'IRON SWORD',  cost: 50,  desc: '공격력 +1, 사거리 증가' },
  { id: 'shield', label: 'WOOD SHIELD', cost: 40,  desc: '방어력 +1' },
  { id: 'armor',  label: 'CHAIN ARMOR', cost: 80,  desc: '방어력 +1, HP +2' },
  { id: 'boots',  label: 'SPEED BOOTS', cost: 60,  desc: '이동속도 증가' },
  { id: 'potion', label: 'LIFE POTION', cost: 30,  desc: 'HP 완전 회복' },
];

export class Shop {
  constructor() {
    this.cursor = 0;
    this.message = '';
    this.messageTimer = 0;
  }

  getItems(player) {
    return SHOP_ITEMS.filter(item => {
      if (item.id === 'sword'  && player.hasSword)  return false;
      if (item.id === 'shield' && player.hasShield) return false;
      if (item.id === 'armor'  && player.hasArmor)  return false;
      if (item.id === 'boots'  && player.hasBoots)  return false;
      return true;
    });
  }

  update(input, player) {
    const items = this.getItems(player);
    if (items.length === 0) return 'exit';

    if (this.cursor >= items.length) this.cursor = items.length - 1;

    if (input.wasPressed('ArrowUp'))   this.cursor = Math.max(0, this.cursor - 1);
    if (input.wasPressed('ArrowDown')) this.cursor = Math.min(items.length - 1, this.cursor + 1);

    if (input.wasPressed('Enter') || input.wasPressed('KeyX')) {
      const item = items[this.cursor];
      if (player.gold >= item.cost) {
        player.gold -= item.cost;
        this._applyItem(item.id, player);
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

  _applyItem(id, player) {
    switch (id) {
      case 'sword':  player.hasSword = true; player.attack += 1; break;
      case 'shield': player.hasShield = true; player.defense += 1; break;
      case 'armor':  player.hasArmor = true; player.defense += 1; player.maxHp += 2; player.hp = Math.min(player.hp + 2, player.maxHp); break;
      case 'boots':  player.hasBoots = true; break;
      case 'potion': player.hp = player.maxHp; break;
    }
  }

  draw(ctx, player) {
    const W = 400, H = 280;
    const sx = 120, sy = 40;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(sx, sy, W, H);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, W, H);

    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('* SHOP *', sx + 155, sy + 30);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`GOLD: ${player.gold}`, sx + 280, sy + 30);

    const items = this.getItems(player);
    items.forEach((item, i) => {
      const iy = sy + 60 + i * 38;
      if (i === this.cursor) {
        ctx.fillStyle = '#33336688';
        ctx.fillRect(sx + 10, iy - 4, W - 20, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('>', sx + 14, iy + 16);
      }
      ctx.fillStyle = player.gold >= item.cost ? '#ffffff' : '#888888';
      ctx.fillText(item.label, sx + 30, iy + 16);
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${item.cost}G`, sx + 270, iy + 16);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px monospace';
      ctx.fillText(item.desc, sx + 30, iy + 28);
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
