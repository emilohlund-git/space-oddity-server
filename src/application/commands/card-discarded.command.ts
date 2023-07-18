import { UUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import GameService from '../../application/services/game.service';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import { EntityValidator } from '../utils/entity.validator';

export type CardDiscardedPayload = {
  gameStateId: UUID;
  cardId: UUID;
  lobbyId: UUID;
  playerId: UUID;
};

class CardDiscardedCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CardDiscardedPayload,
  ) {
    super(payload, new EntityValidator());
  }

  public execute(): void {
    const { gameStateId, cardId, lobbyId, playerId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    this.entityValidator.validateLobbyExists(gameState.lobby);

    this.entityValidator.validateLobbyHasPlayers(gameState.lobby);

    const owner = gameState.lobby.getPlayers().find((u) => u.id === playerId);
    this.entityValidator.validatePlayerExists(owner);

    const card = this.gameService.getCardService().findById(cardId);
    this.entityValidator.validateCardExists(card);
    this.entityValidator.validateCardInHand(owner, card);

    owner.removeFromHand(card);
    gameState.table.disposeCard(card);

    this.io.to(lobbyId).emit('DiscardedCard', lobbyId, gameState.table.id, cardId);
  }
}

export default CardDiscardedCommand;