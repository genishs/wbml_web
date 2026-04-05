import { GRAVITY, COLORS } from './constants.js';

const ENEMY_TYPES = {
  slime: { color: '#40e040', hp: 2, atk: 1, speed: 1.0, w: 20, h: 16, gold: 5, score: 100 },
  goblin: { color: '#e08040', hp: 4, atk: 2, speed: 1.8, w: 22, h: 26, gold: 15, score: 200 },
  knight: { color: '#8080c0', hp: 8, atk: 3, speed: 1.2, w: 24, h: 28, gold: 30, score: 400 },
  dragon: { color: '#c04040', hp: 20, atk: 5, speed: 1.5, w: 48, h: 40, gold: 100, score: 2000, isBoss: true },
};

export class Enemy {
  constructor(type, x, y) {
    const def = ENEMY_TYPES[type] || ENEMY_TYPES.slime;
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = def.w;
    this.h = def.h;
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.atk = def.atk;
    this.speed = def.speed;
    this.color = def.color;
    this.gold = def.gold;
    this.score = def.score;
    this.isBoss = def.isBoss || false;
    this.vx = -this.speed;
    this.vy = 0;
    this.onGround = false;
    this.hitTimer = 0;
    this.frame = 0;
    this.frameTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.patrolTimer = 0;
    this.patrolDir = -1;
  }

  update(platforms, player) {
    if (this.dead) {
      this.deathTimer--;
      return;
    }

    // Skip AI movement during knockback
    if (this.hitTimer > 0) {
      this.vy += GRAVITY;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.7;
      this.onGround = false;
      for (const p of platforms) {
        if (this._collides(p)) {
          if (this.vy >= 0 && this.y + this.h - this.vy <= p.y + 2) {
            this.y = p.y - this.h;
            this.vy = 0;
            this.onGround = true;
          }
        }
      }
      return;
    }

    // Simple AI: patrol and chase player
    const dx = player.x - this.x;
    if (Math.abs(dx) < 200) {
      this.vx = dx > 0 ? this.speed : -this.speed;
    } else {
      this.patrolTimer--;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 80 + Math.random() * 60;
      }
      this.vx = this.patrolDir * this.speed * 0.5;
    }

    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    this.onGround = false;
    for (const p of platforms) {
      if (this._collides(p)) {
        if (this.vy >= 0 && this.y + this.h - this.vy <= p.y + 2) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y = p.y + p.h;
          this.vy = 0;
        } else if (this.vx > 0) {
          this.x = p.x - this.w;
          this.vx = 0;
          this.patrolDir *= -1;
        } else {
          this.x = p.x + p.w;
          this.vx = 0;
          this.patrolDir *= -1;
        }
      }
    }

    if (this.hitTimer > 0) this.hitTimer--;

    this.frameTimer++;
    if (this.frameTimer > 10) { this.frameTimer = 0; this.frame = (this.frame + 1) % 2; }
  }

  _collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  collidesWith(box) {
    if (!box) return false;
    return this.x < box.x + box.w && this.x + this.w > box.x &&
           this.y < box.y + box.h && this.y + this.h > box.y;
  }

  takeDamage(amount, knockbackDir = 1) {
    if (this.hitTimer > 0 || this.dead) return false;
    this.hp -= amount;
    this.hitTimer = 20;
    this.vx = knockbackDir * 5;
    this.vy = -3;
    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 40;
    }
    return true;
  }

  draw(ctx, camX, sprites) {
    const px = this.x - camX;
    const py = this.y;

    if (this.dead) {
      ctx.globalAlpha = this.deathTimer / 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, this.w, this.h);
      ctx.globalAlpha = 1;
      return;
    }

    const frameSet = sprites[this.type] || sprites.slime;
    const frame = frameSet[this.frame % frameSet.length];

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Flash white on hit
    if (this.hitTimer > 0) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    // Flip: sprites face LEFT by default; flip when moving right
    if (this.vx > 0) {
      ctx.translate(px + this.w, py);
      ctx.scale(-1, 1);
      ctx.drawImage(frame, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(frame, px, py, this.w, this.h);
    }

    ctx.restore();

    // HP bar (boss only)
    if (this.isBoss) {
      ctx.fillStyle = '#400';
      ctx.fillRect(px, py - 10, this.w, 6);
      ctx.fillStyle = '#f00';
      ctx.fillRect(px, py - 10, this.w * (this.hp / this.maxHp), 6);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py - 10, this.w, 6);
    }
  }
}

export { ENEMY_TYPES };
