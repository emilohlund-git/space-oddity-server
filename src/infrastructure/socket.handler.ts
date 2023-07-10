import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import CreateLobbyCommand, { CreateLobbyPayload } from '../application/commands/create-lobby.command';
import JoinLobbyCommand, { JoinLobbyPayload } from '../application/commands/join-lobby.command';
import LeaveLobbyCommand, { LeaveLobbyPayload } from '../application/commands/leave-lobby.command';
import SendMessageCommand, { SendMessagePayload } from '../application/commands/send-message.command';
import UserConnectCommand, { UserConnectPayload } from '../application/commands/user-connect.command';
import UserReadyCommand, { UserReadyPayload } from '../application/commands/user-ready.command';
import { LobbyService } from '../application/services/lobby.service';
import { UserService } from '../application/services/user.service';
import { logger } from '../configurations/logger.config';
import { ClientEvents, Command, ServerEvents } from '../domain/interfaces/command.interface';

dotenv.config();

const validApiKeys = [process.env.API_KEY];

class SocketHandler {
  private commands: Record<keyof ClientEvents, (socket: Socket<ClientEvents, ServerEvents>, payload: any) => Command>;

  private readonly io: Server;

  private readonly userService: UserService;

  private readonly lobbyService: LobbyService;

  constructor(
    io: Server,
    userService: UserService,
    lobbyService: LobbyService,
  ) {
    this.io = io;
    this.userService = userService;
    this.lobbyService = lobbyService;
    this.commands = {
      UserConnect: this.createUserConnectCommand.bind(this),
      CreateLobby: this.createCreateLobbyCommand.bind(this),
      JoinLobby: this.createJoinLobbyCommand.bind(this),
      LeaveLobby: this.createLeaveLobbyCommand.bind(this),
      SendMessage: this.createSendMessageCommand.bind(this),
      UserReady: this.createUserReadyCommand.bind(this),
    };
  }

  private createUserConnectCommand(socket: Socket, payload: UserConnectPayload): Command {
    return new UserConnectCommand(this.userService, socket, payload);
  }

  private createCreateLobbyCommand(socket: Socket, payload: CreateLobbyPayload): Command {
    return new CreateLobbyCommand(this.userService, this.lobbyService, socket, payload);
  }

  private createJoinLobbyCommand(socket: Socket, payload: JoinLobbyPayload): Command {
    return new JoinLobbyCommand(this.userService, this.lobbyService, socket, payload);
  }

  private createLeaveLobbyCommand(socket: Socket, payload: LeaveLobbyPayload): Command {
    return new LeaveLobbyCommand(this.userService, this.lobbyService, socket, payload);
  }

  private createSendMessageCommand(socket: Socket, payload: SendMessagePayload): Command {
    return new SendMessageCommand(socket, payload);
  }

  private createUserReadyCommand(socket: Socket, payload: UserReadyPayload): Command {
    return new UserReadyCommand(socket, payload);
  }

  public getCommands(): Record<keyof ClientEvents, (socket: Socket<ClientEvents, ServerEvents>, payload: any) => Command> {
    return this.commands;
  }

  public setCommands(commands: any) {
    this.commands = commands;
  }

  public handleConnection(): void {
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      const apiKey = socket.handshake.headers['x-api-key'] as string | undefined;

      if (!apiKey) {
        return next(new Error('🌎 Connection rejected: No API key'));
      }

      if (!validApiKeys.includes(apiKey)) {
        return next(new Error('🌎 Connection rejected: Invalid API key'));
      }

      logger.info(`🌎 Connection authorized successfully with API key: ${apiKey}`);
      next();
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🌎 ${socket.id} has connected.`);


      Object.entries(this.commands).forEach(([eventName, createCommand]) => {
        socket.on(eventName as keyof ClientEvents, (payload: any) => {
          logger.info(`✨ User: ${socket.id} called Event: ${eventName} to perform command: ${createCommand.name}`);

          try {
            const command = createCommand(socket, payload);
            command.execute(socket);
          } catch (error) {
            this.handleSocketError(error, socket);
          }
        });
      });
    });
  }

  public handleSocketError(error: any, socket: Socket): void {
    logger.error(`Socket error occurred: ${error.message}`);
    socket.emit('error', error.message);
    socket.disconnect(true);
  }
}

export default SocketHandler;
