import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import Card from '../../domain/entities/Card';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type MatchCardsPayload = {
  playerId: UUID;
  card1Id: UUID;
  card2Id: UUID;
  gameStateId: UUID;
  lobbyId: UUID;
};

class MatchCardsCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: MatchCardsPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { playerId, card1Id, card2Id, gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const card1 = this.gameService.getCardService().findById(card1Id) as Card;
    this.entityValidator.validateCardExists(card1);

    const card2 = this.gameService.getCardService().findById(card2Id) as Card;
    this.entityValidator.validateCardExists(card2);

    this.entityValidator.validateCardInHand(user, card1);
    this.entityValidator.validateCardInHand(user, card2);

    user.removeFromHand(card1);
    user.removeFromHand(card2);
    gameState.table.disposeCard(card1);
    gameState.table.disposeCard(card2);

    this.io.to(lobbyId).emit('CardsMatched', gameState);
  }
}

export default MatchCardsCommand;