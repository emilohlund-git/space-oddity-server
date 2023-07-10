import { UUID } from 'crypto';
import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import { CardService } from '../services/card.service';
import { UserService } from '../services/user.service';
import { isValidString } from '../utils/string.validator';
import { isValidUUID } from '../utils/uuid.validator';

export type PickedCardPayload = {
  previousOwnerId: string;
  newOwnerId: string;
  cardId: UUID;
};

class PickedCardCommand implements Command {
  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PickedCardPayload,
  ) { }

  execute(): void {
    const { previousOwnerId, newOwnerId, cardId } = this.payload;

    // Validate input
    if (!cardId || !isValidUUID(cardId)) {
      throw new InvalidPayloadException('Invalid payload: cardId must be a non-empty UUID');
    }

    if (previousOwnerId === newOwnerId) {
      throw new InvalidPayloadException('Invalid payload: userId and cardId must be different.');
    }

    if (!isValidString(previousOwnerId) || !isValidString(newOwnerId)) {
      throw new InvalidPayloadException('Invalid payload: userId and cardId must be a non-empty string.');
    }

    const previousOwner = this.userService.findById(previousOwnerId);
    const newOwner = this.userService.findById(newOwnerId);

    if (!previousOwner || !newOwner) {
      const errorMessage = `👋 ${!previousOwner ? 'Previous owner' : 'New owner'} (${!previousOwner ? previousOwnerId : newOwnerId}) does not exist.`;
      throw new UserNotFoundException(errorMessage);
    }

    const card = this.cardService.findById(cardId);

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