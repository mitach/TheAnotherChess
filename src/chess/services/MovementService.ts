import GameState from "../GameState";

export default class MovementService {
	protected _gameState: GameState;

	constructor(gameState: GameState) {
		this._gameState = gameState;
	}

	public getValidMoves(pieceType: string, column: number, row: number) {
		switch (pieceType.toLowerCase()) {
			case "p":
				return this.getValidMovesPawn(column, row);

			default:
				return [];
		}
	}

	protected getValidMovesPawn(column: number, row: number) {
		const boardState = this._gameState.boardState;

		return [
			[column, row-1],
			[column, row-2],
		];
	}
}
