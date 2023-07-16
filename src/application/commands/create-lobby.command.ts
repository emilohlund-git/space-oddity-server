import type { Server, Socket } from 'socket.io';
import { Lobby } from '../../domain/entities/Lobby';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { getShuffledDeck } from '../utils/deck.utils';
import { EntityValidator } from '../utils/entity.validator';

export type CreateLobbyPayload = {};

class CreateLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CreateLobbyPayload,
  ) {
    super({}, new EntityValidator());
  }

  execute(): void {
    const user = this.gameService.getUserService().findById(this.socket.id);
    this.entityValidator.validatePlayerExists(user);

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