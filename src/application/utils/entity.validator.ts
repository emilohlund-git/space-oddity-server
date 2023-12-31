import Card from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import GameState from '../../domain/entities/GameState';
import { Lobby } from '../../domain/entities/Lobby';
import Player from '../../domain/entities/Player';
import Table from '../../domain/entities/Table';
import { Validator } from '../../domain/interfaces/validator.interface';
import CardNotFoundException from '../exceptions/card-not-found.exception';
import CardNotInHandException from '../exceptions/card-not-in-hand.exception';
import DeckNotFoundException from '../exceptions/deck-not-found.exception';
import FailedToRetrieveGameStateException from '../exceptions/failed-to-retrieve-game-state.exception';
import FailedUserConnectionException from '../exceptions/failed-user-connection.exception';
import GameStateNotFoundException from '../exceptions/game-state-not-found.exception';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../exceptions/no-players-in-game.exception';
import NotYourTurnException from '../exceptions/not-your-turn.exception';
import PlayerNotInLobbyException from '../exceptions/player-not-in-lobby.exception';
import TableNotFoundException from '../exceptions/table-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import { GameStateJson } from '../services/file.service';

export class EntityValidator implements Validator {
  validateRetrievedGameState(gameStateJson?: GameStateJson): asserts gameStateJson is GameStateJson {
    if (!gameStateJson?.id || Object.keys(gameStateJson).length === 0) {
      throw new FailedToRetrieveGameStateException();
    }
  }

  validateCardInHand(player: Player, card: Card): void {
    if (!player.getHand().getCards().find((c) => c.id === card.id)) {
      throw new CardNotInHandException(`👋 Card: ${card.id} is not in the user's hand.`);
    }
  }

  validatePlayerInLobby(lobby: Lobby, player: Player): void {
    const existingPlayer = lobby.getPlayers().find((p) => p.id === player.id);
    if (!existingPlayer) {
      throw new PlayerNotInLobbyException();
    }
  }

  validateIsYourTurn(gameState: GameState, playerId: string): void {
    if (gameState.getCurrentPlayer()?.id !== playerId) {
      throw new NotYourTurnException('Cannot change turn: It is not your turn');
    }
  }

  validateGameStateExists(gameState?: GameState): asserts gameState is GameState {
    if (!gameState) {
      throw new GameStateNotFoundException();
    }
  }

  validatePlayerExists(player?: Player): asserts player is Player {
    if (!player) {
      throw new UserNotFoundException();
    }
  }

  validatePlayerAlreadyExists(player?: Player): void {
    if (player) {
      throw new FailedUserConnectionException();
    }
  }

  validateCardExists(card?: Card): asserts card is Card {
    if (!card) {
      throw new CardNotFoundException();
    }
  }

  validateTableExists(table?: Table): asserts table is Table {
    if (!table) {
      throw new TableNotFoundException();
    }
  }

  validateLobbyExists(lobby?: Lobby): asserts lobby is Lobby {
    if (!lobby) {
      throw new LobbyNotFoundException();
    }
  }

  validateLobbyHasPlayers(lobby: Lobby): void {
    if (lobby.getPlayers().length === 0) {
      throw new NoPlayersInGameException();
    }
  }

  validateDeckExists(deck?: Deck): asserts deck is Deck {
    if (!deck) {
      throw new DeckNotFoundException();
    }
  }
}