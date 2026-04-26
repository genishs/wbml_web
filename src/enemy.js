import { GRAVITY, HUD_W } from './constants.js';

const DEFS = {
  blob:   { w: 20, h: 18, hp: 2,  atk: 1, speed: 0.8,  gold: 5,  score: 100, color: '#7b2fbe', darkColor: '#5a1e8a' },
  snake:  { w: 24, h: 12, hp: 1,  atk: 1, speed: 0.6,  gold: 3,  score: 80,  color: '#2d9e4a', darkColor: '#1a7030' },
  bat:    { w: 18, h: 14, hp: 2,  atk: 1, speed: 1.2,  gold: 4,  score: 100, color: '#8b3fae', darkColor: '#601880', flies: true },
  knight: { w: 22, h: 30, hp: 8,  atk: 2, speed: 0.9,  gold: 15, score: 300, color: '#8080c0', darkColor: '#5050a0' },
};

export class Enemy {
  constructor(type, x, y, opts = {}) {
    const d = DEFS[type] || DEFS.blob;
    Object.assign(this, d);
    this.type  = type;
    this.x = x; this.y = y;
    this.maxHp = d.hp;
    this.vx = (opts.dir ?? 1) * d.speed;
    this.vy = 0;
    this.onGround = false;
    this.facing = opts.dir ?? 1;
    this.dead = false;
    this.deathTimer = 0;
    this.patrolMin = opts.patrolMin ?? x - 100;
    this.patrolMax = opts.patrolMax ?? x + 100;
    this.tick = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0 && !this.dead) { this.dead = true; this.deathTimer = 30; }
  }

  update(platforms) {
    if (this.dead) { this.deathTimer--; return; }
    this.tick++;

    if (this.flies) {
      // 상하로 부유
      this.y += Math.sin(this.tick * 0.05) * 0.8;
      this.x += this.vx;
    } else {
      this.vy += GRAVITY;
      this.x  += this.vx;
      this.y  += this.vy;
      this._collide(platforms);
    }

    // 순찰 반환
    if (this.x < this.patrolMin) { this.vx =  Math.abs(this.vx); this.facing =  1; }
    if (this.x > this.patrolMax) { this.vx = -Math.abs(this.vx); this.facing = -1; }
  }

  _collide(platforms) {
    this.onGround = false;
    for (const p of platforms) {
      if (this.x + this.w <= p.x || this.x >= p.x + p.w) continue;
      if (this.vy >= 0 && this.y + this.h > p.y && this.y + this.h < p.y + 20) {
        this.y = p.y - this.h; this.vy = 0; this.onGround = true;
      }
    }
  }

  getHitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  draw(ctx, camX) {
    if (this.dead && this.deathTimer <= 0) return;
    const sx = Math.round(this.x - camX + HUD_W);
    const sy = Math.round(this.y);
    const alpha = this.dead ? this.deathTimer / 30 : 1;
    ctx.globalAlpha = alpha;

    // 몸통
    ctx.fillStyle = this.color;
    ctx.fillRect(sx, sy, this.w, this.h);
    ctx.fillStyle = this.darkColor;
    ctx.fillRect(sx + 2, sy + 2, this.w - 4, this.h - 4);

    // 눈
    ctx.fillStyle = '#ffffff';
    const ex = this.facing === 1 ? sx + this.w - 6 : sx + 2;
    ctx.fillRect(ex, sy + 4, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ex + (this.facing === 1 ? 2 : 0), sy + 5, 2, 2);

    // HP 바
    if (this.hp < this.maxHp && !this.dead) {
      ctx.fillStyle = '#333';
      ctx.fillRect(sx, sy - 6, this.w, 3);
      ctx.fillStyle = '#00cc44';
      ctx.fillRect(sx, sy - 6, this.w * this.hp / this.maxHp, 3);
    }

    ctx.globalAlpha = 1;
  }
}
