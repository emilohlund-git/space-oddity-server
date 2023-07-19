import { UUID } from 'crypto';
import GameState from '../../domain/entities/GameState';
import Table from '../../domain/entities/Table';
import { Command } from '../../domain/interfaces/command.interface';
import { createPayloadValidationRules, validatePayload } from '../utils/payload.validator';

export type StartGamePayload = {
  lobbyId: UUID,
};

class StartGameCommand extends Command {
  execute(): void {
    const { lobbyId } = this.payload;

    const payloadValidationRules = createPayloadValidationRules(this.payload);
    validatePayload(this.payload, payloadValidationRules);

    const table = new Table();
    this.gameService.getTableService().save(table);

    const gameState = new GameState(table);
    this.gameService.setGameState(gameState);

    const lobby = this.gameService.getLobbyService().findById(lobbyId);
    this.entityValidator.validateLobbyExists(lobby);

    gameState.setLobby(lobby);
    gameState.startGame();

    lobby.lastActivityTime = Date.now();

    this.io.to(lobbyId).emit('GameStarted', gameState);
  }
}

export default StartGameCommand;