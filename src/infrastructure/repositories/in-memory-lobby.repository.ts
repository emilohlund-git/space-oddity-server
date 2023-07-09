import { Lobby } from '../../domain/entities/Lobby';
import { LobbyRepository } from '../../domain/repositories/lobby-repository.interface';

export class InMemoryLobbyRepository implements LobbyRepository {
  private lobbies: Map<string, Lobby>;

  constructor() {
    this.lobbies = new Map<string, Lobby>();
  }

  save(lobby: Lobby): void {
    this.lobbies.set(lobby.id, lobby);
  }

  findById(id: string): Lobby | undefined {
    return this.lobbies.get(id);
  }

  // Implement other methods as needed
}