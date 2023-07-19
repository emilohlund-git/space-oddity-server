import { UUID } from 'crypto';
import { Message } from '../../domain/entities/Message';
import { Command } from '../../domain/interfaces/command.interface';

export type SendMessagePayload = {
  playerId: UUID;
  lobbyId: UUID;
  message: string;
};

class SendMessageCommand extends Command {
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