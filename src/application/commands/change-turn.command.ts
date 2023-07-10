import { Socket } from 'socket.io';
import GameService from '../../application/services/game.service';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../exceptions/no-players-in-game.exception';
import NotYourTurnException from '../exceptions/not-your-turn.exception';

export type ChangeTurnPayload = {};

class ChangeTurnCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload?: ChangeTurnPayload,
  ) { }

  public execute(): void {
    const gameState = this.gameService.getGameState();

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
    const currentPlayer = gameState.getCurrentPlayer();

    this.socket.emit('ChangeTurn', currentPlayer.id);
  }
}

export default ChangeTurnCommand;