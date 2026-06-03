import { GRAVITY, JUMP_FORCE, PLAYER_SPEED, HUD_W, GROUND_Y } from './constants.js';
import { SWORD, SHIELD, ARMOR, BOOTS, MAGIC } from './equipment.js';
import { drawWonderBoy } from './sprites.js';
import { audio } from './audio.js';

const ATTACK_FRAMES    = 16;   // 4프레임 × 4틱 찌르기
const KNOCKBACK_FRAMES = 28;
const BUFF_DURATION    = 900;  // 시간제 강화아이템 지속(프레임, ≈15초)
const PLAYER_SCALE     = 0.7;  // 스프라이트/충돌박스 동시 축소(몹과 크기 균형)
const SPAWN_Y          = GROUND_Y - 50;  // 발이 지면에 닿는 시작 y (h=50)

// ⚠ 테스트용: 공격 판정 확대. 정식 빌드 전 1.0 / 기본값으로 되돌릴 것
const TEST_REACH_MULT = 2.6;   // 리치 배수
const TEST_HIT_H      = 40;    // 판정 세로 높이 (축소된 몸에 맞춤)
const TEST_HIT_YOFF   = 8;     // 판정 시작 y(플레이어 상단 기준)

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 50;   // 스프라이트 0.7배 축소(몹과 균형). 원본 28×72 → 20×50
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1;

    this.state = 'idle';
    this.stateTimer = 0;
    this.animFrame  = 0;
    this.animTick   = 0;

    this.hp = 5; this.maxHp = 5;   // 아케이드: 시작 5, 점수로 최대 10까지 확장
    this.score = 0;
    this.gold  = 9999;             // TODO: 정식 빌드에선 0 (골드는 적·보물에서 획득). 현재 테스트 편의값
    this.timer = 3600; this.timerMax = 3600;

    // 점수 마일스톤마다 최대 하트 +1 (최대 10). 임계값: 30k 후 +50k 간격 (원판 추정치)
    this.heartThresholds = [30000, 80000, 130000, 180000, 230000];
    this._nextHeartIdx   = 0;

    this.eq = {
      sword:  SWORD.none,
      shield: SHIELD.none,
      armor:  ARMOR.none,
      boots:  BOOTS.none,
    };
    this.invincible = 0;
    this.attackHit  = false;

    // 서브웨폰 스택(LIFO): [{magic, count}], 마지막 항목이 현재 활성
    this.magicStack = [];
    // 디버그: 테스트용 매직 시드 (정식 빌드에선 제거)
    this.addMagic(MAGIC.bomb, 5);
    this.addMagic(MAGIC.fireball, 5);
    this.addMagic(MAGIC.tornado, 3);
    this.addMagic(MAGIC.thunder, 2);

    // 소지품(특수 아이템) — HUD 6슬롯에 표시
    //  helmet 투구 / gauntlet 건틀릿 / wingboots 날개신발 : 일시 강화(획득 후 시간제)
    //  key 열쇠(보스 드롭) / potion 물약(hp 0시 자동, +5) / story 스토리아이템
    this.inventory = { helmet: 0, gauntlet: 0, wingboots: 0, key: 0, potion: 0, story: null };
    // 시간제 강화 잔여 프레임. 활성 동안 inventory 플래그=1로 HUD에 표시
    this.buffs = { helmet: 0, gauntlet: 0, wingboots: 0 };
    this.hospitalVisits = 0;   // 병원 누진 비용용(이용할수록 상승)
  }

  // 강화아이템 획득 → 버프 발동(지속시간 리필) + 소지품 슬롯 점등
  gainBuff(key) {
    if (!(key in this.buffs)) return;
    this.buffs[key] = BUFF_DURATION;
    this.inventory[key] = 1;
  }

  // 현재 검 공격력 (건틀릿 버프 시 +2). 폭탄 외 매직/검 데미지의 기준값
  swordAtk() {
    let a = this.eq.sword?.atk ?? 0;
    if (this.buffs.gauntlet > 0) a += 2;
    return a;
  }

  // 같은 종류면 누적, 다른 종류면 새 레이어를 위에 쌓음(최근=활성)
  addMagic(magic, n = 1) {
    const top = this.magicStack[this.magicStack.length - 1];
    if (top && top.magic.id === magic.id) top.count += n;
    else this.magicStack.push({ magic, count: n });
  }

  // 활성(최근) 1개 소비. 없으면 null
  useMagic() {
    const top = this.magicStack[this.magicStack.length - 1];
    if (!top) return null;
    top.count--;
    const m = top.magic;
    if (top.count <= 0) this.magicStack.pop();
    return m;
  }

  activeMagic() { return this.magicStack[this.magicStack.length - 1] || null; }

  // 갑옷 agi(음수)는 이동/점프를 깎는 민첩성 너프
  get speed()     { return Math.max(0.8, PLAYER_SPEED + (this.eq.boots?.speed ?? 0) + (this.eq.armor?.agi ?? 0) + (this.buffs.wingboots > 0 ? 0.6 : 0)); }
  get jumpForce() { return JUMP_FORCE - (this.eq.boots?.jump ?? 0) * 0.25 - (this.eq.armor?.agi ?? 0) - (this.buffs.wingboots > 0 ? 3 : 0); }

  // 찌르기 진행 단계 0~3 (0:윈드업 1:내지름 2:최대 3:회수)
  // 무게감을 위해 윈드업과 최대 찌르기 구간을 길게 둔다(균등분할 X).
  attackPhase() {
    const e = (ATTACK_FRAMES - this.stateTimer) / ATTACK_FRAMES;  // 0~1 진행
    if (e < 0.24) return 0;   // 윈드업(뒤로 당김)
    if (e < 0.42) return 1;   // 내지름
    if (e < 0.80) return 2;   // 최대 찌르기(길게 유지)
    return 3;                 // 회수
  }

  getAttackBox() {
    if (this.state !== 'attack') return null;
    const ph = this.attackPhase();
    if (ph < 1 || ph > 2) return null;          // 검이 뻗는 1~2단계에만 판정
    const ext   = ph === 2 ? 1 : 0.6;
    const reach = (this.eq.sword?.reach ?? 0) * ext * TEST_REACH_MULT;
    if (!reach) return null;
    const x = this.facing === 1 ? this.x + this.w : this.x - reach;
    return { x, y: this.y + TEST_HIT_YOFF, w: reach, h: TEST_HIT_H };
  }

  equip(slot, item) { this.eq[slot] = item; }

  // 보스 드롭으로 검 업그레이드 (상점 구매 불가). 더 강한 검일 때만 장착.
  awardSword(item) {
    if (item && item.atk > (this.eq.sword?.atk ?? 0)) {
      this.eq.sword = item;
      return true;
    }
    return false;
  }

  // source: 'contact'(직접 접촉 → 갑옷 경감) | 'projectile'(적 투사체 → 방패 경감/차단)
  takeDamage(dmg, source = 'contact') {
    if (this.invincible > 0) return false;
    let reduce;
    if (source === 'projectile') {
      // 방패로 막으면 완전 차단, 못 막아도 방패 급수(def)만큼 경감
      if (Math.random() < (this.eq.shield?.block ?? 0)) { this.invincible = 60; return false; }
      reduce = (this.eq.shield?.def ?? 0) / 100;
    } else {
      reduce = (this.eq.armor?.def ?? 0) / 100;   // 접촉 데미지는 갑옷이 경감
      if (this.buffs.helmet > 0) reduce = Math.min(0.85, reduce + 0.3);   // 투구 버프: 추가 경감
    }
    this.hp = Math.max(0, this.hp - Math.max(1, Math.round(dmg * (1 - reduce))));
    this.invincible = 60;
    return true;
  }

  knockback(sourceX) {
    const dir = this.x > sourceX ? 1 : -1;
    const r   = 1 - (this.eq.shield?.kbResist ?? 0);   // 방패 넉백 저항
    this.state = 'knockback'; this.stateTimer = KNOCKBACK_FRAMES;
    this.vx = dir * 4.5 * r; this.vy = -3.5 * Math.max(0.5, r);
  }

  update(input, platforms) {
    // 아케이드 타이머: 모래가 다 떨어지면 즉사가 아니라 하트 1칸 감소 후 리셋(뒤집힘)
    if (--this.timer <= 0) {
      this.hp = Math.max(0, this.hp - 1);
      this.timer = this.timerMax;
    }
    // 점수로 최대 하트 확장 (5→10). 확장된 칸은 채워서 보상
    while (this._nextHeartIdx < this.heartThresholds.length &&
           this.maxHp < 10 &&
           this.score >= this.heartThresholds[this._nextHeartIdx]) {
      this.maxHp++; this.hp++; this._nextHeartIdx++;
    }
    if (this.invincible > 0) this.invincible--;
    // 시간제 강화 만료 처리
    for (const k in this.buffs) {
      if (this.buffs[k] > 0 && --this.buffs[k] <= 0) this.inventory[k] = 0;
    }
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
    if (this.state !== 'knockback') this.vx *= (this.eq.boots?.friction ?? 0.80); // 부츠 접지력(천=미끄럼)
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
      this.state = 'attack'; this.stateTimer = ATTACK_FRAMES; this.attackHit = false;
      audio.sfx('swing'); return;
    }
    if (left)       { this.vx = -this.speed; this.facing = -1; }
    else if (right) { this.vx =  this.speed; this.facing =  1; }
    else            { this.vx = 0; }

    if (this.onGround) this.state = (left || right) ? 'walk' : 'idle';
    if (jmp && this.onGround) { this.vy = this.jumpForce; this.onGround = false; this.state = 'jump'; audio.sfx('jump'); }
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
    ctx.scale(PLAYER_SCALE, PLAYER_SCALE);
    drawWonderBoy(ctx, {
      facing: this.facing, state: this.state, animFrame: this.animFrame, eq: this.eq,
      attackPhase: this.state === 'attack' ? this.attackPhase() : 0,
    });
    ctx.restore();
  }
}
