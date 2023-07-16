import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import GameState from '../../domain/entities/GameState';
import Table from '../../domain/entities/Table';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type StartGamePayload = {
  lobbyId: UUID,
};

class StartGameCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: StartGamePayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const table = new Table();
    this.gameService.getTableService().save(table);

    const gameState = new GameState(table);
    this.gameService.setGameState(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    gameState.setLobby(lobby);
    gameState.startGame();

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('GameStarted', gameState);
  }
}

export default StartGameCommand;