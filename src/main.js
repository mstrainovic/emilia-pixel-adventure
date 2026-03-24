import { Game } from './core/Game.js';

const game = new Game();
window.__game = game; // expose immediately for testing
game.init().catch((err) => {
  console.error('Game initialization failed:', err);
});
