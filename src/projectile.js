// 서브웨폰 투사체/이펙트. 각 종류의 데미지 로직이 다르다.
//  roll(폭탄)    : 굴러가며 닿는 적에게 항상 1 피해. 같은 적 최대 2회(고정 유닛은 2번 맞음). 소멸 안 됨(수명까지).
//  fly(파이어볼) : 직선 비행, 첫 적 1체에 '검 공격력'만큼 피해 후 소멸.
//  tornado(회오리): 지면 따라 이동, 수명 동안 tick 간격 다단 히트, 매 히트 '검 공격력'.
//  thunder(썬더) : 즉발 화면 전체기(게임 쪽에서 일괄 피해 처리). 여기선 번쩍 연출만.
import { GRAVITY, GROUND_Y, HUD_W, VIEW_W } from './constants.js';

// 적 원거리 투사체. 플레이어에게 'projectile' 피해 → 방패로 경감/차단.
const SHOT_PROFILE = {
  arrow:  { speed: 4.5, arc: false, color: '#996633', core: '#ffcc00', w: 13, h: 4 },
  bubble: { speed: 2.6, arc: false, color: '#88ccee', core: '#ffffff', w: 11, h: 11 },
  ink:    { speed: 3.4, arc: false, color: '#440077', core: '#9900cc', w: 11, h: 8 },
  poison: { speed: 3.0, arc: true,  color: '#aa0088', core: '#ff88ff', w: 10, h: 10 },
  rock:   { speed: 3.0, arc: true,  color: '#888888', core: '#cccccc', w: 13, h: 13 },
  ice:    { speed: 3.2, arc: true,  color: '#88ccee', core: '#ffffff', w: 12, h: 12 },
  mud:    { speed: 2.8, arc: true,  color: '#885544', core: '#aa7766', w: 12, h: 9 },
  tar:    { speed: 2.8, arc: true,  color: '#3344aa', core: '#5588cc', w: 12, h: 9 },
};

export class EnemyShot {
  constructor(type, x, y, dir, atk) {
    const p = SHOT_PROFILE[type] || SHOT_PROFILE.arrow;
    this.type = type; this.atk = atk;
    this.x = x; this.y = y; this.w = p.w; this.h = p.h;
    this.vx = dir * p.speed;
    this.vy = p.arc ? -3.2 : 0;
    this.arc = p.arc; this.color = p.color; this.core = p.core;
    this.life = 200; this.dead = false; this.tick = 0;
    this.deflected = false;
  }
  // 방패로 막혔을 때: 데미지 없이 위로 튕겨나가 떨어지는 연출
  deflect(dir) {
    this.deflected = true;
    this.vx = dir * 3.2;
    this.vy = -3.6;
    this.arc = true;                       // 포물선으로 튄 뒤 낙하 소멸
    this.life = Math.min(this.life, 48);
  }
  update() {
    this.tick++;
    if (--this.life <= 0) { this.dead = true; return; }
    this.x += this.vx;
    if (this.arc) {
      this.vy += GRAVITY; this.y += this.vy;
      if (this.y + this.h >= GROUND_Y) this.dead = true;   // 바닥에 떨어지면 소멸
    }
  }
  getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  draw(ctx, camX) {
    const sx = Math.round(this.x - camX + HUD_W), sy = Math.round(this.y);
    if (this.deflected) {
      // 튕겨나가는 중: 회전하는 흰 불꽃
      ctx.save();
      ctx.translate(sx + this.w / 2, sy + this.h / 2);
      ctx.rotate(this.tick * 0.5);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-this.w / 2, -2, this.w, 4); ctx.fillRect(-2, -this.h / 2, 4, this.h);
      ctx.fillStyle = this.core;  ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
      return;
    }
    ctx.fillStyle = this.color; ctx.fillRect(sx, sy, this.w, this.h);
    ctx.fillStyle = this.core;
    ctx.fillRect(sx + 2, sy + 1, Math.max(2, this.w - 4), Math.max(2, this.h - 2));
  }
}

export class Projectile {
  constructor(magic, x, y, facing, swordAtk) {
    this.def    = magic;
    this.kind   = magic.kind;
    this.facing = facing;
    this.x = x; this.y = y;
    this.vx = (magic.speed || 0) * facing;
    this.vy = 0;
    this.life = magic.life;
    this.dead = false;
    this.tick = 0;

    // 검 공격력 기반(폭탄 제외). 검이 없을 때만 최소 1 보정.
    this._atk = Math.max(1, swordAtk || 0);

    // 종류별 히트박스/상태
    if (this.kind === 'fly')      { this.w = 20; this.h = 12; this._hitAny = false; }
    else if (this.kind === 'roll'){ this.w = 16; this.h = 16; this._hits = new Map(); this._cool = new Map(); }
    else if (this.kind === 'tornado') { this.w = 26; this.h = 36; this._cool = new Map(); }
    else { this.w = 0; this.h = 0; }   // thunder
  }

  update() {
    this.tick++;
    if (--this.life <= 0) { this.dead = true; return; }

    switch (this.kind) {
      case 'fly':
        this.x += this.vx;
        break;
      case 'roll':
        this.vy += GRAVITY; this.y += this.vy; this.x += this.vx;
        this._clampGround();
        this._tickCooldowns();
        break;
      case 'tornado':
        this.y = GROUND_Y - this.h;   // 지면 고정
        this.x += this.vx;
        this._tickCooldowns();
        break;
      case 'thunder':
        break;                         // 정지 연출
    }
  }

  _clampGround() {
    if (this.y + this.h >= GROUND_Y) { this.y = GROUND_Y - this.h; this.vy = 0; }
  }

  _tickCooldowns() {
    for (const [e, c] of this._cool) if (c > 0) this._cool.set(e, c - 1);
  }

  getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  // 이 프레임에 enemy에게 줄 피해량(0이면 안 때림). 종류별 로직 차이의 핵심.
  damageFor(enemy) {
    if (this.dead) return 0;
    switch (this.kind) {
      case 'fly': {
        if (this._hitAny) return 0;
        this._hitAny = true;
        this.dead = true;                 // 첫 적에 맞고 소멸
        return this._atk;                 // 검 공격력
      }
      case 'roll': {
        const cool = this._cool.get(enemy) || 0;
        const cnt  = this._hits.get(enemy) || 0;
        if (cool > 0 || cnt >= 2) return 0; // 같은 적 최대 2회, 쿨다운 사이
        this._hits.set(enemy, cnt + 1);
        this._cool.set(enemy, 9);
        return 1;                         // 폭탄은 항상 1 고정
      }
      case 'tornado': {
        const cool = this._cool.get(enemy) || 0;
        if (cool > 0) return 0;
        this._cool.set(enemy, this.def.tick || 12);
        return this._atk;                 // 매 틱 검 공격력
      }
    }
    return 0;
  }

  draw(ctx, camX) {
    const sx = Math.round(this.x - camX + HUD_W);
    const sy = Math.round(this.y);
    const { color, core } = this.def;

    switch (this.kind) {
      case 'fly': {
        // 불덩이: 코어 + 꼬리 + 깜빡임
        ctx.fillStyle = color; ctx.fillRect(sx, sy, this.w, this.h);
        ctx.fillStyle = core;  ctx.fillRect(sx + 4, sy + 3, this.w - 8, this.h - 6);
        ctx.fillStyle = '#ffff00'; ctx.fillRect(sx + 6, sy + 4, 4, 3);
        const t = -this.facing * 6;       // 꼬리
        ctx.fillStyle = 'rgba(255,140,0,0.6)';
        ctx.fillRect(sx + (this.facing === 1 ? -6 : this.w), sy + 3, 6, this.h - 6);
        break;
      }
      case 'roll': {
        // 폭탄: 검은 구 + 심지 불꽃 + 회전 하이라이트
        ctx.fillStyle = color; ctx.beginPath();
        ctx.arc(sx + this.w / 2, sy + this.h / 2, this.w / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#555'; ctx.fillRect(sx + (this.tick % 8 < 4 ? 4 : 9), sy + 3, 3, 3);
        ctx.fillStyle = '#6a3410'; ctx.fillRect(sx + this.w / 2 - 1, sy - 4, 2, 4); // 심지
        ctx.fillStyle = core;     ctx.fillRect(sx + this.w / 2 - 1, sy - 7, 2, 3);  // 불꽃
        break;
      }
      case 'tornado': {
        // 회오리: 위로 갈수록 넓어지는 나선
        for (let i = 0; i < 5; i++) {
          const ry = sy + this.h - i * (this.h / 5);
          const rw = 6 + i * 4;
          const off = Math.sin((this.tick * 0.4) + i) * 4;
          ctx.fillStyle = i % 2 ? core : color;
          ctx.fillRect(sx + this.w / 2 - rw / 2 + off, ry - 4, rw, 4);
        }
        break;
      }
      case 'thunder': {
        // 화면 전체 번쩍 + 지그재그 낙뢰
        const a = this.life / this.def.life;
        ctx.fillStyle = `rgba(255,255,160,${0.35 * a})`;
        ctx.fillRect(HUD_W, 0, VIEW_W, GROUND_Y);
        ctx.strokeStyle = core; ctx.lineWidth = 2;
        for (let b = 0; b < 4; b++) {
          const bx = HUD_W + 60 + b * 120 + (this.tick * 7) % 40;
          ctx.beginPath(); ctx.moveTo(bx, 0);
          for (let yy = 0; yy < GROUND_Y; yy += 18)
            ctx.lineTo(bx + ((yy / 18) % 2 ? 10 : -10), yy);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
        break;
      }
    }
  }
}
