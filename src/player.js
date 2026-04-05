import { GRAVITY, JUMP_FORCE, PLAYER_SPEED, TILE_SIZE, COLORS } from './constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 28;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1; // 1=right, -1=left
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.invincible = 0;

    // Stats
    this.maxHp = 6;
    this.hp = 6;
    this.gold = 0;
    this.attack = 1;
    this.defense = 0;

    // Equipment flags
    this.hasSword = false;
    this.hasShield = false;
    this.hasArmor = false;
    this.hasBoots = false;

    // Animation
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(input, platforms) {
    // Movement
    const speed = this.hasBoots ? PLAYER_SPEED * 1.4 : PLAYER_SPEED;
    if (input.isDown('ArrowLeft')) {
      this.vx = -speed;
      this.facing = -1;
    } else if (input.isDown('ArrowRight')) {
      this.vx = speed;
      this.facing = 1;
    } else {
      this.vx *= 0.8;
    }

    // Jump
    if ((input.wasPressed('KeyZ') || input.wasPressed('Space')) && this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
    }

    // Attack
    if (input.wasPressed('KeyX') && this.attackCooldown <= 0) {
      this.attacking = true;
      this.attackTimer = 18;
      this.attackCooldown = 25;
    }
    if (this.attackTimer > 0) this.attackTimer--;
    else this.attacking = false;
    if (this.attackCooldown > 0) this.attackCooldown--;

    // Gravity
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Platform collision
    this.onGround = false;
    for (const p of platforms) {
      if (this._collides(p)) {
        // from above
        if (this.vy >= 0 && this.y + this.h - this.vy <= p.y + 2) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0 && this.y - this.vy >= p.y + p.h - 2) {
          this.y = p.y + p.h;
          this.vy = 0;
        } else if (this.vx > 0) {
          this.x = p.x - this.w;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = p.x + p.w;
          this.vx = 0;
        }
      }
    }

    if (this.invincible > 0) this.invincible--;

    // Animation
    this.frameTimer++;
    if (this.frameTimer > 8) { this.frameTimer = 0; this.frame = (this.frame + 1) % 2; }
  }

  _collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  getAttackBox() {
    if (!this.attacking) return null;
    const range = this.hasSword ? 36 : 20;
    return {
      x: this.facing > 0 ? this.x + this.w : this.x - range,
      y: this.y + 4,
      w: range,
      h: 16,
    };
  }

  takeDamage(amount) {
    if (this.invincible > 0) return;
    const dmg = Math.max(1, amount - this.defense);
    this.hp -= dmg;
    this.invincible = 90;
    if (this.hp < 0) this.hp = 0;
  }

  draw(ctx, camX, sprites) {
    const px = this.x - camX;
    const py = this.y;

    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const spr = sprites?.player;
    if (spr) {
      // 원본 스프라이트: 오른쪽을 바라보므로 왼쪽이면 반전
      if (this.facing < 0) {
        ctx.translate(px + this.w, py);
        ctx.scale(-1, 1);
        ctx.drawImage(spr, 0, 0, this.w, this.h);
      } else {
        ctx.drawImage(spr, px, py, this.w, this.h);
      }
    } else {
      // fallback
      ctx.fillStyle = this.hasArmor ? '#6080ff' : COLORS.player;
      ctx.fillRect(px, py, this.w, this.h);
    }

    // 무적 시 흰 플래시 오버레이
    if (this.invincible > 60) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
