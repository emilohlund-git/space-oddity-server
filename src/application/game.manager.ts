import { UUID } from 'crypto';
import { logger } from '../configurations/logger.config';
import { Lobby } from '../domain/entities/Lobby';
import { FileService } from './services/file.service';
import GameService from './services/game.service';
import { FIVE_MIN_IN_MS } from './utils/constants';

class GameManager {
  private readonly gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
  }

  public getGameService(): GameService {
    return this.gameService;
  }

  // Update the last activity time for a lobby
  public updateActivityTime(lobbyId: UUID): void {
    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    if (lobby) {
      lobby.lastActivityTime = Date.now();
    }
  }

  // Check for inactive lobbies and terminate them
  public checkInactiveLobbies(): void {
    const currentTime = Date.now();
    const inactiveLobbies: Lobby[] = [];

    for (const lobby of this.gameService.getLobbyService().findAll()) {
      const timeSinceLastActivity = currentTime - lobby.lastActivityTime;
      if (timeSinceLastActivity >= FIVE_MIN_IN_MS) { // 5 minutes in milliseconds
        inactiveLobbies.push(lobby);
      }
    }

    for (const lobby of inactiveLobbies) {
      logger.info(`🏨 Lobby: ${lobby.id} is being terminated due to inactivity.`);
      const players = lobby.getPlayers();
      const deck = lobby.getDeck();


      if (deck) {
        const cards = deck?.getCards();
        if (cards) {
          this.gameService.getCardService().removeMany(cards);
        }
        this.gameService.getDeckService().remove(deck.id);
      }

      const gameState = this.gameService.getGameStates().find((g) => g.lobby?.id === lobby.id);

      if (gameState) {
        FileService.removeSavedState(gameState);
        this.gameService.removeGameState(gameState.id);
      }

      this.gameService.getUserService().removeMany(players);
      this.gameService.getLobbyService().remove(lobby.id);
    }
  }
}

export default GameManager;