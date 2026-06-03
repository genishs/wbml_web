// 필드/적 드롭 수집물. 원작의 돈주머니·하트·시간제 강화아이템을 절차적으로 표현.
//  gold      : 보너스 골드 (적 처치/보물에서 톡 튀어나옴)
//  heart     : 하트 컨테이너 — 최대 체력 +1 (원작의 숨겨진 하트)
//  potion    : 소지품 물약 +1
//  helmet/gauntlet/wingboots : 일정 시간 강화되는 시간제 아이템(획득 시 버프 발동)
//  sword     : 검 보스가 방 안에 떨어뜨리는 보상 검(주우면 장착+방 탈출). opts.sword=SWORD 객체
//  key       : 스테이지 보스가 떨어뜨리는 열쇠(주우면 방 탈출 → 성문 통과)
import { GRAVITY, GROUND_Y, HUD_W } from './constants.js';

const DEFS = {
  gold:      { w: 16, h: 14 },
  heart:     { w: 16, h: 14 },
  potion:    { w: 12, h: 18 },
  helmet:    { w: 18, h: 14 },
  gauntlet:  { w: 16, h: 14 },
  wingboots: { w: 18, h: 16 },
  sword:     { w: 14, h: 24 },
  key:       { w: 14, h: 18 },
};

export class Pickup {
  constructor(type, x, y, opts = {}) {
    const d = DEFS[type] || DEFS.gold;
    this.type = type;
    this.x = x; this.y = y; this.w = d.w; this.h = d.h;
    this.vx = opts.vx ?? 0;
    this.vy = opts.vy ?? 0;           // 드롭 시 위로 톡 튐
    this.amount = opts.amount ?? 0;    // gold 전용
    this.sword  = opts.sword ?? null;  // sword 전용: 장착할 SWORD 객체
    this.onGround = opts.vy == null;   // 필드 배치물은 처음부터 지면
    this.dead = false;
    this.tick = (Math.random() * 60) | 0;
    this.life = opts.life ?? 0;        // 0=영구(필드 배치), >0=드롭물 수명
  }

  update(platforms) {
    this.tick++;
    if (!this.onGround) {
      this.vy += GRAVITY;
      this.x += this.vx; this.y += this.vy;
      this.vx *= 0.9;
      for (const p of platforms) {
        if (this.x + this.w <= p.x || this.x >= p.x + p.w) continue;
        if (this.vy >= 0 && this.y + this.h > p.y && this.y + this.h < p.y + 20) {
          this.y = p.y - this.h; this.vy = 0; this.vx = 0; this.onGround = true;
        }
      }
    }
    if (this.life > 0 && --this.life <= 0) this.dead = true;
  }

  getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  draw(ctx, camX) {
    const bob = this.onGround ? Math.sin(this.tick * 0.12) * 2 : 0;
    const sx = Math.round(this.x - camX + HUD_W);
    const sy = Math.round(this.y + bob);
    const cx = sx + this.w / 2;
    const cy = sy + this.h / 2;

    // 반짝임 후광
    const g = 0.12 + 0.10 * Math.sin(this.tick * 0.2);
    ctx.fillStyle = `rgba(255,255,200,${g})`;
    ctx.fillRect(sx - 3, sy - 3, this.w + 6, this.h + 6);

    switch (this.type) {
      case 'gold':
        ctx.fillStyle = '#caa030'; ctx.fillRect(sx, sy + 3, this.w, this.h - 3);
        ctx.fillStyle = '#8a6810'; ctx.fillRect(sx + 4, sy, this.w - 8, 4);
        ctx.fillStyle = '#fff0a0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('$', cx, cy + 5); ctx.textAlign = 'left';
        break;
      case 'heart':
        _heart(ctx, sx, sy, this.w, '#e81020', '#ff8090');
        break;
      case 'potion':
        ctx.fillStyle = '#aaaaaa'; ctx.fillRect(cx - 3, sy, 6, 4);
        ctx.fillStyle = '#dddddd'; ctx.fillRect(sx + 1, sy + 4, this.w - 2, this.h - 4);
        ctx.fillStyle = '#ee0000'; ctx.fillRect(sx + 2, sy + 8, this.w - 4, this.h - 9);
        ctx.fillStyle = '#ff9999'; ctx.fillRect(sx + 3, sy + 9, 3, 2);
        break;
      case 'helmet':
        ctx.fillStyle = '#88bbff'; ctx.fillRect(sx, cy, this.w, 4);
        ctx.fillStyle = '#5599ee'; ctx.beginPath(); ctx.arc(cx, cy, this.w / 2 - 1, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#ee0000'; ctx.fillRect(cx - 1, sy, 2, 6);
        break;
      case 'gauntlet':
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(sx + 2, sy + 3, this.w - 4, this.h - 4);
        ctx.fillStyle = '#aa8800'; ctx.fillRect(sx, sy, 5, 6);
        ctx.fillStyle = '#fff0a0'; ctx.fillRect(sx + 4, sy + 5, this.w - 8, 2);
        break;
      case 'wingboots':
        ctx.fillStyle = '#774433'; ctx.fillRect(cx - 1, sy + 2, 6, this.h - 5); ctx.fillRect(cx - 1, sy + this.h - 4, 9, 3);
        ctx.fillStyle = '#ffffff'; ctx.beginPath();
        ctx.moveTo(cx - 2, sy + 4); ctx.lineTo(sx, sy); ctx.lineTo(cx - 2, sy + 9); ctx.closePath(); ctx.fill();
        break;
      case 'sword': {
        const fl = (this.sword && this.sword.bladeColor) || '#dfe6f0';
        ctx.fillStyle = '#caa030';                                   // 손잡이(가드)
        ctx.fillRect(sx, sy + this.h - 8, this.w, 3);
        ctx.fillStyle = '#7a4a20'; ctx.fillRect(cx - 1, sy + this.h - 6, 3, 6);
        ctx.fillStyle = fl;                                          // 칼날
        ctx.fillRect(cx - 2, sy, 4, this.h - 7);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 1, sy + 1, 1, this.h - 9); // 하이라이트
        break;
      }
      case 'key':
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath(); ctx.arc(cx, sy + 5, 5, 0, Math.PI * 2); ctx.fill();    // 고리
        ctx.fillStyle = '#0a0810'; ctx.beginPath(); ctx.arc(cx, sy + 5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(cx - 1, sy + 9, 2, this.h - 9); // 자루
        ctx.fillRect(cx + 1, sy + this.h - 6, 4, 2); ctx.fillRect(cx + 1, sy + this.h - 2, 4, 2); // 이빨
        break;
      default:
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sx, sy, this.w, this.h);
    }
  }
}

function _heart(ctx, x, y, size, fill, hi) {
  const s = size;
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 3, s * 0.4, s * 0.4);
  ctx.fillRect(x + s - 1 - s * 0.4, y + 3, s * 0.4, s * 0.4);
  ctx.beginPath();
  ctx.moveTo(x, y + 5); ctx.lineTo(x + s / 2, y + s); ctx.lineTo(x + s, y + 5);
  ctx.lineTo(x + s, y + 6); ctx.lineTo(x + s / 2, y + s + 1); ctx.lineTo(x, y + 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = hi;
  ctx.fillRect(x + 2, y + 4, 3, 3);
}
