import { UUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import GameService from '../../application/services/game.service';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { EntityValidator } from '../utils/entity.validator';

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
    super(payload, new EntityValidator());
  }

  public execute(): void {
    const { gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    this.entityValidator.validateLobbyExists(gameState.lobby);

    this.entityValidator.validateLobbyHasPlayers(gameState.lobby);

    this.entityValidator.validateIsYourTurn(gameState, this.socket.id);

    gameState.nextTurn();

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('ChangeTurn', gameState);
  }
}

export default ChangeTurnCommand;