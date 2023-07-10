/* eslint-disable @typescript-eslint/indent */
import { randomUUID } from 'crypto';
import InsufficientCardsException from '../../src/application/exceptions/insufficient-cards.exception';
import BlackHoleCard from '../../src/domain/entities/BlackHoleCard';
import Card, { CardType } from '../../src/domain/entities/Card';
import Deck from '../../src/domain/entities/Deck';
import Hand from '../../src/domain/entities/Hand';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import TwistedCard, { SpecialEffect } from '../../src/domain/entities/TwistedCard';
import { User } from '../../src/domain/entities/User';

describe('Entities', () => {
  let cards: Card[];
  let deck: Deck;
  let player: Player;

  beforeAll((done) => {
    cards = <Card[]>[];
    cards.push(new TwistedCard('', SpecialEffect.SneakAPeak));
    cards.push(new TwistedCard('', SpecialEffect.SwapDeck));
    cards.push(new TwistedCard('', SpecialEffect.SwitchLight));
    cards.push(new BlackHoleCard(''));
    cards.push(new BlackHoleCard(''));

    for (let i = 0; i < 42; i++) {
      cards.push(new Card(''));
    }

    deck = new Deck();
    deck.setCards(cards);

    deck.shuffle();

    done();
  });

  describe('Card', () => {
    describe('getGraphic', () => {
      test('Should return cards graphic URL string', (done) => {
        const testCard = new Card('test');
        expect(testCard.getGraphic()).toBe('test');

        done();
      });
    });

    describe('getOwner', () => {
      test('Should return undefined and then the player owner', (done) => {
        const testCard = new Card('');
        expect(testCard.getOwner()).toBe(undefined);

        testCard.setOwner(new Player(randomUUID(), 'test-user', new Hand()));

        expect(testCard.getOwner()?.getUserName()).toBe('test-user');

        done();
      });
    });
  });

  describe('Deck', () => {
    describe('drawCard', () => {
      test('Should draw a card from the top of the Deck', (done) => {
        const testDeck = new Deck();
        const testCard = new TwistedCard('', SpecialEffect.SneakAPeak);
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
          cards.push(new Card(''));
        }

        cards.push(new TwistedCard('', SpecialEffect.SneakAPeak));
        cards.push(new TwistedCard('', SpecialEffect.SwapDeck));
        cards.push(new TwistedCard('', SpecialEffect.SwitchLight));
        cards.push(new BlackHoleCard(''));
        cards.push(new BlackHoleCard(''));

        deck = new Deck();
        expect(deck.isEmpty()).toBe(true);

        deck.setCards([...cards]);

        expect(deck.isEmpty()).toBe(false);

        expect(cards).toEqual(deck.getCards());

        deck.shuffle();

        expect(cards).not.toEqual(deck.getCards());
        expect(deck.getCards()).toHaveLength(cards.length);

        deck.addCard(new Card(''));
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
  });

  describe('Player', () => {
    test('Should create a player, add a new hand to the player with 5 random cards', (done) => {
      player = new Player(randomUUID(), 'test-player', new Hand());
      player.getHand().addCards(deck.drawCards(5));
      expect(player.getHand().getCards().length).toBe(5);
      done();
    });

    test('Should add cards to players hand then remove one', (done) => {
      const playerId = randomUUID();
      const playerHand = new Hand();
      player = new Player(playerId, 'test-player', playerHand);

      expect(player.getHand().getCards().length).toBe(0);

      const firstCardToAdd = new Card('');

      player.addToHand(firstCardToAdd);

      expect(player.getHand().getCards().length).toBe(1);

      player.addManyToHand([new Card(''), new Card('')]);

      expect(player.getHand().getCards().length).toBe(3);

      player.removeFromHand(firstCardToAdd);

      expect(player.getHand().getCards().length).toBe(2);

      done();
    });

    test('Should get and set players information', (done) => {
      const playerId = randomUUID();
      const playerHand = new Hand();
      player = new Player(playerId, 'test-player', playerHand);
      expect(player.getId()).toBe(playerId);
      expect(player.getUserName()).toBe('test-player');
      expect(player.getHand()).toBe(playerHand);

      const newPlayerHand = new Hand();
      player.setHand(newPlayerHand);
      expect(player.getHand()).toBe(newPlayerHand);

      done();
    });
  });

  describe('Hand', () => {
    test('Should return the hands player', (done) => {
      const testHand = new Hand();

      expect(testHand.getPlayer()).toBe(undefined);

      const testPlayer = new Player(randomUUID(), 'test', testHand);

      expect(testHand.getPlayer()).toEqual(testPlayer);

      done();
    });
  });

  describe('Lobby', () => {
    test('should add a user to the lobby and then remove it', (done) => {
      const userId = randomUUID();
      const lobby = new Lobby(randomUUID());
      expect(lobby.getUsers().length).toBe(0);
      const testUser = new User(userId, 'test');
      lobby.addUser(testUser);
      expect(lobby.getUsers().length).toBe(1);
      lobby.removeUser(userId);
      expect(lobby.getUsers().length).toBe(0);
      done();
    });
  });
});