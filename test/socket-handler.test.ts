/* eslint-disable import/no-extraneous-dependencies */
import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import CreateLobbyCommand from '../src/application/commands/create-lobby.command';
import JoinLobbyCommand from '../src/application/commands/join-lobby.command';
import LeaveLobbyCommand from '../src/application/commands/leave-lobby.command';
import SendMessageCommand from '../src/application/commands/send-message.command';
import UserConnectCommand from '../src/application/commands/user-connect.command';
import UserReadyCommand from '../src/application/commands/user-ready.command';
import { LobbyService } from '../src/application/services/lobby.service';
import { UserService } from '../src/application/services/user.service';
import { Lobby } from '../src/domain/entities/Lobby';
import { User } from '../src/domain/entities/User';
import { LobbyRepository } from '../src/domain/repositories/lobby-repository.interface';
import { UserRepository } from '../src/domain/repositories/user-repository.interface';
import { InMemoryLobbyRepository } from '../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';

describe('Lobby', () => {
  test('should add a user to the lobby and then remove it', (done) => {
    const userId = randomUUID();
    const lobby = new Lobby(randomUUID(), [new User(userId, 'test')]);
    expect(lobby.getUsers().length).toBe(1);
    lobby.removeUser(userId);
    expect(lobby.getUsers().length).toBe(0);
    done();
  });
});

describe('SocketHandler', () => {
  let io: Server;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;
  let userRepository: UserRepository;
  let userService: UserService;
  let lobbyRepository: LobbyRepository;
  let lobbyService: LobbyService;

  beforeAll((done) => {
    userRepository = new InMemoryUserRepository();
    lobbyRepository = new InMemoryLobbyRepository();
    userService = new UserService(userRepository);
    lobbyService = new LobbyService(lobbyRepository);

    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      /* @ts-ignore */
      const port = httpServer.address().port;
      /* @ts-ignore */
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
        const testUser = new User(socket.id, 'test');
        userService.save(testUser);
        lobbyService.save(new Lobby(randomUUID(), [testUser]));
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  describe('CreateLobbyCommand', () => {
    test('should emit LobbyCreated event when valid payload is provided', (done) => {
      const createLobbyCommand = new CreateLobbyCommand(userService, lobbyService, serverSocket);

      clientSocket.on('LobbyCreated', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      createLobbyCommand.execute();
    });
  });

  describe('JoinLobbyCommand', () => {
    test('should emit UserJoinedLobby event when valid payload is provided', (done) => {
      const lobbies = lobbyService.findAll();

      const joinLobbyCommand = new JoinLobbyCommand(userService, lobbyService, serverSocket, {
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserJoinedLobby', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      joinLobbyCommand.execute();
    });
  });

  describe('LeaveLobbyCommand', () => {
    test('should emit UserLeftLobby event when valid payload is provided', (done) => {
      let lobbies = lobbyService.findAll();

      const leaveLobbyCommand = new LeaveLobbyCommand(userService, lobbyService, serverSocket, {
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserLeftLobby', (lobbyId, userId) => {
        expect(lobbyId).toBeDefined();
        expect(userId).toBeDefined();
        done();
      });

      leaveLobbyCommand.execute();
    });
  });

  describe('UserConnectCommand', () => {
    test('should emit UserConnected event when valid payload is provided', (done) => {
      const users = userService.findAll();

      const userConnectCommand = new UserConnectCommand(userService, serverSocket, {
        username: users[0].username,
      });

      clientSocket.on('UserConnected', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      userConnectCommand.execute();
    });
  });

  describe('SendMessageCommand', () => {
    test('should emit MessageSent event when valid payload is provided', (done) => {
      const users = userService.findAll();
      const lobbies = lobbyService.findAll();

      const sendMessageCommand = new SendMessageCommand(serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
        message: 'test',
      });

      clientSocket.on('MessageSent', (_userId, _lobbyId, message) => {
        expect(message).toBeDefined();
        expect(message).toBe('test');
        done();
      });

      sendMessageCommand.execute();
    });
  });

  describe('UserReadyCommand', () => {
    test('should emit UserReady event when valid payload is provided', (done) => {
      const users = userService.findAll();
      const lobbies = lobbyService.findAll();

      const userReadyCommand = new UserReadyCommand(serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserReady', (userId, lobbyId) => {
        expect(userId).toBeDefined();
        expect(lobbyId).toBeDefined();
        expect(userId).toBe(users[0].id);
        expect(lobbyId).toBe(lobbies[0].id);
        done();
      });

      userReadyCommand.execute();
    });
  });
});
