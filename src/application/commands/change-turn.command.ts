import { UUID } from 'crypto';
import { Command } from '../../domain/interfaces/command.interface';

export type ChangeTurnPayload = {
  gameStateId: UUID;
  lobbyId: UUID;
  playerId: UUID;
};

class ChangeTurnCommand extends Command {
  public execute(): void {
    const { playerId, gameStateId, lobbyId } = this.payload;

    const gameState = this.gameService.getGameState(gameStateId);
    this.entityValidator.validateGameStateExists(gameState);

    this.entityValidator.validateLobbyExists(gameState.lobby);

    this.entityValidator.validateLobbyHasPlayers(gameState.lobby);

    this.entityValidator.validateIsYourTurn(gameState, playerId);

    gameState.nextTurn();

    this.io.to(lobbyId).emit('ChangeTurn', gameState);
  }
}

export default ChangeTurnCommand;