import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type UserReadyPayload = {
  userId: string;
  lobbyId: UUID;
};

class UserReadyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserReadyPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { userId, lobbyId } = this.payload;

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const user = this.gameService.getUserService().findById(userId);
    this.entityValidator.validatePlayerExists(user);

    user.setIsReady();

    this.io.to(lobbyId).emit('UserReady', lobby);
  }
}

export default UserReadyCommand;