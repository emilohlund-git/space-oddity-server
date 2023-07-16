import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';

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
    super(payload);
  }

  execute(): void {
    const { userId, lobbyId } = this.payload;

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException();
    }

    const user = this.gameService.getUserService().findById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    user.setIsReady();

    this.io.to(lobbyId).emit('UserReady', lobby);
  }
}

export default UserReadyCommand;