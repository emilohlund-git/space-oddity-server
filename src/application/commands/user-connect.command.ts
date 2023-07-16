import type { Server, Socket } from 'socket.io';
import { logger } from '../../configurations/logger.config';
import Player from '../../domain/entities/Player';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type UserConnectPayload = {
  username: string;
};

class UserConnectCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserConnectPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): any {
    const { username } = this.payload;

    logger.info(`👤 ${username} just connected to the server.`);

    const userExists = this.gameService.getUserService().findById(this.socket.id);
    this.entityValidator.validatePlayerAlreadyExists(userExists);

    const userToCreate = new Player(this.socket.id, username);

    this.gameService.getUserService().save(userToCreate);
    const userCreated = this.gameService.getUserService().findById(this.socket.id);

    this.io.to(this.socket.id).emit('UserConnected', userCreated);

    return userCreated;
  }
}

export default UserConnectCommand;