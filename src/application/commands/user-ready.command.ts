import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';

export type UserReadyPayload = {
  playerId: UUID;
  lobbyId: UUID;
};

class UserReadyCommand extends Command {
  execute(): void {
    const { playerId, lobbyId } = this.payload;

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    user.setIsReady();

    this.io.to(lobbyId).emit('UserReady', lobby);
  }
}

export default UserReadyCommand;