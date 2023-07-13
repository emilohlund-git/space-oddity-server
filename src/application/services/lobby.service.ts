import { UUID } from 'crypto';
import { Lobby } from '../../domain/entities/Lobby';
import { LobbyRepository } from '../../domain/repositories/lobby-repository.interface';

export class LobbyService {
  private lobbyRepository: LobbyRepository;

  constructor(lobbyRepository: LobbyRepository) {
    this.lobbyRepository = lobbyRepository;
  }

  save(lobby: Lobby): void {
    this.lobbyRepository.save(lobby);
  }

  findById(lobbyId: UUID) {
    return this.lobbyRepository.findById(lobbyId);
  }

  findAll(): Lobby[] {
    return this.lobbyRepository.findAll();
  }

  remove(lobbyId: UUID): void {
    this.lobbyRepository.remove(lobbyId);
  }
}