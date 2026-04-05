import { SHOP_ITEMS } from './equipment.js';
import { COLORS } from './constants.js';
import { getPlayerStageSprite } from './assets.js';

export function drawHUD(ctx, player, timer, stage, score, assets) {
  // HUD background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, 640, 36);

  // HP hearts
  const maxHearts = Math.ceil(player.maxHp / 2);
  for (let i = 0; i < maxHearts; i++) {
    const heartValue = Math.max(0, Math.min(2, player.hp - i * 2));
    drawHeart(ctx, 10 + i * 18, 8, heartValue);
  }

  // Gold
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`G:${player.gold}`, 200, 24);

  drawEquipmentRow(ctx, player, assets);

  // Score
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE:${String(score).padStart(6, '0')}`, 310, 24);

  // Stage
  ctx.fillStyle = '#88ccff';
  ctx.fillText(`STAGE ${stage}`, 490, 24);

  // Timer
  const t = Math.ceil(timer / 60);
  ctx.fillStyle = t <= 15 ? '#ff4444' : '#ffff44';
  ctx.fillText(`TIME:${String(t).padStart(3, '0')}`, 560, 24);
}

function drawHeart(ctx, x, y, fill = 2) {
  ctx.fillStyle = COLORS.heartEmpty;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 14);
  ctx.bezierCurveTo(x - 2, y + 6, x - 2, y, x + 8, y + 6);
  ctx.bezierCurveTo(x + 18, y, x + 18, y + 6, x + 8, y + 14);
  ctx.fill();

  if (fill <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 14);
  ctx.bezierCurveTo(x - 2, y + 6, x - 2, y, x + 8, y + 6);
  ctx.bezierCurveTo(x + 18, y, x + 18, y + 6, x + 8, y + 14);
  ctx.clip();
  ctx.fillStyle = COLORS.heart;
  const fillWidth = fill === 1 ? 9 : 18;
  ctx.fillRect(x - 1, y - 1, fillWidth, 16);
  ctx.restore();
}

function drawEquipmentRow(ctx, player, assets) {
  const items = [
    ['sword', player.equipment.sword],
    ['shield', player.equipment.shield],
    ['armor', player.equipment.armor],
    ['boots', player.equipment.boots],
  ];

  const itemDefs = Object.fromEntries(SHOP_ITEMS.map(item => [item.id, item]));

  items.forEach(([slot, itemId], index) => {
    const owned = !!itemId;
    const x = 245 + index * 18;
    const y = 4;
    ctx.fillStyle = owned ? '#3b2c14' : '#221d1d';
    ctx.fillRect(x, y, 16, 16);
    ctx.strokeStyle = owned ? '#ffd36e' : '#555';
    ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);

    const iconKey = itemDefs[itemId]?.iconKey || slot;
    const img = assets?.items?.[iconKey];
    if (img) {
      ctx.save();
      ctx.globalAlpha = owned ? 1 : 0.3;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x + 1, y + 1, 14, 14);
      ctx.restore();
    }
  });

  const hero = getPlayerStageSprite(player);
  if (hero) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero, 126, 2, 22, 28);
    ctx.restore();
  }
}

export function drawTitleScreen(ctx, assets) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, 640, 360);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137) % 640;
    const sy = (i * 97) % 360;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Title
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WONDER BOY', 320, 100);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('IN MONSTER LAND', 320, 140);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '13px monospace';
  ctx.fillText('- WEB HOMAGE -', 320, 168);

  // Blink
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText('PRESS  ENTER  TO  START', 320, 240);
  }

  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.fillText('← → 이동   Z 점프   X 공격   ENTER 상점', 320, 310);
  ctx.fillText('© 2024 WBML WEB HOMAGE', 320, 340);

  const hero = assets?.playerStages?.[5];
  if (hero) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hero, 110, 140, 110, 110);
    ctx.restore();
  }

  const dragon = assets?.enemies?.dragon;
  if (dragon) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(dragon, 430, 130, 130, 130);
    ctx.restore();
  }

  ctx.textAlign = 'left';
}

export function drawGameOver(ctx, score) {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', 320, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText(`SCORE: ${score}`, 320, 210);
  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText('PRESS ENTER TO RETRY', 320, 270);
  }
  ctx.textAlign = 'left';
}

export function drawStageClear(ctx, stage, score) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`STAGE ${stage} CLEAR!`, 320, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText(`SCORE: ${score}`, 320, 200);
  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.fillStyle = '#88ff88';
    ctx.font = '16px monospace';
    ctx.fillText('PRESS ENTER FOR NEXT STAGE', 320, 260);
  }
  ctx.textAlign = 'left';
}

export function drawSignpostMessage(ctx, signpost) {
  if (!signpost) return;

  const boxX = 56;
  const boxY = 284;
  const boxW = 528;
  const boxH = 52;

  ctx.fillStyle = 'rgba(14, 12, 18, 0.82)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#f0d186';
  ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

  ctx.fillStyle = '#f8dd8c';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(signpost.title, boxX + 14, boxY + 16);

  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.fillText(signpost.message, boxX + 14, boxY + 35);
}
