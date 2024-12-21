import * as PIXI from "pixi.js";
import { SQUARE_SIZE, INITIAL_STATE } from "./constants";
import { getPieceAssetName, LAYERS } from "./utils";
import GameState from "./GameState";
import MovementService from "./services/MovementService";

export default class Chess {
	_app!: PIXI.Application;
	_gameElement: HTMLElement;
	_selected: PIXI.Sprite | null = null;
	_dragStarted = false;
	_highlightSquare!: PIXI.Graphics;
	_gameState: GameState;
	_movementService: MovementService;

	constructor(gameElement: HTMLElement) {
		this._gameElement = gameElement;
		this._gameState = new GameState();
		this._gameState.boardState = INITIAL_STATE;
		this._movementService = new MovementService(this._gameState);
	}

	async init() {
		await this.createPixiApp();
		this.createAppLayers();
		this.createHighlightSquare();
		this.resizePixiApp();
		this.drawBoard();
		this.drawPieces(this._gameState.boardState);
	}

	protected createHighlightSquare() {
		const highlightLayer = this._app.stage.getChildByLabel(LAYERS.HIGHLIGHTS) as PIXI.Container;
		this._highlightSquare = new PIXI.Graphics();
		this._highlightSquare.rect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
		this._highlightSquare.stroke({ width: 5, alignment: 1, color: 0x40e0d0 });
		this._highlightSquare.visible = false;

		highlightLayer.addChild(this._highlightSquare);
	}

	protected async createPixiApp() {
		this._app = new PIXI.Application();
		await this._app.init({
			width: SQUARE_SIZE * 8,
			height: SQUARE_SIZE * 8,
			backgroundColor: 0xaabbcc,
		});

		// @ts-ignore
		globalThis.__PIXI_APP__ = this._app;

		// @ts-ignore
		this._gameElement.appendChild(this._app.canvas);

		window.addEventListener("resize", this.resizePixiApp.bind(this));
	}

	protected createAppLayers() {
		const board = new PIXI.Container();
		board.label = LAYERS.BOARD;
		this._app.stage.addChild(board);

		const highlights = new PIXI.Container();
		highlights.label = LAYERS.HIGHLIGHTS;
		this._app.stage.addChild(highlights);

		const validMoves = new PIXI.Container();
		validMoves.label = LAYERS.VALID_MOVES;
		this._app.stage.addChild(validMoves);

		const pieces = new PIXI.Container();
		pieces.label = LAYERS.PIECES;
		this._app.stage.addChild(pieces);
	}

	protected resizePixiApp() {
		const { clientWidth, clientHeight } = document.documentElement;
		const shortestSide = clientWidth < clientHeight ? clientWidth : clientHeight;
		const proportion = shortestSide * 1;
		const scaleFactor = proportion / (SQUARE_SIZE * 8);

		this._app.stage.scale.set(scaleFactor);
		this._app.renderer.resize(proportion, proportion);
	}

	protected drawBoard() {
		const boardLayer = this._app.stage.getChildByLabel(LAYERS.BOARD) as PIXI.Container;

		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				let fillColor = (row + col) % 2 === 0 ? 0xfbf6e9 : 0x118b50;

				const square = new PIXI.Graphics();
				square.label = `${col}x${row}`;
				square.rect(SQUARE_SIZE * col, SQUARE_SIZE * row, SQUARE_SIZE, SQUARE_SIZE);
				square.fill(fillColor);

				console.error();
				boardLayer.addChild(square);
			}
		}
	}

	protected async drawPieces(state: string[][]) {
        this._app.stage.getChildByLabel(LAYERS.PIECES)?.removeChildren()

		const piecesLayer = this._app.stage.getChildByLabel(LAYERS.PIECES) as PIXI.Container;
		piecesLayer.interactive = true;
		piecesLayer.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000); // TODO: Should not be hardcoded

		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				const pieceChar = state[row][col];
				const assetName = getPieceAssetName(pieceChar);

				if (assetName) {
					const texture = await PIXI.Assets.load(`public/assets/chess/${assetName}`);
					const piece = new PIXI.Sprite(texture);

					piece.label = assetName;
					piece.anchor = 0.5;
					piece.interactive = true;

					piece.x = SQUARE_SIZE * col + piece.width / 2;
					piece.y = SQUARE_SIZE * row + piece.height / 2;

					piece.on("pointerdown", (e) => this.onPiecePointerDown(e, piece));
					piecesLayer.on("pointermove", (e) => this.onPiecesLayerPointerMove(e));
					piece.on("pointerup", (e) => this.onPiecePointerUp(e));

					piecesLayer.addChild(piece);
				}
			}
		}
	}

	protected onPiecePointerDown(e: PIXI.FederatedMouseEvent, piece: PIXI.Sprite) {
		const piecesLayer = this._app.stage.getChildByLabel(LAYERS.PIECES) as PIXI.Container;

		this._selected = piece;
		this._dragStarted = true;
		this._highlightSquare.visible = true;

		this._selected.scale.set(1.1);
		this._selected.zIndex = 10;

		const localPos = piecesLayer.toLocal(e.global);
		const column = Math.floor(localPos.x / SQUARE_SIZE);
		const row = Math.floor(localPos.y / SQUARE_SIZE);

		this._gameState.selectedColumn = column;
		this._gameState.selectedRow = row;

		this._selected.position.set(localPos.x, localPos.y);
		this._highlightSquare.position.set(column * SQUARE_SIZE, row * SQUARE_SIZE);

		//TODO PRIORITY LIFE OR DEATH!: En Passant
		//TODO: Remove from here
		console.log(column, row);
		const pieceType = this._gameState.boardState[row][column];

		this._gameState.validMoves = this._movementService.getValidMoves(pieceType, column, row);
		console.log(pieceType);

		for (const [validCol, validRow] of this._gameState.validMoves) {
			const dot = new PIXI.Graphics();
			dot.circle(validCol * SQUARE_SIZE + SQUARE_SIZE / 2, validRow * SQUARE_SIZE + SQUARE_SIZE / 2, 32);
			dot.fill(0xaaaaaa);
			const validMovesLayer = this._app.stage.getChildByLabel(LAYERS.VALID_MOVES) as PIXI.Container;
			validMovesLayer.addChild(dot);
		}
	}

	protected onPiecesLayerPointerMove(e: PIXI.FederatedMouseEvent) {
		const piecesLayer = this._app.stage.getChildByLabel(LAYERS.PIECES) as PIXI.Container;

		if (this._dragStarted && this._selected) {
			const localPos = piecesLayer.toLocal(e.global);
			this._selected.position.set(localPos.x, localPos.y);

			const column = Math.floor(localPos.x / SQUARE_SIZE);
			const row = Math.floor(localPos.y / SQUARE_SIZE);

			this._highlightSquare.position.set(column * SQUARE_SIZE, row * SQUARE_SIZE);
		}
	}

	protected onPiecePointerUp(e: PIXI.FederatedMouseEvent) {
		const piecesLayer = this._app.stage.getChildByLabel(LAYERS.PIECES) as PIXI.Container;

		this._dragStarted = false;
		this._selected!.scale.set(1);
		this._selected!.zIndex = 0;

		const localPos = piecesLayer.toLocal(e.global);
		const column = Math.floor(localPos.x / SQUARE_SIZE);
		const row = Math.floor(localPos.y / SQUARE_SIZE);

		this._selected!.position.set(column * SQUARE_SIZE + SQUARE_SIZE / 2, row * SQUARE_SIZE + SQUARE_SIZE / 2);

		this._selected = null;
		this._highlightSquare.visible = false;

		//TODO: CLEAN UP
		console.clear();
		console.table(this._gameState.boardState);

		const validMovesLayer = this._app.stage.getChildByLabel(LAYERS.VALID_MOVES) as PIXI.Container;
		validMovesLayer.removeChildren();

		const { selectedColumn, selectedRow } = this._gameState;
		if (selectedRow === row && selectedColumn === column) return;
		if (!this._gameState.validMoves.some((x) => x[0] === column && x[1] === row)) {
			console.log("kur");

			return;
		}

		this._gameState.boardState[row][column] = this._gameState.boardState[selectedRow][selectedColumn];
		this._gameState.boardState[selectedRow][selectedColumn] = "-";

        console.clear();
		console.table(this._gameState.boardState);
        //FULL REDRAW
        this.drawPieces(this._gameState.boardState)
	}
}
