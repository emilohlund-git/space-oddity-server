import type { Socket } from 'socket.io';
import { CreateLobbyPayload } from '../../application/commands/create-lobby.command';
import { JoinLobbyPayload } from '../../application/commands/join-lobby.command';
import { LeaveLobbyPayload } from '../../application/commands/leave-lobby.command';
import { UserConnectPayload } from '../../application/commands/user-connect.command';
import { Lobby } from '../entities/Lobby';
import { User } from '../entities/User';

export type ClientEvents = {
  UserConnect: (payload: UserConnectPayload) => void;
  CreateLobby: (payload: CreateLobbyPayload) => void;
  JoinLobby: (payload: JoinLobbyPayload) => void;
  LeaveLobby: (payload: LeaveLobbyPayload) => void;
};

export type ServerEvents = {
  UserConnected: (user: User) => void;
  LobbyCreated: (lobby: Lobby) => void;
  UserJoinedLobby: (lobbyId: string, user: User) => void;
  UserLeftLobby: (lobbyId: string, userId: string) => void;
};

export interface Command {
  execute(socket: Socket<ClientEvents, ServerEvents>): void;
}