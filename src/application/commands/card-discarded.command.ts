import { UUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import GameService from '../../application/services/game.service';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../exceptions/no-players-in-game.exception';
import OwnerNotFoundException from '../exceptions/owner-not-found.exception';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type CardDiscardedPayload = {
  gameStateId: UUID;
  cardId: UUID;
  lobbyId: UUID;
  userId: string;
};

class CardDiscardedCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: CardDiscardedPayload,
  ) { }

  public execute(): void {
    const { gameStateId, cardId, lobbyId, userId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const gameState = this.gameService.getGameState(gameStateId);

    if (!gameState) {
      throw new GameStateNotFoundException();
    }

    if (!gameState.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    if (gameState.lobby.getPlayers().length === 0) {
      throw new NoPlayersInGameException();
    }

    const owner = gameState.lobby.getPlayers().find((u) => u.id === userId);

    if (!owner) {
      throw new OwnerNotFoundException();
    }

    const card = gameState.getCurrentPlayer().getHand().getCard(cardId);

    if (!card) {
      throw new CardNotInHandException();
    }

    owner.removeFromHand(card);
    gameState.table.disposeCard(card);

    this.io.to(lobbyId).emit('DiscardedCard', lobbyId, gameState.table.id, cardId);
  }
}

export default CardDiscardedCommand;