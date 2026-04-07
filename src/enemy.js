import { GRAVITY } from './constants.js';
import { assets } from './assets.js';

export const ENEMY_CLASS = {
  FIXED_KNOCKBACK: 'fixed_knockback',
  FIXED_HEAVY: 'fixed_heavy',
  MOBILE_HEAVY: 'mobile_heavy',
  BOSS_KNOCKBACK: 'boss_knockback',
};

export const ENEMY_ATTACK_TYPE = {
  CONTACT: 'contact',
  ARROW: 'arrow',
  SWORD: 'sword',
  BUBBLE: 'bubble',
  INK: 'ink',
  ROCK: 'rock',
  ICE: 'ice',
  MUD: 'mud',
  POISON: 'poison',
};

export const ENEMY_MOVE_TYPE = {
  STATIONARY: 'stationary',
  ZONE_PATROL: 'zone_patrol',
  WANDER: 'wander',
  FAST_WANDER: 'fast_wander',
  HOP_ARCHER: 'hop_archer',
  FLY_CURVE: 'fly_curve',
  HOVER: 'hover',
  PLAYER_LIKE: 'player_like',
  VERTICAL: 'vertical',
  SEMI_FIXED: 'semi_fixed',
  POPUP: 'popup',
  BOSS_SWOOP: 'boss_swoop',
  BOSS_BOUNCE: 'boss_bounce',
};

const ENEMY_TYPES = {
  snake: { name: '뱀', code: 'SNK', color: '#d53a32', hp: 1, atk: 1, speed: 0, w: 24, h: 12, gold: 5, score: 100, kind: ENEMY_CLASS.FIXED_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 24, h: 12 } },
  python: { name: '비단뱀', code: 'PTH', color: '#5276d5', hp: 3, atk: 2, speed: 0, w: 28, h: 14, gold: 8, score: 140, kind: ENEMY_CLASS.FIXED_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 28, h: 14 } },
  anaconda: { name: '아나콘다', code: 'ANC', color: '#6db24e', hp: 3, atk: 2, speed: 0.75, w: 30, h: 14, gold: 10, score: 160, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.ZONE_PATROL, behavior: ENEMY_MOVE_TYPE.ZONE_PATROL, hitbox: { x: 0, y: 0, w: 30, h: 14 } },
  myconid: { name: '마이코니드', code: 'MYC', color: '#b0c45a', hp: 1, atk: 1, speed: 0.45, w: 20, h: 20, gold: 6, score: 110, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.WANDER, behavior: ENEMY_MOVE_TYPE.WANDER, hitbox: { x: 0, y: 0, w: 20, h: 20 } },
  orc: { name: '오크', code: 'ORC', color: '#d07f3f', hp: 4, atk: 2, speed: 0.9, w: 22, h: 26, gold: 12, score: 180, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.ARROW, moveType: ENEMY_MOVE_TYPE.HOP_ARCHER, behavior: ENEMY_MOVE_TYPE.HOP_ARCHER, hitbox: { x: -4, y: -2, w: 30, h: 30 } },
  goblin: { name: '고블린', code: 'GBL', color: '#2f9d57', hp: 12, atk: 2, speed: 1.1, w: 22, h: 26, gold: 15, score: 220, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.ARROW, moveType: ENEMY_MOVE_TYPE.HOP_ARCHER, behavior: ENEMY_MOVE_TYPE.HOP_ARCHER, hitbox: { x: -6, y: -2, w: 34, h: 30 } },
  fangBat: { name: '뱀파이어', code: 'FBT', color: '#7b4fb0', hp: 1, atk: 1, speed: 1.2, w: 18, h: 14, gold: 6, score: 110, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.FLY_CURVE, behavior: ENEMY_MOVE_TYPE.FLY_CURVE, hitbox: { x: 0, y: 0, w: 18, h: 14 } },
  vampireBat: { name: '웨어 배트', code: 'VBT', color: '#d4b03e', hp: 4, atk: 2, speed: 1.35, w: 20, h: 16, gold: 10, score: 160, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.FLY_CURVE, behavior: ENEMY_MOVE_TYPE.FLY_CURVE, hitbox: { x: 0, y: 0, w: 20, h: 16 } },
  willOWisp: { name: '도깨비불', code: 'WSP', color: '#ff7a3d', hp: 2, atk: 1, speed: 0.9, w: 16, h: 16, gold: 10, score: 180, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.HOVER, behavior: ENEMY_MOVE_TYPE.HOVER, hitbox: { x: 0, y: 0, w: 16, h: 16 } },
  ghost: { name: '유령', code: 'GST', color: '#8fc4ff', hp: 128, atk: 2, speed: 0.75, w: 20, h: 24, gold: 20, score: 30000, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.HOVER, behavior: ENEMY_MOVE_TYPE.HOVER, hitbox: { x: 0, y: 0, w: 20, h: 24 } },
  skeleton: { name: '스켈레톤', code: 'SKL', color: '#d8d0c8', hp: 6, atk: 2, speed: 1.0, w: 22, h: 28, gold: 12, score: 220, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.SWORD, moveType: ENEMY_MOVE_TYPE.PLAYER_LIKE, behavior: ENEMY_MOVE_TYPE.PLAYER_LIKE, hitbox: { x: 0, y: 0, w: 22, h: 28 } },
  undeadFighter: { name: '언데드 전사', code: 'UDF', color: '#6e90d5', hp: 16, atk: 3, speed: 1.05, w: 24, h: 28, gold: 20, score: 320, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.SWORD, moveType: ENEMY_MOVE_TYPE.PLAYER_LIKE, behavior: ENEMY_MOVE_TYPE.PLAYER_LIKE, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  jellyfish: { name: '해파리', code: 'JLY', color: '#e895d4', hp: 2, atk: 1, speed: 0.7, w: 18, h: 22, gold: 8, score: 140, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.VERTICAL, behavior: ENEMY_MOVE_TYPE.VERTICAL, hitbox: { x: 0, y: 0, w: 18, h: 22 } },
  bubblyCrab: { name: '거품 게', code: 'CRB', color: '#df6c52', hp: 8, atk: 2, speed: 0.4, w: 24, h: 16, gold: 14, score: 260, kind: ENEMY_CLASS.FIXED_HEAVY, attackType: ENEMY_ATTACK_TYPE.BUBBLE, moveType: ENEMY_MOVE_TYPE.SEMI_FIXED, behavior: ENEMY_MOVE_TYPE.SEMI_FIXED, hitbox: { x: 0, y: 0, w: 24, h: 16 } },
  wereRat: { name: '웨어 래트', code: 'WRT', color: '#a95a4d', hp: 2, atk: 1, speed: 0.95, w: 18, h: 14, gold: 8, score: 140, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.WANDER, behavior: ENEMY_MOVE_TYPE.WANDER, hitbox: { x: 0, y: 0, w: 18, h: 14 } },
  ratMaster: { name: '래트 마스터', code: 'RMT', color: '#4f76b9', hp: 8, atk: 2, speed: 1.65, w: 20, h: 16, gold: 14, score: 240, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.FAST_WANDER, behavior: ENEMY_MOVE_TYPE.FAST_WANDER, hitbox: { x: 0, y: 0, w: 20, h: 16 } },
  octopus: { name: '문어', code: 'OCT', color: '#b24c80', hp: 16, atk: 3, speed: 0.8, w: 24, h: 28, gold: 18, score: 300, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.INK, moveType: ENEMY_MOVE_TYPE.VERTICAL, behavior: ENEMY_MOVE_TYPE.VERTICAL, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  yetti: { name: '예티', code: 'YET', color: '#d8f0ff', hp: 8, atk: 2, speed: 0, w: 26, h: 30, gold: 16, score: 260, kind: ENEMY_CLASS.FIXED_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.ROCK, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 26, h: 30 } },
  snowYetti: { name: '스노우 예티', code: 'SYT', color: '#b7ddff', hp: 24, atk: 3, speed: 0, w: 28, h: 32, gold: 22, score: 380, kind: ENEMY_CLASS.FIXED_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.ICE, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 28, h: 32 } },
  mudman: { name: '머드맨', code: 'MDM', color: '#8a6548', hp: 8, atk: 2, speed: 0.7, w: 22, h: 20, gold: 14, score: 240, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.MUD, moveType: ENEMY_MOVE_TYPE.POPUP, behavior: ENEMY_MOVE_TYPE.POPUP, hitbox: { x: 0, y: 0, w: 22, h: 20 } },
  tarman: { name: '타르맨', code: 'TRM', color: '#5f4b38', hp: 16, atk: 3, speed: 0.7, w: 24, h: 20, gold: 18, score: 320, kind: ENEMY_CLASS.MOBILE_HEAVY, attackType: ENEMY_ATTACK_TYPE.MUD, moveType: ENEMY_MOVE_TYPE.POPUP, behavior: ENEMY_MOVE_TYPE.POPUP, hitbox: { x: 0, y: 0, w: 24, h: 20 } },
  roper: { name: '로퍼', code: 'RPR', color: '#6e57a5', hp: 32, atk: 3, speed: 0, w: 24, h: 28, gold: 22, score: 400, kind: ENEMY_CLASS.FIXED_HEAVY, attackType: ENEMY_ATTACK_TYPE.POISON, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  knight: { name: '나이트', code: 'KNT', color: '#8080c0', hp: 20, atk: 3, speed: 1.2, w: 24, h: 28, gold: 30, score: 400, kind: ENEMY_CLASS.FIXED_HEAVY, attackType: ENEMY_ATTACK_TYPE.SWORD, moveType: ENEMY_MOVE_TYPE.STATIONARY, behavior: ENEMY_MOVE_TYPE.STATIONARY, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  redKnight: { name: '레드 나이트', code: 'RKT', color: '#c04040', hp: 28, atk: 4, speed: 1.3, w: 24, h: 28, gold: 40, score: 550, kind: ENEMY_CLASS.FIXED_HEAVY, attackType: ENEMY_ATTACK_TYPE.SWORD, moveType: ENEMY_MOVE_TYPE.PLAYER_LIKE, behavior: ENEMY_MOVE_TYPE.PLAYER_LIKE, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  silverKnight: { name: '실버 나이트', code: 'SKT', color: '#c0c0e0', hp: 36, atk: 4, speed: 1.4, w: 24, h: 28, gold: 50, score: 700, kind: ENEMY_CLASS.FIXED_HEAVY, attackType: ENEMY_ATTACK_TYPE.SWORD, moveType: ENEMY_MOVE_TYPE.PLAYER_LIKE, behavior: ENEMY_MOVE_TYPE.PLAYER_LIKE, hitbox: { x: 0, y: 0, w: 24, h: 28 } },
  death: { name: '데스', code: 'DTH', color: '#d8d8ff', hp: 8, atk: 2, speed: 1.6, w: 28, h: 32, gold: 60, score: 1000, isBoss: true, kind: ENEMY_CLASS.BOSS_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.BOSS_SWOOP, behavior: ENEMY_MOVE_TYPE.BOSS_SWOOP, hitbox: { x: 0, y: 0, w: 28, h: 32 } },
  mushroomKing: { name: '머시룸 킹', code: 'MSK', color: '#d26d58', hp: 12, atk: 3, speed: 1.4, w: 30, h: 28, gold: 80, score: 1400, isBoss: true, kind: ENEMY_CLASS.BOSS_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.BOSS_BOUNCE, behavior: ENEMY_MOVE_TYPE.BOSS_BOUNCE, hitbox: { x: 0, y: 0, w: 30, h: 28 } },
  dragon: { name: '드래곤', code: 'DRG', color: '#c04040', hp: 256, atk: 5, speed: 1.5, w: 48, h: 40, gold: 100, score: 2000, isBoss: true, kind: ENEMY_CLASS.BOSS_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.WANDER, behavior: ENEMY_MOVE_TYPE.WANDER, hitbox: { x: 0, y: 0, w: 48, h: 40 } },
  mechDragon: { name: '메크 드래곤', code: 'MDG', color: '#808080', hp: 320, atk: 6, speed: 1.6, w: 48, h: 40, gold: 120, score: 2500, isBoss: true, kind: ENEMY_CLASS.BOSS_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.WANDER, behavior: ENEMY_MOVE_TYPE.WANDER, hitbox: { x: 0, y: 0, w: 48, h: 40 } },
  vampireLord: { name: '뱀파이어 로드', code: 'VLR', color: '#802080', hp: 400, atk: 7, speed: 1.8, w: 36, h: 44, gold: 150, score: 3000, isBoss: true, kind: ENEMY_CLASS.BOSS_KNOCKBACK, attackType: ENEMY_ATTACK_TYPE.CONTACT, moveType: ENEMY_MOVE_TYPE.BOSS_SWOOP, behavior: ENEMY_MOVE_TYPE.BOSS_SWOOP, hitbox: { x: 0, y: 0, w: 36, h: 44 } },
};

export class Enemy {
  constructor(type, x, y, options = {}) {
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
    this.kind = def.kind || ENEMY_CLASS.MOBILE_HEAVY;
    this.behavior = options.behavior || def.behavior || 'default';
    this.hitbox = def.hitbox || { x: 0, y: 0, w: this.w, h: this.h };
    this.vx = -this.speed;
    this.vy = 0;
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.onGround = false;
    this.facing = -1;
    this.hitTimer = 0;
    this.frame = 0;
    this.frameTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.patrolTimer = 0;
    this.patrolDir = -1;
    this.patrolMinX = options.patrolMinX ?? (options.patrolRange ? x - options.patrolRange : null);
    this.patrolMaxX = options.patrolMaxX ?? (options.patrolRange ? x + options.patrolRange : null);
  }

  update(platforms, player) {
    if (this.dead) {
      this.deathTimer--;
      return;
    }

    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.behavior === ENEMY_MOVE_TYPE.ZONE_PATROL) {
      if (this.patrolMinX !== null && this.x <= this.patrolMinX) this.patrolDir = 1;
      if (this.patrolMaxX !== null && this.x + this.w >= this.patrolMaxX) this.patrolDir = -1;
      this.vx = this.patrolDir * this.speed;
      this.facing = this.patrolDir >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.STATIONARY) {
      this.vx = 0;
    } else if (this.behavior === ENEMY_MOVE_TYPE.VERTICAL) {
      this.patrolTimer++;
      this.vx = 0;
      this.vy = Math.sin(this.patrolTimer / 18) * this.speed;
    } else if (this.behavior === ENEMY_MOVE_TYPE.HOVER) {
      this.patrolTimer++;
      this.vx = Math.cos(this.patrolTimer / 30) * this.speed * 0.7;
      this.vy = Math.sin(this.patrolTimer / 22) * this.speed * 0.45;
      this.facing = this.vx >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.FLY_CURVE) {
      this.patrolTimer++;
      this.vx = this.patrolDir * this.speed;
      this.vy = Math.sin(this.patrolTimer / 10) * 0.8;
      this.facing = this.patrolDir >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.HOP_ARCHER) {
      this.patrolTimer--;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 55 + Math.random() * 35;
        if (this.onGround) {
          this.vy = -4.8;
        }
      }
      this.vx = this.patrolDir * this.speed;
      this.facing = this.vx >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.PLAYER_LIKE) {
      if (Math.abs(dx) < 220) {
        this.vx = dx > 0 ? this.speed : -this.speed;
      } else {
        this.vx = 0;
      }
    } else if (this.behavior === ENEMY_MOVE_TYPE.FAST_WANDER) {
      this.patrolTimer--;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 45 + Math.random() * 25;
      }
      this.vx = this.patrolDir * this.speed;
      this.facing = this.vx >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.POPUP) {
      this.patrolTimer = (this.patrolTimer + 1) % 150;
      this.vx = this.patrolTimer > 55 ? this.patrolDir * this.speed * 0.45 : 0;
      this.facing = this.patrolDir >= 0 ? 1 : -1;
      if (this.patrolTimer === 0) {
        this.patrolDir *= -1;
      }
    } else if (this.behavior === ENEMY_MOVE_TYPE.BOSS_SWOOP) {
      this.patrolTimer++;
      this.vx = Math.sin(this.patrolTimer / 30) * this.speed * 1.4;
      this.vy = Math.cos(this.patrolTimer / 18) * 0.55;
      this.facing = this.vx >= 0 ? 1 : -1;
    } else if (this.behavior === ENEMY_MOVE_TYPE.BOSS_BOUNCE) {
      if (this.onGround && this.patrolTimer <= 0) {
        this.vy = -5.6;
        this.patrolTimer = 30;
        this.patrolDir = dx >= 0 ? 1 : -1;
      }
      this.patrolTimer--;
      this.vx = this.patrolDir * this.speed;
      this.facing = this.patrolDir >= 0 ? 1 : -1;
    } else if (this.kind === ENEMY_CLASS.FIXED_KNOCKBACK || this.kind === ENEMY_CLASS.FIXED_HEAVY) {
      this.vx = 0;
    } else if (Math.abs(dx) < 200 || this.kind === ENEMY_CLASS.BOSS_KNOCKBACK) {
      this.vx = dx > 0 ? this.speed : -this.speed;
    } else {
      this.patrolTimer--;
      if (this.patrolTimer <= 0) {
        this.patrolDir *= -1;
        this.patrolTimer = 80 + Math.random() * 60;
      }
      this.vx = this.patrolDir * this.speed * 0.5;
      this.facing = this.vx >= 0 ? 1 : -1;
    }

    this.vy += GRAVITY;
    if (this.hitTimer > 0) {
      this.knockbackY += GRAVITY * 0.35;
    }

    this.x += this.vx + this.knockbackX;
    this.y += this.vy + this.knockbackY;

    this.onGround = false;
    for (const p of platforms) {
      if (this._collides(p)) {
        if (this.vy + this.knockbackY >= 0 && this.y + this.h - (this.vy + this.knockbackY) <= p.y + 2) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.knockbackY = 0;
          this.onGround = true;
        } else if (this.vy + this.knockbackY < 0) {
          this.y = p.y + p.h;
          this.vy = 0;
          this.knockbackY = 0;
        } else if (this.vx + this.knockbackX > 0) {
          this.x = p.x - this.w;
          this.vx = 0;
          this.knockbackX = 0;
          this.patrolDir *= -1;
        } else {
          this.x = p.x + p.w;
          this.vx = 0;
          this.knockbackX = 0;
          this.patrolDir *= -1;
        }
      }
    }

    if (this.hitTimer > 0) {
      this.hitTimer--;
      this.knockbackX *= 0.78;
      this.knockbackY *= 0.86;
      if (Math.abs(this.knockbackX) < 0.05) this.knockbackX = 0;
      if (Math.abs(this.knockbackY) < 0.05) this.knockbackY = 0;
    }

    this.frameTimer++;
    if (this.frameTimer > 10) { this.frameTimer = 0; this.frame = (this.frame + 1) % 2; }
  }

  _collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  collidesWith(box) {
    if (!box) return false;
    const hurtbox = this.getHitbox();
    return hurtbox.x < box.x + box.w && hurtbox.x + hurtbox.w > box.x &&
           hurtbox.y < box.y + box.h && hurtbox.y + hurtbox.h > box.y;
  }

  getHitbox() {
    return {
      x: this.x + this.hitbox.x,
      y: this.y + this.hitbox.y,
      w: this.hitbox.w,
      h: this.hitbox.h,
    };
  }

  takeDamage(amount, knockbackDir = 1) {
    if (this.hitTimer > 0 || this.dead) return false;
    this.hp -= amount;
    this.hitTimer = 20;
    if (this.kind !== ENEMY_CLASS.FIXED_HEAVY) {
      this.knockbackX = knockbackDir * 6.4;
      this.knockbackY = -3.8;
    } else {
      this.knockbackX = 0;
      this.knockbackY = 0;
    }
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

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Flash white on hit
    if (this.hitTimer > 0) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    if (isSnakeFamily(this.type)) {
      if (this.facing > 0) {
        ctx.translate(px + this.w, py);
        ctx.scale(-1, 1);
        drawSnake(ctx, 0, 0, this.w, this.h, this.frame, this.hitTimer > 0, this.color);
      } else {
        drawSnake(ctx, px, py, this.w, this.h, this.frame, this.hitTimer > 0, this.color);
      }
    } else if (this.type === 'death') {
      drawDeath(ctx, px, py, this.w, this.h, this.hitTimer > 0);
    } else if (this.type === 'mushroomKing') {
      drawMushroomKing(ctx, px, py, this.w, this.h, this.hitTimer > 0);
    } else {
      const frameSet = sprites[this.type] || null;
      const frame = frameSet ? frameSet[this.frame % frameSet.length] : null;
      const imageAsset = assets.enemies?.[this.type] || null;

      if (imageAsset || frame) {
        // Flip: sprites face LEFT by default; flip when moving right
        if (this.facing > 0) {
          ctx.translate(px + this.w, py);
          ctx.scale(-1, 1);
          ctx.drawImage(imageAsset || frame, 0, 0, this.w, this.h);
        } else {
          ctx.drawImage(imageAsset || frame, px, py, this.w, this.h);
        }
      } else {
        drawFallbackEnemy(ctx, px, py, this.w, this.h, this.color, this.hitTimer > 0);
      }
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

function isSnakeFamily(type) {
  return type === 'snake' || type === 'python' || type === 'anaconda';
}

function drawSnake(ctx, x, y, w, h, frame, flashing, color) {
  const body = flashing ? '#edf9d8' : color;
  const dark = '#2c2c2c';
  const headY = frame === 0 ? y + 1 : y + 2;
  const tailY = frame === 0 ? y + 7 : y + 5;

  ctx.fillStyle = body;
  ctx.fillRect(x + 6, headY, w - 10, h - 4);
  ctx.fillRect(x + 2, y + 4, 8, 6);
  ctx.fillRect(x + w - 8, tailY, 6, 4);
  ctx.fillStyle = dark;
  ctx.fillRect(x + 4, y + 6, w - 10, 2);
  ctx.fillRect(x + 5, y + 10, w - 12, 2);
  ctx.fillStyle = '#f6f0d0';
  ctx.fillRect(x + 3, y + 5, 2, 2);
  ctx.fillStyle = '#b81f1f';
  ctx.fillRect(x + 1, y + 7, 3, 1);
}

function drawFallbackEnemy(ctx, x, y, w, h, color, flashing) {
  ctx.fillStyle = flashing ? '#f8f8f8' : color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(x + 3, y + 4, Math.max(2, w - 6), 2);
  ctx.fillRect(x + 4, y + h - 6, Math.max(2, w - 8), 2);
}

function drawDeath(ctx, x, y, w, h, flashing) {
  ctx.fillStyle = flashing ? '#ffffff' : '#e8e8ff';
  ctx.fillRect(x + 7, y, w - 14, 10);
  ctx.fillRect(x + 4, y + 10, w - 8, h - 14);
  ctx.fillStyle = '#2a2340';
  ctx.fillRect(x + 10, y + 5, 3, 3);
  ctx.fillRect(x + w - 13, y + 5, 3, 3);
  ctx.fillRect(x + 6, y + h - 4, 4, 4);
  ctx.fillRect(x + w - 10, y + h - 4, 4, 4);
}

function drawMushroomKing(ctx, x, y, w, h, flashing) {
  ctx.fillStyle = flashing ? '#fff4f0' : '#c96e57';
  ctx.fillRect(x + 2, y, w - 4, 10);
  ctx.fillStyle = '#f0e5cc';
  ctx.fillRect(x + 8, y + 10, w - 16, h - 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 7, y + 3, 4, 3);
  ctx.fillRect(x + w - 11, y + 3, 4, 3);
  ctx.fillStyle = '#633';
  ctx.fillRect(x + 12, y + 15, 2, 6);
  ctx.fillRect(x + w - 14, y + 15, 2, 6);
}

export { ENEMY_TYPES };
