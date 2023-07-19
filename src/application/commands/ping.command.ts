import { Command } from '../../domain/interfaces/command.interface';

export type PingPayload = {};

class PingCommand extends Command {
  execute(): void {
    this.socket.emit('Pong');
  }
}

export default PingCommand;