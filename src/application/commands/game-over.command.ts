import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameHasNotEndedException from '../exceptions/game-has-ended.exception';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type GameOverPayload = {
  lobbyId: UUID,
  gameStateId: UUID,
};

class GameOverCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: GameOverPayload,
  ) {
    super(payload, new EntityValidator());
  }

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

    this.io.to(lobbyId).emit('GameEnded', {
      winner: gameState.getPlayerWithLeastAmountOfCards(),
    });
  }
}

export default GameOverCommand;