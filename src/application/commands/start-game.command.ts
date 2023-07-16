import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import GameState from '../../domain/entities/GameState';
import Table from '../../domain/entities/Table';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import GameService from '../services/game.service';
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
    super(payload);
  }

  execute(): void {
    const { lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const table = new Table();
    this.gameService.getTableService().save(table);

    const gameState = new GameState(table);
    this.gameService.setGameState(gameState);

    const lobbyExists = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobbyExists) {
      throw new LobbyNotFoundException('Unable to start game, lobby does not exist.');
    }

    gameState.setLobby(lobbyExists);
    gameState.startGame();

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('GameStarted', gameState);
  }
}

export default StartGameCommand;