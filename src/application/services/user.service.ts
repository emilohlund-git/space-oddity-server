import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public save(user: User) {
    this.userRepository.save(user);
  }

  public findById(userId: string) {
    return this.userRepository.findById(userId);
  }

  public findByUsername(username: string): User | undefined {
    return this.userRepository.findByUsername(username);
  }

  public findAll(): User[] {
    return this.userRepository.findAll();
  }
}