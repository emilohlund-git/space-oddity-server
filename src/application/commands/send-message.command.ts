import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Message } from '../../domain/entities/Message';
import type { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import UserNotFoundException from '../exceptions/user-not-found.exception';
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
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: SendMessagePayload,
  ) { }

  execute(): void {
    const { userId, lobbyId, message } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const player = this.gameService.getUserService().findById(userId);

    if (!player) {
      throw new UserNotFoundException();
    }

    const lobby = this.gameService.getLobbyService().findById(lobbyId);

    if (!lobby) {
      throw new LobbyNotFoundException();
    }

    const lobbyMessage = new Message(player, message);

    lobby.addMessage(lobbyMessage);
    lobby.lastActivityTime = Date.now();

    this.io.to(lobbyId).emit('MessageSent', lobby);
  }
}

export default SendMessageCommand;