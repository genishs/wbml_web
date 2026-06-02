import { CANVAS_W, CANVAS_H, HUD_W, VIEW_W, GAME_STATE, GROUND_Y } from './constants.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { buildStage, drawStage } from './stage.js';
import { Shop } from './shop.js';
import { drawHUD } from './ui.js';

const DOOR_INTERACT_DIST = 30;

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx ?? canvas.getContext('2d');
    this.input  = new Input();
    this.shop   = new Shop();
    this._loop  = this._loop.bind(this);
    this._restart();
  }

  _restart() {
    this.player = new Player(160, GROUND_Y - 72);
    this.banner = '';
    this._loadStage(1);
    this.state = GAME_STATE.PLAYING;
  }

  _loadStage(n) {
    this.stage     = n;
    this.stageData = buildStage(n);
    this.camX      = 0;
    this.nearDoor  = null;
    this.shop.close();
    // 라운드 시작 위치로 플레이어 복귀 (장비/점수/하트는 유지)
    const p = this.player;
    p.x = 160; p.y = GROUND_Y - 72; p.vx = 0; p.vy = 0;
    p.state = 'idle'; p.invincible = 0;
    p.timer = p.timerMax;
  }

  start() { requestAnimationFrame(this._loop); }

  _loop() {
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

    switch (this.state) {
      case GAME_STATE.PLAYING:     this._updatePlaying();    break;
      case GAME_STATE.STAGE_CLEAR: this._updateStageClear(); break;
      case GAME_STATE.GAME_OVER:   this._updateGameOver();   break;
      case GAME_STATE.WIN:         this._updateWin();        break;
    }
  }

  _updatePlaying() {
    const { player, stageData, input } = this;

    player.update(input, stageData.platforms);

    // 하트 소진(피격 또는 타이머 누적) → 게임오버
    if (player.hp <= 0) { this.state = GAME_STATE.GAME_OVER; return; }

    // 카메라
    const targetCamX = player.x - VIEW_W / 2 + player.w / 2;
    this.camX = Math.max(0, Math.min(targetCamX, stageData.groundLen - VIEW_W));

    // 일반 적
    for (const e of stageData.enemies) {
      if (e.dead && e.deathTimer <= 0) continue;
      e.update(stageData.platforms);
      if (!e.dead) this._resolveCombat(e);
    }

    // 보스
    const boss = stageData.boss;
    if (boss && !(boss.dead && boss.deathTimer <= 0)) {
      boss.update(stageData.platforms, player);
      if (!boss.dead) this._resolveCombat(boss);
      if (boss.dead && !boss._rewarded) {
        boss._rewarded = true;
        if (boss.swordReward) player.awardSword(boss.swordReward);
        this._toStageClear(boss);
      }
    }

    // 상점 문 감지 + 입장
    this.nearDoor = null;
    for (const d of stageData.doors) {
      const dist = Math.abs((player.x + player.w / 2) - (d.x + d.w / 2));
      if (dist < DOOR_INTERACT_DIST) { this.nearDoor = d; break; }
    }
    if (this.nearDoor && input.wasPressed('ArrowUp')) {
      this.shop.openShop(this.nearDoor.type, player);
    }
  }

  // 플레이어↔대상(적/보스) 공방 처리
  _resolveCombat(e) {
    const { player } = this;

    const atkBox = player.getAttackBox();
    if (atkBox && !player.attackHit && _overlap(atkBox, e.getHitbox())) {
      e.takeDamage(player.eq.sword?.atk ?? 1);
      if (e.dead) { player.gold += e.gold; player.score += e.score; }
      player.attackHit = true;
    }

    if (player.invincible === 0) {
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (_overlap(pb, e.getHitbox())) {
        player.takeDamage(e.atk);
        player.knockback(e.x + e.w / 2);
      }
    }
  }

  _toStageClear(boss) {
    if (this.stageData.final) { this.state = GAME_STATE.WIN; return; }
    this.banner = boss.swordReward
      ? `${this.stageData.roundName} 격파!   ${boss.swordReward.name} 획득!`
      : `${this.stageData.roundName} 격파!`;
    this.state = GAME_STATE.STAGE_CLEAR;
  }

  _updateStageClear() {
    if (this._confirmPressed()) {
      this._loadStage(this.stage + 1);
      this.state = GAME_STATE.PLAYING;
    }
  }

  _updateGameOver() { if (this._confirmPressed()) this._restart(); }
  _updateWin()      { if (this._confirmPressed()) this._restart(); }

  _confirmPressed() {
    const i = this.input;
    return i.wasPressed('Enter') || i.wasPressed('KeyZ') || i.wasPressed('Space');
  }

  draw() {
    const { ctx, camX, player, stageData } = this;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 배경 + 스테이지 (HUD 오른쪽 영역 클립)
    ctx.save();
    ctx.beginPath();
    ctx.rect(HUD_W, 0, VIEW_W, CANVAS_H);
    ctx.clip();
    drawStage(ctx, stageData, camX);
    ctx.restore();

    player.draw(ctx, camX);

    if (this.nearDoor && !this.shop.open && this.state === GAME_STATE.PLAYING) {
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
