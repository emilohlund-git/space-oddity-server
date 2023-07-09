import { Lobby } from '../entities/Lobby';

export interface LobbyRepository {
  save(lobby: Lobby): void;
  findById(id: string): Lobby | undefined;
  findAll(): Lobby[];
  clear(): void;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}