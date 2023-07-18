import { UUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import { ClientEvents, Command, ServerEvents } from '../../domain/interfaces/command.interface';
import GameService from '../services/game.service';
import { EntityValidator } from '../utils/entity.validator';

export type JoinLobbyPayload = {
  playerId: UUID;
  lobbyId: UUID;
};

class JoinLobbyCommand extends Command {
  constructor(
    private readonly gameService: GameService,
    private readonly io: Server,
    private readonly socket: Socket<ClientEvents, ServerEvents>,
    private readonly payload: JoinLobbyPayload,
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
    lobby.addUser(user);
    this.socket.join(lobbyId);
    this.gameService.getLobbyService().save(lobby);
    this.io.to(lobbyId).emit('UserJoinedLobby', lobby);
  }
}

export default JoinLobbyCommand;