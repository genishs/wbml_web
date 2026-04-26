import { GRAVITY, JUMP_FORCE, PLAYER_SPEED, HUD_W } from './constants.js';
import { SWORD, SHIELD, ARMOR, BOOTS } from './equipment.js';
import { drawWonderBoy } from './sprites.js';

const ATTACK_FRAMES    = 22;
const KNOCKBACK_FRAMES = 28;

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 28; this.h = 72;   // S=3 기준: 시각 높이 26*3=78, 충돌 약간 안쪽
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1;

    this.state = 'idle';
    this.stateTimer = 0;
    this.animFrame  = 0;
    this.animTick   = 0;

    this.hp = 5; this.maxHp = 5;
    this.score = 0;
    this.gold  = 9999;
    this.timer = 3600; this.timerMax = 3600;

    this.eq = {
      sword:  SWORD.none,
      shield: SHIELD.none,
      armor:  ARMOR.none,
      boots:  BOOTS.none,
    };
    this.invincible = 0;
    this.attackHit  = false;
  }

  get speed()     { return PLAYER_SPEED + (this.eq.boots?.speed ?? 0); }
  get jumpForce() { return JUMP_FORCE - (this.eq.boots?.jump ?? 0) * 0.25; }

  getAttackBox() {
    if (this.state !== 'attack') return null;
    if (this.stateTimer < ATTACK_FRAMES / 2) return null;
    const reach = this.eq.sword?.reach ?? 0;
    if (!reach) return null;
    const x = this.facing === 1 ? this.x + this.w : this.x - reach;
    return { x, y: this.y + 45, w: reach, h: 28 };
  }

  equip(slot, item) { this.eq[slot] = item; }

  takeDamage(dmg) {
    if (this.invincible > 0) return false;
    const reduce = ((this.eq.shield?.def ?? 0) + (this.eq.armor?.def ?? 0)) / 100;
    this.hp = Math.max(0, this.hp - Math.max(1, Math.round(dmg * (1 - reduce))));
    this.invincible = 60;
    return true;
  }

  knockback(sourceX) {
    const dir = this.x > sourceX ? 1 : -1;
    this.state = 'knockback'; this.stateTimer = KNOCKBACK_FRAMES;
    this.vx = dir * 4.5; this.vy = -3.5;
  }

  update(input, platforms) {
    this.timer = Math.max(0, this.timer - 1);
    if (this.timer === 0 && this.animTick % 120 === 0) this.hp = Math.max(0, this.hp - 1);
    if (this.invincible > 0) this.invincible--;
    this.animTick++;

    if (this.state === 'knockback') {
      if (--this.stateTimer <= 0) { this.state = 'idle'; this.vx = 0; }
    } else if (this.state === 'attack') {
      if (--this.stateTimer <= 0) { this.state = 'idle'; this.attackHit = false; }
    } else {
      this._handleInput(input);
    }

    this.vy += GRAVITY;
    this.x  += this.vx;
    this.y  += this.vy;
    if (this.state !== 'knockback') this.vx *= 0.80;
    this._collide(platforms);

    if (this.state === 'walk') {
      if (this.animTick % 10 === 0) this.animFrame = (this.animFrame + 1) % 2;
    } else { this.animFrame = 0; }
  }

  _handleInput(input) {
    const atk   = input.wasPressed('KeyZ') || input.wasPressed('Space');
    const jmp   = input.wasPressed('ArrowUp') || input.wasPressed('KeyX');
    const left  = input.isDown('ArrowLeft');
    const right = input.isDown('ArrowRight');

    if (atk && this.eq.sword.id !== 'none') {
      this.state = 'attack'; this.stateTimer = ATTACK_FRAMES; this.attackHit = false; return;
    }
    if (left)       { this.vx = -this.speed; this.facing = -1; }
    else if (right) { this.vx =  this.speed; this.facing =  1; }
    else            { this.vx = 0; }

    if (this.onGround) this.state = (left || right) ? 'walk' : 'idle';
    if (jmp && this.onGround) { this.vy = this.jumpForce; this.onGround = false; this.state = 'jump'; }
  }

  _collide(platforms) {
    this.onGround = false;
    for (const p of platforms) {
      if (this.x + this.w <= p.x || this.x >= p.x + p.w) continue;
      if (this.vy >= 0 && this.y + this.h > p.y && this.y + this.h < p.y + 20) {
        this.y = p.y - this.h; this.vy = 0; this.onGround = true;
        if (this.state === 'jump') this.state = 'idle';
      }
    }
    if (this.x < 0) { this.x = 0; this.vx = 0; }
  }

  draw(ctx, camX) {
    if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 1) return;
    ctx.save();
    ctx.translate(Math.round(this.x - camX + HUD_W), Math.round(this.y));
    drawWonderBoy(ctx, { facing: this.facing, state: this.state, animFrame: this.animFrame, eq: this.eq });
    ctx.restore();
  }
}
