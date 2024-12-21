
function checkCase(char: string) {
    return (/[A-Z]/.test(char)) ? 'U' : 'L';
}

const letterPieceMap = new Map();
letterPieceMap.set("r", "rook");
letterPieceMap.set("n", "knight");
letterPieceMap.set("b", "bishop");
letterPieceMap.set("k", "king");
letterPieceMap.set("q", "queen");
letterPieceMap.set("p", "pawn");

export function getPieceAssetName(char: string) {
    if (char === "-") {
        return null;
    }

    let assetName = "";
    if (checkCase(char) == "U") {
        assetName += "white-";
    } else {
        assetName += "black-";
    }

    assetName += letterPieceMap.get(char.toLowerCase());
    assetName += ".png";

    return assetName;
}

export enum LAYERS {
    BOARD = 'boardLayer',
    HIGHLIGHTS = 'highlightLayer',
    PIECES = 'piecesLayer',
}