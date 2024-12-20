
function checkCase(character) {
    return (/[A-Z]/.test(character)) ? 'U' : 'L';
}

/* ['r', 'n', 'b', 'k', 'q', 'b', 'n', 'r'], */
const letterPieceMap = new Map()
letterPieceMap.set("r", "rook")
letterPieceMap.set("n", "knight")
letterPieceMap.set("b", "bishop")
letterPieceMap.set("k", "king")
letterPieceMap.set("q", "queen")
letterPieceMap.set("p", "pawn")

export function getPieceAssetName(letter) {
    if (letter == "-") {
        return null
    }

    let assetName = ""
    if (checkCase(letter) == "U") {
        assetName += "white-"
    }
    else {
        assetName += "black-"
    }
    assetName += letterPieceMap.get(letter.toLowerCase())
    assetName += ".png"
    return assetName;
}