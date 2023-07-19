import { UUID } from 'crypto';
import { default as f } from 'fs';
import fs from 'fs/promises';
import { CardType } from '../../domain/entities/Card';
import GameState, { GameStatus, Lights } from '../../domain/entities/GameState';
import FailedToRemoveGameStateException from '../exceptions/failed-to-remove-game-state.exception';
import FailedToRetrieveGameStateException from '../exceptions/failed-to-retrieve-game-state.exception';
import FailedToSaveGameStateException from '../exceptions/failed-to-save-game-state.exception';

export interface HandJson {
  cards: CardJson[];
}

export interface PlayerJson {
  id: string;
  username: string;
  hand: HandJson;
  isReady: boolean;
}

export interface MessageJson {
  id: UUID;
  player: PlayerJson;
  content: string;
}

export interface DeckJson {
  id: UUID;
  cards: CardJson[];
}

export interface LobbyJson {
  id: UUID;
  lastActivityTime: number;
  users: PlayerJson[];
  messages: MessageJson[];
  deck?: DeckJson;
  host: PlayerJson;
}

export interface CardJson {
  id: UUID;
  type: CardType;
  value: number;
  graphic: string;
  specialEffect?: number;
}

export interface TableJson {
  id: UUID;
  disposedCards: CardJson[];
}

export interface GameStateJson {
  id: UUID;
  table: TableJson;
  currentPlayerIndex: number;
  gameStatus: GameStatus;
  light: Lights;
  lobby?: LobbyJson;
}

export class FileService {
  static async removeSavedState(gameState: GameState): Promise<void> {
    const folderPath = './states';
    if (f.existsSync(`${folderPath}/${gameState.id}.json`)) {
      try {
        await fs.rm(`${folderPath}/${gameState.id}.json`);
      } catch (error) {
        throw new FailedToRemoveGameStateException(error as string);
      }
    }
  }

  static async storeGameState(gameState: GameState): Promise<boolean> {
    const folderPath = './states';
    try {
      await fs.mkdir(folderPath, { recursive: true });
      await fs.writeFile(`./states/${gameState.id}.json`, JSON.stringify(gameState));
      return await Promise.resolve(true);
    } catch (error) {
      throw new FailedToSaveGameStateException(error as string);
    }
  }

  static async loadGameState(gameStateId: UUID): Promise<GameStateJson | undefined> {
    const folderPath = './states';
    if (f.existsSync(`${folderPath}/${gameStateId}.json`)) {
      try {
        const result = await fs.readFile(`${folderPath}/${gameStateId}.json`);
        const gameStateJson: GameStateJson = JSON.parse(result.toString());
        return await Promise.resolve(gameStateJson);
      } catch (error) {
        throw new FailedToRetrieveGameStateException(error as string);
      }
    }
  }
}