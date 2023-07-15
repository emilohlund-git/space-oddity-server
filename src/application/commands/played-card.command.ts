import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Lights } from '../../domain/entities/GameState';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import TableNotFoundException from '../exceptions/table-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type PlayedCardPayload = {
  userId: string;
  targetUserId?: string;
  cardId: UUID;
  tableId: UUID;
  lobbyId: UUID;
  gameStateId: UUID;
};

class PlayedCardCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PlayedCardPayload,
  ) { }

  execute(): void {
    const { userId, gameStateId, lobbyId, targetUserId, cardId, tableId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    const user = this.gameService.getUserService().findById(userId);
    if (!user) {
      const errorMessage = `👋 User: ${userId} does not exist.`;
      throw new UserNotFoundException(errorMessage);
    }

    const card = this.gameService.getCardService().findById(cardId) as TwistedCard;
    if (!card) {
      throw new CardNotFoundException(`👋 Card: ${cardId} does not exist.`);
    }
    if (!user.getHand().getCards().includes(card)) {
      throw new CardNotInHandException(`👋 Card: ${cardId} is not in the user's hand.`);
    }

    const table = this.gameService.getTableService().findById(tableId);
    if (!table) {
      throw new TableNotFoundException(`👋 Table: ${tableId} does not exist.`);
    }

    user.removeFromHand(card);
    table.disposeCard(card);

    if (targetUserId) {
      const targetUser = this.gameService.getUserService().findById(targetUserId);

      if (!targetUser) {
        throw new UserNotFoundException(`👋 User: ${targetUserId} does not exist.`);
      }

      const specialEffect = card.getSpecialEffect();

      if (specialEffect === SpecialEffect.SwapHand) {
        const usersHand = user.getHand();
        const targetHand = targetUser.getHand();
        targetUser.setHand(usersHand);
        user.setHand(targetHand);
      }

      if (specialEffect === SpecialEffect.SwitchLight) {
        const currentLight = gameState.light;
        gameState.light = currentLight === Lights.RED ? Lights.BLUE : Lights.RED;
      }
    }

    this.io.to(lobbyId).emit('PlayedCard', gameState);
  }
}

export default PlayedCardCommand;