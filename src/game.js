import { CANVAS_W, CANVAS_H, HUD_W, VIEW_W, GAME_STATE, GROUND_Y } from './constants.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { buildStage, drawStage, drawArena } from './stage.js';
import { Projectile, EnemyShot } from './projectile.js';
import { Pickup } from './pickup.js';
import { SWORD } from './equipment.js';
import { Shop } from './shop.js';
import { Facility } from './facility.js';
import { drawHUD } from './ui.js';
import { drawTitle, drawStory, STORY_PAGES } from './title.js';
import { audio } from './audio.js';

const DOOR_INTERACT_DIST = 30;

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx ?? canvas.getContext('2d');
    this.input    = new Input();
    this.shop     = new Shop();
    this.facility = new Facility();
    this.frame  = 0;
    this.storyPage = 0;
    this.projectiles = [];   // 활성 서브웨폰
    this.enemyShots  = [];   // 적 원거리 투사체
    this.pickups     = [];   // 필드/드롭 수집물
    this.arena       = null; // 보스방(아레나) 진입 시 설정, 필드에선 null
    this.notice      = '';   // 화면 하단 안내 메시지
    this.noticeTimer = 0;
    this._questGiven = false;
    this._loop  = this._loop.bind(this);
    this._restart();
  }

  // 부팅/게임오버 후 → 타이틀로 복귀
  _restart() {
    this.player = new Player(160, GROUND_Y - 50);
    this.banner = '';
    this._loadStage(1);
    this.storyPage = 0;
    this.state = GAME_STATE.TITLE;
  }

  // 스토리 끝 → 실제 플레이 시작
  _beginGame() {
    this.player = new Player(160, GROUND_Y - 50);
    this.banner = '';
    this._questGiven = false;
    this.notice = ''; this.noticeTimer = 0;
    this._loadStage(1);
    this.state = GAME_STATE.PLAYING;
  }

  _loadStage(n) {
    this.stage      = n;
    this.stageData  = buildStage(n);
    this.camX       = 0;
    this.nearDoor   = null;
    this.arena      = null;
    this.projectiles = [];
    this.enemyShots  = [];
    this.pickups     = (this.stageData.pickups || []).slice();
    this.shop.close();
    this.facility.close();
    // 라운드 시작 위치로 플레이어 복귀 (장비/점수/하트는 유지)
    const p = this.player;
    p.x = 160; p.y = GROUND_Y - 50; p.vx = 0; p.vy = 0;
    p.state = 'idle'; p.invincible = 0;
    p.timer = p.timerMax;
  }

  start() { requestAnimationFrame(this._loop); }

  _loop() {
    this.frame++;
    this.input.update();
    this.update();
    this.draw();
    requestAnimationFrame(this._loop);
  }

  update() {
    // 상점 진입 중에는 타이머 정지 (AC-T2)
    if (this.shop.open) {
      this.shop.update(this.input);
      if (!this.shop.open) this.nearDoor = null;
      return;
    }
    if (this.facility.open) {              // 병원/바 이용 중에도 타이머 정지
      this.facility.update(this.input);
      if (!this.facility.open) this.nearDoor = null;
      return;
    }

    switch (this.state) {
      case GAME_STATE.TITLE:       this._updateTitle();      break;
      case GAME_STATE.STORY:       this._updateStory();      break;
      case GAME_STATE.PLAYING:     this._updatePlaying();    break;
      case GAME_STATE.STAGE_CLEAR: this._updateStageClear(); break;
      case GAME_STATE.GAME_OVER:   this._updateGameOver();   break;
      case GAME_STATE.WIN:         this._updateWin();        break;
    }
    this._syncMusic();
  }

  // 상태에 맞는 BGM 자동 전환 (같은 트랙이면 무시됨)
  _syncMusic() {
    let track = null;
    if (this.state === GAME_STATE.TITLE || this.state === GAME_STATE.STORY) track = 'title';
    else if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.STAGE_CLEAR)
      track = this.arena ? 'boss' : 'field';
    if (track) audio.playMusic(track); else audio.stopMusic();
  }

  _updateTitle() {
    if (this._confirmPressed()) { audio.sfx('confirm'); this.state = GAME_STATE.STORY; this.storyPage = 0; }
  }

  _updateStory() {
    if (this._confirmPressed()) {
      audio.sfx('confirm');
      this.storyPage++;
      if (this.storyPage >= STORY_PAGES.length) this._beginGame();
    }
  }

  _updatePlaying() {
    if (this.arena) { this._updateArena(); return; }   // 보스방에 있으면 그쪽 루프

    const { player, stageData, input } = this;

    player.update(input, stageData.platforms);

    if (this.noticeTimer > 0) this.noticeTimer--;
    if (this._checkPotionOrDie()) return;

    // 1라운드: 검을 받기 전엔 장애물이 길을 막음
    const gate = stageData.gate;
    if (gate && player.eq.sword.id === 'none' && player.x + player.w > gate.x) {
      player.x = gate.x - player.w;
      if (player.vx > 0) player.vx = 0;
    }

    // 스테이지 끝 성문: 열쇠 없으면 막힘 / 열쇠 들고 진입 → 스테이지 클리어
    const cg = stageData.castleGate;
    if (cg) {
      if (player.inventory.key >= 1 && player.x + player.w > cg.x + cg.w * 0.4) {
        player.inventory.key = 0;
        this._toStageClear(stageData.bossChain[stageData.bossChain.length - 1]);
        return;
      } else if (player.inventory.key < 1 && player.x + player.w > cg.x) {
        player.x = cg.x - player.w;
        if (player.vx > 0) player.vx = 0;
      }
    }

    // 카메라
    const targetCamX = player.x - VIEW_W / 2 + player.w / 2;
    this.camX = Math.max(0, Math.min(targetCamX, stageData.groundLen - VIEW_W));

    // 일반 적
    for (const e of stageData.enemies) {
      if (e.dead && e.deathTimer <= 0) continue;
      e.update(stageData.platforms, player);
      if (e.pendingShot) {
        const s = e.pendingShot; e.pendingShot = null;
        this.enemyShots.push(new EnemyShot(s.type, s.x, s.y, s.dir, s.atk));
      }
      if (!e.dead) this._resolveCombat(e);
    }
    this._updateEnemyShots();

    // 문 감지 + 입장(상점 / NPC / 보스문)
    this.nearDoor = null;
    for (const d of stageData.doors) {
      const dist = Math.abs((player.x + player.w / 2) - (d.x + d.w / 2));
      if (dist < DOOR_INTERACT_DIST) { this.nearDoor = d; break; }
    }
    if (this.nearDoor && input.wasPressed('ArrowUp')) {
      const d = this.nearDoor, t = d.type;
      if (t === 'quest')                      this._questGift();
      else if (t === 'boss' || t === 'swordboss') {
        if (d.cleared) this._notice('텅 빈 방이다.', 60);
        else this._enterBossArena(d);
      }
      else if (t === 'hospital' || t === 'bar') this.facility.openFacility(t, player, this.stage);
      else this.shop.openShop(t, player, this.stage);
    }

    // 서브웨폰 발동 (아래 방향키)
    if (input.wasPressed('ArrowDown')) this._castMagic();
    this._updateProjectiles();
    this._updatePickups();
  }

  // 하트 소진 처리 (물약 자동 사용 또는 게임오버). 처리로 인해 턴 종료 시 true
  _checkPotionOrDie() {
    const { player } = this;
    if (player.hp > 0) return false;
    if (player.inventory.potion > 0) {
      player.inventory.potion = 0;            // 물약은 보유/소진 2상태(중복 없음)
      player.hp = Math.min(player.maxHp, 5);
      player.invincible = 90;
      audio.sfx('coin');
      this._notice('물약을 사용해 되살아났다!', 120);
      return false;
    }
    this.state = GAME_STATE.GAME_OVER;
    return true;
  }

  // 보스 객체를 아레나 좌표(우측 등장)에 배치
  _placeBossInArena(boss) {
    boss.active = true; boss.dead = false; boss._rewarded = false; boss.deathTimer = 0;
    boss.x = VIEW_W - 140; boss.homeX = boss.x; boss.homeY = GROUND_Y - 48;
    boss.y = boss.flies ? boss.homeY : GROUND_Y - boss.h;
    boss.patrolMin = 80; boss.patrolMax = VIEW_W - boss.w - 40;
    boss.vx = -(boss.speed || 1); boss.tick = 0;
  }

  // 보스문 진입 → 화면 가득한 보스방(아레나). 보스를 직접 상대한다.
  // 방은 전투 전용: 처치하면 보상(검/열쇠)이 방에 드롭, 주우면 방을 나와 필드로 복귀.
  // 검 보스(swordboss)·스테이지 보스(boss) 모두 같은 흐름. 성문은 필드(스테이지 끝)에 있음.
  _enterBossArena(door) {
    const boss = door.boss;
    this._placeBossInArena(boss);
    this._fieldPickups = this.pickups;                 // 필드 수집물 보존(복귀 시 복원)

    this.arena = {
      platforms: [{ x: 0, y: GROUND_Y, w: VIEW_W, h: 60, isGround: true }],
      groundLen: VIEW_W, sky: this.stageData.sky,
      boss, door, drop: door.drop,
      swordReward: door.swordReward || boss.swordReward,
      returnX: door.x + door.w / 2,
      dropped: false,
    };
    const p = this.player;
    p.x = 40; p.y = GROUND_Y - p.h; p.vx = 0; p.vy = 0; p.invincible = 40;
    p.state = 'idle';
    this.camX = 0; this.nearDoor = null;
    this.projectiles = []; this.enemyShots = []; this.pickups = [];
    audio.sfx('roomlock');
    this._notice(`${boss.name} 등장!`, 150);
  }

  // 보상 수집 후 방을 나와 필드로 복귀(들어온 문 위치). 문은 처치완료 표시.
  _exitBossArena() {
    const returnX = this.arena.returnX;
    this.arena.door.cleared = true;
    this.arena = null;
    this.pickups = this._fieldPickups || [];
    this.projectiles = []; this.enemyShots = [];
    const p = this.player;
    p.x = returnX - p.w / 2; p.y = GROUND_Y - p.h; p.vx = 0; p.vy = 0;
    p.invincible = 40; p.state = 'idle';
    this.camX = Math.max(0, Math.min(p.x - VIEW_W / 2 + p.w / 2, this.stageData.groundLen - VIEW_W));
    this.nearDoor = null;
    audio.sfx('roomlock');
  }

  _updateArena() {
    const { player, input, arena } = this;
    const boss = arena.boss;

    player.update(input, arena.platforms);
    if (this.noticeTimer > 0) this.noticeTimer--;
    if (this._checkPotionOrDie()) return;

    this.camX = 0;
    if (player.x < 0) { player.x = 0; if (player.vx < 0) player.vx = 0; }
    if (player.x > VIEW_W - player.w) player.x = VIEW_W - player.w;    // 우측 벽

    // 보스 행동/공방
    if (boss && !(boss.dead && boss.deathTimer <= 0)) {
      boss.update(arena.platforms, player);
      if (!boss.dead) this._resolveCombat(boss);
      if (boss.dead && !arena.dropped) {
        // 처치 → 보상(검/열쇠)을 방 안에 떨어뜨림. 아직 지급 안 함(주워야 함).
        arena.dropped = true;
        audio.sfx('bossdown');
        player.hp = Math.min(player.maxHp, player.hp + 1);            // 격파 시 하트 1칸 회복
        const dx = boss.x + boss.w / 2 - 8, dy = boss.y;
        const opt = arena.drop === 'sword' ? { vy: -3.5, sword: arena.swordReward } : { vy: -3.5 };
        this.pickups.push(new Pickup(arena.drop, dx, dy, opt));
        this._notice(arena.drop === 'sword' ? '검을 떨어뜨렸다! 주워라' : '열쇠를 떨어뜨렸다! 주워라', 300);
      }
    }

    // 방 안의 보상 수집 → 지급 후 방 탈출
    for (const pk of this.pickups) {
      if (pk.dead) continue;
      pk.update(arena.platforms);
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (_overlap(pk.getHitbox(), pb)) {
        pk.dead = true;
        if (pk.type === 'sword') {
          if (arena.swordReward) player.awardSword(arena.swordReward);
          audio.sfx('clear');
          this._notice(`${arena.swordReward ? arena.swordReward.name : '검'} 획득!`, 150);
        } else {                                                       // key
          player.inventory.key = 1;
          audio.sfx('coin');
          this._notice('열쇠 획득! 성문으로 →', 180);
        }
        this._exitBossArena();
        return;
      }
    }

    if (input.wasPressed('ArrowDown')) this._castMagic();
    this._updateProjectiles();
  }

  _notice(text, t) { this.notice = text; this.noticeTimer = t; }

  // 1라운드 첫 NPC: 그라디우스 검 + 물약 지급 (받기 전엔 길이 막혀 진행 불가)
  _questGift() {
    const p = this.player;
    if (this._questGiven) { this._notice('이미 검과 물약을 받았다.', 90); return; }
    this._questGiven = true;
    p.awardSword(SWORD.gradius);
    p.inventory.potion = 1;
    audio.sfx('clear');
    this._notice('용사여! 이 검과 물약을 받아 몬스터랜드를 구해다오!', 260);
  }

  _allTargets() {
    const b = this.arena ? this.arena.boss : this.stageData.boss;
    const bossLive = b && b.active && !(b.dead && b.deathTimer <= 0);
    if (this.arena) return bossLive ? [b] : [];       // 아레나: 현재 보스만 대상
    const t = this.stageData.enemies.filter(e => !(e.dead && e.deathTimer <= 0));
    if (bossLive) t.push(b);
    return t;
  }

  _onEnemyKilled(e) {
    this.player.gold  += e.gold;
    this.player.score += e.score;
    audio.sfx('enemydown');
    this._dropLoot(e);
  }

  // 적 처치 시 확률 드롭. 큰 돈주머니/하트가 튀어나와 직접 주워야 함(원작 보너스 감각)
  _dropLoot(e) {
    if (e.isBoss) return;                       // 보스는 별도 보상(하트+열쇠+검)
    const dx = e.x + e.w / 2 - 8, dy = e.y;
    const r = Math.random();
    if (r < 0.10) {
      this.pickups.push(new Pickup('heart', dx, dy, { vy: -4, vx: (Math.random() - 0.5) * 2, life: 600 }));
    } else if (r < 0.30) {
      this.pickups.push(new Pickup('gold', dx, dy, { vy: -3.5, vx: (Math.random() - 0.5) * 2, amount: e.gold * 3, life: 600 }));
    }
  }

  _updatePickups() {
    const { player } = this;
    const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (const pk of this.pickups) {
      if (pk.dead) continue;
      pk.update(this.stageData.platforms);
      if (_overlap(pk.getHitbox(), pb)) { this._collectPickup(pk); pk.dead = true; }
    }
    this.pickups = this.pickups.filter(pk => !pk.dead);
  }

  _collectPickup(pk) {
    const p = this.player;
    switch (pk.type) {
      case 'gold':
        p.gold += pk.amount; audio.sfx('coin'); this._notice(`+${pk.amount} G`, 60); break;
      case 'heart':
        if (p.maxHp < 10) p.maxHp++;
        p.hp = Math.min(p.maxHp, p.hp + 1);
        audio.sfx('coin'); this._notice('하트 획득! 최대 체력 +1', 100); break;
      case 'potion':
        p.inventory.potion = 1; audio.sfx('coin'); this._notice('물약 획득', 90); break;
      case 'helmet':
        p.gainBuff('helmet'); audio.sfx('clear'); this._notice('투구! 잠시 방어가 강해진다', 110); break;
      case 'gauntlet':
        p.gainBuff('gauntlet'); audio.sfx('clear'); this._notice('건틀릿! 잠시 공격력 +2', 110); break;
      case 'wingboots':
        p.gainBuff('wingboots'); audio.sfx('clear'); this._notice('날개신발! 잠시 높이 도약', 110); break;
    }
  }

  _castMagic() {
    const { player } = this;
    const m = player.useMagic();
    if (!m) { audio.sfx('magic_empty'); return; }
    const swordAtk = player.swordAtk();

    if (m.kind === 'thunder') {
      // 즉발: 화면 내 모든 적에게 '검 공격력' 일괄 1회
      const dmg = Math.max(1, swordAtk);
      for (const e of this._allTargets()) {
        e.takeDamage(dmg);
        if (e.dead) this._onEnemyKilled(e);
      }
      audio.sfx('magic_thunder');
    } else {
      audio.sfx('magic_' + m.kind);   // magic_roll / magic_fly / magic_tornado
    }

    const px = player.facing === 1 ? player.x + player.w : player.x - 18;
    const py = player.y + (m.kind === 'fly' ? 28 : 40);
    this.projectiles.push(new Projectile(m, px, py, player.facing, swordAtk));
  }

  _updateProjectiles() {
    const len = (this.arena || this.stageData).groundLen;
    for (const p of this.projectiles) {
      if (p.dead) continue;
      p.update();
      if (p.x < -60 || p.x > len + 60) { p.dead = true; continue; }
      if (p.kind === 'thunder') continue;  // 피해는 시전 시 처리

      for (const e of this._allTargets()) {
        if (!_overlap(p.getHitbox(), e.getHitbox())) continue;
        const dmg = p.damageFor(e);
        if (dmg > 0) {
          e.takeDamage(dmg);
          if (e.dead) this._onEnemyKilled(e);
          else e.hitKnockback(p.x + p.w / 2, 3);
        }
        if (p.dead) break;
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  _updateEnemyShots() {
    const { player } = this;
    const len = (this.arena || this.stageData).groundLen;
    for (const s of this.enemyShots) {
      if (s.dead) continue;
      s.update();
      if (s.x < -40 || s.x > len + 40) { s.dead = true; continue; }
      if (player.invincible === 0 && !s.deflected &&
          _overlap(s.getHitbox(), { x: player.x, y: player.y, w: player.w, h: player.h })) {
        if (player.takeDamage(s.atk, 'projectile')) { audio.sfx('hurt'); s.dead = true; }   // 못 막음 → 소멸
        else { audio.sfx('hit'); s.deflect(s.x < player.x ? -1 : 1); }                       // 방패로 막음 → 튕김
      }
    }
    this.enemyShots = this.enemyShots.filter(s => !s.dead);
  }

  // 플레이어↔대상(적/보스) 공방 처리
  _resolveCombat(e) {
    const { player } = this;

    const atkBox = player.getAttackBox();
    if (atkBox && !player.attackHit && _overlap(atkBox, e.getHitbox())) {
      e.takeDamage(Math.max(1, player.swordAtk()));
      if (!e.dead) { e.hitKnockback(player.x + player.w / 2); audio.sfx('hit'); }  // 원작: 적도 넉백
      else this._onEnemyKilled(e);
      player.attackHit = true;
    }

    if (player.invincible === 0) {
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (_overlap(pb, e.getHitbox())) {
        if (player.takeDamage(e.atk)) audio.sfx('hurt');
        player.knockback(e.x + e.w / 2);
      }
    }
  }

  _toStageClear(boss) {
    if (this.stageData.final) { this.state = GAME_STATE.WIN; return; }
    audio.sfx('clear');
    this.banner = boss.swordReward
      ? `${this.stageData.roundName} 격파!   ${boss.swordReward.name} 획득!`
      : `${this.stageData.roundName} 격파!`;
    this.state = GAME_STATE.STAGE_CLEAR;
  }

  _updateStageClear() {
    if (this._confirmPressed()) {
      audio.sfx('confirm');
      this._loadStage(this.stage + 1);
      this.state = GAME_STATE.PLAYING;
    }
  }

  _updateGameOver() { if (this._confirmPressed()) { audio.sfx('confirm'); this._restart(); } }
  _updateWin()      { if (this._confirmPressed()) { audio.sfx('confirm'); this._restart(); } }

  _confirmPressed() {
    const i = this.input;
    return i.wasPressed('Enter') || i.wasPressed('KeyZ') || i.wasPressed('Space');
  }

  draw() {
    const { ctx, camX, player, stageData } = this;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 타이틀 / 스토리 화면은 전체 화면 전용 렌더
    if (this.state === GAME_STATE.TITLE) { drawTitle(ctx, this.frame); return; }
    if (this.state === GAME_STATE.STORY) { drawStory(ctx, this.storyPage, this.frame); return; }

    const worldCamX = this.arena ? 0 : camX;

    // 배경 + 스테이지/아레나 (HUD 오른쪽 영역 클립)
    ctx.save();
    ctx.beginPath();
    ctx.rect(HUD_W, 0, VIEW_W, CANVAS_H);
    ctx.clip();

    if (this.arena) {
      drawArena(ctx, this.arena, this.arena.boss);
    } else {
      drawStage(ctx, stageData, camX, player.inventory.key >= 1);
      // 1라운드 장애물 (검 받기 전 통행 차단)
      const gate = stageData.gate;
      if (gate && player.eq.sword.id === 'none') {
        const gx = Math.round(gate.x - camX + HUD_W);
        ctx.fillStyle = '#5a5a5a'; ctx.fillRect(gx, gate.y, gate.w, gate.h);
        ctx.fillStyle = '#777777'; ctx.fillRect(gx + 2, gate.y + 2, gate.w - 4, 8);
        ctx.fillStyle = '#3a3a3a'; ctx.fillRect(gx + 4, gate.y + 14, gate.w - 8, gate.h - 18);
        ctx.fillStyle = '#222222'; ctx.fillRect(gx + gate.w / 2 - 1, gate.y, 2, gate.h);
      }
    }
    for (const pk of this.pickups) pk.draw(ctx, worldCamX);
    for (const p of this.projectiles) p.draw(ctx, worldCamX);
    for (const s of this.enemyShots) s.draw(ctx, worldCamX);
    ctx.restore();

    player.draw(ctx, worldCamX);

    if (this.nearDoor && !this.shop.open && !this.facility.open && this.state === GAME_STATE.PLAYING) {
      const d  = this.nearDoor;
      const sx = d.x - camX + HUD_W + d.w / 2;
      ctx.fillStyle = '#ffff44';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('↑ 입장', sx, d.y - 10);
      ctx.textAlign = 'left';
    }

    drawHUD(ctx, player, this.stage);
    this.shop.draw(ctx);
    this.facility.draw(ctx);

    // 화면 하단 안내 메시지 (NPC 대사, 물약 사용 등)
    if (this.noticeTimer > 0 && !this.shop.open && !this.facility.open) {
      const w = VIEW_W - 40, nx = HUD_W + 20, ny = CANVAS_H - 56;
      ctx.fillStyle = 'rgba(0,0,0,0.80)'; ctx.fillRect(nx, ny, w, 34);
      ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1; ctx.strokeRect(nx, ny, w, 34);
      ctx.fillStyle = '#ffee99'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.notice, HUD_W + VIEW_W / 2, ny + 22);
      ctx.textAlign = 'left';
    }

    if (this.state === GAME_STATE.STAGE_CLEAR)
      this._overlay(ctx, this.banner, 'Z / ENTER : 다음 라운드', '#40ff80');
    else if (this.state === GAME_STATE.GAME_OVER)
      this._overlay(ctx, 'GAME OVER', 'Z / ENTER : 다시 시작', '#ff4040');
    else if (this.state === GAME_STATE.WIN)
      this._overlay(ctx, 'MEKA DRAGON 격파! 클리어!', 'Z / ENTER : 처음부터', '#ffd040');
  }

  _overlay(ctx, title, sub, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(HUD_W, 0, VIEW_W, CANVAS_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = 'bold 17px monospace';
    ctx.fillText(title, HUD_W + VIEW_W / 2, CANVAS_H / 2 - 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.fillText(sub, HUD_W + VIEW_W / 2, CANVAS_H / 2 + 20);
    ctx.textAlign = 'left';
  }
}

function _overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
