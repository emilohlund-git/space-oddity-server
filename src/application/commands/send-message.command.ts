import { UUID } from 'crypto';
import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type SendMessagePayload = {
  userId: string;
  lobbyId: UUID;
  message: string;
};

class SendMessageCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: SendMessagePayload,
  ) { }

  execute(): void {
    const { userId, lobbyId, message } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    this.socket.emit('MessageSent', userId, lobbyId, message);
  }
}

export default SendMessageCommand;