export function createSignpost({ x, y, message, title = '표지판', w = 18, h = 28, triggerW = 84, triggerH = 54 }) {
  return {
    x,
    y,
    w,
    h,
    title,
    message,
    triggerX: x - Math.floor((triggerW - w) / 2),
    triggerY: y - (triggerH - h),
    triggerW,
    triggerH,
  };
}

export function getNearbySignpost(player, signposts = []) {
  return signposts.find(signpost => overlaps(player, {
    x: signpost.triggerX,
    y: signpost.triggerY,
    w: signpost.triggerW,
    h: signpost.triggerH,
  })) || null;
}

export function drawSignposts(ctx, signposts = [], camX = 0, activeSignpost = null) {
  for (const signpost of signposts) {
    const px = signpost.x - camX;
    if (px + signpost.w < 0 || px > 640) continue;

    ctx.fillStyle = activeSignpost === signpost ? '#f6d66f' : '#c28a43';
    ctx.fillRect(px + 4, signpost.y, signpost.w - 8, 12);
    ctx.fillStyle = '#7a4f1d';
    ctx.fillRect(px + 7, signpost.y + 12, signpost.w - 14, signpost.h - 12);
    ctx.fillStyle = '#4b2e13';
    ctx.fillRect(px + 2, signpost.y + 2, signpost.w - 4, 2);
    ctx.fillRect(px + 3, signpost.y + 16, signpost.w - 6, 2);
  }
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
