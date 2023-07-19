import { UUID } from 'crypto';
import { Lights } from '../../domain/entities/GameState';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';
import { Command } from '../../domain/interfaces/command.interface';

export type PlayedCardPayload = {
  playerId: UUID;
  targetPlayerId?: UUID;
  cardId: UUID;
  tableId: UUID;
  lobbyId: UUID;
  gameStateId: UUID;
};

class PlayedCardCommand extends Command {
  execute(): void {
    const { playerId, gameStateId, lobbyId, targetPlayerId, cardId, tableId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const card = this.gameService.getCardService().findById(cardId) as TwistedCard;
    this.entityValidator.validateCardExists(card);

    this.entityValidator.validateCardInHand(user, card);

    const table = this.gameService.getTableService().findById(tableId);
    this.entityValidator.validateTableExists(table);

    user.removeFromHand(card);
    table.disposeCard(card);

    if (targetPlayerId) {
      const targetUser = this.gameService.getUserService().findById(targetPlayerId);

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