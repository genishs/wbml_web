// 타이틀 화면 + 오프닝 스토리 시퀀스
// 원작 아케이드의 정체성: 부팅 → 타이틀 → 전설(스토리) → 게임 시작.
import { CANVAS_W, CANVAS_H, GROUND_Y, GAME_VERSION } from './constants.js';

// 원작 스토리(몬스터랜드의 전설)를 충실히 각색
export const STORY_PAGES = [
  [
    '먼 옛날, 평화롭던 몬스터랜드.',
    '사람도 동물도 웃으며 살던 땅에',
    '어느 날 그림자가 드리웠다.',
  ],
  [
    "사악한 용 '메카 드래곤'이",
    '부하 몬스터 군단을 이끌고 쳐들어와',
    '마을을 불태우고 땅을 빼앗았다.',
  ],
  [
    '모두가 공포에 떨던 그때,',
    '한 용감한 소년이 칼을 들고 일어섰다.',
    '그의 이름은 — 원더보이.',
  ],
  [
    '11개의 땅을 가로질러',
    '보스를 쓰러뜨리고 전설의 검을 모아',
    '메카 드래곤을 물리치고 평화를 되찾아라!',
  ],
];

function _starfield(ctx, frame) {
  for (let i = 0; i < 70; i++) {
    const x = (i * 97) % CANVAS_W;
    const y = (i * 53) % 200;
    const tw = (Math.sin((frame * 0.04) + i) + 1) / 2;        // 반짝임
    ctx.globalAlpha = 0.35 + tw * 0.55;
    ctx.fillStyle = i % 7 === 0 ? '#ffe080' : '#ffffff';
    ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

function _dragonSilhouette(ctx, x, y) {
  ctx.fillStyle = '#1a0e1e';
  ctx.fillRect(x, y, 60, 22);                 // 몸통
  ctx.fillRect(x + 50, y - 14, 22, 20);       // 목/머리
  ctx.beginPath();                            // 날개
  ctx.moveTo(x + 14, y); ctx.lineTo(x + 4, y - 30); ctx.lineTo(x + 38, y - 4); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 30, y); ctx.lineTo(x + 26, y - 24); ctx.lineTo(x + 50, y - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff3030';                  // 눈
  ctx.fillRect(x + 64, y - 8, 4, 3);
}

function _heroSilhouette(ctx, x, y) {
  ctx.fillStyle = '#10202e';
  ctx.fillRect(x + 4, y - 26, 12, 12);        // 머리/모자
  ctx.fillRect(x + 5, y - 14, 10, 16);        // 몸
  ctx.fillRect(x + 5, y + 2, 4, 10); ctx.fillRect(x + 11, y + 2, 4, 10); // 다리
  ctx.fillStyle = '#3a5a7a';                  // 들어올린 검
  ctx.fillRect(x + 16, y - 34, 3, 26);
  ctx.fillStyle = '#5a7a9a'; ctx.fillRect(x + 13, y - 12, 9, 3);
}

export function drawTitle(ctx, frame) {
  // 밤하늘
  ctx.fillStyle = '#0a0a1c';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#10142e';
  ctx.fillRect(0, 120, CANVAS_W, 120);
  _starfield(ctx, frame);

  // 먼 성/지평선 실루엣
  ctx.fillStyle = '#070710';
  ctx.fillRect(0, GROUND_Y - 40, CANVAS_W, CANVAS_H);
  _dragonSilhouette(ctx, 470, GROUND_Y - 70);
  _heroSilhouette(ctx, 120, GROUND_Y - 30);

  // 타이틀 로고
  ctx.textAlign = 'center';
  ctx.font = 'bold 46px monospace';
  ctx.fillStyle = '#3a1c00';                  // 그림자
  ctx.fillText('WONDER BOY', CANVAS_W / 2 + 3, 96 + 3);
  ctx.fillStyle = '#ffd040';
  ctx.fillText('WONDER BOY', CANVAS_W / 2, 96);

  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#5a1010';
  ctx.fillText('in MONSTER LAND', CANVAS_W / 2 + 2, 132 + 2);
  ctx.fillStyle = '#ff5030';
  ctx.fillText('in MONSTER LAND', CANVAS_W / 2, 132);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#a0c0e0';
  ctx.fillText('원더보이 인 몬스터랜드', CANVAS_W / 2, 158);

  // 깜빡이는 시작 안내
  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PUSH   Z / ENTER', CANVAS_W / 2, 264);
  }

  // 푸터(오마주 표기)
  ctx.font = '9px monospace';
  ctx.fillStyle = '#6070a0';
  ctx.fillText('ARCADE 1987 SEGA — FAN HOMAGE', CANVAS_W / 2, 348);

  // 버전 표기 (우하단)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#445';
  ctx.fillText(GAME_VERSION, CANVAS_W - 6, 348);
  ctx.textAlign = 'left';
}

export function drawStory(ctx, page, frame) {
  ctx.fillStyle = '#060610';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  _starfield(ctx, frame);

  const lines = STORY_PAGES[page] || [];
  ctx.textAlign = 'center';
  ctx.font = '15px monospace';
  ctx.fillStyle = '#f0e8d0';
  lines.forEach((ln, i) => ctx.fillText(ln, CANVAS_W / 2, 150 + i * 30));

  // 페이지 표시
  ctx.font = '10px monospace';
  ctx.fillStyle = '#8090b0';
  ctx.fillText(`${page + 1} / ${STORY_PAGES.length}`, CANVAS_W / 2, 250);

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.font = '11px monospace';
    ctx.fillStyle = '#ffd040';
    const last = page === STORY_PAGES.length - 1;
    ctx.fillText(last ? 'Z / ENTER : 모험 시작!' : 'Z / ENTER : 다음 ▶', CANVAS_W / 2, 300);
  }
  ctx.textAlign = 'left';
}
