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
    this.state  = GAME_STATE.PLAYING;
    this.stage  = 1;

    this.player    = new Player(160, GROUND_Y - 72);
    this.stageData = buildStage(this.stage);
    this.camX      = 0;

    this.shop = new Shop();
    this.nearDoor = null;   // 현재 가까운 문

    this._loop = this._loop.bind(this);
  }

  start() { requestAnimationFrame(this._loop); }

  _loop() {
    this.input.update();
    this.update();
    this.draw();
    requestAnimationFrame(this._loop);
  }

  update() {
    if (this.shop.open) {
      this.shop.update(this.input);
      if (!this.shop.open) this.nearDoor = null;
      return;
    }

    if (this.state === GAME_STATE.PLAYING) {
      this._updatePlaying();
    }
  }

  _updatePlaying() {
    const { player, stageData, input } = this;

    // 플레이어 업데이트
    player.update(input, stageData.platforms);

    // 카메라 (뷰포트 중앙 트래킹)
    const targetCamX = player.x - VIEW_W / 2 + player.w / 2;
    this.camX = Math.max(0, Math.min(targetCamX, stageData.groundLen - VIEW_W));

    // 적 업데이트 + 전투
    for (const e of stageData.enemies) {
      if (e.dead && e.deathTimer <= 0) continue;
      e.update(stageData.platforms);

      if (e.dead) continue;

      // 플레이어 공격 → 적
      const atkBox = player.getAttackBox();
      if (atkBox && !player.attackHit) {
        const hb = e.getHitbox();
        if (_overlap(atkBox, hb)) {
          e.takeDamage(player.eq.sword?.atk ?? 1);
          if (e.dead) {
            player.gold += e.gold;
            player.score += e.score;
          }
          player.attackHit = true;
        }
      }

      // 적 → 플레이어 접촉 데미지
      if (player.invincible === 0) {
        const hb = e.getHitbox();
        const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
        if (_overlap(pb, hb)) {
          player.takeDamage(e.atk);
          player.knockback(e.x + e.w / 2);
        }
      }
    }

    // 상점 문 감지
    this.nearDoor = null;
    for (const d of stageData.doors) {
      const dist = Math.abs((player.x + player.w / 2) - (d.x + d.w / 2));
      if (dist < DOOR_INTERACT_DIST) {
        this.nearDoor = d;
        break;
      }
    }

    // 상점 입장 (위 방향키)
    if (this.nearDoor && input.wasPressed('ArrowUp')) {
      this.shop.openShop(this.nearDoor.type, player);
    }
  }

  draw() {
    const { ctx, camX, player, stageData } = this;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 배경 + 스테이지 (HUD 오른쪽 영역)
    ctx.save();
    ctx.beginPath();
    ctx.rect(HUD_W, 0, VIEW_W, CANVAS_H);
    ctx.clip();
    drawStage(ctx, stageData, camX);
    ctx.restore();

    // 플레이어
    player.draw(ctx, camX);

    // 문 상호작용 힌트
    if (this.nearDoor && !this.shop.open) {
      const d = this.nearDoor;
      const sx = d.x - camX + HUD_W + d.w / 2;
      ctx.fillStyle = '#ffff44';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('↑ 입장', sx, d.y - 10);
      ctx.textAlign = 'left';
    }

    // HUD
    drawHUD(ctx, player, this.stage);

    // 상점 오버레이
    this.shop.draw(ctx);
  }
}

function _overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
