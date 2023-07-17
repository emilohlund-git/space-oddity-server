import { mapJsonToClass } from '../../../src/application/utils/json-mapper';
import GameState, { GameStatus, Lights } from '../../../src/domain/entities/GameState';

describe('JsonMapper', () => {
  it('should map a GameState json object to a GameState class', () => {
    const gameStateJson: object = {
      id: '8f88262e-00cd-4be6-86a7-0a70bdbcb979',
      table: {
        id: 'c5d47641-4ed2-4286-8fdb-a417549bb93a',
        disposedCards: [],
      },
      currentPlayerIndex: 0,
      gameStatus: GameStatus.NotStarted,
      light: Lights.BLUE,
    };

    const gameState = mapJsonToClass(gameStateJson, GameState);

    expect(gameState).toBeInstanceOf(GameState);
  });
});