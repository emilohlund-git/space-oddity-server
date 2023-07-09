import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';

export type UserReadyPayload = {
  userId: string;
  lobbyId: string;
};

class UserReadyCommand implements Command {
  constructor(
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserReadyPayload,
  ) { }

  execute(): void {
    const { userId, lobbyId } = this.payload;

    // Validate input
    if (!userId || typeof userId !== 'string' || !lobbyId || typeof lobbyId !== 'string') {
      throw new InvalidPayloadException('Invalid payload: username must be a non-empty string.');
    }

    this.socket.emit('UserReady', userId, lobbyId);
  }
}

export default UserReadyCommand;