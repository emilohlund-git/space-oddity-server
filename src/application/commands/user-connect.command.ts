import type { Socket } from 'socket.io';
import { User } from '../../domain/entities/User';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import FailedUserConnectionException from '../exceptions/failed-user-connection.exception';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import { UserService } from '../services/user.service';

export type UserConnectPayload = {
  username: string;
};

class UserConnectCommand implements Command {
  constructor(
    private readonly userService: UserService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserConnectPayload,
  ) { }

  execute(): void {
    const { username } = this.payload;

    // Validate input
    if (!username || typeof username !== 'string') {
      throw new InvalidPayloadException('Invalid payload: username must be a non-empty string.');
    }

    const userExists = this.userService.findById(this.socket.id);

    if (userExists) {
      throw new FailedUserConnectionException(`👋 User: ${this.socket.id} already exists.`);
    }

    const userToCreate = new User(this.socket.id, this.payload.username);

    this.userService.save(userToCreate);
    const userCreated = this.userService.findById(this.socket.id);

    if (!userCreated) {
      throw new FailedUserConnectionException(`👋 Failed to connect User: ${this.socket.id}.`);
    }

    this.socket.emit('UserConnected', userCreated);
  }
}

export default UserConnectCommand;