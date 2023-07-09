import { randomUUID } from 'crypto';
import type { Socket } from 'socket.io';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import LobbyExistsException from '../exceptions/lobby-exists.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import { LobbyService } from '../services/lobby.service';
import { UserService } from '../services/user.service';
import { isValidUUID } from '../utils/uuid.validator';

export type CreateLobbyPayload = {
  lobbyId: string;
};

class CreateLobbyCommand implements Command {
  constructor(
    private readonly userService: UserService,
    private readonly lobbyService: LobbyService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CreateLobbyPayload = {
      lobbyId: randomUUID(),
    },
  ) { }

  execute(): void {
    const { lobbyId } = this.payload;

    // Validate input
    if (!lobbyId || !isValidUUID(lobbyId)) {
      throw new InvalidPayloadException('Invalid payload: lobbyId must be an UUID.');
    }

    const user = this.userService.findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`User not found with ID: ${this.socket.id}`);
    }

    const lobbyExists = this.lobbyService.findById(lobbyId);

    if (lobbyExists) {
      throw new LobbyExistsException(`Lobby already exists with ID: ${lobbyId}`);
    }

    const lobby = new Lobby(lobbyId);
    lobby.addUser(user);
    this.lobbyService.save(lobby);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;