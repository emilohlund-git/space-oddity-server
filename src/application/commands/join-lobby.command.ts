import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';

export type JoinLobbyPayload = {
  playerId: UUID;
  lobbyId: UUID;
};

class JoinLobbyCommand extends Command {
  execute(): void {
    const { playerId, lobbyId } = this.payload;

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    lobby.addUser(user);
    this.socket.join(lobbyId);
    this.gameService.getLobbyService().save(lobby);

    lobby.lastActivityTime = Date.now();

    this.io.to(lobbyId).emit('UserJoinedLobby', lobby);
  }
}

export default JoinLobbyCommand;