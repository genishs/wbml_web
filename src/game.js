import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATE, COLORS } from './constants.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Shop } from './shop.js';
import { buildStage, drawPlatforms, drawDoors, drawPickups, drawGoal, drawRoom } from './stage.js';
import { drawHUD, drawTitleScreen, drawGameOver, drawStageClear, drawSignpostMessage } from './ui.js';
import { sprites } from './sprites.js';
import { assets } from './assets.js';
import { drawSignposts, getNearbySignpost } from './signpost.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.state = GAME_STATE.TITLE;
    this.stage = 1;
    this.score = 0;
    this.player = null;
    this.stageData = null;
    this.camX = 0;
    this.timer = 0;
    this.maxTimer = 120 * 60; // 120 seconds
    this.shop = new Shop();
    this.inShop = false;
    this.currentRoomId = null;
    this.roomReturn = null;
    this.particles = [];
    this.lastTime = 0;
    this.activeSignpost = null;
  }

  start() {
    requestAnimationFrame(t => this.loop(t));
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 16.67, 3);
    this.lastTime = timestamp;
    this.input.update();
    this.update();
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  initStage({ preservePlayer = false } = {}) {
    this.stageData = buildStage(this.stage);
    if (!preservePlayer || !this.player) {
      this.player = new Player(80, 200);
    } else {
      this.player.x = 80;
      this.player.y = 200;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.knockbackX = 0;
      this.player.knockbackY = 0;
      this.player.invincible = 0;
      this.player.attacking = false;
      this.player.attackTimer = 0;
      this.player.attackCooldown = 0;
    }
    this.camX = 0;
    this.timer = this.maxTimer - this.stage * 10 * 60;
    this.inShop = false;
    this.currentRoomId = null;
    this.roomReturn = null;
    this.particles = [];
    this.activeSignpost = null;
  }

  update() {
    const { input } = this;

    if (this.state === GAME_STATE.TITLE) {
      if (input.wasPressed('Enter')) {
        this.stage = 1;
        this.score = 0;
        this.initStage();
        this.state = GAME_STATE.PLAYING;
      }
      return;
    }

    if (this.state === GAME_STATE.GAME_OVER) {
      if (input.wasPressed('Enter')) {
        this.stage = 1;
        this.score = 0;
        this.initStage();
        this.state = GAME_STATE.PLAYING;
      }
      return;
    }

    if (this.state === GAME_STATE.STAGE_CLEAR) {
      if (input.wasPressed('Enter')) {
        this.stage++;
        if (this.stage > 2) this.stage = 1; // loop back
        this.initStage({ preservePlayer: true });
        this.state = GAME_STATE.PLAYING;
      }
      return;
    }

    if (this.state !== GAME_STATE.PLAYING) return;

    const { player, stageData } = this;

    if (this.currentRoomId) {
      this.updateRoom();
      return;
    }

    // Shop mode
    if (this.inShop) {
      const result = this.shop.update(input, player);
      if (result === 'exit') this.inShop = false;
      return;
    }

    // Update player
    player.update(input, stageData.platforms);

    // Clamp player to stage bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > stageData.groundLen) player.x = stageData.groundLen - player.w;

    // Camera follow
    const targetCam = player.x - CANVAS_WIDTH / 3;
    this.camX += (targetCam - this.camX) * 0.12;
    this.camX = Math.max(0, Math.min(this.camX, stageData.groundLen - CANVAS_WIDTH));
    this.activeSignpost = getNearbySignpost(player, stageData.signposts);

    // Timer
    this.timer--;
    if (this.timer <= 0) {
      player.hp = 0;
    }

    // Pickups
    for (const pickup of stageData.pickups) {
      if (pickup.collected) continue;
      if (this._overlaps(player, { x: pickup.x, y: pickup.y, w: 12, h: 12 })) {
        pickup.collected = true;
        if (pickup.type === 'gold') {
          player.gold += pickup.value;
          this.score += pickup.value;
          this.spawnParticles(pickup.x, pickup.y, '#ffd700', 6);
        }
      }
    }

    // Enemies
    for (const enemy of stageData.enemies) {
      if (enemy.dead && enemy.deathTimer <= 0) continue;
      enemy.update(stageData.platforms, player);

      if (!enemy.dead) {
        // Player attack hits enemy
        const atkBox = player.getAttackBox();
        if (atkBox && enemy.collidesWith(atkBox)) {
          if (enemy.takeDamage(player.attack, player.facing)) {
            if (enemy.dead) {
              player.gold += enemy.gold;
              this.score += enemy.score;
              this.spawnParticles(enemy.x + enemy.w / 2, enemy.y, '#ffffff', 10);
            }
          }
        }

        // Enemy touches player
        if (this._overlaps(player, enemy)) {
          const knockbackDir = player.x < enemy.x ? -1 : 1;
          player.takeDamage(enemy.atk, knockbackDir);
          if (player.invincible > 80) {
            this.spawnParticles(player.x + player.w / 2, player.y, '#ff4444', 5);
          }
        }
      }
    }

    // Doors
    for (const door of stageData.doors) {
      if (this._overlaps(player, door) && input.wasPressed('Enter')) {
        this.enterRoom(door.roomId, door);
        return;
      }
    }

    // Goal check
    if (player.x + player.w > stageData.goalX) {
      this.score += Math.ceil(this.timer / 60) * 10;
      this.state = GAME_STATE.STAGE_CLEAR;
    }

    // Fall into pit
    if (player.y > CANVAS_HEIGHT + 100) {
      player.hp = 0;
    }

    // Game over
    if (player.hp <= 0) {
      this.state = GAME_STATE.GAME_OVER;
    }

    // Particles
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
    }
  }

  draw() {
    const { ctx, stageData } = this;

    if (this.state === GAME_STATE.TITLE) {
      drawTitleScreen(ctx, assets);
      return;
    }
    if (this.state === GAME_STATE.GAME_OVER) {
      this._drawPlayfield();
      drawGameOver(ctx, this.score);
      return;
    }
    if (this.state === GAME_STATE.STAGE_CLEAR) {
      this._drawPlayfield();
      drawStageClear(ctx, this.stage, this.score);
      return;
    }

    if (this.currentRoomId) {
      this._drawRoom();
      if (this.inShop) {
        this.shop.draw(ctx, this.player, assets);
      }
      return;
    }

    this._drawPlayfield();

    if (this.inShop) {
      this.shop.draw(ctx, this.player, assets);
    }
  }

  _drawPlayfield() {
    const { ctx, stageData, player } = this;
    if (!stageData) return;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#5c94fc');
    grad.addColorStop(1, '#90c8fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background mountains
    this._drawBG();

    drawPlatforms(ctx, stageData.platforms, this.camX);
    drawDoors(ctx, stageData.doors, this.camX, assets);
    drawSignposts(ctx, stageData.signposts, this.camX, this.activeSignpost);
    drawPickups(ctx, stageData.pickups, this.camX);
    drawGoal(ctx, stageData.goalX, this.camX, 312);

    // Door prompt
    for (const door of stageData.doors) {
      if (this._overlaps(player, door)) {
        const px = door.x - this.camX + door.w / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`ENTER: ${door.roomType === 'boss' ? '문 열기' : '상점 입장'}`, px, door.y - 12);
        ctx.textAlign = 'left';
      }
    }

    // Enemies
    for (const enemy of stageData.enemies) {
      if (enemy.dead && enemy.deathTimer <= 0) continue;
      enemy.draw(ctx, this.camX, sprites);
    }

    player.draw(ctx, this.camX, sprites);

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - this.camX - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    drawHUD(ctx, player, this.timer, this.stage, this.score, assets);
    drawSignpostMessage(ctx, this.activeSignpost);
  }

  _drawRoom() {
    const room = this.stageData.rooms[this.currentRoomId];
    const { ctx, player } = this;
    if (!room) return;

    drawRoom(ctx, room, assets);

    if (room.type === 'shop') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText('상인과 바로 거래 중', room.merchant.x - 22, room.merchant.y - 8);
    } else if (room.type === 'boss') {
      ctx.fillStyle = '#ffcc88';
      ctx.font = '11px monospace';
      ctx.fillText('ESC/Z: 방 나가기', room.exitDoor.x - 4, room.exitDoor.y - 10);
    }

    for (const enemy of room.enemies) {
      if (enemy.dead && enemy.deathTimer <= 0) continue;
      enemy.draw(ctx, 0, sprites);
    }

    player.draw(ctx, 0, sprites);

    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    drawHUD(ctx, player, this.timer, this.stage, this.score, assets);
  }

  enterRoom(roomId, door) {
    const room = this.stageData.rooms[roomId];
    if (!room) return;
    this.currentRoomId = roomId;
    this.roomReturn = { x: door.x, y: door.y };
    this.activeSignpost = null;
    this.player.x = room.entryX;
    this.player.y = room.entryY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.camX = 0;
    this.inShop = room.type === 'shop';
    if (this.inShop) {
      this.shop.open(room.shopType);
      this.player.x = room.merchant.x - 76;
      this.player.y = room.entryY;
    }
  }

  exitRoom() {
    if (!this.roomReturn) return;
    this.player.x = this.roomReturn.x + 8;
    this.player.y = this.roomReturn.y - this.player.h;
    this.player.vx = 0;
    this.player.vy = 0;
    this.currentRoomId = null;
    this.inShop = false;
    this.activeSignpost = null;
    this.camX = Math.max(0, Math.min(this.player.x - CANVAS_WIDTH / 3, this.stageData.groundLen - CANVAS_WIDTH));
  }

  updateRoom() {
    const room = this.stageData.rooms[this.currentRoomId];
    const { input, player } = this;
    if (!room) return;

    if (this.inShop) {
      const result = this.shop.update(input, player);
      if (result === 'exit') {
        this.inShop = false;
        this.exitRoom();
      }
      return;
    }

    if (room.type === 'shop') {
      this.exitRoom();
      return;
    }

    player.update(input, room.platforms);
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.w;

    this.timer--;
    if (this.timer <= 0) player.hp = 0;

    for (const enemy of room.enemies) {
      if (enemy.dead && enemy.deathTimer <= 0) continue;
      enemy.update(room.platforms, player);

      if (!enemy.dead) {
        const atkBox = player.getAttackBox();
        if (atkBox && enemy.collidesWith(atkBox)) {
          if (enemy.takeDamage(player.attack, player.facing) && enemy.dead) {
            player.gold += enemy.gold;
            this.score += enemy.score;
            this.spawnParticles(enemy.x + enemy.w / 2, enemy.y, '#ffffff', 10);
          }
        }

        if (this._overlaps(player, enemy)) {
          const knockbackDir = player.x < enemy.x ? -1 : 1;
          player.takeDamage(enemy.atk, knockbackDir);
          if (player.invincible > 80) {
            this.spawnParticles(player.x + player.w / 2, player.y, '#ff4444', 5);
          }
        }
      }
    }

    const bossAlive = room.enemies.some(enemy => !enemy.dead || enemy.deathTimer > 0);
    if (room.type === 'boss' && !bossAlive) {
      room.cleared = true;
    }

    if ((this._overlaps(player, room.exitDoor) && input.wasPressed('Enter')) ||
        input.wasPressed('Escape') || input.wasPressed('KeyZ')) {
      this.exitRoom();
      return;
    }

    if (player.hp <= 0) {
      this.state = GAME_STATE.GAME_OVER;
    }

    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
    }
  }

  _drawBG() {
    const ctx = this.ctx;
    const parallax = this.camX * 0.3;
    ctx.fillStyle = '#7070a0';
    for (let i = 0; i < 5; i++) {
      const mx = ((i * 300 - parallax) % 700) - 50;
      const mh = 80 + i * 20;
      ctx.beginPath();
      ctx.moveTo(mx, 312);
      ctx.lineTo(mx + 60, 312 - mh);
      ctx.lineTo(mx + 120, 312);
      ctx.fill();
    }
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color,
        life: 30 + Math.random() * 20,
        maxLife: 50,
      });
    }
  }

  _overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }
}
