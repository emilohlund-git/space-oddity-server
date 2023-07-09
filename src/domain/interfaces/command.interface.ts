import type { Socket } from 'socket.io';
import { Lobby } from '../entities/Lobby';
import { User } from '../entities/User';

export type ClientEvents = {
  UserConnect: (payload: { username: string }) => void;
  CreateLobby: (payload: { lobbyId: string }) => void;
  JoinLobby: (payload: { lobbyId: string }) => void;
  LeaveLobby: (payload: { lobbyId: string }) => void;
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