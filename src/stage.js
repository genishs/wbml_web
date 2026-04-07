import { TILE_SIZE, COLORS } from './constants.js';
import { Enemy } from './enemy.js';
import { SHOP_TYPE } from './equipment.js';
import { createSignpost } from './signpost.js';

// Each stage: platforms, enemies, shop positions, goal
export function buildStage(stageNum) {
  const groundY = 312;
  const platforms = [];
  const enemies = [];
  const pickups = [];
  const doors = [];
  const rooms = {};
  const signposts = [];

  // Ground (always)
  const groundLen = 2400 + stageNum * 800;
  platforms.push({ x: 0, y: groundY, w: groundLen, h: 48, isGround: true });

  // Stage-specific layout
  if (stageNum === 1) {
    platforms.push({ x: 300, y: 252, w: 84, h: 16 });
    platforms.push({ x: 640, y: 224, w: 92, h: 16 });
    platforms.push({ x: 980, y: 244, w: 112, h: 16 });
    platforms.push({ x: 1300, y: 212, w: 88, h: 16 });
    platforms.push({ x: 1620, y: 238, w: 120, h: 16 });

    enemies.push(new Enemy('snake', 760, groundY - 12));
    enemies.push(new Enemy('anaconda', 930, groundY - 14, { patrolMinX: 860, patrolMaxX: 1030 }));
    enemies.push(new Enemy('snake', 1180, groundY - 12));
    enemies.push(new Enemy('anaconda', 1460, groundY - 14, { patrolMinX: 1390, patrolMaxX: 1570 }));
    enemies.push(new Enemy('snake', 1730, groundY - 12));

    signposts.push(createSignpost({
      x: 112,
      y: groundY - 28,
      title: '무기 상점',
      message: '앞의 상점에서 무기를 구매하라.',
    }));

    doors.push(makeDoor('shop-1a', 190, groundY, 'shop', SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-1b', 1240, groundY, 'shop', SHOP_TYPE.SHIELD));
    doors.push(makeDoor('boss-1', 1840, groundY, 'boss'));

    // Gold pickups
    for (let i = 0; i < 12; i++) {
      pickups.push({ x: 150 + i * 150, y: groundY - 32, type: 'gold', value: 10, collected: false });
    }
  } else if (stageNum === 2) {
    platforms.push({ x: 250, y: 248, w: 90, h: 16 });
    platforms.push({ x: 520, y: 212, w: 120, h: 16 });
    platforms.push({ x: 840, y: 172, w: 80, h: 16 });
    platforms.push({ x: 1160, y: 228, w: 100, h: 16 });
    platforms.push({ x: 1460, y: 190, w: 88, h: 16 });
    platforms.push({ x: 1760, y: 236, w: 118, h: 16 });
    platforms.push({ x: 2140, y: 220, w: 92, h: 16 });

    enemies.push(new Enemy('orc', 420, groundY - 26));
    enemies.push(new Enemy('goblin', 720, groundY - 26));
    enemies.push(new Enemy('fangBat', 900, 170));
    enemies.push(new Enemy('myconid', 1160, groundY - 20));
    enemies.push(new Enemy('orc', 1490, groundY - 26));
    enemies.push(new Enemy('goblin', 1860, groundY - 26));
    enemies.push(new Enemy('vampireBat', 2170, 176));

    doors.push(makeDoor('shop-2a', 340, groundY, 'shop', SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-2b', 1320, groundY, 'shop', SHOP_TYPE.SHIELD));
    doors.push(makeDoor('shop-2c', 2060, groundY, 'shop', SHOP_TYPE.BOOTS));
    doors.push(makeDoor('boss-2', 2360, groundY, 'boss'));

    for (let i = 0; i < 15; i++) {
      pickups.push({ x: 200 + i * 160, y: groundY - 32, type: 'gold', value: 15, collected: false });
    }
  } else if (stageNum === 3) {
    platforms.push({ x: 300, y: 248, w: 90, h: 16 });
    platforms.push({ x: 640, y: 212, w: 100, h: 16 });
    platforms.push({ x: 1000, y: 180, w: 80, h: 16 });
    platforms.push({ x: 1360, y: 224, w: 110, h: 16 });
    platforms.push({ x: 1720, y: 192, w: 90, h: 16 });
    platforms.push({ x: 2100, y: 236, w: 120, h: 16 });

    enemies.push(new Enemy('knight', 480, groundY - 28));
    enemies.push(new Enemy('orc', 760, groundY - 26));
    enemies.push(new Enemy('goblin', 1040, groundY - 26));
    enemies.push(new Enemy('knight', 1400, groundY - 28));
    enemies.push(new Enemy('orc', 1760, groundY - 26));

    doors.push(makeDoor('shop-3a', 190, groundY, 'shop', SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-3b', 1180, groundY, 'shop', SHOP_TYPE.ARMOR));
    doors.push(makeDoor('boss-3', 2160, groundY, 'boss'));

    for (let i = 0; i < 18; i++) {
      pickups.push({ x: 200 + i * 170, y: groundY - 32, type: 'gold', value: 20, collected: false });
    }
  } else if (stageNum === 4) {
    platforms.push({ x: 280, y: 240, w: 100, h: 16 });
    platforms.push({ x: 600, y: 200, w: 90, h: 16 });
    platforms.push({ x: 960, y: 168, w: 80, h: 16 });
    platforms.push({ x: 1320, y: 216, w: 110, h: 16 });
    platforms.push({ x: 1680, y: 180, w: 88, h: 16 });
    platforms.push({ x: 2060, y: 228, w: 100, h: 16 });
    platforms.push({ x: 2460, y: 200, w: 90, h: 16 });

    enemies.push(new Enemy('redKnight', 440, groundY - 28));
    enemies.push(new Enemy('knight', 720, groundY - 28));
    enemies.push(new Enemy('orc', 1000, groundY - 26));
    enemies.push(new Enemy('redKnight', 1380, groundY - 28));
    enemies.push(new Enemy('knight', 1740, groundY - 28));
    enemies.push(new Enemy('orc', 2120, groundY - 26));

    doors.push(makeDoor('shop-4a', 190, groundY, 'shop', SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-4b', 1200, groundY, 'shop', SHOP_TYPE.SHIELD));
    doors.push(makeDoor('shop-4c', 2200, groundY, 'shop', SHOP_TYPE.ARMOR));
    doors.push(makeDoor('boss-4', 2760, groundY, 'boss'));

    for (let i = 0; i < 20; i++) {
      pickups.push({ x: 200 + i * 180, y: groundY - 32, type: 'gold', value: 25, collected: false });
    }
  } else if (stageNum === 5) {
    platforms.push({ x: 300, y: 236, w: 100, h: 16 });
    platforms.push({ x: 620, y: 196, w: 90, h: 16 });
    platforms.push({ x: 980, y: 160, w: 80, h: 16 });
    platforms.push({ x: 1360, y: 208, w: 110, h: 16 });
    platforms.push({ x: 1740, y: 172, w: 88, h: 16 });
    platforms.push({ x: 2120, y: 220, w: 100, h: 16 });
    platforms.push({ x: 2540, y: 188, w: 92, h: 16 });
    platforms.push({ x: 2940, y: 228, w: 120, h: 16 });

    enemies.push(new Enemy('silverKnight', 460, groundY - 28));
    enemies.push(new Enemy('redKnight', 740, groundY - 28));
    enemies.push(new Enemy('knight', 1020, groundY - 28));
    enemies.push(new Enemy('silverKnight', 1420, groundY - 28));
    enemies.push(new Enemy('redKnight', 1800, groundY - 28));
    enemies.push(new Enemy('knight', 2180, groundY - 28));
    enemies.push(new Enemy('silverKnight', 2600, groundY - 28));

    doors.push(makeDoor('shop-5a', 190, groundY, 'shop', SHOP_TYPE.WEAPON));
    doors.push(makeDoor('shop-5b', 1300, groundY, 'shop', SHOP_TYPE.ARMOR));
    doors.push(makeDoor('shop-5c', 2400, groundY, 'shop', SHOP_TYPE.SHIELD));
    doors.push(makeDoor('boss-5', 3200, groundY, 'boss'));

    for (let i = 0; i < 24; i++) {
      pickups.push({ x: 200 + i * 180, y: groundY - 32, type: 'gold', value: 30, collected: false });
    }
  }

  for (const door of doors) {
    rooms[door.roomId] = buildRoom(door, stageNum);
  }

  const goalX = groundLen - 120;

  return { platforms, enemies, pickups, doors, rooms, signposts, goalX, groundLen };
}

function makeDoor(id, x, groundY, roomType, shopType = null) {
  return {
    id,
    x,
    y: groundY - 52,
    w: 40,
    h: 52,
    roomId: id,
    roomType,
    shopType,
  };
}

function buildRoom(door, stageNum) {
  const roomGroundY = 312;
  const platforms = [{ x: 0, y: roomGroundY, w: 640, h: 48, isGround: true }];
  const enemies = [];
  const merchant = { x: 470, y: roomGroundY - 56, w: 56, h: 56 };
  const exitDoor = { x: 56, y: roomGroundY - 52, w: 40, h: 52 };

  if (door.roomType === 'boss') {
    const bossType = getBossType(stageNum);
    const bossX = bossType === 'dragon' ? 400 : 430;
    const bossY = bossType === 'death' ? roomGroundY - 84 : bossType === 'mushroomKing' ? roomGroundY - 28 : roomGroundY - 40;
    enemies.push(new Enemy(bossType, bossX, bossY));
  }

  return {
    id: door.id,
    type: door.roomType,
    shopType: door.shopType,
    platforms,
    enemies,
    merchant,
    exitDoor,
    entryX: 112,
    entryY: roomGroundY - 28,
    worldDoorId: door.id,
    cleared: false,
  };
}

function getBossType(stageNum) {
  switch (stageNum) {
    case 1: return 'death';
    case 2: return 'mushroomKing';
    case 3: return 'dragon';
    case 4: return 'mechDragon';
    case 5: return 'vampireLord';
    default: return 'dragon';
  }
}

export function drawPlatforms(ctx, platforms, camX) {
  for (const p of platforms) {
    const px = p.x - camX;
    if (px + p.w < 0 || px > 640) continue;

    if (p.isGround) {
      ctx.fillStyle = COLORS.groundTop;
      ctx.fillRect(px, p.y, p.w, 8);
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(px, p.y + 8, p.w, p.h - 8);
      // Grass pattern
      for (let tx = 0; tx < p.w; tx += 32) {
        ctx.fillStyle = '#50a030';
        ctx.fillRect(px + tx, p.y, 28, 6);
      }
    } else {
      ctx.fillStyle = '#907050';
      ctx.fillRect(px, p.y, p.w, p.h);
      ctx.fillStyle = '#b09060';
      ctx.fillRect(px, p.y, p.w, 4);
    }
  }
}

export function drawDoors(ctx, doors, camX, assets) {
  for (const door of doors) {
    const px = door.x - camX;
    if (px + door.w < 0 || px > 640) continue;

    ctx.fillStyle = door.roomType === 'boss' ? '#5e1b1b' : COLORS.shop;
    ctx.fillRect(px, door.y, door.w, door.h);
    ctx.fillStyle = '#160808';
    ctx.fillRect(px + 6, door.y + 10, door.w - 12, door.h - 10);
    ctx.fillStyle = '#d7b46a';
    ctx.fillRect(px + door.w - 10, door.y + 27, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(getDoorLabel(door), px + 5, door.y - 4);

    const sign = door.roomType === 'boss' ? assets?.enemies?.dragon : getDoorIcon(door, assets);
    if (sign && door.roomType !== 'boss') {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sign, px + 11, door.y - 18, 18, 18);
      ctx.restore();
    } else if (sign) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sign, px + 6, door.y - 26, 28, 24);
      ctx.restore();
    }
  }
}

export function drawPickups(ctx, pickups, camX) {
  for (const p of pickups) {
    if (p.collected) continue;
    const px = p.x - camX;
    if (px + 12 < 0 || px > 640) continue;
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(px + 6, p.y + 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('G', px + 3, p.y + 10);
  }
}

export function drawGoal(ctx, goalX, camX, groundY) {
  const px = goalX - camX;
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(px, groundY - 80, 8, 80);
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(px + 8, groundY - 80, 40, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('GOAL', px + 10, groundY - 63);
}

export function drawRoom(ctx, room, assets) {
  ctx.fillStyle = room.type === 'boss' ? '#261010' : '#2a1f17';
  ctx.fillRect(0, 0, 640, 360);

  ctx.fillStyle = room.type === 'boss' ? '#4a2222' : '#4d3524';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(i * 64, 0, 32, 220);
  }

  drawPlatforms(ctx, room.platforms, 0);

  drawInteriorDoor(ctx, room.exitDoor, room.type === 'boss' ? '#7b2d2d' : COLORS.shop);

  if (room.type === 'shop') {
    ctx.fillStyle = '#6e4c31';
    ctx.fillRect(room.merchant.x - 10, room.merchant.y + 18, 84, 34);
    ctx.fillStyle = '#d8c49a';
    ctx.fillRect(room.merchant.x, room.merchant.y, 44, 52);
    ctx.fillStyle = '#3a2416';
    ctx.fillRect(room.merchant.x + 12, room.merchant.y + 12, 20, 8);
    const icon = assets?.items?.shield || assets?.items?.swordBroad;
    if (icon) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(icon, room.merchant.x + 48, room.merchant.y + 8, 20, 20);
      ctx.restore();
    }
  }
}

function getDoorLabel(door) {
  if (door.roomType === 'boss') return 'BOSS';
  switch (door.shopType) {
    case SHOP_TYPE.STARTER_GIFT: return 'GIFT';
    case SHOP_TYPE.SHIELD: return 'SHIELD';
    case SHOP_TYPE.ARMOR: return 'ARMOR';
    case SHOP_TYPE.BOOTS: return 'BOOTS';
    case SHOP_TYPE.WEAPON: return 'WEAPON';
    default: return 'SHOP';
  }
}

function getDoorIcon(door, assets) {
  switch (door.shopType) {
    case SHOP_TYPE.STARTER_GIFT: return assets?.items?.sword;
    case SHOP_TYPE.SHIELD: return assets?.items?.shield;
    case SHOP_TYPE.ARMOR: return assets?.items?.armor;
    case SHOP_TYPE.BOOTS: return assets?.items?.boots;
    case SHOP_TYPE.WEAPON: return assets?.items?.swordBroad;
    default: return assets?.items?.shield || assets?.items?.swordBroad;
  }
}

function drawInteriorDoor(ctx, door, color) {
  ctx.fillStyle = color;
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.fillStyle = '#130d0d';
  ctx.fillRect(door.x + 6, door.y + 10, door.w - 12, door.h - 10);
  ctx.fillStyle = '#d7b46a';
  ctx.fillRect(door.x + door.w - 10, door.y + 27, 4, 4);
}
