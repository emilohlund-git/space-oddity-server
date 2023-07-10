import { UUID, randomUUID } from 'crypto';
import type { Socket } from 'socket.io';
import Deck from '../../domain/entities/Deck';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyExistsException from '../exceptions/lobby-exists.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type CreateLobbyPayload = {
  lobbyId: UUID;
  deck: Deck;
};

class CreateLobbyCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CreateLobbyPayload = {
      lobbyId: randomUUID(),
      deck: new Deck(),
    },
  ) { }

  execute(): void {
    const { lobbyId, deck } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const user = this.gameService.getUserService().findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`User not found with ID: ${this.socket.id}`);
    }

    const lobbyExists = this.gameService.getLobbyService().findById(lobbyId);

    if (lobbyExists) {
      throw new LobbyExistsException(`Lobby already exists with ID: ${lobbyId}`);
    }

    const lobby = new Lobby(lobbyId, deck);
    lobby.addUser(user);
    this.gameService.getLobbyService().save(lobby);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;