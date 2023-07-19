import { logger } from '../../configurations/logger.config';
import Player from '../../domain/entities/Player';
import { Command } from '../../domain/interfaces/command.interface';

export type UserConnectPayload = {
  username: string;
};

class UserConnectCommand extends Command {
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