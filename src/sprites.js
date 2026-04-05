// sprites.js — 원본 게임 스프라이트 로더
// assets/sprites/ 의 PNG 파일을 비동기로 로드하여 반환

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`스프라이트 로드 실패: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

// 흰 배경이 남아있는 이미지를 canvas에서 투명으로 처리
function makeTransparent(img, threshold = 240) {
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, cv.width, cv.height);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] >= threshold && d[i+1] >= threshold && d[i+2] >= threshold) {
      d[i+3] = 0;
    }
  }
  ctx.putImageData(id, 0, 0);
  return cv;
}

export async function loadSprites() {
  const base = 'assets/sprites/';
  const names = [
    'player', 'snake', 'goblin', 'orc',
    'red_knight', 'blue_knight', 'silver_knight',
    'death_master', 'dragon', 'mech_dragon',
    'vampire_lord', 'were_rat', 'yeti', 'giant_kong', 'gold_collector',
    'sword_gladius', 'sword_broad', 'sword_great', 'sword_excalibur', 'sword_legend',
    'armor', 'shield', 'boots',
  ];

  const raw = await Promise.all(names.map(n => loadImage(`${base}${n}.png`)));
  const map = {};
  names.forEach((n, i) => {
    map[n] = raw[i] ? makeTransparent(raw[i]) : null;
  });

  // 엔미 타입 → 스프라이트 매핑
  return {
    // 플레이어
    player: map['player'],

    // 적 (enemy.js 의 type 문자열과 매핑)
    enemies: {
      slime:       map['snake'],          // 뱀을 슬라임 대체
      goblin:      map['goblin'],
      orc:         map['orc'],
      knight:      map['blue_knight'],
      red_knight:  map['red_knight'],
      silver_knight: map['silver_knight'],
      death_master: map['death_master'],
      vampire_lord: map['vampire_lord'],
      were_rat:    map['were_rat'],
      yeti:        map['yeti'],
      giant_kong:  map['giant_kong'],
      gold_collector: map['gold_collector'],
      dragon:      map['dragon'],
      mech_dragon: map['mech_dragon'],
    },

    // 무기/장비 아이콘
    items: {
      sword_gladius:   map['sword_gladius'],
      sword_broad:     map['sword_broad'],
      sword_great:     map['sword_great'],
      sword_excalibur: map['sword_excalibur'],
      sword_legend:    map['sword_legend'],
      armor:   map['armor'],
      shield:  map['shield'],
      boots:   map['boots'],
    },
  };
}
