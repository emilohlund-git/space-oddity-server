import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { FileService } from '../services/file.service';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type RetrieveGameStatePayload = {
  gameStateId: UUID;
  reconnectingPlayer: {
    username: string;
    id: UUID;
  };
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
    const { gameStateId, reconnectingPlayer } = this.payload;

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