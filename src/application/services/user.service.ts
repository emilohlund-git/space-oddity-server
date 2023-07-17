import Player from '../../domain/entities/Player';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public save(user: Player) {
    this.userRepository.save(user);
  }

  public saveMany(players: Player[]) {
    for (const player of players) {
      this.userRepository.save(player);
    }
  }

  public remove(userId: string) {
    this.userRepository.remove(userId);
  }

  public removeMany(players: Player[]) {
    this.userRepository.removeMany(players);
  }

  public findById(userId: string) {
    return this.userRepository.findById(userId);
  }

  public findByUsername(username: string): Player | undefined {
    return this.userRepository.findByUsername(username);
  }

  public findAll(): Player[] {
    return this.userRepository.findAll();
  }
}