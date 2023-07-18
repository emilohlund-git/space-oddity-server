import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type PingPayload = {};

class PingCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: PingPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    this.socket.emit('Pong');
  }
}

export default PingCommand;