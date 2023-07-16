import cron from 'node-cron';
import GameManager from '../game.manager';

export function startInactiveLobbyCheck(gameManager: GameManager): void {
  cron.schedule('*/5 * * * *', () => {
    gameManager.checkInactiveLobbies();
  });
}