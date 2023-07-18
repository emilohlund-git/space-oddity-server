import type { Server, Socket } from 'socket.io';
import { logger } from '../../configurations/logger.config';
import GameState from '../../domain/entities/GameState';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type SaveGameStatePayload = {
  gameState: GameState;
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
    const { gameState } = this.payload;

    const res = await FileService.storeGameState(gameState);
    if (res) {
      logger.info('Saved GameState succesfully!');
    }

    this.socket.emit('GameStateSaved');
  }
}

export default SaveGameStateCommand;