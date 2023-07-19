import { UUID } from 'crypto';
import { Lobby } from '../../domain/entities/Lobby';
import { Command } from '../../domain/interfaces/command.interface';
import { getShuffledDeck } from '../utils/deck.utils';

export type CreateLobbyPayload = {
  playerId: UUID;
};

class CreateLobbyCommand extends Command {
  execute(): void {
    const { playerId } = this.payload;

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const lobby = new Lobby(user);
    const deck = getShuffledDeck();

    lobby.setDeck(deck);

    this.gameService.getCardService().saveMany(deck.getCards());
    this.gameService.getLobbyService().save(lobby);
    this.gameService.getDeckService().save(deck);

    this.socket.join(lobby.id);
    this.socket.emit('LobbyCreated', lobby);
  }
}

export default CreateLobbyCommand;