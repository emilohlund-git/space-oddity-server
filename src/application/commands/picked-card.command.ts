import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type PickedCardPayload = {
  userPreviousId: string;
  userNewId: string;
  cardId: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
  fromOpponent: boolean;
};

class PickedCardCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PickedCardPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { lobbyId, fromOpponent, gameStateId, userPreviousId, userNewId, cardId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const lobby = gameState.getLobby();
    this.entityValidator.validateLobbyExists(lobby);

    const deck = lobby.getDeck();
    this.entityValidator.validateDeckExists(deck);

    const previousOwner = this.gameService.getUserService().findById(userPreviousId);
    this.entityValidator.validatePlayerExists(previousOwner);

    const newOwner = this.gameService.getUserService().findById(userNewId);
    this.entityValidator.validatePlayerExists(newOwner);

    this.entityValidator.validatePlayerInLobby(lobby, newOwner);
    this.entityValidator.validatePlayerInLobby(lobby, previousOwner);

    const card = this.gameService.getCardService().findById(cardId);
    this.entityValidator.validateCardExists(card);

    if (deck.hasCards() && !fromOpponent) {
      const drawnCard = deck.drawCard();

      this.entityValidator.validateCardExists(drawnCard);

      newOwner.addToHand(drawnCard);
    } else {
      this.entityValidator.validateCardInHand(previousOwner, card);

      gameState.transferCard(previousOwner, newOwner, card);
    }

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('PickedCard', gameState);
  }
}

export default PickedCardCommand;