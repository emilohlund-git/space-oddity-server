import { UUID } from 'crypto';
import { default as f } from 'fs';
import fs from 'fs/promises';
import { CardType } from '../../domain/entities/Card';
import GameState, { GameStatus, Lights } from '../../domain/entities/GameState';

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
        return await Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  static async storeGameState(gameState: GameState): Promise<void> {
    const folderPath = './states';
    try {
      await fs.mkdir(folderPath, { recursive: true });
      await fs.writeFile(`./states/${gameState.id}.json`, JSON.stringify(gameState));
      return await Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async loadGameState(gameStateId: UUID): Promise<GameStateJson> {
    const folderPath = './states';
    try {
      const result = await fs.readFile(`${folderPath}/${gameStateId}.json`);
      const gameStateJson: GameStateJson = JSON.parse(result.toString());
      return await Promise.resolve(gameStateJson);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}