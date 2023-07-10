import type { Socket } from 'socket.io';
import { ChangeTurnPayload } from '../../application/commands/change-turn.command';
import { JoinLobbyPayload } from '../../application/commands/join-lobby.command';
import { LeaveLobbyPayload } from '../../application/commands/leave-lobby.command';
import { PickedCardPayload } from '../../application/commands/picked-card.command';
import { PlayedCardPayload } from '../../application/commands/played-card.command';
import { SendMessagePayload } from '../../application/commands/send-message.command';
import { UserConnectPayload } from '../../application/commands/user-connect.command';
import { UserReadyPayload } from '../../application/commands/user-ready.command';
import { Lobby } from '../entities/Lobby';
import { SpecialEffect } from '../entities/TwistedCard';
import { User } from '../entities/User';

export type ClientEvents = {
  UserConnect: (payload: UserConnectPayload) => void;
  CreateLobby: () => void;
  JoinLobby: (payload: JoinLobbyPayload) => void;
  LeaveLobby: (payload: LeaveLobbyPayload) => void;
  SendMessage: (payload: SendMessagePayload) => void;
  UserReady: (payload: UserReadyPayload) => void;
  PickedCard: (payload: PickedCardPayload) => void;
  PlayedCard: (payload: PlayedCardPayload) => void;
  ChangeTurn: (payload: ChangeTurnPayload) => void;
};

export type ServerEvents = {
  UserConnected: (user: User) => void;
  LobbyCreated: (lobby: Lobby) => void;
  UserJoinedLobby: (lobbyId: string, user: User) => void;
  UserLeftLobby: (lobbyId: string, userId: string) => void;
  MessageSent: (lobbyId: string, userId: string, message: string) => void;
  UserReady: (lobbyId: string, userId: string) => void;
  PickedCard: (cardId: string, userId: string) => void;
  PlayedCard: (cardEffect: SpecialEffect, userId: string, targetUserId?: string) => void;
  ChangeTurn: (userId: string) => void;
};

export interface Command {
  execute(socket: Socket<ClientEvents, ServerEvents>): void;
}