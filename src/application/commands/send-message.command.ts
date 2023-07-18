import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Message } from '../../domain/entities/Message';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type SendMessagePayload = {
  playerId: UUID;
  lobbyId: UUID;
  message: string;
};

class SendMessageCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: SendMessagePayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { playerId, lobbyId, message } = this.payload;

    const player = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(player);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    const lobbyMessage = new Message(player, message);

    lobby.addMessage(lobbyMessage);
    lobby.lastActivityTime = Date.now();

    this.io.to(lobbyId).emit('MessageSent', lobby);
  }
}

export default SendMessageCommand;