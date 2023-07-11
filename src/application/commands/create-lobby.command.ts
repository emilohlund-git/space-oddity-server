import type { Server, Socket } from 'socket.io';
import { getShuffledDeck } from '../../../test/utils/test.utils';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';

export type CreateLobbyPayload = {};

class CreateLobbyCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload?: CreateLobbyPayload,
  ) { }

  execute(): void {
    const user = this.gameService.getUserService().findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`User not found with ID: ${this.socket.id}`);
    }

    const lobby = new Lobby();
    lobby.addUser(user);
    lobby.setDeck(getShuffledDeck());
    this.gameService.getLobbyService().save(lobby);

    this.socket.join(lobby.id);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;