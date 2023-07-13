import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type UserReadyPayload = {
  userId: string;
  lobbyId: UUID;
};

class UserReadyCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserReadyPayload,
  ) { }

  execute(): void {
    const { userId, lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

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