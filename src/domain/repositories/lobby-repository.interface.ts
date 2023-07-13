import { UUID } from 'crypto';
import { Lobby } from '../entities/Lobby';

export interface LobbyRepository {
  save(lobby: Lobby): void;
  findById(id: UUID): Lobby | undefined;
  findAll(): Lobby[];
  clear(): void;
  remove(id: UUID): void;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}