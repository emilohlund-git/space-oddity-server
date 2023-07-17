/* eslint-disable import/no-extraneous-dependencies */
import { fail } from 'assert';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import { CardService } from '../src/application/services/card.service';
import { DeckService } from '../src/application/services/deck.service';
import GameService from '../src/application/services/game.service';
import { LobbyService } from '../src/application/services/lobby.service';
import { TableService } from '../src/application/services/table.service';
import { UserService } from '../src/application/services/user.service';
import Card from '../src/domain/entities/Card';
import Deck from '../src/domain/entities/Deck';
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
    const port = 3007;
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

  test('should simulate finishing a deck of cards', async () => {
    socketHandler.handleConnection();

    /* Players connects to the game */
    clientSocket.emit('UserConnect', {
      username: 'test1',
    });

    clientSocket2.emit('UserConnect', {
      username: 'test2',
    });

    await wait();

    /* Player 1 creates a lobby and Player 2 joins it */
    clientSocket.emit('CreateLobby');

    await wait();

    const players = gameService.getUserService().findAll();
    const lobby = gameService.getLobbyService().findAll()[0];

    const testDeck = new Deck();
    for (let i = 1; i <= 21; i++) {
      const card = new Card(i);
      const cardCopy = new Card(i);
      cardRepository.saveMany([card, cardCopy]);
      testDeck.addCard(card);
      testDeck.addCard(cardCopy);
    }

    lobby.setDeck(testDeck);

    clientSocket2.emit('JoinLobby', {
      lobbyId: lobby.id,
    });

    await wait();

    expect(lobby.getPlayers().includes(players[0])).toBe(true);
    expect(lobby.getPlayers().includes(players[1])).toBe(true);

    /* Player1 starts the game */
    clientSocket.emit('StartGame', {
      lobbyId: lobby.id,
    });

    await wait();

    const gameState = gameService.getGameStates()[0];
    expect(gameState).toBeDefined();
    expect(gameState.getLobby()).toBe(lobby);
    expect(gameState.gameStatus).toBe('in_progress');

    while (players[0].getHand().getCards().length > 0 &&
      players[1].getHand().getCards().length > 0 &&
      lobby.getDeck()?.hasCards()) {
      clientSocket.connect();
      clientSocket2.connect();
      const currentPlayer = gameState.getCurrentPlayer();
      const otherPlayer = lobby.getPlayers().find((p) => p.id !== currentPlayer.id)!;
      const otherPlayerHand = otherPlayer.getHand();
      const otherPlayerHandCards = otherPlayerHand.getCards();
      const currentSocket = gameState.getCurrentPlayer() === players[0] ? clientSocket : clientSocket2;
      const randomCardFromOtherPlayer = otherPlayerHandCards[Math.floor(Math.random() * otherPlayerHandCards.length)];
      const matches = currentPlayer.getHand().getMatches();

      if (matches.length > 0) {
        currentSocket.emit('MatchCards', {
          card1Id: matches[0].id,
          card2Id: matches[1].id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: currentPlayer.id,
        });

        await wait();
      } else {
        currentSocket.emit('PickedCard', {
          cardId: randomCardFromOtherPlayer.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userNewId: currentPlayer.id,
          userPreviousId: otherPlayer.id,
          fromOpponent: !lobby.getDeck()!.hasCards(),
        });

        await wait();
      }

      currentSocket.emit('ChangeTurn', {
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
      });

      await wait();
    }

    expect(lobby.getDeck()?.getCards()).toHaveLength(0);
  }, 100000);

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
});
