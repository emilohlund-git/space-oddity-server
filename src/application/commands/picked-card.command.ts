import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import DeckIsEmptyException from '../exceptions/deck-is-empty.exception';
import DeckNotFoundException from '../exceptions/deck-not-found.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import PlayerNotInLobbyException from '../exceptions/player-not-in-lobby.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';

export type PickedCardPayload = {
  userPreviousId: string;
  userNewId: string;
  cardId: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
};

class PickedCardCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PickedCardPayload,
  ) {
    super(payload);
  }

  execute(): void {
    const { lobbyId, gameStateId, userPreviousId, userNewId, cardId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    const lobby = gameState.getLobby();

    if (!lobby) {
      throw new LobbyNotFoundException();
    }

    const deck = lobby.getDeck();

    if (!deck) {
      throw new DeckNotFoundException();
    }

    const previousOwner = this.gameService.getUserService().findById(userPreviousId);
    const newOwner = this.gameService.getUserService().findById(userNewId);

    if (!previousOwner || !newOwner) {
      throw new UserNotFoundException(`👋 ${!previousOwner ? 'Previous owner' : 'New owner'} (${!previousOwner ? userPreviousId : userNewId}) does not exist.`);
    }

    if (!lobby.getPlayers().includes(previousOwner) || !lobby.getPlayers().includes(newOwner)) {
      throw new PlayerNotInLobbyException();
    }

    const card = this.gameService.getCardService().findById(cardId);

    if (!card) {
      throw new CardNotFoundException(`👋 Card: ${cardId} does not exist.`);
    }

    if (deck.hasCards()) {
      const drawnCard = deck.drawCard();

      if (!drawnCard) {
        throw new DeckIsEmptyException();
      }

      newOwner.addToHand(drawnCard);
    } else {
      if (!previousOwner.getHand().getCards().includes(card)) {
        throw new CardNotInHandException(`👋 Card: ${cardId} does not exist in players hand.`);
      }

      gameState.transferCard(previousOwner, newOwner, card);
    }

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('PickedCard', gameState);
  }
}

export default PickedCardCommand;