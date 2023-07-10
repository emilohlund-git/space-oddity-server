import type { Socket } from 'socket.io';
import Player from '../../domain/entities/Player';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import FailedUserConnectionException from '../exceptions/failed-user-connection.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type UserConnectPayload = {
  username: string;
};

class UserConnectCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserConnectPayload,
  ) { }

  execute(): void {
    const { username } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const userExists = this.gameService.getUserService().findById(this.socket.id);

    if (userExists) {
      throw new FailedUserConnectionException(`👋 User: ${this.socket.id} already exists.`);
    }

    const userToCreate = new Player(this.socket.id, username);

    this.gameService.getUserService().save(userToCreate);
    const userCreated = this.gameService.getUserService().findById(this.socket.id);

    if (!userCreated) {
      throw new FailedUserConnectionException(`👋 Failed to connect User: ${this.socket.id}.`);
    }

    this.socket.emit('UserConnected', userCreated);
  }
}

export default UserConnectCommand;