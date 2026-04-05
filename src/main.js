import { Game } from './game.js';
import { loadAssets } from './assets.js';

const canvas = document.getElementById('gameCanvas');

async function boot() {
  await loadAssets();
  const game = new Game(canvas);
  game.start();
}

boot();
