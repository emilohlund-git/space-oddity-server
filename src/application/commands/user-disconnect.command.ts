import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { logger } from '../../configurations/logger.config';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type UserDisconnectPayload = {
  userId: string;
  lobbyId?: UUID;
  gameStateId?: UUID;
};

class UserDisconnectCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserDisconnectPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): any {
    const { lobbyId, userId, gameStateId } = this.payload;

    logger.info(`👤 ${userId} just disconnected from the server.`);

    const user = this.gameService.getUserService().findById(userId);
    this.entityValidator.validatePlayerExists(user);

    if (gameStateId) {
      const gameState = this.gameService.getGameState(gameStateId);

      if (gameState) {
        gameState.lobby?.removeUser(userId);
        if (gameState.lobby?.getPlayers().length === 0) {
          gameState.setLobby(undefined);
          this.gameService.removeGameState(gameStateId);
        }
      }
    }

    if (lobbyId) {
      const lobby = this.gameService.getLobbyService().findById(lobbyId);
      this.entityValidator.validateLobbyExists(lobby);

      lobby.removeUser(userId);
      if (lobby.getPlayers().length === 0) {
        this.gameService.getLobbyService().remove(lobby.id);
      }
    }

    this.gameService.getUserService().remove(user.id);

    this.io.to(this.socket.id).emit('UserDisconnected', user);

    return user;
  }
}

export default UserDisconnectCommand;