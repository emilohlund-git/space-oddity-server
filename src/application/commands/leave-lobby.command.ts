import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Command } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';

export type LeaveLobbyPayload = {
  lobbyId: UUID;
};

class LeaveLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket,
    private readonly payload: LeaveLobbyPayload,
  ) {
    super(payload);
  }

  execute(): void {
    const { lobbyId } = this.payload;

    const user = this.gameService.getUserService().findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`👋 User: ${this.socket.id} does not exist.`);
    }

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException(`👋 Lobby: ${lobbyId} does not exist.`);
    }

    lobby.lastActivityTime = Date.now();
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