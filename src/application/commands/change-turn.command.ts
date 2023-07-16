import { UUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import GameService from '../../application/services/game.service';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../exceptions/no-players-in-game.exception';
import NotYourTurnException from '../exceptions/not-your-turn.exception';

export type ChangeTurnPayload = {
  gameStateId: UUID;
  lobbyId: UUID;
};

class ChangeTurnCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: ChangeTurnPayload,
  ) {
    super(payload);
  }

  public execute(): void {
    const { gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    if (!gameState.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    // Validate the game state
    if (gameState.lobby.getPlayers().length === 0) {
      throw new NoPlayersInGameException('Cannot change turn: No players in the game');
    }

    if (gameState.getCurrentPlayer().id !== this.socket.id) {
      throw new NotYourTurnException('Cannot change turn: It is not your turn');
    }

    gameState.nextTurn();

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('ChangeTurn', gameState);
  }
}

export default ChangeTurnCommand;