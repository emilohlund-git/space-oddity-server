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
import Card from '../src/domain/entities/Card';
import Deck from '../src/domain/entities/Deck';
import Hand from '../src/domain/entities/Hand';
import TwistedCard, { SpecialEffect } from '../src/domain/entities/TwistedCard';
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
  let clientSocket2: ClientSocket<ServerEvents, ClientEvents>;
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

  beforeEach((done) => {
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
    const port = 3005;
    io = new Server(httpServer);
    const connectionsNeeded = 2;
    let currentConnected = 0;

    const checkConnections = () => {
      currentConnected++;
      if (connectionsNeeded == currentConnected) done();
    };

    httpServer.listen(port, () => {
      /* @ts-ignore */
      clientSocket = Client(`http://localhost:${port}`, {
        extraHeaders: { 'x-api-key': process.env.API_KEY! },
      });
      clientSocket2 = Client(`http://localhost:${port}`, {
        extraHeaders: { 'x-api-key': process.env.API_KEY! },
      });
      socketHandler = new SocketHandler(io, gameService);
      socketHandler.handleConnection();
      clientSocket.on('connect', checkConnections);
      clientSocket2.on('connect', checkConnections);
    });

    userRepository.clear();
    lobbyRepository.clear();
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
    clientSocket2.close();
  });

  const wait = async () => {
    await new Promise<void>((resolve): void => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  };

  test('should simulate an entire game', async () => {
    socketHandler.handleConnection();

    /* Players connects to the game */
    clientSocket.emit('UserConnect', {
      username: 'test1',
    });

    clientSocket2.emit('UserConnect', {
      username: 'test2',
    });

    await wait();

    const players = gameService.getUserService().findAll();
    expect(players).toHaveLength(2);
    expect(players[0].getUserName()).toBe('test1');
    expect(players[1].getUserName()).toBe('test2');

    /* Player 1 creates a lobby and Player 2 joins it */
    clientSocket.emit('CreateLobby');

    await wait();

    const lobby = gameService.getLobbyService().findAll()[0];
    const testDeck = new Deck();
    const card1 = new Card(0);
    const card1Copy = new Card(0);
    const card2 = new Card(1);
    const card2Copy = new Card(1);
    const card3 = new Card(2);
    const card3Copy = new Card(2);
    const card4 = new Card(3);
    const card4Copy = new Card(3);
    const twistedCard1 = new TwistedCard(23, SpecialEffect.SwitchLight);
    const twistedCard2 = new TwistedCard(24, SpecialEffect.SwapHand);
    const twistedCard3 = new TwistedCard(25, SpecialEffect.SneakAPeak);
    cardRepository.saveMany([card1, card2, card3, card4,
      twistedCard1, twistedCard2, twistedCard3,
      card1Copy, card2Copy, card3Copy, card4Copy]);
    testDeck.addCard(card1);
    testDeck.addCard(card1Copy);
    testDeck.addCard(card2);
    testDeck.addCard(card2Copy);
    testDeck.addCard(card3);
    testDeck.addCard(card3Copy);
    testDeck.addCard(card4);
    testDeck.addCard(card4Copy);
    testDeck.addCard(twistedCard1);
    testDeck.addCard(twistedCard2);
    testDeck.addCard(twistedCard3);

    lobby.setDeck(testDeck);
    expect(lobby.getDeck()).toBeDefined();
    expect(lobby.getDeck()?.getCards()).toHaveLength(11);
    expect(lobby.getPlayers().includes(players[0])).toBe(true);
    expect(lobby.getPlayers().includes(players[1])).toBe(false);

    clientSocket2.emit('JoinLobby', {
      lobbyId: lobby.id,
    });

    await wait();

    expect(lobby.getPlayers().includes(players[0])).toBe(true);
    expect(lobby.getPlayers().includes(players[1])).toBe(true);

    /* Player 1 sends a message in the lobby */
    clientSocket.emit('SendMessage', {
      lobbyId: lobby.id,
      message: 'Press ready',
      userId: players[0].id,
    });

    await wait();

    const messages = lobby.getMessages();
    expect(messages[0].content).toBe('Press ready');
    expect(messages[0].player).toBe(players[0]);

    /* Players sets status ready */
    expect(players[0].getIsReady()).toBe(false);
    expect(players[1].getIsReady()).toBe(false);

    clientSocket.emit('UserReady', {
      lobbyId: lobby.id,
      userId: players[0].id,
    });
    clientSocket2.emit('UserReady', {
      lobbyId: lobby.id,
      userId: players[1].id,
    });

    await wait();

    expect(players[0].getIsReady()).toBe(true);
    expect(players[1].getIsReady()).toBe(true);

    /* Player1 starts the game */
    clientSocket.emit('StartGame', {
      lobbyId: lobby.id,
    });

    await wait();

    const gameState = gameService.getGameStates()[0];
    expect(gameState).toBeDefined();
    expect(gameState.getLobby()).toBe(lobby);
    expect(gameState.gameStatus).toBe('in_progress');

    const playerWithLeastAmountOfCards = gameState.getPlayerWithLeastAmountOfCards();
    expect(gameState.getCurrentPlayer()).toBe(playerWithLeastAmountOfCards);

    if (!gameState.lobby) fail();
  });

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

    let lobby = gameService.getLobbyService().findAll()[0];
    if (!lobby) fail('lobby does not exist.');

    expect(lobby.getPlayers().includes(player)).toBe(true);

    /* Player leaves the lobby, lobby gets removed cause of no players */
    clientSocket.emit('LeaveLobby', {
      lobbyId: lobby.id,
    });

    await wait();

    lobby = gameService.getLobbyService().findAll()[0];
    expect(lobby).not.toBeDefined();

    /* Re-create the lobby */
    clientSocket.emit('CreateLobby');

    await wait();

    lobby = gameService.getLobbyService().findAll()[0];
    expect(lobby.getPlayers().includes(player)).toBe(true);
    expect(lobby).toBeDefined();

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

    let gameState = gameService.getGameStates()[0];

    if (!gameState) {
      throw new GameStateFoundException();
    }

    expect(gameState.gameStatus).toBe('in_progress');

    const discardedCard = player.getHand().getCards()[0];

    /* Player discards a card */
    clientSocket.emit('CardDiscarded', {
      cardId: discardedCard.id,
      gameStateId: gameState.id,
      lobbyId: gameState.lobby!.id,
      userId: player.id,
    });

    await wait();

    expect(gameState.table.getDisposedCards().length).toBe(1);

    /* Change the turn of the game */
    clientSocket.emit('ChangeTurn', {
      gameStateId: gameState.id,
      lobbyId: gameState.lobby!.id,
    });

    await wait();

    player.setHand(new Hand());

    /* End the game */
    clientSocket.emit('GameOver', {
      gameStateId: gameState.id,
      lobbyId: gameState.lobby!.id,
    });

    await wait();

    expect(gameState.isGameOver()).toBe(true);
    expect(gameState.gameStatus).toBe('ended');

    /* Disconnect the player */
    clientSocket.emit('UserDisconnect', {
      userId: player.id,
      lobbyId: gameState.lobby?.id,
      gameStateId: gameState.id,
    });

    await wait();

    expect(gameState.lobby).toBeUndefined();
    expect(gameService.getUserService().findAll()).toHaveLength(0);

    gameState = gameService.getGameStates()[0];

    expect(gameState).toBeUndefined();
  });
});
