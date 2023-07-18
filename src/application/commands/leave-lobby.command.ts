import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { Command } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type LeaveLobbyPayload = {
  playerId: UUID;
  lobbyId: UUID;
};

class LeaveLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket,
    private readonly payload: LeaveLobbyPayload,
  ) {
    super(payload, new EntityValidator());
  }

  execute(): void {
    const { playerId, lobbyId } = this.payload;

    const user = this.gameService.getUserService().findById(playerId);
    this.entityValidator.validatePlayerExists(user);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    lobby.lastActivityTime = Date.now();
    lobby.removeUser(user.id);
    this.gameService.getLobbyService().save(lobby);
    if (lobby.getPlayers().length === 0) {
      this.gameService.getLobbyService().remove(lobby.id);
    }

    this.socket.leave(lobbyId);
    this.socket.broadcast.to(lobbyId).emit('UserLeftLobby', lobby);
  }
}

export default LeaveLobbyCommand;