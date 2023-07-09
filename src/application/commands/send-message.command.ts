import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import { isValidUUID } from '../utils/uuid.validator';

export type SendMessagePayload = {
  userId: string;
  lobbyId: string;
  message: string;
};

class SendMessageCommand implements Command {
  constructor(
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: SendMessagePayload,
  ) { }

  execute(): void {
    const { userId, lobbyId, message } = this.payload;

    // Validate input
    if (!userId || typeof userId !== 'string' || !lobbyId || !isValidUUID(lobbyId) || !message || typeof message !== 'string') {
      throw new InvalidPayloadException('Invalid payload: username must be a non-empty string.');
    }

    this.socket.emit('MessageSent', userId, lobbyId, message);
  }
}

export default SendMessageCommand;