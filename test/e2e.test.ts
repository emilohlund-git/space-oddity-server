/* eslint-disable import/no-extraneous-dependencies */
import { fail } from 'assert';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import GameStateFoundException from '../src/application/exceptions/game-state-not-found.exception';
import { CardService } from '../src/application/services/card.service';
import { DeckService } from '../src/application/services/deck.service';
import GameService from '../src/application/services/game.service';
import { LobbyService } from '../src/application/services/lobby.service';
import { TableService } from '../src/application/services/table.service';
import { UserService } from '../src/application/services/user.service';
import { ClientEvents, ServerEvents } from '../src/domain/interfaces/command.interface';
import { CardRepository } from '../src/domain/repositories/card-repository.interface';
import { DeckRepository } from '../src/domain/repositories/deck-repository.interface';
import { LobbyRepository } from '../src/domain/repositories/lobby-repository.interface';
import { TableRepository } from '../src/domain/repositories/table-repository.interface';
import { UserRepository } from '../src/domain/repositories/user-repository.interface';
import { InMemoryCardRepository } from '../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../src/infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../src/infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import SocketHandler from '../src/infrastructure/socket.handler';
dotenv.config();

describe('End to End tests', () => {
  let io: Server;
  let clientSocket: ClientSocket<ServerEvents, ClientEvents>;
  let cardRepository: CardRepository;
  let cardService: CardService;
  let userRepository: UserRepository;
  let tableRepository: TableRepository;
  let deckRepository: DeckRepository;
  let userService: UserService;
  let lobbyRepository: LobbyRepository;
  let lobbyService: LobbyService;
  let tableService: TableService;
  let deckService: DeckService;
  let gameService: GameService;
  let socketHandler: SocketHandler;

  beforeAll((done) => {
    cardRepository = new InMemoryCardRepository();
    userRepository = new InMemoryUserRepository();
    lobbyRepository = new InMemoryLobbyRepository();
    tableRepository = new InMemoryTableRepository();
    deckRepository = new InMemoryDeckRepository();
    cardService = new CardService(cardRepository);
    userService = new UserService(userRepository);
    lobbyService = new LobbyService(lobbyRepository);
    tableService = new TableService(tableRepository);
    deckService = new DeckService(deckRepository);
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
    );

    const httpServer = createServer();
    const port = 3006;
    io = new Server(httpServer);
    httpServer.listen(port, () => {
      /* @ts-ignore */
      clientSocket = Client(`http://localhost:${port}`, {
        extraHeaders: { 'x-api-key': process.env.API_KEY! },
      });
      socketHandler = new SocketHandler(io, gameService);
      socketHandler.handleConnection();
      clientSocket.on('connect', done);
    });

    userRepository.clear();
    lobbyRepository.clear();
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  const wait = async () => {
    await new Promise<void>((resolve): void => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  };

  test('should connect a player, create a lobby and start the game', async () => {
    socketHandler.handleConnection();

    /* Player connects to the game */
    clientSocket.emit('UserConnect', {
      username: 'test1',
    });

    await wait();

    const player = gameService.getUserService().findByUsername('test1');
    if (!player) fail('player does not exist.');

    expect(player.username).toBe('test1');

    /* Player creates a lobby */
    clientSocket.emit('CreateLobby');

    await wait();

    const lobby = gameService.getLobbyService().findAll()[0];
    if (!lobby) fail('lobby does not exist.');

    expect(lobby?.getPlayers().includes(player)).toBe(true);

    /* Player leaves the lobby */
    clientSocket.emit('LeaveLobby', {
      lobbyId: lobby.id,
    });

    await wait();

    expect(lobby.getPlayers().includes(player)).toBe(false);

    /* Player re-joins the lobby */
    clientSocket.emit('JoinLobby', {
      lobbyId: lobby.id,
    });

    await wait();

    expect(lobby.getPlayers().includes(player)).toBe(true);

    /* Player sets ready status */
    clientSocket.emit('UserReady', {
      lobbyId: lobby.id,
      userId: player.id,
    });

    await wait();

    expect(player.getIsReady()).toBe(true);

    /* Lobby owner starts the game */
    clientSocket.emit('StartGame', {
      lobbyId: lobby.id,
    });

    await wait();

    const gameState = gameService.getGameStates()[0];

    if (!gameState) {
      throw new GameStateFoundException();
    }

    expect(gameState.gameStatus).toBe('in_progress');
  });
});
