import Card from '../entities/Card';
import Deck from '../entities/Deck';
import GameState from '../entities/GameState';
import { Lobby } from '../entities/Lobby';
import Player from '../entities/Player';
import Table from '../entities/Table';

export interface Validator {
  validateCardInHand(player: Player, card: Card): void;
  validatePlayerInLobby(lobby: Lobby, player: Player): void;
  validateGameStateExists(gameState?: GameState): void;
  validatePlayerExists(player?: Player): void;
  validatePlayerAlreadyExists(player?: Player): void;
  validateCardExists(card?: Card): void;
  validateTableExists(table?: Table): void;
  validateLobbyExists(lobby?: Lobby): void;
  validateDeckExists(deck?: Deck): void;
  validateLobbyHasPlayers(lobby: Lobby): void;
  validateIsYourTurn(gameState: GameState, playerId: string): void;
}