import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';

export type LeaveLobbyPayload = {
  playerId: UUID;
  lobbyId: UUID;
};

class LeaveLobbyCommand extends Command {
  execute(): void {
    const { playerId, lobbyId } = this.payload;

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    lobby.removeUser(user.id);
    this.gameService.getLobbyService().save(lobby);
    if (lobby.getPlayers().length === 0) {
      this.gameService.getLobbyService().remove(lobby.id);
    }

    this.socket.leave(lobbyId);
    this.socket.broadcast.to(lobbyId).emit('UserLeftLobby', lobby);
  }
}

export default LeaveLobbyCommand;