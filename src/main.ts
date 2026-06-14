import { Game } from '@/game/Game';

const container = document.getElementById('canvas-container');

if (!container) {
  throw new Error('Canvas container not found');
}

const game = new Game(container);
game.start().catch((err) => {
  console.error('Failed to start game:', err);
  const overlay = document.getElementById('loading');
  if (overlay) {
    overlay.innerHTML = '<div class="loading-error">Failed to load game assets.<br>Please refresh.</div>';
  }
});
