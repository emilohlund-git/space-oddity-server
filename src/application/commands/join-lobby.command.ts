import type { Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import { LobbyService } from '../services/lobby.service';
import { UserService } from '../services/user.service';

export type JoinLobbyPayload = {
  lobbyId: string;
};

class JoinLobbyCommand implements Command {
  constructor(
    private readonly userService: UserService,
    private readonly lobbyService: LobbyService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: JoinLobbyPayload,
  ) { }

  execute(): void {
    const { lobbyId } = this.payload;

    // Validate input
    if (!lobbyId || typeof lobbyId !== 'string') {
      throw new InvalidPayloadException('Invalid payload: lobbyId must be a non-empty string.');
    }

    const user = this.userService.findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`👋 User: ${this.socket.id} does not exist.`);
    }

    const lobby = this.lobbyService.findById(this.payload.lobbyId);
    if (!lobby) {
      throw new LobbyNotFoundException(`👋 Lobby: ${this.payload.lobbyId} does not exist.`);
    }

    lobby.addUser(user);
    this.lobbyService.save(lobby);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default JoinLobbyCommand;