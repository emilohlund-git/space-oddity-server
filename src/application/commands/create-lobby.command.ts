import type { Server, Socket } from 'socket.io';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { getShuffledDeck } from '../utils/deck.utils';

export type CreateLobbyPayload = {};

class CreateLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CreateLobbyPayload,
  ) {
    super({});
  }

  execute(): void {
    const user = this.gameService.getUserService().findById(this.socket.id);

    if (!user) {
      throw new UserNotFoundException(`User not found with ID: ${this.socket.id}`);
    }

    const lobby = new Lobby(user);
    const deck = getShuffledDeck();

    lobby.setDeck(deck);

    this.gameService.getCardService().saveMany(deck.getCards());
    this.gameService.getLobbyService().save(lobby);

    this.socket.join(lobby.id);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;