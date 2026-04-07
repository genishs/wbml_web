import { GRAVITY, JUMP_FORCE, PLAYER_SPEED } from './constants.js';
import { assets, getPlayerStageSprite, getPlayerAppearanceStage } from './assets.js';
import { getEquipmentAppearanceKeys, getShopItem } from './equipment.js';

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
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.invincible = 0;

    // Stats
    this.maxHp = 10;
    this.hp = 10;
    this.gold = 0;
    this.attack = 0;
    this.defense = 0;
    this.baseMaxHp = 10;
    this.speedMultiplier = 1;
    this.attackRangeBonus = 0;
    this.equipment = {
      sword: null,
      shield: null,
      armor: null,
      boots: null,
    };

    // Animation
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(input, platforms) {
    // Movement
    const speed = PLAYER_SPEED * this.speedMultiplier;
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
    if (input.wasPressed('KeyX') && this.attackCooldown <= 0 && this.hasSword) {
      this.attacking = true;
      this.attackTimer = 18;
      this.attackCooldown = 25;
    }
    if (this.attackTimer > 0) this.attackTimer--;
    else this.attacking = false;
    if (this.attackCooldown > 0) this.attackCooldown--;

    // Gravity
    this.vy += GRAVITY;
    if (this.invincible > 0) {
      this.knockbackY += GRAVITY * 0.25;
    }
    this.x += this.vx + this.knockbackX;
    this.y += this.vy + this.knockbackY;

    // Platform collision
    this.onGround = false;
    for (const p of platforms) {
      if (this._collides(p)) {
        // from above
        if (this.vy + this.knockbackY >= 0 && this.y + this.h - (this.vy + this.knockbackY) <= p.y + 2) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.knockbackY = 0;
          this.onGround = true;
        } else if (this.vy + this.knockbackY < 0 && this.y - (this.vy + this.knockbackY) >= p.y + p.h - 2) {
          this.y = p.y + p.h;
          this.vy = 0;
          this.knockbackY = 0;
        } else if (this.vx + this.knockbackX > 0) {
          this.x = p.x - this.w;
          this.vx = 0;
          this.knockbackX = 0;
        } else if (this.vx + this.knockbackX < 0) {
          this.x = p.x + p.w;
          this.vx = 0;
          this.knockbackX = 0;
        }
      }
    }

    if (this.invincible > 0) {
      this.invincible--;
      this.knockbackX *= 0.78;
      this.knockbackY *= 0.84;
      if (Math.abs(this.knockbackX) < 0.05) this.knockbackX = 0;
      if (Math.abs(this.knockbackY) < 0.05) this.knockbackY = 0;
    }

    // Animation frame cycling
    this.frameTimer++;
    const isMoving = Math.abs(this.vx) > 0.5;
    const frameTick = isMoving ? 7 : 12;
    if (this.frameTimer > frameTick) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % 2;
    }
  }

  _collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  getAttackBox() {
    if (!this.attacking || !this.hasSword) return null;
    const range = 20 + this.attackRangeBonus;
    return {
      x: this.facing > 0 ? this.x + this.w : this.x - range,
      y: this.y + 4,
      w: range,
      h: 16,
    };
  }

  takeDamage(amount, knockbackDir = 0) {
    if (this.invincible > 0) return;
    const dmg = Math.max(1, amount - this.defense);
    this.hp -= dmg;
    this.invincible = 90;
    this.knockbackX = knockbackDir * 6.2;
    this.knockbackY = -3.6;
    if (this.hp < 0) this.hp = 0;
  }

  equip(itemId) {
    const item = getShopItem(itemId);
    if (!item) return;
    if (item.slot) {
      this.equipment[item.slot] = item.id;
      this.recalculateStats();
      return;
    }
    if (item.id === 'potion') {
      this.hp = this.maxHp;
    }
  }

  recalculateStats() {
    this.attack = 0;
    this.defense = 0;
    this.maxHp = this.baseMaxHp;
    this.speedMultiplier = 1;
    this.attackRangeBonus = 0;

    Object.values(this.equipment).forEach(itemId => {
      const item = getShopItem(itemId);
      if (!item) return;
      this.attack += item.bonuses.attack || 0;
      if (item.slot === 'armor') {
        this.defense += item.bonuses.defense || 0;
      }
      this.maxHp += item.bonuses.maxHp || 0;
      this.speedMultiplier = Math.max(this.speedMultiplier, item.bonuses.speedMultiplier || 1);
      this.attackRangeBonus += item.bonuses.range || 0;
    });

    this.hp = Math.min(this.hp, this.maxHp);
  }

  hasEquipment(slot) {
    return !!this.equipment[slot];
  }

  get hasSword() { return this.hasEquipment('sword'); }
  get hasShield() { return this.hasEquipment('shield'); }
  get hasArmor() { return this.hasEquipment('armor'); }
  get hasBoots() { return this.hasEquipment('boots'); }

  _getAnimFrame() {
    const stageIdx = Math.min(
      (assets.playerFrames?.length ?? 1) - 1,
      Math.max(0, this._appearanceStage ?? 0)
    );
    const frameSet = assets.playerFrames?.[stageIdx];
    if (!frameSet) return getPlayerStageSprite(this); // fallback

    if (this.attacking) {
      // atk1 → atk2 를 attackTimer 기준으로 전환
      return this.attackTimer > 9 ? frameSet.atk1 : frameSet.atk2;
    }

    const isMoving = Math.abs(this.vx) > 0.5;
    if (!isMoving || !this.onGround) return frameSet.idle;
    return this.frame === 0 ? frameSet.walk1 : frameSet.walk2;
  }

  draw(ctx, camX, sprites) {
    const px = this.x - camX;
    const py = this.y;

    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) return;

    this._appearanceStage = getPlayerAppearanceStage(this);

    const frameImg = this._getAnimFrame();
    const appearance = getEquipmentAppearanceKeys(this);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (this.facing < 0) {
      ctx.translate(px + this.w, py);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(px, py);
    }

    const isMoving = Math.abs(this.vx) > 0.5;
    let bobY = 0;
    if (isMoving && this.onGround && !this.attacking && this.frame === 1) {
      bobY = 1;
    }
    
    ctx.translate(0, bobY);

    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, this.w, this.h);
    } else {
      ctx.fillStyle = '#f0c040';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    this.drawEquipment(ctx, appearance, sprites);

    ctx.restore();
  }

  drawEquipment(ctx, appearance, sprites) {
    const armorImg = appearance.armor ? assets.items[appearance.armor] : null;
    if (armorImg) {
      ctx.drawImage(armorImg, 5, 6, 14, 14);
    }

    const bootsImg = appearance.boots ? assets.items[appearance.boots] : null;
    if (bootsImg) {
      ctx.drawImage(bootsImg, 6, 18, 12, 8);
    }

    const shieldImg = appearance.shield ? assets.items[appearance.shield] : null;
    if (shieldImg) {
      ctx.drawImage(shieldImg, -7, 5, 11, 14);
    }

    let swordImg = null;
    if (appearance.sword && sprites && sprites.weapons && sprites.weapons[appearance.sword]) {
        swordImg = sprites.weapons[appearance.sword];
    } else if (appearance.sword) {
        swordImg = assets.items[appearance.sword];
    }

    if (swordImg) {
      ctx.save();
      if (this.attacking) {
        ctx.translate(14, 12);
        ctx.drawImage(swordImg, 0, -4, 18, 8);
      } else {
        ctx.translate(10, 10);
        ctx.rotate(-Math.PI / 2.2);
        ctx.drawImage(swordImg, 0, -4, 18, 8);
      }
      ctx.restore();
    }
  }
}
