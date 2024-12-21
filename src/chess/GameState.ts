export default class GameState {
    boardState: string[][] = [];
    playerTurn: boolean = false;
    selectedColumn: number = 0;
    selectedRow: number = 0;
    validMoves: number[][] = []
}