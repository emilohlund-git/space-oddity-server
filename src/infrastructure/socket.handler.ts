import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import ChangeTurnCommand from '../application/commands/change-turn.command';
import CreateLobbyCommand from '../application/commands/create-lobby.command';
import JoinLobbyCommand from '../application/commands/join-lobby.command';
import LeaveLobbyCommand from '../application/commands/leave-lobby.command';
import PickedCardCommand from '../application/commands/picked-card.command';
import PlayedCardCommand from '../application/commands/played-card.command';
import SendMessageCommand from '../application/commands/send-message.command';
import StartGameCommand from '../application/commands/start-game.command';
import UserConnectCommand from '../application/commands/user-connect.command';
import UserReadyCommand from '../application/commands/user-ready.command';
import GameService from '../application/services/game.service';
import { logger } from '../configurations/logger.config';
import { ClientEvents, Command, ServerEvents } from '../domain/interfaces/command.interface';

dotenv.config();

const validApiKeys = [process.env.API_KEY];

export type CommandFactory = Record<keyof ClientEvents, (socket: Socket<ClientEvents, ServerEvents>, payload: any) => Command>;

class SocketHandler {
  private commandFactory: CommandFactory;

  private readonly io: Server;

  constructor(
    io: Server,
    private readonly gameService: GameService,
  ) {
    this.io = io;
    this.commandFactory = {} as CommandFactory;

    this.registerCommand('UserConnect', UserConnectCommand, [this.gameService, this.io]);
    this.registerCommand('CreateLobby', CreateLobbyCommand, [this.gameService, this.io]);
    this.registerCommand('JoinLobby', JoinLobbyCommand, [this.gameService, this.io]);
    this.registerCommand('LeaveLobby', LeaveLobbyCommand, [this.gameService, this.io]);
    this.registerCommand('SendMessage', SendMessageCommand, [this.gameService, this.io]);
    this.registerCommand('UserReady', UserReadyCommand, [this.gameService, this.io]);
    this.registerCommand('PickedCard', PickedCardCommand, [this.gameService, this.io]);
    this.registerCommand('PlayedCard', PlayedCardCommand, [this.gameService, this.io]);
    this.registerCommand('ChangeTurn', ChangeTurnCommand, [this.gameService, this.io]);
    this.registerCommand('StartGame', StartGameCommand, [this.gameService, this.io]);
  }

  public registerCommand<T extends Command>(
    eventName: keyof ClientEvents,
    commandClass: new (...args: any[]) => T,
    commandArgs: any[],
  ): void {
    this.commandFactory[eventName] = (socket: Socket<ClientEvents, ServerEvents>, payload: any) => {
      return new commandClass(...commandArgs, socket, payload);
    };
  }

  public getCommands(): CommandFactory {
    return this.commandFactory;
  }

  public setCommands(commands: CommandFactory) {
    this.commandFactory = commands;
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

      Object.entries(this.commandFactory).forEach(([eventName, createCommand]) => {
        socket.on(eventName as keyof ClientEvents, (payload: any) => {
          logger.info(`✨ User: ${socket.id} called Event: ${eventName} with payload: ${payload}`);

          try {
            const command = createCommand(socket, payload);
            command.execute();
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
