import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameHasNotEndedException from '../exceptions/game-has-ended.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import GameService from '../services/game.service';

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
    super(payload);
  }

  execute(): void {
    const { gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException('Unable to end game, lobby does not exist.');
    }

    const isGameOver = gameState.isGameOver();

    // Game should still be running if all players still have cards in hand.
    if (!isGameOver) {
      throw new GameHasNotEndedException();
    } else {
      this.gameService.getCardService().removeMany(lobby.getDeck()!.getCards());
      this.gameService.getLobbyService().remove(lobby.id);
      gameState.endGame();
    }

    this.io.to(lobbyId).emit('GameEnded');
  }
}

export default GameOverCommand;