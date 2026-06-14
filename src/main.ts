import * as THREE from 'three';
import { Game } from '@/game/Game';

const container = document.getElementById('canvas-container');

if (!container) {
  throw new Error('Canvas container not found');
}

const game = new Game(container);
game.start();
