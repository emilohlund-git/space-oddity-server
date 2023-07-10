import { UUID } from 'crypto';
import { Lobby } from '../../domain/entities/Lobby';
import { LobbyRepository } from '../../domain/repositories/lobby-repository.interface';

export class InMemoryLobbyRepository implements LobbyRepository {
  private lobbies: Map<UUID, Lobby>;

  constructor() {
    this.lobbies = new Map<UUID, Lobby>();
  }

  save(lobby: Lobby): void {
    this.lobbies.set(lobby.id, lobby);
  }

  findById(id: UUID): Lobby | undefined {
    return this.lobbies.get(id);
  }

  findAll(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  clear() {
    this.lobbies = new Map<UUID, Lobby>();
  }

  // Implement other methods as needed
}