import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type SaveGameStatePayload = {
  gameStateId: UUID;
};

class SaveGameStateCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: SaveGameStatePayload,
  ) {
    super(payload, new EntityValidator());
  }

  async execute(): Promise<void> {
    const { gameStateId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    await FileService.storeGameState(gameState);

    this.socket.emit('GameStateSaved');
  }
}

export default SaveGameStateCommand;