import { default as f } from 'fs';
import fs from 'fs/promises';
import { FileService } from '../../../src/application/services/file.service';
import GameState from '../../../src/domain/entities/GameState';
import Table from '../../../src/domain/entities/Table';

jest.mock('fs/promises');

describe('FileService', () => {
  describe('removeSavedState', () => {
    it('should throw an error', async () => {
      const gameState = new GameState(new Table());

      jest.spyOn(f, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'rm').mockRejectedValue(new Error('File removal error'));

      await expect(FileService.removeSavedState(gameState)).rejects.toThrow(Error);

      expect(fs.rm).toHaveBeenCalledWith(`./states/${gameState.id}.json`);
    });

    it('should remove file if the file exists', async () => {
      const gameState = new GameState(new Table());

      jest.spyOn(f, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'rm').mockResolvedValue(undefined);

      await FileService.removeSavedState(gameState);

      expect(fs.rm).toHaveBeenCalledWith(`./states/${gameState.id}.json`);
    });

    it('should do nothing if file doesn\'t exist', async () => {
      const gameState = new GameState(new Table());

      const fileExists = jest.spyOn(f, 'existsSync');

      await FileService.removeSavedState(gameState);

      expect(fileExists).toHaveBeenCalledWith(`./states/${gameState.id}.json`);
    });
  });

  describe('storeGameState', () => {
    it('should fail to store the game state file to disk', async () => {
      const gameState = new GameState(new Table());

      const mockMkdir = jest.spyOn(fs, 'mkdir');
      mockMkdir.mockRejectedValueOnce(new Error('Failed to create directory'));

      const mockWriteFile = jest.spyOn(fs, 'writeFile');
      mockWriteFile.mockResolvedValue(undefined);

      await expect(FileService.storeGameState(gameState)).rejects.toThrowError('Failed to create directory');

      expect(mockMkdir).toHaveBeenCalledWith('./states', { recursive: true });

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('should store the game state file to disk', async () => {
      const mockWriteFile = jest.spyOn(fs, 'writeFile');

      // Create a mock game state
      const gameState = new GameState(new Table());

      await FileService.storeGameState(gameState);

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringMatching(/^\.\/states\/.*\.json$/),
        JSON.stringify(gameState),
      );
    });
  });

  describe('loadGameState', () => {
    it('should fail to load the game state file from disk', async () => {
      const gameStateId = '8f88262e-00cd-4be6-86a7-0a70bdbcb979';

      const mockReadFile = jest.spyOn(fs, 'readFile');
      mockReadFile.mockRejectedValue(new Error('Failed to read file'));

      await expect(FileService.loadGameState(gameStateId)).rejects.toThrowError('Failed to read file');

      expect(mockReadFile).toHaveBeenCalledWith(`./states/${gameStateId}.json`);
    });

    it('should load the game state file from disk', async () => {
      const mockReadFile = jest.spyOn(fs, 'readFile');

      const gameStateId = '8f88262e-00cd-4be6-86a7-0a70bdbcb979';

      const filePath = `./states/${gameStateId}.json`;

      const gameStateJson = {
        id: gameStateId,
        table: {
          id: 'c5d47641-4ed2-4286-8fdb-a417549bb93a',
          disposedCards: [],
        },
        currentPlayerIndex: 0,
        gameStatus: 'not_started',
        light: 'blue',
      };

      const expectedResult = gameStateJson;

      mockReadFile.mockResolvedValue(JSON.stringify(gameStateJson));

      const result = await FileService.loadGameState(gameStateId);

      expect(mockReadFile).toHaveBeenCalledWith(filePath);

      expect(result).toEqual(expectedResult);
    });
  });
});
