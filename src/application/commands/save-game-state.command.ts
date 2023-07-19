import GameState from '../../domain/entities/GameState';
import { Command } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';

export type SaveGameStatePayload = {
  gameState: GameState;
};

class SaveGameStateCommand extends Command {
  async execute(): Promise<void> {
    const { gameState } = this.payload;

    await FileService.storeGameState(gameState);

    this.socket.emit('GameStateSaved');
  }
}

export default SaveGameStateCommand;