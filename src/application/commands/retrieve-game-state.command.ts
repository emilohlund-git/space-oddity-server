import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';

export type RetrieveGameStatePayload = {
  gameStateId: UUID;
  reconnectingPlayer: {
    username: string;
    id: UUID;
  };
};

class RetrieveGameStateCommand extends Command {
  async execute(): Promise<void> {
    const { gameStateId, reconnectingPlayer } = this.payload;

    const gameStateExists = this.gameService.getGameState(gameStateId);
    if (gameStateExists) {
      const lobby = gameStateExists.lobby;
      this.entityValidator.validateLobbyExists(lobby);

      const player = lobby.getPlayers().find((p) => p.id === reconnectingPlayer.id);
      this.entityValidator.validatePlayerExists(player);

      this.socket.emit('GameStateRetrieved', {
        gameState: gameStateExists,
        player,
      });
      return;
    }

    const gameStateJson = await FileService.loadGameState(gameStateId);
    this.entityValidator.validateRetrievedGameState(gameStateJson);

    const gameState = await this.gameService.createFromLoadedJson(gameStateJson);
    this.entityValidator.validateLobbyExists(gameState.lobby);

    const player = gameState.lobby.getPlayers().find((p) => p.id === reconnectingPlayer.id);
    this.entityValidator.validatePlayerExists(player);

    this.socket.join(gameState.lobby.id);

    this.socket.emit('GameStateRetrieved', {
      gameState,
      player,
    });
  }
}

export default RetrieveGameStateCommand;