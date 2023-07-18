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

  execute(): void {
    const { username } = this.payload;

    logger.info(`👤 ${username} just connected to the server.`);

    const userExists = this.gameService.getUserService().findByUsername(username);
    this.entityValidator.validatePlayerAlreadyExists(userExists);

    const userToCreate = new Player(username);
    this.gameService.getUserService().save(userToCreate);

    this.io.to(this.socket.id).emit('UserConnected', userToCreate);
  }
}

export default UserConnectCommand;