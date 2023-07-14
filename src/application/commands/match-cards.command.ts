import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import Card from '../../domain/entities/Card';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type MatchCardsPayload = {
  userId: string;
  card1Id: UUID;
  card2Id: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
};

class MatchCardsCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: MatchCardsPayload,
  ) { }

  execute(): void {
    const { userId, card1Id, card2Id, gameStateId, lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException();
    }

    const user = this.gameService.getUserService().findById(userId);
    if (!user) {
      throw new UserNotFoundException(`👋 User: ${userId} does not exist.`);
    }

    const card1 = this.gameService.getCardService().findById(card1Id) as Card;
    const card2 = this.gameService.getCardService().findById(card2Id) as Card;
    if (!card1 || !card2) {
      throw new CardNotFoundException('🃏 Cards do not exist.');
    }

    const userHand = user.getHand().getCards();
    if (![card1, card2].every(card => userHand.includes(card))) {
      const missingCardIds = [card1, card2]
        .filter(card => !userHand.includes(card))
        .map(card => card.id)
        .join(' & ');
      throw new CardNotInHandException(`🃏 Cards ${missingCardIds} are not in the player's hand.`);
    }

    user.removeFromHand(card1);
    user.removeFromHand(card2);
    gameState.table.disposeCard(card1);
    gameState.table.disposeCard(card2);

    this.io.to(lobbyId).emit('CardsMatched', gameState);
  }
}

export default MatchCardsCommand;