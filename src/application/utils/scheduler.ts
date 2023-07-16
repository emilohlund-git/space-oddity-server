import cron from 'cron';
import GameManager from '../game.manager';

export function startInactiveLobbyCheck(gameManager: GameManager): void {
  cron.job('*/5 * * * *', () => {
    gameManager.checkInactiveLobbies();
  });
}