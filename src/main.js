import { Game } from './game.js';
import { CANVAS_W, CANVAS_H } from './constants.js';
import { loadAssets } from './assets.js';
import { audio } from './audio.js';

// 브라우저 자동재생 정책: 첫 사용자 입력에서 오디오 컨텍스트 활성화
function _wakeAudio() {
  audio.resume();
  window.removeEventListener('keydown', _wakeAudio);
  window.removeEventListener('pointerdown', _wakeAudio);
}
window.addEventListener('keydown', _wakeAudio);
window.addEventListener('pointerdown', _wakeAudio);

const canvas = document.getElementById('gameCanvas');
const dpr = window.devicePixelRatio || 1;

// Physical pixel size for crisp rendering on HiDPI screens
canvas.width  = CANVAS_W * dpr;
canvas.height = CANVAS_H * dpr;

// CSS size stays at logical 640×360 (container handles scaling)
canvas.style.width  = CANVAS_W + 'px';
canvas.style.height = CANVAS_H + 'px';

const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

// 레퍼런스 아트(PNG)를 먼저 로드한 뒤 게임 시작 — 없으면 캔버스 폴백으로 동작
loadAssets().finally(() => {
  const game = new Game(canvas, ctx);
  game.start();
});
