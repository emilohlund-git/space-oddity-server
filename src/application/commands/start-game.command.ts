import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import GameState from '../../domain/entities/GameState';
import Table from '../../domain/entities/Table';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type StartGamePayload = {
  lobbyId: UUID,
};

class StartGameCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: StartGamePayload,
  ) { }

  execute(): void {
    const { lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const gameState = new GameState(new Table());
    this.gameService.setGameState(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException('Unable to start game, lobby does not exist.');
    }

    gameState.setLobby(lobby);
    gameState.startGame();

    this.io.to(lobbyId).emit('GameStarted');
  }
}

export default StartGameCommand;