import type { Socket } from 'socket.io';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import LobbyExistsException from '../exceptions/lobby-exists.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import { LobbyService } from '../services/lobby.service';
import { UserService } from '../services/user.service';

export type CreateLobbyPayload = {
  lobbyId: string;
};

class CreateLobbyCommand implements Command {
  constructor(
    private readonly userService: UserService,
    private readonly lobbyService: LobbyService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CreateLobbyPayload,
  ) { }

  execute(): void {
    const { lobbyId } = this.payload;

    // Validate input
    if (!lobbyId || typeof lobbyId !== 'string') {
      throw new InvalidPayloadException('Invalid payload: lobbyId must be a non-empty string.');
    }

    const user = this.userService.findById(this.socket.id);
    if (!user) {
      throw new UserNotFoundException(`User not found with ID: ${this.socket.id}`);
    }

    const lobbyExists = this.lobbyService.findById(lobbyId);
    if (lobbyExists) {
      throw new LobbyExistsException(`Lobby already exists with ID: ${lobbyId}`);
    }

    const lobby = new Lobby(lobbyId, [user]);
    this.lobbyService.save(lobby);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;