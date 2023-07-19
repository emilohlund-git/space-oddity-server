import { CardDiscardedPayload } from '../../application/commands/card-discarded.command';
import { ChangeTurnPayload } from '../../application/commands/change-turn.command';
import { CreateLobbyPayload } from '../../application/commands/create-lobby.command';
import { GameOverPayload } from '../../application/commands/game-over.command';
import { JoinLobbyPayload } from '../../application/commands/join-lobby.command';
import { LeaveLobbyPayload } from '../../application/commands/leave-lobby.command';
import { MatchCardsPayload } from '../../application/commands/match-cards.command';
import { PickedCardPayload } from '../../application/commands/picked-card.command';
import { PingPayload } from '../../application/commands/ping.command';
import { PlayedCardPayload } from '../../application/commands/played-card.command';
import { RetrieveGameStatePayload } from '../../application/commands/retrieve-game-state.command';
import { SaveGameStatePayload } from '../../application/commands/save-game-state.command';
import { SendMessagePayload } from '../../application/commands/send-message.command';
import { StartGamePayload } from '../../application/commands/start-game.command';
import { UserConnectPayload } from '../../application/commands/user-connect.command';
import { UserDisconnectPayload } from '../../application/commands/user-disconnect.command';
import { UserReadyPayload } from '../../application/commands/user-ready.command';
import { EntityValidator } from '../../application/utils/entity.validator';
import { createPayloadValidationRules, validatePayload } from '../../application/utils/payload.validator';
import GameState from '../entities/GameState';
import { Lobby } from '../entities/Lobby';
import Player from '../entities/Player';
import { SpecialEffect } from '../entities/TwistedCard';

export type ClientEvents = {
  UserConnect: (payload: UserConnectPayload) => void;
  CreateLobby: (payload: CreateLobbyPayload) => void;
  JoinLobby: (payload: JoinLobbyPayload) => void;
  LeaveLobby: (payload: LeaveLobbyPayload) => void;
  SendMessage: (payload: SendMessagePayload) => void;
  UserReady: (payload: UserReadyPayload) => void;
  PickedCard: (payload: PickedCardPayload) => void;
  PlayedCard: (payload: PlayedCardPayload) => void;
  ChangeTurn: (payload: ChangeTurnPayload) => void;
  StartGame: (payload: StartGamePayload) => void;
  CardDiscarded: (payload: CardDiscardedPayload) => void;
  GameOver: (payload: GameOverPayload) => void;
  UserDisconnect: (payload: UserDisconnectPayload) => void;
  MatchCards: (payload: MatchCardsPayload) => void;
  SaveGameState: (payload: SaveGameStatePayload) => void;
  RetrieveGameState: (payload: RetrieveGameStatePayload) => void;
  Ping: (payload: PingPayload) => void;
};

export type ServerEvents = {
  UserConnected: (user: Player) => void;
  LobbyCreated: (lobby: Lobby) => void;
  UserJoinedLobby: (lobbyId: string, user: Player) => void;
  UserLeftLobby: (lobbyId: string, userId: string) => void;
  MessageSent: (lobbyId: string, userId: string, message: string) => void;
  UserReady: (lobbyId: string, userId: string) => void;
  PickedCard: (cardId: string, userId: string) => void;
  PlayedCard: (cardEffect: SpecialEffect, userId: string, targetUserId?: string) => void;
  ChangeTurn: (userId: string) => void;
  GameStarted: () => void;
  DiscardedCard: (lobbyId: string, tableId: string, cardId: string) => void;
  GameEnded: () => void;
  UserDisconnected: (user: Player) => void;
  CardsMatched: (gameState: GameState) => void;
  GameStateSaved: () => void;
  GameStateRetrieved: (payload: {
    gameState: GameState,
    player: Player,
  }) => void;
  Pong: () => any;
};

export abstract class Command {
  constructor(
    payload: Record<string, any>,
    protected readonly entityValidator: EntityValidator,
  ) {
    this.payloadValidation(payload);
    this.entityValidator = new EntityValidator();
  }

  public abstract execute(): void;

  private payloadValidation(payload: Record<string, any>) {
    const payloadValidationRules = createPayloadValidationRules(payload);
    validatePayload(payload, payloadValidationRules);
  }
}