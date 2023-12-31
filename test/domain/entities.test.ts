/* eslint-disable @typescript-eslint/indent */
import { randomUUID } from 'crypto';
import CardNotInHandException from '../../src/application/exceptions/card-not-in-hand.exception';
import DeckNotFoundException from '../../src/application/exceptions/deck-not-found.exception';
import InsufficientCardsException from '../../src/application/exceptions/insufficient-cards.exception';
import LobbyNotFoundException from '../../src/application/exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../../src/application/exceptions/no-players-in-game.exception';
import { TwistedCardDescription } from '../../src/application/utils/deck.utils';
import BlackHoleCard from '../../src/domain/entities/BlackHoleCard';
import Card, { CardType, cardGraphicMapping } from '../../src/domain/entities/Card';
import Deck from '../../src/domain/entities/Deck';
import GameState from '../../src/domain/entities/GameState';
import Hand from '../../src/domain/entities/Hand';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import Table from '../../src/domain/entities/Table';
import TwistedCard, { SpecialEffect } from '../../src/domain/entities/TwistedCard';

describe('Entities', () => {
  let cards: Card[];
  let deck: Deck;
  let player: Player;

  beforeAll((done) => {
    cards = <Card[]>[];
    cards.push(new TwistedCard(0, SpecialEffect.SneakAPeak));
    cards.push(new TwistedCard(0, SpecialEffect.SwapHand));
    cards.push(new TwistedCard(0, SpecialEffect.SwitchLight));
    cards.push(new BlackHoleCard(0));
    cards.push(new BlackHoleCard(0));

    for (let i = 0; i < 42; i++) {
      cards.push(new Card(0));
    }

    deck = new Deck();
    deck.setCards(cards);

    deck.shuffle();

    done();
  });

  describe('Table', () => {
    test('should dispose a card and then return a list of all disposed cards, then clear', (done) => {
      const table = new Table();
      const card = new Card(0);
      table.disposeCard(card);

      expect(table.getDisposedCards()[0]).toBe(card);

      table.clearTable();

      expect(table.getDisposedCards().length).toBe(0);

      done();
    });
  });

  describe('Card', () => {
    describe('getGraphic', () => {
      test('Should return cards graphic URL string', (done) => {
        const testCard = new Card(0);
        expect(testCard.getGraphic()).toBe('defaultGraphic.png');

        testCard.setValue(1);
        expect(testCard.getGraphic()).toBe(cardGraphicMapping[1]);

        done();
      });
    });
  });

  describe('Deck', () => {
    describe('drawCard', () => {
      test('Should draw a card from the top of the Deck', (done) => {
        const testDeck = new Deck();
        const testCard = new TwistedCard(0, SpecialEffect.SneakAPeak);
        testDeck.addCard(testCard);
        const drawnCard = testDeck.drawCard();

        expect(drawnCard).toEqual(testCard);

        done();
      });
    });

    describe('drawCards', () => {
      test('Should throw an InsufficientCardsException', (done) => {
        expect(() => {
          const emptyDeck = new Deck();
          emptyDeck.drawCards(5);
        }).toThrow(InsufficientCardsException);
        done();
      });
    });

    describe('shuffle', () => {
      test('Should create and shuffle a Deck with 47 cards, 3 Twisted cards and 2 Black Hole cards, rest regular.', (done) => {
        cards = <Card[]>[];

        for (let i = 0; i < 42; i++) {
          cards.push(new Card(0));
        }

        cards.push(new TwistedCard(0, SpecialEffect.SneakAPeak));
        cards.push(new TwistedCard(0, SpecialEffect.SwapHand));
        cards.push(new TwistedCard(0, SpecialEffect.SwitchLight));
        cards.push(new BlackHoleCard(0));
        cards.push(new BlackHoleCard(0));

        deck = new Deck();
        expect(deck.isEmpty()).toBe(true);

        deck.setCards([...cards]);

        expect(deck.isEmpty()).toBe(false);

        expect(cards).toEqual(deck.getCards());

        deck.shuffle();

        expect(cards).not.toEqual(deck.getCards());
        expect(deck.getCards()).toHaveLength(cards.length);

        deck.addCard(new Card(0));
        expect(deck.getCards()).toHaveLength(cards.length + 1);

        done();
      });
    });
  });

  describe('TwistedCard', () => {
    test('Should return a TwistedCards special effect', (done) => {
      const twistedCards = <TwistedCard[]>deck.getCards().filter((c) => c.getType() === CardType.Twisted);

      expect(twistedCards.length).toBe(3);

      const sneakPeakCard = twistedCards.find((c) => c.getSpecialEffect() === SpecialEffect.SneakAPeak);

      expect(sneakPeakCard).toBeDefined();

      expect(sneakPeakCard!.getSpecialEffect()).toBe(SpecialEffect.SneakAPeak);
      done();
    });

    test('should return a TwistedCards description', () => {
      const card = new TwistedCard(24, SpecialEffect.SwitchLight, TwistedCardDescription.SwitchLight);
      expect(card.getDescription()).toBe(TwistedCardDescription.SwitchLight);
    });
  });

  describe('Player', () => {
    test('should retrieve a special card from the players hand, undefined if none exists', () => {
      player = new Player('Player1', new Hand(), randomUUID());
      const specialCard = new TwistedCard(22, SpecialEffect.SwapHand);
      const specialCard2 = new TwistedCard(23, SpecialEffect.SwitchLight);
      player.getHand().addCards([new Card(0), new Card(1), specialCard, specialCard2]);
      expect(player.getTwistedCard()).toBe(specialCard);

      player.setHand(new Hand());
      player.getHand().addCards([new Card(0), new Card(1)]);
      expect(player.getTwistedCard()).toBeUndefined();
    });

    test('Should create a player, add a new hand to the player with 5 random cards', (done) => {
      player = new Player('Player1', new Hand(), randomUUID());
      player.getHand().addCards(deck.drawCards(5));
      expect(player.getHand().getCards().length).toBe(5);
      done();
    });

    test('Should add cards to players hand then remove one', (done) => {
      player = new Player('Player1', new Hand(), randomUUID());

      expect(player.getHand().getCards().length).toBe(0);

      const firstCardToAdd = new Card(0);

      player.addToHand(firstCardToAdd);

      expect(player.getHand().getCards().length).toBe(1);

      player.addManyToHand([new Card(0), new Card(0)]);

      expect(player.getHand().getCards().length).toBe(3);

      player.removeFromHand(firstCardToAdd);

      expect(player.getHand().getCards().length).toBe(2);

      done();
    });

    test('Should get and set players information', (done) => {
      const playerId = randomUUID();
      const playerHand = new Hand();
      player = new Player('Player1', playerHand, playerId);
      expect(player.getId()).toBe(playerId);
      expect(player.getUserName()).toBe('Player1');
      expect(player.getHand()).toBe(playerHand);

      const newPlayerHand = new Hand();
      player.setHand(newPlayerHand);
      expect(player.getHand()).toBe(newPlayerHand);

      const newPlayerId = randomUUID();
      player.setId(newPlayerId);

      expect(player.getId()).toBe(newPlayerId);

      done();
    });
  });

  describe('Hand', () => {
    test('should find a card by it\'s id', () => {
      const card = new Card(0);
      const hand = new Hand();
      hand.addCard(card);
      expect(hand.getCard(card.id)).toBe(card);
    });

    test('should get a list of all matches in the player\'s hand', () => {
      const playerHand = new Hand();

      const card1 = new Card(1);
      const card2 = new Card(1);
      const card3 = new Card(3);
      const card4 = new Card(4);
      const card5 = new Card(5);
      const card6 = new Card(5);

      playerHand.addCards([card1, card2, card3, card4, card5, card6]);

      const matches = playerHand.getMatches();

      // Assert that all cards in 'matches' are present in the player's hand
      expect(matches.every((card) => playerHand.getCards().includes(card))).toBe(true);

      // Assert that cards not in 'matches' are not present in the player's hand
      expect(playerHand.getCards().some((card) => ![card3, card4].includes(card))).toBe(true);
    });
  });

  describe('GameState', () => {
    describe('checkLobbyWinner', () => {
      let gameState: GameState;
      let lobby: Lobby;

      beforeEach(() => {
        gameState = new GameState(new Table());
        player = new Player('Player1', new Hand(), randomUUID());
        lobby = new Lobby(player);
        lobby.setDeck(new Deck());
        gameState.setLobby(lobby);
        gameState.startGame();
      });

      test('should return player', () => {
        expect(gameState.checkLobbyWinner()).toBe(player);
      });
    });

    describe('getPlayerWithLeastAmountOfCards', () => {
      let gameState: GameState;
      let lobby: Lobby;

      beforeEach(() => {
        gameState = new GameState(new Table());
        player = new Player('Player1', new Hand(), randomUUID());
        lobby = new Lobby(player);
        lobby.setDeck(new Deck());
        gameState.setLobby(lobby);
        gameState.startGame();
      });

      test('should throw NoPlayersInGameException exception', (done) => {
        if (!gameState.lobby) fail();

        gameState.lobby.removeUser(player.id);

        expect(gameState.lobby.getPlayers()).toHaveLength(0);

        expect(() => {
          gameState.getPlayerWithLeastAmountOfCards();
        }).toThrow(NoPlayersInGameException);

        done();
      });

      test('should throw LobbyNotFoundException exception', (done) => {
        expect(() => {
          gameState.setLobby(undefined);
          gameState.getPlayerWithLeastAmountOfCards();
        }).toThrow(LobbyNotFoundException);

        done();
      });
    });

    test('should set current player to Player2', (done) => {
      const gameState = new GameState(new Table());
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const player2 = new Player('Player2', new Hand(), randomUUID());
      const lobby = new Lobby(player1);
      lobby.addUser(player2);
      const testDeck = new Deck();
      const card1 = new Card(0);
      const card2 = new Card(0);
      const card3 = new Card(0);
      testDeck.addCard(card1);
      testDeck.addCard(card2);
      testDeck.addCard(card3);
      lobby.setDeck(testDeck);
      gameState.setLobby(lobby);
      gameState.startGame();

      expect(player1.getHand().getCards().length).toBe(2);
      expect(player2.getHand().getCards().length).toBe(1);
      expect(gameState.getCurrentPlayer()).toBe(player2);

      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      expect(() => {
        const gameState = new GameState(new Table());
        const player1 = new Player('Player1', new Hand(), randomUUID());
        const testHand = new Hand();
        const lobby = new Lobby(player1);
        const testDeck = new Deck();
        const card1 = new Card(0);
        const card2 = new Card(0);
        player1.setHand(testHand);
        testDeck.addCard(card1);
        testDeck.addCard(card2);
        lobby.setDeck(testDeck);
        gameState.setLobby(lobby);
        gameState.matchCards(player1, card1, card2);
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should match two cards', (done) => {
      const gameState = new GameState(new Table());
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const testHand = new Hand();
      const lobby = new Lobby(player1);
      const testDeck = new Deck();
      const card1 = new Card(0);
      const card2 = new Card(0);
      testHand.addCards([card1, card2]);
      player1.setHand(testHand);
      testDeck.addCard(card1);
      testDeck.addCard(card2);
      lobby.setDeck(testDeck);
      gameState.setLobby(lobby);
      gameState.matchCards(player1, card1, card2);

      expect(player1.getHand().getCards().includes(card1)).toBe(false);
      expect(player1.getHand().getCards().includes(card2)).toBe(false);

      done();
    });

    test('should return the GameState lobby', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(new Deck());
      gameState.setLobby(lobby);

      expect(gameState.getLobby()).toBe(lobby);

      done();
    });

    test('should throw DeckNotFoundException exception', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(undefined);
      gameState.setLobby(lobby);

      expect(() => {
        gameState.startGame();
      }).toThrow(DeckNotFoundException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(new Deck());
      gameState.setLobby(lobby);
      gameState.startGame();

      expect(() => {
        gameState.setLobby(undefined);
        gameState.isGameOver();
      }).toThrow(LobbyNotFoundException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(new Deck());
      gameState.setLobby(lobby);
      gameState.startGame();

      expect(() => {
        gameState.setLobby(undefined);
        gameState.getCurrentPlayer();
      }).toThrow(LobbyNotFoundException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(new Deck());
      gameState.setLobby(lobby);
      gameState.startGame();

      expect(() => {
        gameState.setLobby(undefined);
        gameState.nextTurn();
      }).toThrow(LobbyNotFoundException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const gameState = new GameState(new Table());
      const lobby = new Lobby(player1);
      lobby.setDeck(new Deck());
      gameState.setLobby(undefined);

      expect(() => {
        gameState.startGame();
      }).toThrow(LobbyNotFoundException);

      done();
    });
  });

  describe('Lobby', () => {
    test('should get the lobbies host, then change host', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const player2 = new Player('Player2', new Hand(), randomUUID());
      const lobby = new Lobby(player1);
      expect(lobby.getHost().getUserName()).toBe('Player1');

      lobby.setHost(player2);
      expect(lobby.getHost().getUserName()).toBe('Player2');
      done();
    });

    test('should set a deck for the lobby', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const oldDeck = new Deck();
      const newDeck = new Deck();

      const lobby = new Lobby(player1);
      lobby.setDeck(oldDeck);

      expect(lobby.getDeck()).toBe(oldDeck);

      lobby.setDeck(newDeck);

      expect(lobby.getDeck()).toBe(newDeck);

      done();
    });

    test('should add a user to the lobby and then remove it', (done) => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const player2 = new Player('Player2', new Hand(), randomUUID());
      const lobby = new Lobby(player1);
      expect(lobby.getPlayers().length).toBe(1);
      lobby.addUser(player2);
      expect(lobby.getPlayers().length).toBe(2);
      lobby.removeUser(player1.id);
      expect(lobby.getPlayers().length).toBe(1);
      done();
    });
  });
});