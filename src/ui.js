import { COLORS } from './constants.js';

export function drawHUD(ctx, player, timer, stage, score) {
  // HUD background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, 640, 36);

  // HP hearts
  for (let i = 0; i < player.maxHp; i++) {
    ctx.fillStyle = i < player.hp ? COLORS.heart : COLORS.heartEmpty;
    drawHeart(ctx, 10 + i * 18, 8);
  }

  // Gold
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`G:${player.gold}`, 200, 24);

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

function drawHeart(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 14);
  ctx.bezierCurveTo(x - 2, y + 6, x - 2, y, x + 8, y + 6);
  ctx.bezierCurveTo(x + 18, y, x + 18, y + 6, x + 8, y + 14);
  ctx.fill();
}

export function drawTitleScreen(ctx) {
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
