import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';
import GameHasNotEndedException from '../exceptions/game-has-ended.exception';

export type GameOverPayload = {
  lobbyId: UUID,
  gameStateId: UUID,
};

class GameOverCommand extends Command {
  execute(): void {
    const { gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const isGameOver = gameState.isGameOver();

    // Game should still be running if all players still have cards in hand.
    if (!isGameOver) {
      throw new GameHasNotEndedException();
    } else {
      gameState.endGame();
    }

    this.io.to(lobbyId).emit('GameEnded', gameState.getPlayerWithLeastAmountOfCards());
  }
}

export default GameOverCommand;