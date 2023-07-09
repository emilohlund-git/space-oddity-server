import type { Socket } from 'socket.io';
import { CreateLobbyPayload } from '../../application/commands/create-lobby.command';
import { JoinLobbyPayload } from '../../application/commands/join-lobby.command';
import { LeaveLobbyPayload } from '../../application/commands/leave-lobby.command';
import { SendMessagePayload } from '../../application/commands/send-message.command';
import { UserConnectPayload } from '../../application/commands/user-connect.command';
import { UserReadyPayload } from '../../application/commands/user-ready.command';
import { Lobby } from '../entities/Lobby';
import { User } from '../entities/User';

export type ClientEvents = {
  UserConnect: (payload: UserConnectPayload) => void;
  CreateLobby: (payload: CreateLobbyPayload) => void;
  JoinLobby: (payload: JoinLobbyPayload) => void;
  LeaveLobby: (payload: LeaveLobbyPayload) => void;
  SendMessage: (payload: SendMessagePayload) => void;
  UserReady: (payload: UserReadyPayload) => void;
};

export type ServerEvents = {
  UserConnected: (user: User) => void;
  LobbyCreated: (lobby: Lobby) => void;
  UserJoinedLobby: (lobbyId: string, user: User) => void;
  UserLeftLobby: (lobbyId: string, userId: string) => void;
  MessageSent: (lobbyId: string, userId: string, message: string) => void;
  UserReady: (lobbyId: string, userId: string) => void;
};

export interface Command {
  execute(socket: Socket<ClientEvents, ServerEvents>): void;
}