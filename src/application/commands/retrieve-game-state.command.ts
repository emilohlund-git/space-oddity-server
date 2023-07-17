import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type RetrieveGameStatePayload = {
  gameStateId: UUID;
};

class RetrieveGameStateCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: RetrieveGameStatePayload,
  ) {
    super(payload, new EntityValidator());
  }

  async execute(): Promise<void> {
    const { gameStateId } = this.payload;

    const existingGameState = this.gameService.getGameState(gameStateId);

    if (existingGameState) {
      this.socket.emit('GameStateRetrieved', existingGameState);
      return;
    }

    const gameStateJson = await FileService.loadGameState(gameStateId);
    this.entityValidator.validateRetrievedGameState(gameStateJson);

    const gameState = this.gameService.createFromLoadedJson(gameStateJson);

    this.socket.emit('GameStateRetrieved', gameState);
  }
}

export default RetrieveGameStateCommand;