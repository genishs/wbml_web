// Pixel art sprites recreated in Wonder Boy in Monster Land style
// Based on the original arcade / Sega Master System art (1987, Sega)

// Palette: index → CSS color (null = transparent)
// Accessed via parseInt(char, 36): '0'-'9' = 0-9, 'a'-'z' = 10-35
const P = [
  null,        // 0  transparent
  '#F8B068',   // 1  skin
  '#5C2810',   // 2  dark brown (helmet)
  '#F0A010',   // 3  yellow tunic
  '#401808',   // 4  dark brown boots/belt
  '#8C4820',   // 5  mid brown (helmet shading)
  '#101010',   // 6  near-black (eyes/outline)
  '#D0D0C0',   // 7  silver (sword)
  '#C81818',   // 8  red (scarf / goblin torso)
  '#FFD030',   // 9  gold (belt buckle)
  '#30A830',   // a  green (slime)
  '#60D060',   // b  light green (slime highlight)
  '#0C400C',   // c  dark green (unused / shadow)
  '#E06018',   // d  orange (goblin skin)
  '#983008',   // e  dark orange (goblin shadow)
  '#3858A8',   // f  blue (knight armor)
  '#202868',   // g  dark blue (knight shadow)
  '#7898E0',   // h  light blue (knight highlight)
  '#B02020',   // i  dragon red
  '#701010',   // j  dragon dark red
  '#FF8000',   // k  bright orange (fire)
];

function make(rows) {
  const h = rows.length, w = rows[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = P[parseInt(row[x], 36)];
      if (color) { cx.fillStyle = color; cx.fillRect(x, y, 1, 1); }
    }
  });
  return cv;
}

// ── PLAYER (16 × 24) ─────────────────────────────────────────────────────────
// Facing right by default; flip horizontally when facing left.

const PLAYER_W1 = make([   // walk / stand frame 1
  '0000222200000000',
  '0002522520000000',
  '0002555520000000',
  '0001111100000000',
  '0001611600000000',
  '0001111100000000',
  '0088888880000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0049494940000000',
  '0033443300000000',
  '0033443300000000',
  '0034400440000000',
  '0044400440000000',
  '0044400440000000',
  '0044500450000000',
  '0044400440000000',
  '0044400440000000',
  '0044000440000000',
  '0000000000000000',
  '0000000000000000',
]);

const PLAYER_W2 = make([   // walk frame 2 (legs alternated)
  '0000222200000000',
  '0002522520000000',
  '0002555520000000',
  '0001111100000000',
  '0001611600000000',
  '0001111100000000',
  '0088888880000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0049494940000000',
  '0033443300000000',
  '0033443300000000',
  '0004403440000000',
  '0004403440000000',
  '0004403440000000',
  '0005403450000000',
  '0004403440000000',
  '0004403440000000',
  '0004400440000000',
  '0000000000000000',
  '0000000000000000',
]);

const PLAYER_ATK = make([  // attack (sword extended right)
  '0000222200000000',
  '0002522520000000',
  '0002555520000000',
  '0001111100000000',
  '0001611600000000',
  '0001111100000000',
  '0088888880000000',
  '0033333337777770',
  '0033333337000000',
  '0033333330000000',
  '0033333330000000',
  '0033333330000000',
  '0049494940000000',
  '0033443300000000',
  '0033443300000000',
  '0034400440000000',
  '0044400440000000',
  '0044400440000000',
  '0044500450000000',
  '0044400440000000',
  '0044400440000000',
  '0044000440000000',
  '0000000000000000',
  '0000000000000000',
]);

// ── SLIME (16 × 12) ──────────────────────────────────────────────────────────

const SLIME_1 = make([   // normal
  '0000aaaa00000000',
  '000aaaaaaa000000',
  '00aaabbaabaa0000',
  '0aaab6aab6aaa000',
  '0aaababababaa000',
  '0aaaaaaaaabaa000',
  '0aaaaaaaaaa00000',
  '00aaaaaaaaa00000',
  '000aaaaaaa000000',
  '0000aaaaaa000000',
  '0000000000000000',
  '0000000000000000',
]);

const SLIME_2 = make([   // squished (bounce)
  '0000000000000000',
  '0000000000000000',
  '00aaaaaaaaaaaa00',
  '0aaab6aaab6aaaa0',
  '0aaababababaaa00',
  '0aaaaaaaaaaaaa00',
  '00aaaaaaaaaa0000',
  '0000aaaaaa000000',
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
]);

// ── GOBLIN (16 × 20) ─────────────────────────────────────────────────────────

const GOBLIN_1 = make([  // stand
  '00000ddddd000000',
  '0000dde66edd0000',
  '0000dddddddd0000',
  '0000dddedeed0000',
  '0000edddddde0000',
  '0000e8888ee00000',
  '0000888888000000',
  '0000888888000000',
  '0000888888000000',
  '0004944494000000',
  '0004488884000000',
  '0004488884000000',
  '0000480048000000',
  '0000480048000000',
  '0000440044000000',
  '0000440044000000',
  '0000440044000000',
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
]);

const GOBLIN_2 = make([  // walk (arm raised)
  '00000ddddd000000',
  '0000dde66edd0000',
  '0000dddddddd0000',
  '0000dddedeed0000',
  '0000edddddde0000',
  '0000e8888ee00000',
  '0888888888000000',
  '0088888888000000',
  '0000888888000000',
  '0004944494000000',
  '0004488884000000',
  '0004488884000000',
  '0000048048000000',
  '0000048048000000',
  '0000044044000000',
  '0000044044000000',
  '0000044044000000',
  '0000000000000000',
  '0000000000000000',
  '0000000000000000',
]);

// ── KNIGHT (16 × 24) ─────────────────────────────────────────────────────────

const KNIGHT_1 = make([  // stand
  '0000ffffff000000',
  '000ffffffhf00000',
  '000fgggggff00000',
  '000fg6g6gff00000',
  '000fffffffh00000',
  '0000f777ff000000',
  '00fffffffff00000',
  '00fhffhffff00000',
  '00fffffffff00000',
  '00fffffffff00000',
  '0007ffffff700000',
  '000ffgffgff00000',
  '000ffgffgff00000',
  '000ffgffgff00000',
  '000fg0ff0gf00000',
  '0000g0ff0g000000',
  '0000g0ff0g000000',
  '0000g0ff0g000000',
  '0000ggffgg000000',
  '0000ggffgg000000',
  '0000ggffgg000000',
  '000ggggggg000000',
  '0000000000000000',
  '0000000000000000',
]);

const KNIGHT_2 = make([  // walk (arm raised)
  '0000ffffff000000',
  '000ffffffhf00000',
  '000fgggggff00000',
  '000fg6g6gff00000',
  '000fffffffh00000',
  '0000f777ff000000',
  '0ffffffffffh0000',
  '0ffhffhfffff0000',
  '00fffffffff00000',
  '00fffffffff00000',
  '0007ffffff700000',
  '000ffgffgff00000',
  '000ffgffgff00000',
  '000ffgffgff00000',
  '0000fg0gff000000',
  '0000fg0gff000000',
  '0000fg0gff000000',
  '0000fg0gff000000',
  '0000ffgff0000000',
  '0000ffgff0000000',
  '0000ffgff0000000',
  '0000ggggg0000000',
  '0000000000000000',
  '0000000000000000',
]);

// ── DRAGON (48 × 40, boss) ───────────────────────────────────────────────────
// Drawn programmatically; faces LEFT by default.

function makeDragon(frame) {
  const cv = document.createElement('canvas');
  cv.width = 48; cv.height = 40;
  const ctx = cv.getContext('2d');

  // Body
  ctx.fillStyle = '#B02020';
  ctx.fillRect(12, 12, 32, 18);

  // Belly (lighter)
  ctx.fillStyle = '#D04040';
  ctx.fillRect(14, 18, 28, 12);

  // Head (left side, faces left)
  ctx.fillStyle = '#C03030';
  ctx.fillRect(2, 6, 16, 16);

  // Upper jaw / snout
  ctx.fillStyle = '#B02020';
  ctx.fillRect(0, 6, 6, 8);

  // Lower jaw (open mouth area)
  ctx.fillStyle = '#801010';
  ctx.fillRect(0, 14, 8, 6);

  // Teeth
  ctx.fillStyle = '#F0F0E0';
  ctx.fillRect(1, 13, 2, 3);
  ctx.fillRect(4, 13, 2, 3);

  // Eye
  ctx.fillStyle = '#FFD030';
  ctx.fillRect(6, 8, 5, 5);
  ctx.fillStyle = '#101010';
  ctx.fillRect(7, 9, 3, 3);

  // Dorsal spikes
  ctx.fillStyle = '#901010';
  const spikeY = frame === 1 ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    const sx = 16 + i * 8;
    ctx.fillRect(sx + 1, spikeY, 2, 10);
    ctx.fillRect(sx,     spikeY + 4, 4, 6);
  }

  // Tail (right side)
  ctx.fillStyle = '#901818';
  ctx.fillRect(40, 20, 8, 8);
  ctx.fillStyle = '#701010';
  ctx.fillRect(44, 26, 4, 6);
  ctx.fillRect(46, 30, 2, 4);

  // Legs
  const legOff = frame === 0 ? 0 : 2;
  ctx.fillStyle = '#901818';
  ctx.fillRect(16, 30 - legOff, 8, 10);
  ctx.fillRect(28, 30 + legOff, 8, Math.max(6, 10 - legOff));

  // Claws
  ctx.fillStyle = '#E8D000';
  ctx.fillRect(15, 38, 3, 2);
  ctx.fillRect(19, 38, 3, 2);
  ctx.fillRect(27, 36 + legOff, 3, 2);
  ctx.fillRect(31, 36 + legOff, 3, 2);

  // Fire breath (frame 1)
  if (frame === 1) {
    ctx.fillStyle = '#FF8000';
    ctx.fillRect(0, 15, 8, 5);
    ctx.fillStyle = '#FFD030';
    ctx.fillRect(0, 16, 5, 3);
  }

  return cv;
}

// ── Export ────────────────────────────────────────────────────────────────────

export const sprites = {
  player: [PLAYER_W1, PLAYER_W2, PLAYER_ATK],
  slime:  [SLIME_1,  SLIME_2],
  goblin: [GOBLIN_1, GOBLIN_2],
  knight: [KNIGHT_1, KNIGHT_2],
  dragon: [makeDragon(0), makeDragon(1)],
};
