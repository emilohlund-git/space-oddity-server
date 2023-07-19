import { UUID } from 'crypto';
import { logger } from '../../configurations/logger.config';
import { Command } from '../../domain/interfaces/command.interface';

export type UserDisconnectPayload = {
  playerId: UUID;
  lobbyId?: UUID;
  gameStateId?: UUID;
};

class UserDisconnectCommand extends Command {
  execute(): any {
    const { lobbyId, playerId } = this.payload;

    logger.info(`👤 ${playerId} just disconnected from the server.`);

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    if (lobbyId) {
      const lobby = this.gameService.getLobbyService().findById(lobbyId);
      this.entityValidator.validateLobbyExists(lobby);

      lobby.removeUser(playerId);
      if (lobby.getPlayers().length === 0) {
        this.gameService.getLobbyService().remove(lobby.id);
      }
    }

    this.io.to(this.socket.id).emit('UserDisconnected', user);

    return user;
  }
}

export default UserDisconnectCommand;