import { UUID } from 'crypto';
import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type PickedCardPayload = {
  previousOwnerId: string;
  newOwnerId: string;
  cardId: UUID;
};

class PickedCardCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PickedCardPayload,
  ) { }

  execute(): void {
    const { previousOwnerId, newOwnerId, cardId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const previousOwner = this.gameService.getUserService().findById(previousOwnerId);
    const newOwner = this.gameService.getUserService().findById(newOwnerId);

    if (!previousOwner || !newOwner) {
      const errorMessage = `👋 ${!previousOwner ? 'Previous owner' : 'New owner'} (${!previousOwner ? previousOwnerId : newOwnerId}) does not exist.`;
      throw new UserNotFoundException(errorMessage);
    }

    const card = this.gameService.getCardService().findById(cardId);

    if (!card) {
      throw new CardNotFoundException(`👋 Card: ${cardId} does not exist.`);
    }

    if (!previousOwner.getHand().getCards().includes(card)) {
      throw new CardNotInHandException(`👋 Card: ${cardId} does not exist in players hand.`);
    }

    previousOwner.removeFromHand(card);
    card.setOwner(newOwner);
    newOwner.addToHand(card);

    this.socket.emit('PickedCard', newOwnerId, cardId);
  }
}

export default PickedCardCommand;