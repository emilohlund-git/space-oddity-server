import { Lobby } from '../entities/Lobby';

export interface LobbyRepository {
  save(lobby: Lobby): void;
  findById(id: string): Lobby | undefined;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}