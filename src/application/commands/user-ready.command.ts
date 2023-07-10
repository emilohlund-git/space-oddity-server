import type { Socket } from 'socket.io';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type UserReadyPayload = {
  userId: string;
  lobbyId: string;
};

class UserReadyCommand implements Command {
  constructor(
    private readonly gameService: GameService,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: UserReadyPayload,
  ) { }

  execute(): void {
    const { userId, lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    this.socket.emit('UserReady', userId, lobbyId);
  }
}

export default UserReadyCommand;