import GameManager from '../game.manager';
import { FIVE_MIN_IN_MS } from './constants';

export function startInactiveLobbyCheck(gameManager: GameManager): NodeJS.Timer {
  const interval = setInterval(() => {
    gameManager.checkInactiveLobbies();
  }, FIVE_MIN_IN_MS);

  return interval;
}