import GameManager from '../game.manager';

export function startInactiveLobbyCheck(gameManager: GameManager): NodeJS.Timer {
  const interval = setInterval(() => {
    gameManager.checkInactiveLobbies();
  }, 5 * 60 * 1000);

  return interval;
}