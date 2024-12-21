import GameState from "./GameState";

export default class MovementService {
    _gameState: GameState;

    constructor(gameState: GameState) {
        this._gameState = gameState;
    }
}