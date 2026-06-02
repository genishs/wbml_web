import { GRAVITY, HUD_W } from './constants.js';
import { drawEnemySprite } from './sprites.js';

// 일반몹 전체 로스터 (웹 자료 기준 명칭/HP). 정통 색: 빨강↔파랑 등 변종 구분.
//  family = 렌더 외형군 / move = 거동 / shot = 원거리 투사체(있으면 방패로 경감되는 'projectile')
const DEFS = {
  _base:     { w: 32, h: 24, hp: 2, atk: 1, speed: 0.8, gold: 5, score: 100, color: '#888', darkColor: '#555', family: 'orb', move: 'still' },

  snake:     { w: 32, h: 18, hp: 1,   atk: 1, speed: 0.7, gold: 3,  score: 80,    color: '#cc0000', darkColor: '#770000', family: 'snake',   move: 'walk'  },
  python:    { w: 32, h: 18, hp: 3,   atk: 1, speed: 0,   gold: 5,  score: 120,   color: '#5588cc', darkColor: '#3344aa', family: 'snake',   move: 'still' },
  anaconda:  { w: 36, h: 18, hp: 3,   atk: 2, speed: 1.5, gold: 6,  score: 150,   color: '#00aa00', darkColor: '#008800', family: 'snake',   move: 'walk'  },
  myconid:   { w: 28, h: 30, hp: 1,   atk: 1, speed: 0.5, gold: 4,  score: 100,   color: '#cc0000', darkColor: '#ffccbb', family: 'mushroom',move: 'walk'  },

  orc:       { w: 30, h: 42, hp: 4,   atk: 2, speed: 0.8, gold: 10, score: 300,   color: '#cc0000', darkColor: '#770000', family: 'humanoid',move: 'walkjump', shot: 'arrow', shotEvery: 130 },
  goblin:    { w: 30, h: 42, hp: 12,  atk: 3, speed: 0.9, gold: 20, score: 600,   color: '#5588cc', darkColor: '#3344aa', family: 'humanoid',move: 'walkjump', shot: 'arrow', shotEvery: 110 },

  fangbat:   { w: 28, h: 22, hp: 1,   atk: 1, speed: 1.2, gold: 4,  score: 100,   color: '#9900cc', darkColor: '#660099', family: 'bat',     move: 'fly'   },
  werebat:   { w: 28, h: 22, hp: 4,   atk: 2, speed: 1.4, gold: 6,  score: 150,   color: '#ffcc00', darkColor: '#aa8800', family: 'bat',     move: 'fly'   },

  wisp:      { w: 22, h: 22, hp: 2,   atk: 2, speed: 1.0, gold: 5,  score: 120,   color: '#ff5500', darkColor: '#aa0000', family: 'orb',     move: 'fly'   },
  ghost:     { w: 30, h: 30, hp: 128, atk: 3, speed: 0.7, gold: 30, score: 30000, color: '#5588cc', darkColor: '#112288', family: 'orb',     move: 'fly'   },

  skeleton:  { w: 28, h: 44, hp: 6,   atk: 2, speed: 1.0, gold: 12, score: 300,   color: '#dddddd', darkColor: '#cc0000', family: 'humanoid',move: 'walk'  },
  undead:    { w: 28, h: 44, hp: 16,  atk: 3, speed: 1.1, gold: 18, score: 500,   color: '#dddddd', darkColor: '#3344aa', family: 'humanoid',move: 'walk'  },

  jellyfish: { w: 26, h: 28, hp: 2,   atk: 1, speed: 0,   gold: 4,  score: 100,   color: '#88ccee', darkColor: '#5599bb', family: 'jelly',   move: 'vert'  },
  octopus:   { w: 34, h: 30, hp: 16,  atk: 2, speed: 0,   gold: 14, score: 400,   color: '#9900cc', darkColor: '#660099', family: 'octopus', move: 'vert',  shot: 'ink', shotEvery: 120 },
  crab:      { w: 34, h: 26, hp: 8,   atk: 2, speed: 0.6, gold: 10, score: 300,   color: '#ff7700', darkColor: '#aa5500', family: 'crab',    move: 'walk',  shot: 'bubble', shotEvery: 140 },

  wererat:   { w: 30, h: 20, hp: 2,   atk: 1, speed: 1.8, gold: 5,  score: 120,   color: '#cc0000', darkColor: '#770000', family: 'rat',     move: 'walk'  },
  ratmaster: { w: 30, h: 20, hp: 8,   atk: 2, speed: 2.4, gold: 10, score: 300,   color: '#5588cc', darkColor: '#3344aa', family: 'rat',     move: 'walk'  },

  yeti:      { w: 36, h: 44, hp: 8,   atk: 3, speed: 0.7, gold: 12, score: 300,   color: '#cccccc', darkColor: '#888888', family: 'yeti',    move: 'walk',  shot: 'rock', shotEvery: 150 },
  snowyeti:  { w: 36, h: 44, hp: 24,  atk: 3, speed: 0.7, gold: 18, score: 500,   color: '#ffffff', darkColor: '#88ccee', family: 'yeti',    move: 'walk',  shot: 'ice',  shotEvery: 130 },

  mudman:    { w: 32, h: 34, hp: 8,   atk: 2, speed: 0,   gold: 10, score: 300,   color: '#885544', darkColor: '#663322', family: 'mudman',  move: 'crouch', shot: 'mud', shotEvery: 120 },
  tarman:    { w: 32, h: 34, hp: 16,  atk: 3, speed: 0,   gold: 16, score: 400,   color: '#3344aa', darkColor: '#112288', family: 'mudman',  move: 'crouch', shot: 'tar', shotEvery: 100 },

  roper:     { w: 30, h: 36, hp: 32,  atk: 2, speed: 0,   gold: 20, score: 600,   color: '#aa0088', darkColor: '#770055', family: 'roper',   move: 'still', shot: 'poison', shotEvery: 110 },
};

export function enemyHp(type) { return (DEFS[type] || DEFS._base).hp; }
export function enemyAirborne(type) { const d = DEFS[type] || DEFS._base; return d.move === 'fly' || d.move === 'vert'; }

export class Enemy {
  constructor(type, x, y, opts = {}) {
    const d = DEFS[type] || DEFS._base;
    Object.assign(this, d);
    this.type  = type;
    this.x = x; this.y = y;
    this.baseY = y;
    this.maxHp = d.hp;
    this.vx = (opts.dir ?? 1) * d.speed;
    this.vy = 0;
    this.onGround = false;
    this.facing = opts.dir ?? -1;
    this.dead = false;
    this.deathTimer = 0;
    this.patrolMin = opts.patrolMin ?? x - 100;
    this.patrolMax = opts.patrolMax ?? x + 100;
    this.airborne = d.move === 'fly' || d.move === 'vert';
    this.shotEvery = d.shotEvery ?? 120;
    this.pendingShot = null;
    this.tick = Math.floor(Math.random() * 60);
    this.hitStun = 0;
    this.kbVx = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0 && !this.dead) { this.dead = true; this.deathTimer = 30; }
  }

  hitKnockback(sourceX, power = 4) {
    const dir = this.x >= sourceX ? 1 : -1;
    this.kbVx    = dir * power;
    this.hitStun = 14;
    this.facing  = -dir;
    if (!this.airborne && this.onGround) this.vy = -3;
  }

  update(platforms, player) {
    if (this.dead) { this.deathTimer--; return; }

    if (this.hitStun > 0) {
      this.hitStun--;
      this.x += this.kbVx;
      this.kbVx *= 0.82;
      if (!this.airborne) { this.vy += GRAVITY; this.y += this.vy; this._collide(platforms); }
      this.x = Math.max(this.patrolMin, Math.min(this.patrolMax, this.x));
      return;
    }
    this.tick++;

    switch (this.move) {
      case 'fly':
        this.y = this.baseY + Math.sin(this.tick * 0.05) * 14;
        this.x += this.vx; this._patrol();
        break;
      case 'vert':
        this.y = this.baseY + Math.sin(this.tick * 0.045) * 22;
        break;
      case 'still':
      case 'crouch':
        this.vy += GRAVITY; this.y += this.vy; this._collide(platforms);
        if (player) this.facing = Math.sign(player.x - this.x) || this.facing;
        break;
      case 'walkjump':
        this.vy += GRAVITY; this.x += this.vx; this.y += this.vy;
        this._collide(platforms); this._patrol();
        if (this.onGround && this.tick % 100 === 0) this.vy = -7;
        break;
      default: // walk / dash
        this.vy += GRAVITY; this.x += this.vx; this.y += this.vy;
        this._collide(platforms); this._patrol();
    }

    // 원거리 공격 요청 (게임이 EnemyShot 생성). 방패로 경감되는 'projectile'.
    if (this.shot && player && this.tick % this.shotEvery === (this.shotEvery >> 1)) {
      if (Math.abs(player.x - this.x) < 440) {
        const dir = Math.sign(player.x - this.x) || this.facing;
        this.facing = dir;
        this.pendingShot = { type: this.shot, x: this.x + this.w / 2, y: this.y + this.h * 0.4, dir, atk: this.atk };
      }
    }
  }

  _patrol() {
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

  getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  draw(ctx, camX) {
    if (this.dead && this.deathTimer <= 0) return;
    const sx = Math.round(this.x - camX + HUD_W);
    const sy = Math.round(this.y);
    const alpha = this.dead ? this.deathTimer / 30 : 1;
    ctx.globalAlpha = alpha;

    ctx.save();
    ctx.translate(sx, sy);
    const drawn = drawEnemySprite(ctx, {
      family: this.family, color: this.color, dark: this.darkColor,
      facing: this.facing, w: this.w, h: this.h, tick: this.tick,
    });
    ctx.restore();

    if (!drawn) {
      ctx.fillStyle = this.color;     ctx.fillRect(sx, sy, this.w, this.h);
      ctx.fillStyle = this.darkColor; ctx.fillRect(sx + 2, sy + 2, this.w - 4, this.h - 4);
      ctx.fillStyle = '#ffffff';
      const ex = this.facing === 1 ? sx + this.w - 6 : sx + 2;
      ctx.fillRect(ex, sy + 4, 4, 4);
    }

    if (this.hitStun > 0 && !this.dead) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, this.w, this.h);
      ctx.globalAlpha = alpha;
    }

    if (this.hp < this.maxHp && !this.dead) {
      ctx.fillStyle = '#333';
      ctx.fillRect(sx, sy - 6, this.w, 3);
      ctx.fillStyle = '#00cc44';
      ctx.fillRect(sx, sy - 6, this.w * this.hp / this.maxHp, 3);
    }

    ctx.globalAlpha = 1;
  }
}

// ── 보스 (라운드 끝 가디언) ─────────────────────────────────────────────
// 외형/거동 두 종류. 이름·HP·점수·골드는 라운드별로 주입(opts)
const BOSS_DEFS = {
  fly:    { w: 38, h: 46, atk: 2, speed: 1.6, gold: 100, color: '#112288', darkColor: '#000066', flies: true  },
  ground: { w: 42, h: 48, atk: 3, speed: 1.1, gold: 120, color: '#cc0000', darkColor: '#770000', flies: false },
};

export class Boss extends Enemy {
  constructor(type, x, y, opts = {}) {
    super('_base', x, y, opts);
    const d = BOSS_DEFS[type] || BOSS_DEFS.ground;
    Object.assign(this, d);
    this.type        = 'boss:' + type;
    this.bossType    = type;
    this.isBoss      = true;
    this.name  = opts.name ?? 'BOSS';
    this.hp    = opts.hp ?? 20;  this.maxHp = this.hp;
    this.score = opts.score ?? 2000;
    this.gold  = opts.gold ?? d.gold;
    this.swordReward = opts.swordReward ?? null;
    this.homeX = x;  this.homeY = y;
    this.patrolMin = x - 160; this.patrolMax = x + 60;
    this.vx = -d.speed;
    this.tick = 0;
    this._rewarded = false;
    this.active = false;
    this.shot = null;            // 보스는 별도 패턴(원거리 미사용)
  }

  hitKnockback(sourceX, power = 1.8) {
    const dir = this.x >= sourceX ? 1 : -1;
    this.kbVx    = dir * power;
    this.hitStun = 8;
    this.facing  = -dir;
  }

  update(platforms, player) {
    if (this.dead) { this.deathTimer--; return; }

    if (this.hitStun > 0) {
      this.hitStun--;
      this.x = Math.max(this.patrolMin, Math.min(this.patrolMax, this.x + this.kbVx));
      this.kbVx *= 0.8;
      return;
    }

    this.tick++;
    if (this.flies) {
      const tx  = player ? player.x : this.homeX;
      const dir = Math.sign(tx - this.x) || 1;
      this.x += dir * this.speed * 0.6;
      this.x  = Math.max(this.patrolMin, Math.min(this.patrolMax, this.x));
      this.facing = dir;
      this.y = this.homeY - 30 + Math.sin(this.tick * 0.05) * 26;
    } else {
      this.vy += GRAVITY;
      this.x += this.vx; this.y += this.vy;
      this._collide(platforms);
      if (this.x < this.patrolMin) { this.vx =  Math.abs(this.vx); this.facing =  1; }
      if (this.x > this.patrolMax) { this.vx = -Math.abs(this.vx); this.facing = -1; }
      if (this.onGround && this.tick % 90 === 0) this.vy = -7;
    }
  }

  draw(ctx, camX) {
    if (this.dead && this.deathTimer <= 0) return;
    const sx = Math.round(this.x - camX + HUD_W);
    const sy = Math.round(this.y);
    const w = this.w, h = this.h;
    ctx.globalAlpha = this.dead ? this.deathTimer / 30 : 1;
    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing === 1) { ctx.translate(w, 0); ctx.scale(-1, 1); }

    if (this.flies) {
      ctx.fillStyle = this.color;
      ctx.fillRect(w * 0.2, h * 0.15, w * 0.6, h * 0.7);
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.4); ctx.lineTo(0, h);
      ctx.lineTo(w * 0.35, h * 0.85); ctx.closePath();
      ctx.fillStyle = this.darkColor; ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.8, h * 0.4); ctx.lineTo(w, h);
      ctx.lineTo(w * 0.65, h * 0.85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0a0a12'; ctx.fillRect(w * 0.3, h * 0.28, w * 0.4, h * 0.2);
      ctx.fillStyle = '#ff0000'; ctx.fillRect(w * 0.36, h * 0.34, 5, 4); ctx.fillRect(w * 0.56, h * 0.34, 5, 4);
      ctx.fillStyle = '#cccccc'; ctx.fillRect(w * 0.78, h * 0.45, 3, h * 0.45);
      ctx.fillStyle = '#dddddd'; ctx.beginPath();
      ctx.moveTo(w * 0.78, h * 0.45); ctx.quadraticCurveTo(w * 1.05, h * 0.4, w * 0.95, h * 0.7);
      ctx.lineTo(w * 0.8, h * 0.55); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = this.darkColor; ctx.fillRect(w * 0.22, h * 0.62, w * 0.2, h * 0.38); ctx.fillRect(w * 0.58, h * 0.62, w * 0.2, h * 0.38);
      ctx.fillStyle = this.color;     ctx.fillRect(w * 0.14, h * 0.28, w * 0.72, h * 0.42);
      ctx.fillStyle = this.darkColor; ctx.fillRect(w * 0.14, h * 0.28, w * 0.72, 4);
      ctx.fillStyle = this.color;     ctx.fillRect(w * 0.28, h * 0.04, w * 0.44, h * 0.28);
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath(); ctx.moveTo(w * 0.28, h * 0.1); ctx.lineTo(w * 0.14, h * -0.04); ctx.lineTo(w * 0.34, h * 0.06); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.1); ctx.lineTo(w * 0.86, h * -0.04); ctx.lineTo(w * 0.66, h * 0.06); ctx.fill();
      ctx.fillStyle = '#ff0000'; ctx.fillRect(w * 0.34, h * 0.16, 6, 5); ctx.fillRect(w * 0.56, h * 0.16, 6, 5);
      ctx.fillStyle = '#cccccc'; ctx.fillRect(w * 0.86, h * 0.1, 4, h * 0.6);
      ctx.fillStyle = '#ffcc00'; ctx.fillRect(w * 0.8, h * 0.66, w * 0.18, 4);
    }
    ctx.restore();

    if (this.hitStun > 0 && !this.dead) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, w, h);
    }
    ctx.globalAlpha = 1;

    if (!this.dead) {
      const bw = this.w + 10, bx = sx - 5, by = sy - 13;
      ctx.fillStyle = '#400';     ctx.fillRect(bx, by, bw, 5);
      ctx.fillStyle = '#ff3040';  ctx.fillRect(bx, by, bw * this.hp / this.maxHp, 5);
      ctx.fillStyle = '#ffffff';  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.name, sx + this.w / 2, by - 3);
      ctx.textAlign = 'left';
    }
  }
}
