import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Lights } from '../../domain/entities/GameState';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type PlayedCardPayload = {
  userId: string;
  targetUserId?: string;
  cardId: UUID;
  tableId: UUID;
  lobbyId: UUID;
  gameStateId: UUID;
};

class PlayedCardCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PlayedCardPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { userId, gameStateId, lobbyId, targetUserId, cardId, tableId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const user = this.gameService.getUserService().findById(userId);
    this.entityValidator.validatePlayerExists(user);

    const card = this.gameService.getCardService().findById(cardId) as TwistedCard;
    this.entityValidator.validateCardExists(card);

    this.entityValidator.validateCardInHand(user, card);

    const table = this.gameService.getTableService().findById(tableId);
    this.entityValidator.validateTableExists(table);

    user.removeFromHand(card);
    table.disposeCard(card);

    if (targetUserId) {
      const targetUser = this.gameService.getUserService().findById(targetUserId);

      this.entityValidator.validatePlayerExists(targetUser);

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

    if (gameState.lobby) {
      gameState.lobby.lastActivityTime = Date.now();
    }

    this.io.to(lobbyId).emit('PlayedCard', gameState);
  }
}

export default PlayedCardCommand;