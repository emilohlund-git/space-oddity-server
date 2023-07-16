import GameManager from '../game.manager';

export function startInactiveLobbyCheck(gameManager: GameManager): void {
  setInterval(() => {
    gameManager.checkInactiveLobbies();
  }, 5 * 60 * 1000);
}