import * as PIXI from 'pixi.js';
import { SQUARE_SIZE } from './game-constants';
import { getPieceAssetName } from './game-utils';

let initialState = [
    ['r', 'n', 'b', 'k', 'q', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
]

export async function initChess() {
    const app = new PIXI.Application();
    await app.init({ width: SQUARE_SIZE * 8, height: SQUARE_SIZE * 8 });

    globalThis.__PIXI_APP__ = app;

    document.getElementById('chess').appendChild(app.canvas);

    drawBoard(app);
    resize(app);
    drawPieces(app, initialState);

    window.addEventListener("resize", (event) => {
        resize(app)
    });
}

function drawBoard(app) {
    const board = new PIXI.Container();
    board.label = 'BoardContainer';
    app.stage.addChild(board);

    for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
            let fillColor = (row + col) % 2 === 0 ? 0xFBF6E9 : 0x118B50;

            const square = new PIXI.Graphics();
            square.rect(SQUARE_SIZE * col, SQUARE_SIZE * row, SQUARE_SIZE, SQUARE_SIZE);
            square.fill(fillColor);

            board.addChild(square);
        }
    }
}

let selected = null;
let dragStarted = false;

async function drawPieces(app, state) {
    const pieces = new PIXI.Container();
    pieces.label = 'PiecesContainer';
    app.stage.addChild(pieces);
    pieces.interactive = true;
    pieces.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);

    for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
            const pieceChar = state[row][col];
            const assetName = getPieceAssetName(pieceChar);

            if (assetName) {
                const texture = await PIXI.Assets.load(`public/assets/chess/${assetName}`);
                const piece = new PIXI.Sprite(texture);

                piece.label = assetName;
                piece.anchor = 0.5;

                piece.x = SQUARE_SIZE * col + piece.width / 2;
                piece.y = SQUARE_SIZE * row + piece.height / 2;

                piece.interactive = true;
                piece.on('pointerdown', (e) => {
                    selected = piece;
                    piece.scale.set(1.1)
                    piece.zIndex = 10;
                    dragStarted = true;
                    const localPos = pieces.toLocal(e.global);
                    selected.position.set(localPos.x, localPos.y);
                });

                pieces.on('pointermove', (e) => {
                    if (dragStarted && selected) {
                        const localPos = pieces.toLocal(e.global);
                        selected.position.set(localPos.x, localPos.y);
                    }
                })
                
                piece.on('pointerup', (e) => {
                    dragStarted = false
                    selected.scale.set(1);
                    selected.zIndex = 0;
                });

                pieces.addChild(piece);
            }
        }
    }
}

function resize(app) {
    const { clientWidth, clientHeight } = document.documentElement
    const shortestSide = clientWidth < clientHeight ? clientWidth : clientHeight;
    const proportion = shortestSide * 1;
    const scaleFactor = proportion / (SQUARE_SIZE * 8);

    app.stage.scale.set(scaleFactor)
    app.renderer.resize(proportion, proportion)
}
