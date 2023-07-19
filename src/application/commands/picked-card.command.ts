import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';

export type PickedCardPayload = {
  playerPreviousId: UUID;
  playerNewId: UUID;
  cardId: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
  fromOpponent: boolean;
};

class PickedCardCommand extends Command {
  execute(): void {
    const { lobbyId, fromOpponent, gameStateId, playerPreviousId, playerNewId, cardId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const deck = lobby.getDeck();
    this.entityValidator.validateDeckExists(deck);

    const previousOwner = this.gameService.getUserService().findById(playerPreviousId);
    this.entityValidator.validatePlayerExists(previousOwner);

    const newOwner = this.gameService.getUserService().findById(playerNewId);
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

    lobby.lastActivityTime = Date.now();

    this.io.to(lobbyId).emit('PickedCard', gameState);

    const winner = gameState.checkLobbyWinner();

    if (winner) {
      this.io.to(lobbyId).emit('GameEnded', winner);
    }
  }
}

export default PickedCardCommand;