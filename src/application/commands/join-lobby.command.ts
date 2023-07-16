import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';

export type JoinLobbyPayload = {
  lobbyId: UUID;
};

class JoinLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: JoinLobbyPayload,
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
      throw new LobbyNotFoundException(`👋 Lobby: ${this.payload.lobbyId} does not exist.`);
    }

    lobby.lastActivityTime = Date.now();
    lobby.addUser(user);
    this.socket.join(lobbyId);
    this.gameService.getLobbyService().save(lobby);
    this.io.to(lobbyId).emit('UserJoinedLobby', lobby);
  }
}

export default JoinLobbyCommand;