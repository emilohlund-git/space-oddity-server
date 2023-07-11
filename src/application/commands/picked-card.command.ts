import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import GameStateFoundException from '../exceptions/game-state-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type PickedCardPayload = {
  userPreviousId: string;
  userNewId: string;
  cardId: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
};

class PickedCardCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PickedCardPayload,
  ) { }

  execute(): void {
    const { lobbyId, gameStateId, userPreviousId, userNewId, cardId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateFoundException();
    }

    const previousOwner = this.gameService.getUserService().findById(userPreviousId);
    const newOwner = this.gameService.getUserService().findById(userNewId);

    if (!previousOwner || !newOwner) {
      throw new UserNotFoundException(`👋 ${!previousOwner ? 'Previous owner' : 'New owner'} (${!previousOwner ? userPreviousId : userNewId}) does not exist.`);
    }

    const card = this.gameService.getCardService().findById(cardId);

    if (!card) {
      throw new CardNotFoundException(`👋 Card: ${cardId} does not exist.`);
    }

    if (!previousOwner.getHand().getCards().includes(card)) {
      throw new CardNotInHandException(`👋 Card: ${cardId} does not exist in players hand.`);
    }

    gameState.transferCard(previousOwner, newOwner, card);

    this.io.to(lobbyId).emit('PickedCard', userNewId, cardId);
  }
}

export default PickedCardCommand;